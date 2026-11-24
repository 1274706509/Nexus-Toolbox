// ==UserScript==
// @name         Comp Time Remaining
// @namespace    https://goodwe.gaiaworkforce.com/
// @version      1.0.1
// @author       Ryan Chen
// @description  首页显示调休剩余时数；请假表单内联显示，后台自动计算
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTQiIGZpbGw9IiMxNjc3ZmYiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIxNyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNMzIgMjF2MTJsOCA1IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+
// @match        https://goodwe.gaiaworkforce.com/head/HR1Main.html*
// @match        https://goodwe.gaiaworkforce.com/eFlow/FlowForm/LeaveFormFrm.aspx*
// @grant        none
// @run-at       document-idle
// @updateURL    https://cdn.jsdelivr.net/gh/1274706509/Nexus-Toolbox@main/leave-remaining.meta.js
// @downloadURL  https://cdn.jsdelivr.net/gh/1274706509/Nexus-Toolbox@main/leave-remaining.user.js
// ==/UserScript==

/* ==================================================================== *
 * 首页模式：在顶部用户信息旁显示调休剩余时数
 * ==================================================================== */
(function () {
  'use strict';
  if (!/\/head\/HR1Main\.html/.test(location.pathname)) return;

  const CACHE_PREFIX = 'a02_leave_threshold_v1';
  const CACHE_TTL = 30 * 60 * 1000;
  const BADGE_ID = 'leave-remaining-badge';
  const HIDDEN_ID = 'leave-remaining-hidden-form';
  const LEAVE_URL = 'https://goodwe.gaiaworkforce.com/eFlow/FlowForm/LeaveFormFrm.aspx?ProcessID=PROCESSLEAVEFORM&RandomStr=';

  let running = false;
  let lastUpdated = null;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function formatTime(ts) {
    const d = new Date(ts || Date.now());
    return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function ymd(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function defaultBasis() {
    const d = new Date();
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return ymd(d);
  }

  function nowStr() {
    const d = new Date();
    return d.getFullYear() + '/' + pad2(d.getMonth() + 1) + '/' + pad2(d.getDate()) +
      ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function readEmployeeId() {
    // 通用：取用户信息区最后一个 <p>（工号），不依赖具体姓名
    const ps = document.querySelectorAll('.user p');
    if (!ps.length) return null;
    const t = (ps[ps.length - 1].textContent || '').trim();
    return t || null;
  }

  function injectHomeStyle() {
    if (document.getElementById('lr-home-style')) return;
    const style = document.createElement('style');
    style.id = 'lr-home-style';
    style.textContent = [
      '#leave-remaining-badge{overflow:hidden;box-sizing:border-box;transition:background .2s ease,color .2s ease;}',
      '#leave-remaining-badge .lr-icon{vertical-align:-2px;margin-right:4px;}',
      '#leave-remaining-badge .lr-refresh{vertical-align:-2px;margin-left:5px;opacity:.55;transition:opacity .2s;}',
      '#leave-remaining-badge:hover .lr-refresh{opacity:1;}',
      '#leave-remaining-badge:hover{background:#f0f9e8 !important;}',
      '#leave-remaining-badge .lr-spinner{display:inline-block;width:12px;height:12px;margin-right:6px;vertical-align:-2px;border:2px solid rgba(22,119,255,.18);border-top-color:#1677ff;border-radius:50%;animation:lrSpin .7s linear infinite;}',
      '#leave-remaining-badge .lr-dots{display:inline-block;margin-left:1px;}',
      '#leave-remaining-badge .lr-dots i{display:inline-block;width:3px;height:3px;margin-left:2px;border-radius:50%;background:#1677ff;opacity:.25;animation:lrDot 1.1s ease-in-out infinite;}',
      '#leave-remaining-badge .lr-dots i:nth-child(2){animation-delay:.15s;}',
      '#leave-remaining-badge .lr-dots i:nth-child(3){animation-delay:.3s;}',
      '#leave-remaining-badge .lr-progress{position:absolute;left:0;right:0;bottom:0;height:2px;background:rgba(22,119,255,.12);overflow:hidden;}',
      '#leave-remaining-badge .lr-progress i{display:block;width:38%;height:100%;background:linear-gradient(90deg,transparent,#1677ff,transparent);animation:lrBar 1.2s ease-in-out infinite;}',
      '#leave-remaining-badge.lr-loading{animation:lrPulse 1.6s ease-in-out infinite;}',
      '@keyframes lrSpin{to{transform:rotate(360deg);}}',
      '@keyframes lrDot{0%,80%,100%{opacity:.25;transform:translateY(0);}40%{opacity:1;transform:translateY(-2px);}}',
      '@keyframes lrBar{0%{transform:translateX(-100%);}100%{transform:translateX(300%);}}',
      '@keyframes lrPulse{0%,100%{box-shadow:0 2px 6px rgba(0,0,0,.15),0 0 0 0 rgba(22,119,255,.28);}50%{box-shadow:0 2px 6px rgba(0,0,0,.15),0 0 0 5px rgba(22,119,255,0);}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function ensureBadge() {
    injectHomeStyle();

    if (!document.querySelector('.head-content')) return null;

    let b = document.getElementById(BADGE_ID);
    if (!b) {
      b = document.createElement('span');
      b.id = BADGE_ID;
      b.style.cssText = [
        'position:fixed',
        'right:175px',
        'top:11px',
        'height:28px',
        'line-height:28px',
        'padding:0 12px',
        'border-radius:14px',
        'background:#fff',
        'color:#3d8b1f',
        'font-size:12px',
        'font-weight:600',
        'font-family:"Microsoft YaHei",Arial,sans-serif',
        'box-shadow:0 2px 6px rgba(0,0,0,.15)',
        'cursor:pointer',
        'white-space:nowrap',
        'user-select:none',
        'box-sizing:border-box',
        'overflow:hidden'
      ].join(';');
      b.title = '点击重新读取';
    }

    // 放到 body 顶层，避免被页面上方的标签栏覆盖导致点不到
    if (b.parentElement !== document.body) document.body.appendChild(b);

    b.style.position = 'fixed';
    b.style.zIndex = '2147483647';
    b.style.pointerEvents = 'auto';
    b.onclick = (e) => {
      e.stopPropagation();
      if (!running) refresh();
    };
    return b;
  }

  function setBadge(text, color, title, loading) {
    const b = ensureBadge();
    if (!b) return;
    if (loading) {
      b.classList.add('lr-loading');
      b.style.background = '#f5f9ff';
      b.innerHTML = '<span class="lr-spinner"></span><span class="lr-text"></span><span class="lr-dots"><i></i><i></i><i></i></span><span class="lr-progress"><i></i></span>';
      const t = b.querySelector('.lr-text');
      if (t) t.textContent = text;
    } else {
      b.classList.remove('lr-loading');
      b.style.background = '#fff';
      b.innerHTML =
        '<svg class="lr-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' +
        '<span class="lr-text"></span>' +
        '<svg class="lr-refresh" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 6.7"/><path d="M20 4v7h-7"/></svg>';
      const t = b.querySelector('.lr-text');
      if (t) t.textContent = text;
    }
    b.style.color = color || '#3d8b1f';
    if (title !== undefined) b.title = title;
  }

  function readCache() {
    let best = null;
    const empId = readEmployeeId();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith(CACHE_PREFIX + ':')) continue;
        const parts = k.split(':');
        if (empId && parts[1] !== empId) continue;
        const obj = JSON.parse(localStorage.getItem(k));
        if (obj && Number.isFinite(obj.threshold) && Date.now() - obj.ts < CACHE_TTL) {
          if (!best || obj.ts > best.ts) best = obj;
        }
      }
    } catch (e) { /* ignore */ }
    return best;
  }

  function clearCache() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX + ':')) keys.push(k);
      }
      keys.forEach((k) => localStorage.removeItem(k));
    } catch (e) { /* ignore */ }
  }

  function waitFor(fn, timeoutMs, intervalMs) {
    return new Promise((resolve) => {
      const t0 = Date.now();
      const tick = () => {
        let v = null;
        try { v = fn(); } catch (e) { /* ignore */ }
        if (v) return resolve(v);
        if (Date.now() - t0 >= timeoutMs) return resolve(null);
        setTimeout(tick, intervalMs || 300);
      };
      tick();
    });
  }

  async function calcHidden(onStage) {
    const old = document.getElementById(HIDDEN_ID);
    if (old) old.remove();

    const ifr = document.createElement('iframe');
    ifr.id = HIDDEN_ID;
    // 放到屏幕外，但保持正常渲染（不用 display:none，避免 Ext 布局失效）
    ifr.style.cssText = 'position:fixed;left:-12000px;top:0;width:1200px;height:900px;visibility:hidden;';
    ifr.src = LEAVE_URL + encodeURIComponent(nowStr());
    document.body.appendChild(ifr);

    try {
      const combo = await waitFor(() => {
        const w = ifr.contentWindow;
        if (!w || !w.Ext) return null;
        const c = w.Ext.getCmp('panel__ctl2__ctl0_gpDetail_frmDetail__ctl0_ddlLeaveType');
        return c && c.store && c.store.getCount() > 0 ? c : null;
      }, 25000, 300);

      if (!combo) return null;

      const d = ifr.contentDocument;
      const lt = d.querySelector('[id$="ddlLeaveType-inputEl"]');
      const isA02 = lt && (/A02/.test(lt.value || '') || /调休假/.test(lt.value || ''));

      if (!isA02) {
        const rec = combo.store.findRecord('value', '2');
        combo.setValue('2');
        combo.fireEvent('select', combo, rec);
      }

      const t0 = Date.now();
      let lastStage = '';
      while (Date.now() - t0 < 60000) {
        await sleep(500);
        let dd = null;
        try { dd = ifr.contentDocument; } catch (e) { continue; }

        const stageEl = dd && dd.getElementById('leave-remaining-overlay-sub');
        if (stageEl && onStage) {
          const s = (stageEl.textContent || '').trim();
          if (s && s !== lastStage) {
            lastStage = s;
            onStage(s);
          }
        }

        const el = dd && dd.getElementById('leave-remaining-inline');
        if (!el) continue;
        const m = (el.textContent || '').match(/调休剩余\s*(\d+(?:\.\d+)?)\s*小时/);
        if (m) return Number(m[1]);
      }
      return null;
    } finally {
      setTimeout(() => {
        try { ifr.remove(); } catch (e) { /* ignore */ }
      }, 800);
    }
  }

  async function refresh() {
    if (running) return;
    running = true;

    clearCache();
    setBadge('正在计算调休时数', '#1677ff', '正在后台计算，请稍候…', true);

    let threshold = null;
    try {
      threshold = await calcHidden((stage) => {
        const b = ensureBadge();
        if (b) b.title = '正在后台计算：' + stage;
      });
    } catch (e) {
      threshold = null;
    } finally {
      running = false;
    }

    if (Number.isFinite(threshold)) {
      lastUpdated = Date.now();
      setBadge('调休剩余 ' + threshold + ' 小时', '#3d8b1f',
        '按 ' + defaultBasis() + ' 09:00 起算；更新于 ' + formatTime(lastUpdated) + '；点击重新读取', false);
    } else {
      setBadge('调休时数获取失败', '#d46b08', '点击重试', false);
    }
  }

  async function main() {
    const head = await waitFor(() => document.querySelector('.head-content'), 15000, 300);
    if (!head) return;

    ensureBadge();

    // 30 分钟内已有结果，直接显示，不再加载隐藏表单
    const cached = readCache();
    if (cached) {
      lastUpdated = cached.ts;
      setBadge('调休剩余 ' + cached.threshold + ' 小时', '#3d8b1f',
        '按 ' + defaultBasis() + ' 09:00 起算；更新于 ' + formatTime(cached.ts) + '；点击重新读取', false);
      return;
    }

    refresh();
  }

  main();
})();

/* ==================================================================== *
 * 请假表单模式：计算并在“请假类型”右侧显示调休剩余时数
 * ==================================================================== */
(function () {
  'use strict';
  if (!/\/eFlow\/FlowForm\/LeaveFormFrm\.aspx/.test(location.pathname)) return;

  /* ------------------------------------------------------------------ *
   * 调休余额没有直接显示，用二分法探测：
   *   固定起算日（默认今天 09:00），构造 1~N 小时的请假区间，
   *   通过日期/时间字段的 blur 回发让服务端重新计算，
   *   读取报错面板是否显示，找到“刚好不报错”的最大整小时数。
   *
   * 计算期间会用加载遮罩挡住临时改动的日期，结束后自动恢复原表单。
   * ------------------------------------------------------------------ */

  const PARAM = {
    sd: 'panel:_ctl2:_ctl0:gpDetail:frmDetail:_ctl4:Form2:_ctl0:dpDateF',
    st: 'panel:_ctl2:_ctl0:gpDetail:frmDetail:_ctl4:Form2:_ctl0:tpTimeF',
    ed: 'panel:_ctl2:_ctl0:gpDetail:frmDetail:_ctl5:Form3:_ctl0:dpDateE',
    et: 'panel:_ctl2:_ctl0:gpDetail:frmDetail:_ctl5:Form3:_ctl0:tpTimeT'
  };

  const CMP = {
    sd: 'panel__ctl2__ctl0_gpDetail_frmDetail__ctl4_Form2__ctl0_dpDateF',
    st: 'panel__ctl2__ctl0_gpDetail_frmDetail__ctl4_Form2__ctl0_tpTimeF',
    ed: 'panel__ctl2__ctl0_gpDetail_frmDetail__ctl5_Form3__ctl0_dpDateE',
    et: 'panel__ctl2__ctl0_gpDetail_frmDetail__ctl5_Form3__ctl0_tpTimeT'
  };

  const EL = {
    sd: CMP.sd + '-inputEl',
    st: CMP.st + '-inputEl',
    ed: CMP.ed + '-inputEl',
    et: CMP.et + '-inputEl',
    hour: 'panel__ctl2__ctl0_gpDetail_frmDetail__ctl6_txtHour-inputEl',
    panel: 'panel_cpLateMsg',
    leaveTypeBody: 'panel__ctl2__ctl0_gpDetail_frmDetail__ctl0_ddlLeaveType-bodyEl'
  };

  const MAX_HOURS = 240;
  const CACHE_TTL = 30 * 60 * 1000;
  const CACHE_PREFIX = 'a02_leave_threshold_v1';
  const INLINE_ID = 'leave-remaining-inline';
  const OVERLAY_ID = 'leave-remaining-overlay';

  let running = false;
  let currentBasis = null;
  let currentThreshold = null;
  let lastAutoKey = null;

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
    return ymd(nextWorkday(new Date()));
  }

  function makePlan(H, basisYmd) {
    if (H <= 8) {
      const off = H + (H >= 4 ? 1 : 0);
      return { sd: basisYmd, st: '09:00', ed: basisYmd, et: pad2(9 + off) + ':00' };
    }

    const p = H % 8 === 0 ? 8 : H % 8;
    const k = H % 8 === 0 ? H / 8 - 1 : Math.floor(H / 8);
    const stHour = p >= 5 ? 17 - p : 18 - p;
    const end = addWorkdays(parseYmd(basisYmd), k);

    return { sd: basisYmd, st: pad2(stHour) + ':00', ed: ymd(end), et: '18:00' };
  }

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
        await sleep(350);
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

    const first = await test(1);
    if (first.fail) {
      return { threshold: 0, probes, exact: first.hour === 1 && !inexact };
    }

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

    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      const r = await test(mid);
      if (r.fail) hi = mid;
      else lo = mid;
    }

    return { threshold: lo, probes, exact: !inexact };
  }

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
      el.title = '点击重新读取';
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

  function updateInline() {
    if (!isA02()) {
      hideInline();
      return;
    }

    if (currentThreshold === null) {
      setInline(running ? '正在计算调休时数' : '调休剩余 -- 小时', '#8c98a8', '');
      return;
    }

    setInline('调休剩余 ' + currentThreshold + ' 小时', '#389e0d',
      '按 ' + currentBasis + ' 09:00 起算；点击重新读取');
  }

  function renderThreshold(basisYmd, threshold) {
    currentBasis = basisYmd;
    currentThreshold = threshold;
    updateInline();
  }

  function injectFormStyle() {
    if (document.getElementById('lr-form-style')) return;
    const style = document.createElement('style');
    style.id = 'lr-form-style';
    style.textContent = [
      '.lr-overlay-card{position:relative;text-align:center;padding:22px 30px 26px;border:1px solid #d9e2ef;border-radius:12px;background:#fff;box-shadow:0 10px 40px rgba(15,35,70,.2);min-width:280px;overflow:hidden;}',
      '.lr-overlay-spinner{width:36px;height:36px;margin:0 auto 12px;border:3px solid rgba(22,119,255,.15);border-top-color:#1677ff;border-radius:50%;animation:lrFormSpin .8s linear infinite;}',
      '.lr-overlay-title{font-size:16px;font-weight:600;color:#0b4a8f;margin-bottom:4px;}',
      '.lr-overlay-sub{font-size:12px;color:#6b7a90;}',
      '.lr-overlay-bar{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(22,119,255,.12);overflow:hidden;}',
      '.lr-overlay-bar i{display:block;width:35%;height:100%;background:linear-gradient(90deg,transparent,#1677ff,transparent);animation:lrFormBar 1.15s ease-in-out infinite;}',
      '@keyframes lrFormSpin{to{transform:rotate(360deg);}}',
      '@keyframes lrFormBar{0%{transform:translateX(-100%);}100%{transform:translateX(300%);}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function showOverlay() {
    const old = document.getElementById(OVERLAY_ID);
    if (old) old.remove();

    injectFormStyle();

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
      '<div class="lr-overlay-card">' +
      '<div class="lr-overlay-spinner"></div>' +
      '<div class="lr-overlay-title">正在计算调休时数…</div>' +
      '<div id="leave-remaining-overlay-sub" class="lr-overlay-sub">请稍候，计算完成后会自动恢复表单</div>' +
      '<div class="lr-overlay-bar"><i></i></div>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  function updateOverlay(text) {
    const s = document.getElementById('leave-remaining-overlay-sub');
    if (s) s.textContent = text;
  }

  function removeOverlay(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

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
        renderThreshold(basisYmd, cached.threshold);
        running = false;
        return;
      }
    }

    const saved = readFormValues();
    const origAlert = window.alert;
    window.alert = function () {};

    const overlay = showOverlay();
    setInline('正在计算调休时数', '#1677ff', '正在探测可用时数');
    updateOverlay('起算日 ' + basisYmd + ' 09:00');

    let meta = null;
    let error = null;
    let restored = true;

    try {
      meta = await computeThreshold(basisYmd, (n, H) => {
        updateOverlay('第 ' + n + ' 次探测（' + H + ' 小时）…');
      });
    } catch (e) {
      error = e;
    }

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
      renderThreshold(basisYmd, meta.threshold);
      if (!restored) {
        setInline('调休剩余 ' + meta.threshold + ' 小时（表单未恢复）', '#d46b08',
          '表单未能自动恢复，请检查日期');
      }
    } else {
      const msg = error && error.message ? error.message : String(error || '未知错误');
      setInline('调休时数获取失败', '#d46b08', msg + '；点击重试');
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
        renderThreshold(basis, cached.threshold);
      } else {
        run(basis, false);
      }
      return;
    }

    if (!running) updateInline();
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

    setInterval(tick, 1500);
  }

  main();
})();
