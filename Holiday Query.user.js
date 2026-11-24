// ==UserScript==
// @name         调休假可用时数查询
// @namespace    https://goodwe.gaiaworkforce.com/
// @version      1.0.0
// @description  在请假申请页的“请假类型”旁直接显示 A02 调休假可用时数（默认按今天起算，计算后恢复表单）
// @match        https://goodwe.gaiaworkforce.com/eFlow/FlowForm/LeaveFormFrm.aspx*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 说明
   * ------------------------------------------------------------------
   * A02 调休假的“没有足够的时数”提示，只有当请假时数 > 当前可用时数时才出现。
   * 可用时数没有直接显示在页面上，所以这里用二分法探测：
   *   固定“起算日”（默认今天 09:00），构造 1~N 小时的请假区间，
   *   通过日期/时间字段的 blur 回发让服务端重新计算，
   *   读取 panel_cpLateMsg 是否显示，找到“刚好不报错”的最大整小时数。
   *
   * 计算期间会在表单上覆盖一层加载遮罩，并临时改动日期；计算结束后自动恢复原日期。
   * 结果直接显示在“请假类型”下拉框右侧，不额外弹窗。
   * 调休假有时效，阈值会随起算日变化；脚本默认按今天计算。
   * ------------------------------------------------------------------ */

  const PARAM = {
    sd: 'panel:_ctl2:_ctl0:gpDetail:frmDetail:_ctl4:Form2:_ctl0:dpDateF',
    st: 'panel:_ctl2:_ctl0:gpDetail:frmDetail:_ctl4:Form2:_ctl0:tpTimeF',
    ed: 'panel:_ctl2:_ctl0:gpDetail:frmDetail:_ctl5:Form3:_ctl0:dpDateE',
    et: 'panel:_ctl2:_ctl0:gpDetail:frmDetail:_ctl5:Form3:_ctl0:tpTimeT'
  };

  // Ext 组件 id（下划线格式）
  const CMP = {
    sd: 'panel__ctl2__ctl0_gpDetail_frmDetail__ctl4_Form2__ctl0_dpDateF',
    st: 'panel__ctl2__ctl0_gpDetail_frmDetail__ctl4_Form2__ctl0_tpTimeF',
    ed: 'panel__ctl2__ctl0_gpDetail_frmDetail__ctl5_Form3__ctl0_dpDateE',
    et: 'panel__ctl2__ctl0_gpDetail_frmDetail__ctl5_Form3__ctl0_tpTimeT'
  };

  // DOM input id（下划线 + -inputEl）
  const EL = {
    sd: CMP.sd + '-inputEl',
    st: CMP.st + '-inputEl',
    ed: CMP.ed + '-inputEl',
    et: CMP.et + '-inputEl',
    hour: 'panel__ctl2__ctl0_gpDetail_frmDetail__ctl6_txtHour-inputEl',
    panel: 'panel_cpLateMsg',
    leaveTypeBody: 'panel__ctl2__ctl0_gpDetail_frmDetail__ctl0_ddlLeaveType-bodyEl'
  };

  const MAX_HOURS = 240;            // 探测上限
  const CACHE_TTL = 30 * 60 * 1000; // 缓存 30 分钟
  const CACHE_PREFIX = 'a02_leave_threshold_v1';
  const INLINE_ID = 'a02-inline-threshold';
  const OVERLAY_ID = 'a02-threshold-overlay';

  let running = false;
  let currentBasis = null;
  let currentThreshold = null;
  let lastAutoKey = null;

  /* ---------------------------- 工具 ---------------------------- */

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function ymd(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function parseYmd(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  function isWeekend(d) {
    const w = d.getDay();
    return w === 0 || w === 6;
  }

  function nextWorkday(d) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    while (isWeekend(x)) x.setDate(x.getDate() + 1);
    return x;
  }

  function addWorkdays(d, n) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let c = 0;
    while (c < n) {
      x.setDate(x.getDate() + 1);
      if (!isWeekend(x)) c++;
    }
    return x;
  }

  function bySuffix(suffix) {
    const all = document.querySelectorAll('[id$="' + suffix + '"]');
    return all.length ? all[all.length - 1] : null;
  }

  function getForm() {
    return window.theForm || document.getElementById('form1') || document.querySelector('form');
  }

  function getInputValue(cmpId) {
    const el = document.getElementById(cmpId + '-inputEl');
    return el ? String(el.value || '') : '';
  }

  function readHour() {
    return getInputValue('panel__ctl2__ctl0_gpDetail_frmDetail__ctl6_txtHour');
  }

  function readLeaveType() {
    const el = bySuffix('ddlLeaveType-inputEl');
    return el ? String(el.value || '') : '';
  }

  function isA02() {
    const t = readLeaveType();
    return /A02/.test(t) || /调休假/.test(t);
  }

  function readEmployeeId() {
    const el = bySuffix('txtEmployeeId-inputEl') || bySuffix('txtCardNum-inputEl');
    return el ? String(el.value || '').trim() : 'unknown';
  }

  function isPanelVisible() {
    const p = document.getElementById(EL.panel);
    return !!p && getComputedStyle(p).display !== 'none';
  }

  function defaultBasis() {
    // 默认按今天；如果今天是周末，顺延到下一个工作日
    return ymd(nextWorkday(new Date()));
  }

  /* ---------------------------- 构造探测区间 ---------------------------- */

  /**
   * 生成“请 H 小时”的起止时间。
   *
   * 系统规则：
   *  - 跨天请假时，结束时间会被服务端强制为 18:00；
   *  - 所以 H > 8 时，用“第一天少上几小时 + 之后若干整天”的方式凑出 H。
   *
   * 例：H=10 → 09:00 开始改为 16:00，结束为次日 18:00（第一天 2h + 第二天 8h）。
   */
  function makePlan(H, basisYmd) {
    if (H <= 8) {
      const off = H + (H >= 4 ? 1 : 0); // 12:00-13:00 午休
      return {
        sd: basisYmd,
        st: '09:00',
        ed: basisYmd,
        et: pad2(9 + off) + ':00'
      };
    }

    const p = H % 8 === 0 ? 8 : H % 8;                     // 第一天的小时数 1..8
    const k = H % 8 === 0 ? H / 8 - 1 : Math.floor(H / 8);  // 之后还有几个整天
    const stHour = p >= 5 ? 17 - p : 18 - p;                // 第一天开始时间
    const end = addWorkdays(parseYmd(basisYmd), k);

    return {
      sd: basisYmd,
      st: pad2(stHour) + ':00',
      ed: ymd(end),
      et: '18:00'
    };
  }

  /* ---------------------------- 表单操作 / 回发 ---------------------------- */

  function readFormValues() {
    return {
      sd: getInputValue(CMP.sd),
      st: getInputValue(CMP.st),
      ed: getInputValue(CMP.ed),
      et: getInputValue(CMP.et)
    };
  }

  function setFormPlan(p) {
    const w = window;
    if (!w.Ext) throw new Error('页面组件未就绪');
    const sd = parseYmd(p.sd);
    const ed = parseYmd(p.ed);
    if (!sd || !ed) throw new Error('日期格式不正确');

    const csd = w.Ext.getCmp(CMP.sd);
    const cst = w.Ext.getCmp(CMP.st);
    const ced = w.Ext.getCmp(CMP.ed);
    const cet = w.Ext.getCmp(CMP.et);
    if (!csd || !cst || !ced || !cet) throw new Error('找不到日期/时间字段');

    csd.setValue(sd);
    cst.setValue(p.st);
    ced.setValue(ed);
    cet.setValue(p.et);
  }

  function getViewState() {
    const el = document.getElementById('__VIEWSTATE');
    return el ? el.value : null;
  }

  async function postBackAndWait() {
    const before = getViewState();
    window.__doPostBack(PARAM.st, 'Blur');

    const t0 = Date.now();
    while (Date.now() - t0 < 15000) {
      await sleep(150);
      const vs = getViewState();
      if (vs && vs !== before) {
        await sleep(350); // 等 FineUI 把面板/时数渲染完
        return;
      }
    }
    throw new Error('表单响应超时，请重试');
  }

  async function realProbe(H, basisYmd) {
    const plan = makePlan(H, basisYmd);
    setFormPlan(plan);
    await postBackAndWait();

    const hourNum = Number(readHour());
    const hour = Number.isFinite(hourNum) ? hourNum : null;

    return {
      H,
      plan,
      hour,
      fail: isPanelVisible(),
      actualMismatch: hour !== null && hour !== H
    };
  }

  async function restoreFormValues(saved) {
    if (!saved || !parseYmd(saved.sd) || !parseYmd(saved.ed)) return false;
    setFormPlan(saved);
    await postBackAndWait();
    return true;
  }

  /* ---------------------------- 二分探测 ---------------------------- */

  async function computeThreshold(basisYmd, onProgress) {
    const memo = new Map();
    let probes = 0;
    let inexact = false;

    async function test(H) {
      if (memo.has(H)) return memo.get(H);
      probes++;
      if (onProgress) onProgress(probes, H);
      const r = await realProbe(H, basisYmd);
      if (r.actualMismatch) inexact = true;
      memo.set(H, r);
      return r;
    }

    // 1 小时就超限 → 阈值为 0
    const first = await test(1);
    if (first.fail) {
      return { threshold: 0, probes, exact: first.hour === 1 && !inexact };
    }

    // 指数增长找上界
    let lo = 1;
    let hi = 2;
    let foundFail = false;

    while (hi <= MAX_HOURS) {
      const r = await test(hi);
      if (r.fail) {
        foundFail = true;
        break;
      }
      lo = hi;
      if (hi === MAX_HOURS) break;
      hi = Math.min(hi * 2, MAX_HOURS);
    }

    if (!foundFail) {
      return { threshold: MAX_HOURS, probes, capped: true, exact: !inexact };
    }

    // 二分到 1 小时
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      const r = await test(mid);
      if (r.fail) hi = mid;
      else lo = mid;
    }

    return { threshold: lo, probes, exact: !inexact };
  }

  /* ---------------------------- 缓存 ---------------------------- */

  function cacheKey(empId, basisYmd) {
    return CACHE_PREFIX + ':' + empId + ':' + basisYmd;
  }

  function readCache(empId, basisYmd) {
    try {
      const raw = localStorage.getItem(cacheKey(empId, basisYmd));
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (obj && Number.isFinite(obj.threshold) && Date.now() - obj.ts < CACHE_TTL) {
        return obj;
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  function writeCache(empId, basisYmd, threshold) {
    try {
      localStorage.setItem(cacheKey(empId, basisYmd), JSON.stringify({
        threshold,
        ts: Date.now(),
        empId
      }));
    } catch (e) { /* ignore */ }
  }

  /* ---------------------------- 内联显示 ---------------------------- */

  function ensureInline() {
    const body = document.getElementById(EL.leaveTypeBody);
    if (!body) return null;

    let el = document.getElementById(INLINE_ID);
    if (!el) {
      el = document.createElement('span');
      el.id = INLINE_ID;
      el.style.cssText = [
        'position:absolute',
        'left:calc(100% + 12px)',
        'top:50%',
        'transform:translateY(-50%)',
        'white-space:nowrap',
        'font-size:12px',
        'font-weight:600',
        'font-family:"Microsoft YaHei",Arial,sans-serif',
        'cursor:pointer',
        'user-select:none'
      ].join(';');
      el.title = '点击按今天重新计算';
      el.addEventListener('click', () => {
        if (!running && isA02()) run(defaultBasis(), true);
      });
      body.appendChild(el);
    }

    if (body.style.position !== 'relative') body.style.position = 'relative';
    return el;
  }

  function setInline(text, color, title) {
    const el = ensureInline();
    if (!el) return;
    el.style.display = '';
    el.textContent = text;
    el.style.color = color || '#389e0d';
    if (title !== undefined) el.title = title;
  }

  function hideInline() {
    const el = document.getElementById(INLINE_ID);
    if (el) el.style.display = 'none';
  }

  function updateInline(hint) {
    if (!isA02()) {
      hideInline();
      return;
    }

    if (currentThreshold === null) {
      setInline(running ? '计算中…' : '—', '#8c98a8', '');
      return;
    }

    const h = Number(readHour());
    let text = '可用 ' + currentThreshold + ' 小时';
    let color = '#389e0d';

    if (Number.isFinite(h) && h > currentThreshold) {
      text += '（超出 ' + (h - currentThreshold) + '）';
      color = '#cf1322';
    }
    if (hint) text += hint;

    setInline(text, color, '按 ' + currentBasis + ' 09:00 起算；点击可重新计算');
  }

  function renderThreshold(basisYmd, threshold, meta) {
    currentBasis = basisYmd;
    currentThreshold = threshold;

    let hint = '';
    if (meta && meta.capped) hint = '（上限）';
    if (meta && meta.exact === false) hint += '（近似）';

    updateInline(hint);
  }

  /* ---------------------------- 加载遮罩 ---------------------------- */

  function showOverlay() {
    const old = document.getElementById(OVERLAY_ID);
    if (old) old.remove();

    const el = document.createElement('div');
    el.id = OVERLAY_ID;
    el.style.cssText = [
      'position:fixed',
      'left:0',
      'top:0',
      'right:0',
      'bottom:0',
      'z-index:2147483646',
      'background:rgba(255,255,255,.9)',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'font-family:"Microsoft YaHei",Arial,sans-serif'
    ].join(';');
    el.innerHTML =
      '<div style="text-align:center;padding:16px 24px;border:1px solid #d9e2ef;border-radius:10px;background:#fff;box-shadow:0 8px 30px rgba(15,35,70,.16);">' +
      '<div style="font-size:15px;font-weight:600;color:#0b4a8f;margin-bottom:4px;">正在计算可用时数…</div>' +
      '<div id="a02-overlay-sub" style="font-size:12px;color:#6b7a90;">请稍候，计算完成后会自动恢复表单</div>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  function updateOverlay(text) {
    const s = document.getElementById('a02-overlay-sub');
    if (s) s.textContent = text;
  }

  function removeOverlay(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  /* ---------------------------- 主流程 ---------------------------- */

  async function run(basisYmd, force) {
    if (running) return;
    if (!isA02()) {
      hideInline();
      return;
    }
    if (!window.Ext) {
      setInline('页面未就绪', '#d46b08', '请稍后点击重试');
      return;
    }

    running = true;
    const empId = readEmployeeId();

    if (!force) {
      const cached = readCache(empId, basisYmd);
      if (cached) {
        renderThreshold(basisYmd, cached.threshold, {});
        running = false;
        return;
      }
    }

    const saved = readFormValues();
    const origAlert = window.alert;
    window.alert = function () {};

    const overlay = showOverlay();
    setInline('计算中…', '#1677ff', '正在探测可用时数');
    updateOverlay('起算日 ' + basisYmd + ' 09:00');

    let meta = null;
    let error = null;
    let restored = true;

    try {
      meta = await computeThreshold(basisYmd, (n, H) => {
        const msg = '第 ' + n + ' 次探测（' + H + ' 小时）…';
        updateOverlay(msg);
      });
    } catch (e) {
      error = e;
    }

    // 无论成功与否，都尽量恢复原表单
    try {
      restored = await restoreFormValues(saved);
      if (!restored) {
        error = error || new Error('原表单日期为空，未能自动恢复');
      }
    } catch (e) {
      restored = false;
      error = error || e;
    }

    removeOverlay(overlay);
    window.alert = origAlert;

    if (meta) {
      writeCache(empId, basisYmd, meta.threshold);
      renderThreshold(basisYmd, meta.threshold, meta);
      if (!restored) {
        setInline('可用 ' + meta.threshold + ' 小时（表单未恢复）', '#d46b08',
          '表单未能自动恢复，请检查日期');
      }
    } else {
      const msg = error && error.message ? error.message : String(error || '未知错误');
      setInline('阈值计算失败', '#d46b08', msg + '；点击重试');
    }

    running = false;
  }

  async function tick() {
    if (!ensureInline()) return;

    if (!isA02()) {
      lastAutoKey = null;
      hideInline();
      return;
    }

    if (!document.getElementById(EL.hour)) return;

    const basis = defaultBasis();
    const empId = readEmployeeId();
    const key = empId + '|' + basis;

    if (!running && lastAutoKey !== key) {
      lastAutoKey = key;
      const cached = readCache(empId, basis);
      if (cached) {
        renderThreshold(basis, cached.threshold, {});
      } else {
        run(basis, false);
      }
      return;
    }

    if (!running) updateInline('');
  }

  async function waitForReady(timeoutMs) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      if (window.Ext && getForm() && document.getElementById(EL.hour) &&
          document.getElementById(EL.leaveTypeBody)) {
        return true;
      }
      await sleep(300);
    }
    return false;
  }

  async function main() {
    const ready = await waitForReady(30000);
    if (!ready) return;

    ensureInline();

    if (isA02()) {
      tick();
    } else {
      hideInline();
    }

    // 处理假别切换、时数变化、FineUI 局部重绘后内联元素被移除
    setInterval(tick, 1500);
  }

  main();
})();
