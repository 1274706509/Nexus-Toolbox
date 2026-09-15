// ==UserScript==
// @name         Nexus Toolbox(For EU)
// @name:zh-CN   Nexus Toolbox(For EU)
// @namespace    goodwe.nexus.toolbox
// @version      1.0.2
// @description  右下角 ⚙ 打开面板，每个功能都有独立开关，可即时开启/关闭（无需刷新）：库存可用量（自动选组织/自动筛可用量/排序优化）、预留单（隐藏预留数量为0的行/悬停ISO周数/库存状态筛选/默认每页条数）、挪库存（挪用公共库存按钮，含创建→提交→跨库挪单→撤回→删除闭环）、跨库挪单（去除仓库必选限制）、新增预留单（「添加行Beta」：用库存可用量(page)接口跨仓库搜索并加明细行）。设置存本地，并自动继承旧脚本原有设置。
// @description:zh-CN 右下角 ⚙ 打开面板，每个功能都有独立开关，可即时开启/关闭（无需刷新）：库存可用量（自动选组织/自动筛可用量/排序优化）、预留单（隐藏预留数量为0的行/悬停ISO周数/库存状态筛选/默认每页条数）、挪库存（挪用公共库存按钮，含创建→提交→跨库挪单→撤回→删除闭环）、跨库挪单（去除仓库必选限制）、新增预留单（「添加行Beta」：用库存可用量(page)接口跨仓库搜索并加明细行）。设置存本地，并自动继承旧脚本原有设置。
// @author       Ryan
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ij48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIxNCIgZmlsbD0iIzQwOWVmZiIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgsOCkgc2NhbGUoMikiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiLz48cGF0aCBkPSJNMTkuNCAxNWExLjY1IDEuNjUgMCAwIDAgLjMzIDEuODJsLjA2LjA2YTIgMiAwIDAgMSAwIDIuODMgMiAyIDAgMCAxLTIuODMgMGwtLjA2LS4wNmExLjY1IDEuNjUgMCAwIDAtMS44Mi0uMzMgMS42NSAxLjY1IDAgMCAwLTEgMS41MVYyMWEyIDIgMCAwIDEtMiAyIDIgMiAwIDAgMS0yLTJ2LS4wOUExLjY1IDEuNjUgMCAwIDAgOSAxOS40YTEuNjUgMS42NSAwIDAgMC0xLjgyLjMzbC0uMDYuMDZhMiAyIDAgMCAxLTIuODMgMCAyIDIgMCAwIDEgMC0yLjgzbC4wNi0uMDZhMS42NSAxLjY1IDAgMCAwIC4zMy0xLjgyIDEuNjUgMS42NSAwIDAgMC0xLjUxLTFIM2EyIDIgMCAwIDEtMi0yIDIgMiAwIDAgMSAyLTJoLjA5QTEuNjUgMS42NSAwIDAgMCA0LjYgOWExLjY1IDEuNjUgMCAwIDAtLjMzLTEuODJsLS4wNi0uMDZhMiAyIDAgMCAxIDAtMi44MyAyIDIgMCAwIDEgMi44MyAwbC4wNi4wNmExLjY1IDEuNjUgMCAwIDAgMS44Mi4zM0g5YTEuNjUgMS42NSAwIDAgMCAxLTEuNTFWM2EyIDIgMCAwIDEgMi0yIDIgMiAwIDAgMSAyIDJ2LjA5YTEuNjUgMS42NSAwIDAgMCAxIDEuNTEgMS42NSAxLjY1IDAgMCAwIDEuODItLjMzbC4wNi0uMDZhMiAyIDAgMCAxIDIuODMgMCAyIDIgMCAwIDEgMCAyLjgzbC0uMDYuMDZhMS42NSAxLjY1IDAgMCAwLS4zMyAxLjgyVjlhMS42NSAxLjY1IDAgMCAwIDEuNTEgMUgyMWEyIDIgMCAwIDEgMiAyIDIgMiAwIDAgMS0yIDJoLS4wOWExLjY1IDEuNjUgMCAwIDAtMS41MSAxeiIvPjwvZz48L3N2Zz4=
// @match        https://crm.goodwe.com:2001/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://cdn.jsdelivr.net/gh1274706509/Nexus-Toolbox@main/Nexus-Toolbox.meta.js
// @downloadURL  https://cdn.jsdelivr.net/gh1274706509/Nexus-Toolbox@main/Nexus-Toolbox.user.js
// ==/UserScript==

(function () {
  'use strict';

  /* =========================================================================
   * 0. 常量与设置
   * =======================================================================*/

  const SETTINGS_KEY = 'goodwe_nexus_toolbox_settings';
  const LEGACY_KEY   = 'goodwe_gw_settings';   // 旧「Nexus tool」的设置键，用于一次性迁移

  // 每个功能一个开关：true=启用
  const DEFAULTS = {
    enabled: true,                 // 总开关：关掉后脚本完全不介入页面（⚠ 齿轮仍保留，否则没法再打开）
    'stock.autoOrg': true,         // 库存可用量：自动选择库存组织
    'stock.autoFilter': true,      // 库存可用量：自动筛选可用量
    'stock.sortOptimize': true,    // 库存可用量：排序优化（按预计入库时间整体排序）
    'res.hideZeroQty': true,       // 预留明细：隐藏预留数量为0的行
    'res.weekTooltip': true,       // 预留单详情：预计入库时间悬停显示 ISO 周数
    'res.statusFilter': true,      // 预留明细：库存状态客户端筛选
    'move.crossMove': true,        // 预留明细：「挪用公共库存」按钮
    'move.warehouseBypass': true,  // 跨库挪单：未选仓库免校验 + 去掉必填红星
    'create.addRowBeta': true,     // 新增预留单：「添加行Beta」（用 page 接口跨仓库加明细行）
    // —— 参数项（非开关，不在面板里暴露） ——
    orgName: 'GoodWe Europe GmbH',
    availMin: '1',
    availMax: '999999',
    defaultMaterial: 'NBG8000-07-00P',
    pageSize: '50',
  };

  function loadSettings() {
    const out = Object.assign({}, DEFAULTS);
    // 迁移旧设置（同名参数 + 旧开关名映射到新的模块化键名）
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      if (raw) {
        const old = JSON.parse(raw) || {};
        if (old.autoFilter !== undefined) out['stock.autoFilter'] = !!old.autoFilter;
        if (old.globalSort !== undefined) out['stock.sortOptimize'] = !!old.globalSort;
        // 旧键 showZeroQty 语义相反：展示0行 == 不隐藏0行
        if (old.showZeroQty !== undefined) out['res.hideZeroQty'] = !old.showZeroQty;
        ['orgName', 'availMin', 'availMax', 'defaultMaterial', 'pageSize'].forEach((k) => {
          if (old[k] !== undefined) out[k] = old[k];
        });
      }
    } catch (e) { /* 忽略 */ }
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const cur = JSON.parse(raw) || {};
        Object.keys(DEFAULTS).forEach((k) => { if (cur[k] !== undefined) out[k] = cur[k]; });
      }
    } catch (e) { /* 忽略 */ }
    return out;
  }

  const S = loadSettings();

  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(S)); } catch (e) { /* 忽略 */ }
  }

  const featureOn = (k) => !!S.enabled && !!S[k];

  /* =========================================================================
   * 1. 通用工具
   * =======================================================================*/

  const API_BASE  = 'https://crm.goodwe.com:2001/admin-api';
  const TENANT_ID = '1';
  const ORG_CODE  = '010501';     // 库存可用量接口的 orgCode（与抓包一致）
  const MAX_OFFER = '9999999';    // 可用量筛选上界（与抓包一致）

  const sleep = (win, ms) => new Promise((resolve) => win.setTimeout(resolve, ms));

  function waitFor(win, getter, timeout = 15000) {
    const end = Date.now() + timeout;
    return (async () => {
      while (Date.now() < end) {
        const value = getter();
        if (value) return value;
        await sleep(win, 60);
      }
      throw new Error('等待页面控件超时');
    })();
  }

  function visible(el) { return !!el && el.getClientRects().length > 0; }

  function click(win, el) {
    el.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true, view: win }));
  }

  // 给受控 input 赋值（绕过 Vue 的 value 拦截）
  function setInputValue(win, input, value) {
    const setter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, 'value').set;
    setter.call(input, value);
    input.dispatchEvent(new win.Event('input', { bubbles: true }));
    input.dispatchEvent(new win.Event('change', { bubbles: true }));
  }

  function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function pad2(n) { return String(n).padStart(2, '0'); }
  function todayStr() { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
  function newReservationNo() { return 'TS' + Date.now(); }

  // 库存行的 expectStockTime 可能是 epoch 毫秒数，转成 YYYY-MM-DD
  function fmtDate(v) {
    if (v == null || v === '') return null;
    if (typeof v === 'number') { const d = new Date(v); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
    return String(v);
  }
  // 仅当值为非空字符串时才返回，否则 null（避免把数量/数字误当单号）
  function strOrNull(v) { return (typeof v === 'string' && v.trim() !== '') ? v : null; }

  function decodeStored(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return JSON.parse(value.v);
    } catch (e) { return ''; }
  }

  function getAccessToken() {
    if (localStorage.getItem('ACCESS_TOKEN')) return decodeStored('ACCESS_TOKEN');
    try {
      const raw = localStorage.getItem('ACCESS_TOKEN') || '';
      if (!raw) return '';
      const obj = JSON.parse(raw);
      if (obj && obj.v !== undefined) { const t = JSON.parse(obj.v); return typeof t === 'string' ? t : String(t); }
      return raw.replace(/^"|"$/g, '');
    } catch (e) { return ''; }
  }

  // 统一请求：走页面原生 fetch（同源，自动带 Cookie / Origin / Referer）
  async function api(method, path, body) {
    const headers = {
      Authorization: 'Bearer ' + getAccessToken(),
      'tenant-id': TENANT_ID,
      'Content-Type': 'application/json',
    };
    const opts = { method: method, headers: headers, credentials: 'include' };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const res = await fetch(path, opts);
    let j; const text = await res.text();
    try { j = JSON.parse(text); } catch (e) { j = { raw: text, code: -1 }; }
    if (res.status >= 400) throw new Error('HTTP ' + res.status + ': ' + text.slice(0, 300));
    if (j && j.code !== 0) throw new Error('接口返回code=' + j.code + ' msg=' + (j.msg || '') + ' ' + JSON.stringify(j).slice(0, 200));
    return j;
  }

  const TARGET_RE      = /stock-availability/;          // 库存可用量页
  const RESERVATION_RE = /crm\/reservation\/detail\//;  // 预留单详情页
  const CREATE_RE      = /crm\/reservation\/(create|edit)\b/;  // 新增/编辑预留单页（含「添加行」）

  /* =========================================================================
   * 2. 静默层：临时隐藏所有会弹出的浮层（自动化过程不可见）
   * =======================================================================*/

  const HIDE_CSS = [
    '.el-select-dropdown, .el-popper, .el-overlay, .el-dialog {',
    '  visibility: hidden !important;',
    '  pointer-events: none !important;',
    '}',
  ].join('\n');

  function silentCss(includeDialog) {
    return includeDialog ? HIDE_CSS : HIDE_CSS.replace(/,\s*\.el-dialog\s*\{/, ' {');
  }

  function hidePopups(doc) {
    const head = doc.head || doc.documentElement;
    const style = head.querySelector('#gw-silent-style');
    if (style) return;
    const el = doc.createElement('style');
    el.id = 'gw-silent-style';
    el.textContent = silentCss(!window.__gwBypassActive);
    head.appendChild(el);
  }

  function restorePopups(doc) {
    const style = doc.querySelector('#gw-silent-style');
    if (style) style.remove();
  }

  // 放行窗口内不得把「跨库挪单」弹窗一起藏掉（否则自动化会把用户正在用的弹窗弄没）
  function setBypassActive(on) {
    window.__gwBypassActive = !!on;
    const style = document.getElementById('gw-silent-style');
    if (style) style.textContent = silentCss(!on);
  }
  setBypassActive(false);

  /* =========================================================================
   * 3. 库存可用量：排序优化（按预计入库时间整体重排）
   * =======================================================================*/

  function installGlobalArrivalSort(win, doc) {
    if (win.__gwGlobalArrivalSort) return win.__gwGlobalArrivalSort;
    const state = {
      baseUrl: null,
      rows: [],
      direction: 'asc',
      active: false,
      loading: null,
      hooked: false,
      epoch: 0,   // 每次加载递增，用于丢弃被更新搜索取代的过期结果
    };
    win.__gwGlobalArrivalSort = state;

    const rank = (type) => {
      if (type === '在库') return 0;
      if (type === '在途') return 1;
      if (type === '专项-在途') return 1;
      if (type === '在制') return 3;
      if (type === '实单') return 4;
      if (type === '专项') return 5;
      return 6;
    };

    const dateValue = (row) => row.expectStockTime == null ? null : Number(row.expectStockTime);

    function compare(a, b) {
      const ra = rank(a.type); const rb = rank(b.type);
      if (ra !== rb) return ra - rb;
      if (ra !== 1) return 0;
      const da = dateValue(a); const db = dateValue(b);
      if (da == null && db == null) return 0;
      if (da == null) return state.direction === 'asc' ? 1 : -1;
      if (db == null) return state.direction === 'asc' ? -1 : 1;
      return (da - db) * (state.direction === 'asc' ? 1 : -1);
    }

    function formatValue(prop, row) {
      const value = row[prop];
      if (prop === 'expectStockTime' || prop === 'expectArrivalDate'
        || prop === 'deliveryDate' || prop === 'deliveryDateUpdate') {
        if (value == null || value === '') return '';
        const date = new Date(Number(value));
        return Number.isNaN(date.getTime()) ? String(value) : date.toISOString().slice(0, 10);
      }
      return value == null ? '' : String(value);
    }

    function getColumnProps(table) {
      return [...table.querySelectorAll('thead th')].map((th) => ({
        prop: th.querySelector('.column-filter-sort')?.getAttribute('prop') || '',
        cls: [...th.classList].find((name) => /^el-table_\d+_column_\d+$/.test(name)) || '',
      }));
    }

    function render() {
      // 只在库存可用量路由改写表格；进入其它页面（如预留单详情）后不得污染其数据
      if (!TARGET_RE.test(win.location.href)) return;
      if (!featureOn('stock.sortOptimize')) return;
      if (!state.active || !state.rows.length) return;
      const table = [...doc.querySelectorAll('.el-table')]
        .find((item) => [...item.querySelectorAll('th')]
          .some((th) => th.textContent.trim().startsWith('预计入库时间')));
      if (!table) return;
      const pageInput = [...doc.querySelectorAll('input')]
        .find((item) => item.type === 'number' && item.getAttribute('aria-label') === '页');
      const page = Math.max(1, Number(pageInput?.value || 1));
      const sizeText = [...doc.querySelectorAll('*')]
        .find((item) => /^\d+条\/页$/.test(item.textContent.trim()));
      const size = Number(sizeText?.textContent.match(/\d+/)?.[0] || 10);
      const pageRows = state.rows.slice((page - 1) * size, page * size);
      const columns = getColumnProps(table);
      const bodyRows = [...table.querySelectorAll('table.el-table__body tbody tr')];
      pageRows.forEach((row, index) => {
        const tr = bodyRows[index]; if (!tr) return;
        columns.forEach((column, colIndex) => {
          if (!column.prop) return;
          const cell = tr.children[colIndex];
          const content = cell?.querySelector('.cell');
          if (content) {
            const nextValue = formatValue(column.prop, row);
            // 只有内容确实变化时才写 DOM，避免 MutationObserver 自己触发无限重绘
            if (content.textContent !== nextValue) content.textContent = nextValue;
          }
        });
      });
    }

    async function loadAll() {
      if (!state.baseUrl) return;
      const loadToken = ++state.epoch; // 本次加载令牌；更新的搜索会用新令牌，从而丢弃本次结果
      state.loading = (async () => {
        try {
          const base = new URL(state.baseUrl, win.location.origin);
          base.searchParams.delete('pageNo'); base.searchParams.delete('pageSize');
          base.searchParams.delete('sortingFields[0].field');
          base.searchParams.delete('sortingFields[0].order');
          const token = decodeStored('ACCESS_TOKEN');
          const tenant = decodeStored('tenantId') || '1';
          const request = async (page) => {
            const url = new URL(base);
            url.searchParams.set('pageNo', String(page));
            url.searchParams.set('pageSize', '100');
            const response = await win.fetch(url, {
              headers: { Authorization: `Bearer ${token}`, 'tenant-id': tenant },
            });
            const json = await response.json();
            if (json.code !== 0) throw new Error(json.msg || '库存数据请求失败');
            return json.data;
          };
          const first = await request(1);
          if (state.epoch !== loadToken) return; // 已被更新的搜索取代，丢弃过期结果
          if (!first.total || !first.list?.length) { state.rows = []; return; }
          const pages = Math.ceil(first.total / first.list.length);
          const rest = await Promise.all(Array.from({ length: Math.max(0, pages - 1) }, (_, i) => request(i + 2)));
          if (state.epoch !== loadToken) return; // 已被更新的搜索取代，丢弃过期结果
          state.rows = [first, ...rest].flatMap((item) => item.list).sort(compare);
          render();
        } finally {
          if (state.epoch === loadToken) state.loading = null;
        }
      })().catch((error) => {
        if (state.epoch === loadToken) state.loading = null;
        console.warn('[Nexus 排序优化]', error);
      });
      return state.loading;
    }

    const originalOpen = win.XMLHttpRequest.prototype.open;
    const queryKey = (url) => {
      try {
        const parsed = new URL(url, win.location.origin);
        parsed.searchParams.delete('pageNo');
        parsed.searchParams.delete('pageSize');
        parsed.searchParams.delete('sortingFields[0].field');
        parsed.searchParams.delete('sortingFields[0].order');
        return `${parsed.pathname}?${parsed.searchParams.toString()}`;
      } catch (e) { return String(url); }
    };
    // 判断是否带筛选条件（而非页面默认的全量查询）。只有带筛选的查询才值得自动重排，
    // 否则页面首次/重开的默认查询会触发“全量拉取整个数据集”，导致极慢。
    const hasFilters = (url) => {
      try {
        const p = new URL(url, win.location.origin);
        return ['orgCode', 'materialNo', 'columnFilters', 'warehouseName', 'batchNo']
          .some((key) => p.searchParams.has(key));
      } catch (e) { return true; }
    };
    win.XMLHttpRequest.prototype.open = function (...args) {
      const url = String(args[1] || '');
      if (url.includes('/admin-api/crm/stock-availability/page')) {
        const nextQueryKey = queryKey(url);
        const changed = state.baseUrl && state.queryKey !== nextQueryKey;
        state.baseUrl = url;
        state.queryKey = nextQueryKey;
        if (changed) {
          // 重置排序状态，等待新的结果再重排
          state.active = false;
          state.rows = [];
          // 仅在「带筛选条件」的查询（用户/自动化搜索）时自动重新加载并排序；
          // 页面默认的无筛选查询不自动全量加载（交给自动化去设置筛选后触发），
          // 自动化运行期间也无需重复触发（自动化自身会 activate）。
          if (hasFilters(url) && !(win.__gwFilterState && win.__gwFilterState.running)) {
            state.activate();
          }
        }
      }
      return originalOpen.apply(this, args);
    };

    const observer = new win.MutationObserver(() => render());
    observer.observe(doc.body, { childList: true, subtree: true });
    state.hooked = true;
    state.activate = () => { state.active = true; return loadAll(); };

    const bind = () => {
      if (!featureOn('stock.sortOptimize')) return;
      if (!TARGET_RE.test(win.location.href)) return;
      const header = [...doc.querySelectorAll('th')]
        .find((th) => th.textContent.trim().startsWith('预计入库时间'));
      const target = header?.querySelector('.column-filter-sort');
      if (!target || target.dataset.gwBound) return;
      target.dataset.gwBound = '1';
      target.addEventListener('click', async (event) => {
        event.preventDefault(); event.stopImmediatePropagation();
        if (!featureOn('stock.sortOptimize')) return;
        if (state.active) state.direction = state.direction === 'asc' ? 'desc' : 'asc';
        state.active = true;
        await loadAll();
        state.rows.sort(compare); render();
      }, true);
    };
    new win.MutationObserver(bind).observe(doc.body, { childList: true, subtree: true });
    bind();
    state.bind = bind;
    state.render = render;
    return state;
  }

  /* =========================================================================
   * 4. 库存可用量：自动选组织 / 自动筛可用量
   * =======================================================================*/

  function initializeMaterialNo(win, doc) {
    const input = [...doc.querySelectorAll('input')]
      .find((item) => item.placeholder === '请输入物料编码');
    if (input && !input.value.trim()) setInputValue(win, input, S.defaultMaterial);
  }

  async function selectOrganization(win, doc) {
    const formItem = await waitFor(win, () => [...doc.querySelectorAll('.el-form-item')]
      .find((item) => item.textContent.includes('库存组织编码')));
    const select = formItem.querySelector('.el-select');
    if (!select) throw new Error('找不到库存组织编码下拉框');

    const selectedText = select.querySelector('.el-select__selected-item');
    if (selectedText?.textContent.trim() === S.orgName) return;

    click(win, select.querySelector('.el-select__wrapper') || select);
    const option = await waitFor(win, () => [...doc.querySelectorAll('.el-select-dropdown__item')]
      .find((item) => visible(item) && item.textContent.trim() === S.orgName));
    click(win, option);
    await waitFor(win, () => select.textContent.includes(S.orgName));
  }

  async function filterAvailability(win, doc) {
    const header = await waitFor(win, () => [...doc.querySelectorAll('th')]
      .find((th) => th.textContent.trim().startsWith('可用量')));
    const filterIcon = header.querySelector('.column-filter-sort__filter-icon');
    if (!filterIcon) throw new Error('找不到可用量筛选按钮');
    click(win, filterIcon);

    const minInput = await waitFor(win, () => [...doc.querySelectorAll('input[placeholder="最小值"]')].find(visible));
    const maxInput = await waitFor(win, () => [...doc.querySelectorAll('input[placeholder="最大值"]')].find(visible));
    setInputValue(win, minInput, S.availMin);
    setInputValue(win, maxInput, S.availMax);

    const popup = minInput.closest('.el-popper') || minInput.parentElement?.parentElement;
    const confirm = [...(popup || doc).querySelectorAll('button')]
      .find((button) => button.textContent.trim() === '确认' && visible(button));
    if (!confirm) throw new Error('找不到可用量筛选确认按钮');
    click(win, confirm);
  }

  // 在指定 window/document 内执行一次静默自动化
  async function runAutomation(win, doc, state) {
    if (win.__gwFilterState !== state) return;
    state.running = true;
    hidePopups(doc);
    try {
      if (featureOn('stock.autoFilter')) initializeMaterialNo(win, doc);
      if (featureOn('stock.autoOrg')) {
        await selectOrganization(win, doc);
        if (win.__gwFilterState !== state) return;
      }
      if (featureOn('stock.autoFilter')) {
        await filterAvailability(win, doc);
        if (win.__gwFilterState !== state) return;
      }
      if (featureOn('stock.sortOptimize')) installGlobalArrivalSort(win, doc);
      const search = [...doc.querySelectorAll('button')]
        .find((button) => button.textContent.trim() === '搜索' && visible(button));
      if (search) click(win, search);
      await sleep(win, 400); // 搜索请求发出后再恢复浮层
      if (win.__gwFilterState !== state) return;
      if (featureOn('stock.sortOptimize') && win.__gwGlobalArrivalSort) {
        await win.__gwGlobalArrivalSort.activate();
      }
      restorePopups(doc);
      state.running = false;
      state.done = true;
    } catch (error) {
      if (win.__gwFilterState !== state) return;
      state.running = false;
      state.done = false;
      restorePopups(doc);
      console.warn('[Nexus 自动筛选]', error);
    }
  }

  /* =========================================================================
   * 5. 预留单详情：预计入库时间悬停显示 ISO 周数
   * =======================================================================*/

  const WEEK_TEXT = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  // yyyy-MM-dd → ISO8601 周数信息
  function getWeekInfo(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    let isoWeekday = date.getUTCDay();
    if (isoWeekday === 0) isoWeekday = 7;
    const thursday = new Date(date);
    thursday.setUTCDate(date.getUTCDate() + 4 - isoWeekday);
    const isoYear = thursday.getUTCFullYear();
    const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
    let firstIsoWeekday = firstThursday.getUTCDay();
    if (firstIsoWeekday === 0) firstIsoWeekday = 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() + 4 - firstIsoWeekday);
    const weekNum = Math.floor((thursday - firstThursday) / 604800000) + 1;
    return `${isoYear}年第${weekNum}周 ${WEEK_TEXT[date.getUTCDay()]}`;
  }

  // 只处理「预计入库时间」列：按表头定位列序号（每次重扫，兼容列拖拽），为单元格写入悬停提示
  function applyWeekTooltip(win, doc) {
    if (!RESERVATION_RE.test(win.location.href)) return;

    if (!featureOn('res.weekTooltip')) {
      // 关闭时：只摘掉我们自己写上去的那部分
      doc.querySelectorAll('td[data-gnx-week]').forEach((td) => {
        td.removeAttribute('title');
        td.removeAttribute('data-gnx-week');
      });
      return;
    }

    doc.querySelectorAll('.el-table').forEach((table) => {
      const headerTable = table.querySelector('.el-table__header');
      const bodyTable = table.querySelector('.el-table__body');
      if (!headerTable || !bodyTable) return;
      const ths = [...headerTable.querySelectorAll('th')];
      let targetIdx = -1;
      for (let i = 0; i < ths.length; i++) {
        const t = ths[i].innerText.replace(/\s+/g, '').trim();
        if (t.includes('预计入库时间')) { targetIdx = i; break; }
      }
      if (targetIdx < 0) return;
      bodyTable.querySelectorAll('tbody tr').forEach((tr) => {
        const td = tr.querySelector(`td:nth-child(${targetIdx + 1})`);
        const cellDiv = td?.querySelector('div.cell');
        if (!cellDiv) return;
        const raw = cellDiv.textContent.trim();
        const m = raw.match(/^(\d{4}-\d{2}-\d{2})/);
        if (!m) return;
        td.title = getWeekInfo(m[1]);
        td.setAttribute('data-gnx-week', '1');
      });
    });
  }

  // 为预留单详情建立一次性的扫表监听：初次 + DOM 变化（排序/筛选/分页/数据刷新）后防抖重扫
  function setupWeekTooltips(win, doc) {
    if (win.__gwWeekTooltipsReady) return;
    if (!RESERVATION_RE.test(win.location.href)) return;
    win.__gwWeekTooltipsReady = true;
    const scan = () => applyWeekTooltip(win, doc);
    win.__gwWeekTooltipScan = scan;
    scan();
    let timer = null;
    new win.MutationObserver(() => {
      if (timer) win.clearTimeout(timer);
      timer = win.setTimeout(() => { timer = null; scan(); }, 200);
    }).observe(doc.body, { childList: true, subtree: true });
  }

  /* =========================================================================
   * 6. 预留明细：库存状态客户端筛选 + 隐藏预留数量为0的行 + 默认每页条数
   * =======================================================================*/

  function findReservationTable(doc) {
    // 预留明细标签页的表：同时含「国际仓库」与「库存状态」
    return [...doc.querySelectorAll('.el-table')].find((t) => {
      const ths = [...t.querySelectorAll('thead th')].map((th) => th.textContent.trim());
      return ths.includes('国际仓库') && ths.includes('库存状态');
    });
  }

  function colIndex(table, text) {
    return [...table.querySelectorAll('thead th')].findIndex((th) => th.textContent.trim() === text);
  }

  // 用列类名（el-table_N_column_M）定位单元格，避免固定列/索引错位
  function cellClass(table, text) {
    const th = [...table.querySelectorAll('thead th')].find((t) => t.textContent.trim() === text);
    return th ? [...th.classList].find((c) => /^el-table_\d+_column_\d+$/.test(c)) || '' : '';
  }

  // 行长显隐：同时考虑「库存状态」筛选 与 「预留数量为0」隐藏
  function applyRowVisibility(win, table) {
    const statusCls = cellClass(table, '库存状态');
    const qtyCls = cellClass(table, '预留数量');
    const allowed = featureOn('res.statusFilter') ? win.__gwStatusAllowed : null; // null=全部；否则 Set=仅显示的库存状态
    const hideZero = !!S.enabled && !!S['res.hideZeroQty'];
    table.querySelectorAll('tbody tr').forEach((tr) => {
      const status = statusCls ? (tr.querySelector('.' + statusCls)?.textContent.trim() || '') : null;
      const qty = qtyCls ? Number(tr.querySelector('.' + qtyCls)?.textContent.trim()) : NaN;
      let show = true;
      if (allowed) show = allowed.has(status);
      if (show && hideZero && qty === 0) show = false;
      const val = show ? '' : 'none';
      if (tr.style.display !== val) tr.style.display = val;
    });
  }

  // 关闭「库存状态筛选」时：移除注入的筛选入口，并把列名文本还原
  function cleanupStatusFilter(doc) {
    if (typeof window.__gwStatusAllowed !== 'undefined') window.__gwStatusAllowed = null;
    const panel = doc.getElementById('gw-status-panel');
    if (panel) panel.remove();
    doc.querySelectorAll('.gw-status-trigger').forEach((trigger) => {
      const cfs = trigger.closest('.column-filter-sort');
      const th = trigger.closest('th');
      trigger.remove();
      if (cfs) cfs.remove();
      const cell = th && (th.querySelector('.cell') || th);
      if (cell && !cell.textContent.trim()) cell.textContent = '库存状态';
    });
  }

  function ensureStatusFilter(win, doc, table) {
    if (!featureOn('res.statusFilter')) { cleanupStatusFilter(doc); return; }
    const idx = colIndex(table, '库存状态');
    if (idx < 0) return;
    const th = [...table.querySelectorAll('thead th')][idx];
    if (th.querySelector('.gw-status-trigger')) return;
    const cell = th.querySelector('.cell') || th;
    let cfs = th.querySelector('.column-filter-sort');
    if (!cfs) {
      // 严格复刻原生筛选列：column-filter-sort + 标签 span，避免图标污染列名
      cfs = doc.createElement('div');
      cfs.className = 'column-filter-sort';
      cfs.setAttribute('filterable', 'true');
      cfs.setAttribute('filtermode', 'suggest');
      const label = doc.createElement('span');
      label.className = 'column-filter-sort__label';
      label.textContent = '库存状态';
      cfs.appendChild(label);
      cell.textContent = ''; // 清空原有文本，避免列名被图标污染
      cell.appendChild(cfs);
    }
    const icon = doc.createElement('i');
    icon.className = 'el-icon column-filter-sort__filter-icon el-tooltip__trigger el-tooltip__trigger gw-status-trigger';
    icon.style.cssText = 'font-size:14px;cursor:pointer;';
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M384 523.392V928a32 32 0 0 0 46.336 28.608l192-96A32 32 0 0 0 640 832V523.392l280.768-343.104a32 32 0 1 0-49.536-40.576l-288 352A32 32 0 0 0 576 512v300.224l-128 64V512a32 32 0 0 0-7.232-20.288L195.52 192H704a32 32 0 1 0 0-64H128a32 32 0 0 0-24.768 52.288z"/></svg>';
    icon.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleStatusPanel(win, doc, table, icon); });
    cfs.appendChild(icon);
  }

  function toggleStatusPanel(win, doc, table, btn) {
    const existing = doc.getElementById('gw-status-panel');
    if (existing) { existing.remove(); return; }
    const statusCls = cellClass(table, '库存状态');
    const values = [];
    table.querySelectorAll('tbody tr').forEach((tr) => {
      const v = statusCls ? (tr.querySelector('.' + statusCls)?.textContent.trim() || '') : '';
      if (v && !values.includes(v)) values.push(v);
    });
    const allowed = win.__gwStatusAllowed;
    const panel = doc.createElement('div');
    panel.id = 'gw-status-panel';
    panel.style.cssText = 'position:fixed;z-index:999997;background:#fff;border:1px solid #dcdfe6;border-radius:8px;box-shadow:0 5px 24px rgba(0,0,0,.16);padding:10px 12px;min-width:150px;font:13px/1.7 system-ui,sans-serif;color:#333;';
    const r = btn.getBoundingClientRect();
    panel.style.left = Math.min(r.right + 4, win.innerWidth - 190) + 'px';
    panel.style.top = (r.bottom + 6) + 'px';
    const title = doc.createElement('div');
    title.textContent = '库存状态';
    title.style.cssText = 'font-weight:700;margin-bottom:6px;color:#111827;';
    panel.appendChild(title);
    const cbs = [];
    const recompute = () => {
      const sel = new Set();
      let anyUnchecked = false;
      cbs.forEach((cb, i) => { if (cb.checked) sel.add(values[i]); else anyUnchecked = true; });
      win.__gwStatusAllowed = anyUnchecked ? sel : null;
      applyRowVisibility(win, table);
    };
    values.forEach((v) => {
      const label = doc.createElement('label');
      label.style.cssText = 'display:flex;align-items:center;gap:6px;padding:3px 0;cursor:pointer;';
      const cb = doc.createElement('input');
      cb.type = 'checkbox'; cb.checked = !allowed || allowed.has(v);
      cb.addEventListener('change', recompute);
      cbs.push(cb);
      const span = doc.createElement('span'); span.textContent = v;
      label.appendChild(cb); label.appendChild(span);
      panel.appendChild(label);
    });
    const hint = doc.createElement('div');
    hint.textContent = '勾选需要显示的库存状态';
    hint.style.cssText = 'margin-top:6px;font-size:12px;color:#9ca3af;';
    panel.appendChild(hint);
    const done = () => { panel.remove(); win.__gwStatusPanelOpen = false; doc.removeEventListener('click', onDoc, true); };
    const onDoc = (e) => { if (!panel.contains(e.target) && e.target !== btn) done(); };
    win.__gwStatusPanelOpen = true;
    doc.body.appendChild(panel);
    setTimeout(() => doc.addEventListener('click', onDoc, true), 0);
  }

  // 判断分页控件是否属于指定表格所在的标签页容器。
  // 关键：不能用「沿表格向上找第一个 el-pagination」——预留单详情的两张表在同一个
  // el-tabs__content 下（预留单明细在前、预留明细在后），向上冒泡时先撞到的是
  // 「预留单明细」分页；标签切换动画期间两张表同时可见，于是会把条数错设到预留单明细上。
  function belongsToTablePane(pag, table) {
    const pane = table.closest('.el-tab-pane');
    if (pane) return !!pane.contains(pag);
    // 非标签页结构：退回到「表格与分页同处一个只含单个分页的容器」
    let node = table.parentElement;
    for (let i = 0; i < 6 && node; i++) {
      const pags = [...node.querySelectorAll('.el-pagination')].filter((p) => !p.closest('.el-table'));
      if (pags.length === 1) return pags[0] === pag;
      node = node.parentElement;
    }
    return true;
  }

  // 找出属于指定表格所在标签页的分页控件（排除嵌套表格内部的分页）
  function pickPaginatorsIn(node, table) {
    const pane = table.closest('.el-tab-pane');
    return [...node.querySelectorAll('.el-pagination')]
      .filter((p) => !p.closest('.el-table'))
      .filter((p) => !pane || p.closest('.el-tab-pane') === pane);
  }

  // 找到与指定表格关联的分页控件。
  // ⚠ 不能用「向上冒泡、遇到第一个 el-pagination 就返回」：预留单详情的两张表同处一个
  // el-tabs__content（预留单明细在前、预留明细在后），冒泡到 el-tabs__content 时会先撞上
  // 「预留单明细」的分页；而标签切换动画期间两张表同时可见，于是条数会被错设到预留单明细上。
  // 正确做法：向上逐层找「恰好只有一个分页」的容器（= 该表格自己的分页区），
  // 只有分页已被拆到更外层时才退回更靠上的兄弟容器。
  function findTablePagination(table) {
    let node = table;
    let fallback = null;
    for (let i = 0; i < 8 && node; i++) {
      node = node.parentElement;
      if (!node) break;
      const pags = pickPaginatorsIn(node, table);
      if (pags.length === 1) return pags[0];
      if (pags.length > 1) return fallback;
      if (!fallback && pags.length) fallback = pags[0];
    }
    return fallback;
  }

  // 无感设置默认每页条数：仅处理「预留明细」表格关联的分页，不影响页面上的其它分页（如预留单明细）。
  // 通过 hidePopups 隐藏所有浮层，因此打开下拉/点击选项的过程用户肉眼不可见。
  // 幂等策略：以「分页控件元素」为标识记一次（表格/分页被重建 = 换了新元素 = 重新设一次），
  // 所以每次打开或切回预留明细都能拿到 50 条/页，而用户在同一实例里的手动修改会被尊重。
  async function setDefaultPageSize(win, doc, want, table) {
    try {
      const target = String(want) + '条/页';
      if (!win.__gwPageSizeDone) win.__gwPageSizeDone = new Set();
      if (!table) return;
      const pag = findTablePagination(table);
      if (!pag || win.__gwPageSizeDone.has(pag)) return;
      if (!belongsToTablePane(pag, table)) return; // 兜底：绝不动预留明细以外的分页
      win.__gwPageSizeDone.add(pag); // 本分页已尝试（避免循环重复触发）
      hidePopups(doc);
      const sizeSel = pag.querySelector('.el-pagination__sizes .el-select');
      const wrap = sizeSel?.querySelector('.el-select__wrapper');
      if (wrap) {
        const cur = sizeSel.querySelector('.el-select__placeholder')?.textContent.trim() || '';
        if (cur !== target) {
          click(win, wrap); // 打开条数下拉（已被隐藏）
          await sleep(win, 260);
          const opt = [...doc.querySelectorAll('.el-select-dropdown__item')]
            .find((o) => visible(o) && o.textContent.trim() === target);
          if (opt) {
            click(win, opt);
            await sleep(win, 260);
          } else {
            // 没找到目标选项（下拉已在别处打开/被静默层挡住）：撤掉本次标记，交给下一轮重试
            win.__gwPageSizeDone.delete(pag);
            doc.body.click();
          }
        }
      }
      restorePopups(doc);
    } catch (error) {
      restorePopups(doc);
    }
  }

  function applyReservationFeatures(win, doc) {
    const table = findReservationTable(doc);
    if (table) {
      ensureStatusFilter(win, doc, table);
      applyRowVisibility(win, table);
      if (S.enabled && S.pageSize) setDefaultPageSize(win, doc, S.pageSize, table);
    }
    applyWeekTooltip(win, doc);
    applyMoveButtonPlacement();
  }

  function setupReservation(win, doc) {
    if (win.__gwReservationReady) return;
    if (!findReservationTable(doc)) return;
    win.__gwReservationReady = true;
    win.__gwReservationApply = () => applyReservationFeatures(win, doc);
    // 防抖：等 Vue 渲染稳定后再一次性刷新，避免与排序重渲染竞态
    let timer = null;
    const debouncedApply = () => {
      if (timer) win.clearTimeout(timer);
      timer = win.setTimeout(() => { timer = null; applyReservationFeatures(win, doc); }, 150);
    };
    win.__gwReservationDebounced = debouncedApply;
    debouncedApply(); // 首次也等稳定后再刷新
    new win.MutationObserver(debouncedApply).observe(doc.body, { childList: true, subtree: true });
  }

  // 「预留明细」标签页是否处于激活态（按钮只属于这个标签页）
  function isDetailTabActive() {
    const tab = Array.from(document.querySelectorAll('.el-tabs__item')).filter(function (t) {
      return (t.innerText || '').trim() === '预留明细';
    })[0];
    return !!tab && tab.className.toString().indexOf('is-active') >= 0;
  }

  // 「延期释放」按钮是否在 DOM 里（与「挪用公共库存」同一个容器）
  function hasDeferReleaseButton() {
    return Array.from(document.querySelectorAll('button')).some(function (b) {
      return (b.innerText || '').trim() === '延期释放';
    });
  }

  // 关闭某个预留明细功能后，立即把页面恢复成“没被改过”的样子
  function resyncReservation() {
    const doc = document;
    if (S.enabled && featureOn('res.statusFilter') && featureOn('res.weekTooltip')) return;
    if (!S.enabled || !featureOn('res.statusFilter')) cleanupStatusFilter(doc);
    if (!S.enabled || !featureOn('res.weekTooltip')) applyWeekTooltip(window, doc);
    const table = findReservationTable(doc);
    if (table) applyRowVisibility(window, table);
  }

  /* =========================================================================
   * 7. 「挪用公共库存」（原「Goodwe Nexus：挪库存」）
   * =======================================================================*/

  function getQtyInput() { return document.getElementById('gnx-apply-qty'); }
  function setQtyInput(v) { const el = getQtyInput(); if (el) el.value = (v == null ? '' : String(v)); }
  function getQtyValue() {
    const el = getQtyInput();
    if (!el || el.value === '') return null;
    const n = parseInt(el.value, 10);
    return isNaN(n) ? null : n;
  }

  function getSrcOrderId() {
    const m = location.pathname.match(/\/crm\/reservation\/detail\/(\d+)/);
    return m ? m[1] : null;
  }

  // ---------------- 预留类型（reservationType）前置校验 ----------------
  // 「挪用公共库存」只对「预留单」（reservationType === 1）成立；其它类型（工厂单/实单备货/
  // 退换货借机…）点了直接报错，不再走下去建单。来源与页面自身一致：
  // GET /admin-api/crm/order/get?id=<详情页 url 上的订单 id> → data.reservationType
  const RESERVATION_TYPE_OK = 1;     // 1=预留单（crm_reservation_type 字典）

  async function getSrcReservationType() {
    const srcId = getSrcOrderId();
    if (!srcId) throw new Error('无法从地址栏解析源订单 id');
    const order = (await api('GET', API_BASE + '/crm/order/get?id=' + encodeURIComponent(srcId))).data || {};
    return order.reservationType;
  }

  // 把类型编号翻成中文（crm_reservation_type 字典，如 1=预留单、2=工厂单），拿不到就退回编号
  let _resTypeLabels = null;
  async function reservationTypeText(type) {
    if (type == null || type === '') return '未知';
    if (!_resTypeLabels) {
      _resTypeLabels = {};
      try {
        const list = (await api('GET', API_BASE + '/system/dict-data/simple-list')).data || [];
        list.forEach((it) => {
          if (it && it.dictType === 'crm_reservation_type') _resTypeLabels[String(it.value)] = it.label;
        });
      } catch (e) { /* 字典拿不到就用编号 */ }
    }
    const label = _resTypeLabels[String(type)];
    return label ? label + '(' + type + ')' : String(type);
  }

  // 取产品信息（物料名称 productDesc、模型、质保）
  async function getProductInfo(materialNo) {
    const url = API_BASE + '/crm/product-v2/fuzzy-page?keyword=' + encodeURIComponent(materialNo) + '&pageNo=1&pageSize=20&countryCode=DE';
    const j = await api('GET', url);
    const list = (j && j.data && (j.data.list || j.data.records)) || [];
    const p = list[0] || {};
    return {
      productName: p.productDesc || p.productName || '',
      model: p.productModel || '',
      warranty: p.warranty != null ? p.warranty : 10,
      standardWarranty: p.standardWarranty != null ? p.standardWarranty : 10,
      spareWarranty: p.spareWarranty != null ? p.spareWarranty : 0,
    };
  }

  // ---------------- 定位“预留明细”表（带选择框的那张） ----------------
  function findDetailBody() {
    const tables = Array.from(document.querySelectorAll('table'));
    for (const t of tables) {
      const tr = t.querySelector('tbody tr');
      if (!tr) continue;
      const cells = tr.querySelectorAll('td');
      if (cells.length >= 4) {
        const hasCb = !!cells[0].querySelector('.el-checkbox, input[type=checkbox]');
        const c1 = cells[1].innerText.trim();
        const c3 = cells[3].innerText.trim();
        if (hasCb && c1 && /^[A-Za-z0-9-]+$/.test(c1) && /^\d+$/.test(c3)) {
          return { table: t, tbody: t.querySelector('tbody') };
        }
      }
    }
    return null;
  }

  function isRowChecked(tr) {
    const cb = tr.querySelector('td') && tr.querySelector('td').querySelector('.el-checkbox__input, input[type=checkbox]');
    if (!cb) return false;
    if (cb.type === 'checkbox') return cb.checked;
    return cb.className && cb.className.toString().indexOf('is-checked') >= 0;
  }

  /* =========================================================================
   * 6.5 自绘对话框（替代原生 alert）
   *   为什么不用原生 alert：
   *   1) 用户勾选「阻止此页面创建更多对话框」后，alert 会被静默吞掉——校验提示
   *      无声消失，而挪用库存是写操作（建单→提交→挪单→撤回→删除），不能没有反馈；
   *   2) 后台标签页/失焦状态下 alert 也会被浏览器抑制；
   *   3) 原生弹窗标题栏是 crm.goodwe.com 的域名，4 步操作要弹好几次，观感也差。
   *   ⚠ 语义必须保持「阻塞」：调用处一律 `await showDialog(...)`。
   *      以「挪库成功」为例，原代码靠 alert 阻塞来保证 refreshPageData() 一定在用户
   *      确认之后才执行；换成自动消失的 toast 会让表格在用户看清结果前就被重建。
   *   样式直接复用页面的 Element Plus 变量，尽量与原生弹窗一致。
   * =======================================================================*/

  const MODAL_ICONS = {
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    success: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
    warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    error: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  };
  const MODAL_TITLES = { info: '提示', success: '成功', warn: '注意', error: '操作失败' };
  const MODAL_COLORS = { info: '#409eff', success: '#67c23a', warn: '#e6a23c', error: '#f56c6c' };

  // 对话框自己的样式：同时带上 !important，保证不被静默层（.el-select-dropdown /
  // .el-popper / .el-overlay）的 visibility:hidden 连坐
  function ensureDialogStyle(doc) {
    if (doc.getElementById('gnx-dialog-style')) return;
    const style = doc.createElement('style');
    style.id = 'gnx-dialog-style';
    style.textContent = [
      '#gnx-dialog-host * { box-sizing: border-box; }',
      '#gnx-dialog-host {',
      '  position: fixed; inset: 0; z-index: 2147483000;',
      '  display: flex; align-items: center; justify-content: center;',
      '  visibility: visible !important; pointer-events: auto !important;',
      '  background: rgba(0, 0, 0, .45);',
      '  font: 14px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Microsoft YaHei", sans-serif;',
      '  color: var(--el-text-color-primary, #303133);',
      '}',
      '#gnx-dialog-host .gnx-dlg {',
      '  width: 420px; max-width: 92vw; background: #fff; border-radius: 12px; overflow: hidden;',
      '  box-shadow: 0 12px 40px rgba(0, 0, 0, .22);',
      '  animation: gnx-dlg-in .16s ease-out;',
      '}',
      '@keyframes gnx-dlg-in { from { opacity: 0; transform: translateY(-8px) scale(.98); } to { opacity: 1; transform: none; } }',
      '#gnx-dialog-host .gnx-dlg__head {',
      '  display: flex; align-items: center; justify-content: space-between; gap: 10px;',
      '  padding: 15px 18px; border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);',
      '}',
      '#gnx-dialog-host .gnx-dlg__title { font-size: 15px; font-weight: 700; color: var(--el-text-color-primary, #303133); }',
      '#gnx-dialog-host .gnx-dlg__x {',
      '  border: 0; background: none; padding: 0 2px; cursor: pointer;',
      '  font-size: 19px; line-height: 1; color: var(--el-text-color-placeholder, #a8abb2);',
      '}',
      '#gnx-dialog-host .gnx-dlg__x:hover { color: var(--el-text-color-regular, #606266); }',
      '#gnx-dialog-host .gnx-dlg__body { display: flex; gap: 12px; padding: 20px 18px; }',
      '#gnx-dialog-host .gnx-dlg__icon { flex: none; width: 22px; height: 22px; margin-top: 1px; }',
      '#gnx-dialog-host .gnx-dlg__text { flex: 1; white-space: pre-wrap; word-break: break-word; color: var(--el-text-color-regular, #606266); }',
      '#gnx-dialog-host .gnx-dlg__foot {',
      '  display: flex; justify-content: flex-end; gap: 8px; padding: 0 18px 18px;',
      '}',
      '#gnx-dialog-host button.gnx-dlg__btn {',
      '  height: 32px; padding: 0 18px; border-radius: 6px; font-size: 13px; cursor: pointer;',
      '  border: 1px solid var(--el-border-color, #dcdfe6); background: #fff;',
      '  color: var(--el-text-color-regular, #606266);',
      '}',
      '#gnx-dialog-host button.gnx-dlg__btn:hover { color: var(--el-color-primary, #409eff); border-color: var(--el-color-primary-light-5, #a0cfff); background: var(--el-color-primary-light-9, #ecf5ff); }',
      '#gnx-dialog-host button.gnx-dlg__btn--primary {',
      '  border-color: var(--el-color-primary, #409eff); background: var(--el-color-primary, #409eff); color: #fff; font-weight: 600;',
      '}',
      '#gnx-dialog-host button.gnx-dlg__btn--primary:hover { opacity: .88; color: #fff; }',
    ].join('\n');
    (doc.head || doc.documentElement).appendChild(style);
  }

  // 自绘对话框（Promise 版）：resolve(true)=确认，resolve(false)=取消/点遮罩/关闭
  //   opts = { message, type: 'info'|'success'|'warn'|'error', title, confirmText, cancelText }
  //   只传 message 时等价于原来的 alert()：只有标题、正文和「确定」。
  function showDialog(opts) {
    const o = (typeof opts === 'string') ? { message: opts } : (opts || {});
    const type = MODAL_TITLES[o.type] ? o.type : 'info';
    const color = MODAL_COLORS[type];
    const doc = document;
    ensureDialogStyle(doc);

    return new Promise(function (resolve) {
      let done = false;
      const host = doc.createElement('div');
      host.id = 'gnx-dialog-host';

      const box = doc.createElement('div');
      box.className = 'gnx-dlg';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');

      const head = doc.createElement('div');
      head.className = 'gnx-dlg__head';
      const title = doc.createElement('div');
      title.className = 'gnx-dlg__title';
      title.textContent = o.title || MODAL_TITLES[type];
      const close = doc.createElement('button');
      close.type = 'button';
      close.className = 'gnx-dlg__x';
      close.setAttribute('aria-label', '关闭');
      close.textContent = '×';
      head.appendChild(title); head.appendChild(close);

      const body = doc.createElement('div');
      body.className = 'gnx-dlg__body';
      const icon = doc.createElement('div');
      icon.className = 'gnx-dlg__icon';
      icon.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="' + color
        + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + MODAL_ICONS[type] + '</svg>';
      const text = doc.createElement('div');
      text.className = 'gnx-dlg__text';
      text.textContent = o.message == null ? '' : String(o.message);
      body.appendChild(icon); body.appendChild(text);

      const foot = doc.createElement('div');
      foot.className = 'gnx-dlg__foot';

      function finish(result) {
        if (done) return;
        done = true;
        doc.removeEventListener('keydown', onKey, true);
        host.remove();
        resolve(result);
      }

      const cancel = doc.createElement('button');
      cancel.type = 'button';
      cancel.className = 'gnx-dlg__btn';
      cancel.textContent = o.cancelText || '取消';
      cancel.addEventListener('click', function () { finish(false); });

      const ok = doc.createElement('button');
      ok.type = 'button';
      ok.className = 'gnx-dlg__btn gnx-dlg__btn--primary';
      ok.textContent = o.confirmText || '确定';
      ok.addEventListener('click', function () { finish(true); });

      // 遮罩点击 = 取消；有确认无取消时点遮罩等同关闭
      host.addEventListener('mousedown', function (e) { if (e.target === host) finish(false); });
      close.addEventListener('click', function () { finish(false); });

      function onKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); }
        else if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); finish(true); }
      }

      if (o.cancelText) foot.appendChild(cancel);
      foot.appendChild(ok);
      box.appendChild(head); box.appendChild(body); box.appendChild(foot);
      host.appendChild(box);
      (doc.body || doc.documentElement).appendChild(host);

      // 焦点留在宿主上，避免 Enter 被页面其它监听吃掉
      host.tabIndex = -1;
      try { host.focus({ preventScroll: true }); } catch (e) { /* 忽略 */ }
      doc.addEventListener('keydown', onKey, true);
    });
  }

  // 语法糖：等价于原来的 alert(message)，但非阻塞且可 await
  function showAlert(message, type, title) {
    return showDialog({ message: message, type: type, title: title });
  }

  // 读取某行：返回 { materialNo, reserveQty, model, warehouseName, batchNo }
  function readRow(tr) {
    const cells = tr.querySelectorAll('td');
    const txt = (i) => (cells[i] ? cells[i].innerText.replace(/\s+/g, ' ').trim() : '');
    return { materialNo: txt(1), model: txt(2), reserveQty: parseInt(txt(3), 10) || 0, warehouseName: txt(5), batchNo: txt(9) };
  }

  // 从选中行读取“预留单明细号”列的值（用于 targetItemId）。找不到该列则直接报错，不继续。
  function getSelectedItemId(tr) {
    let colIdx = -1;
    document.querySelectorAll('table').forEach(function (t) {
      if (colIdx >= 0) return;
      Array.from(t.querySelectorAll('thead th')).forEach(function (th, i) {
        if (colIdx < 0 && (th.innerText || '').replace(/\s+/g, ' ').trim() === '预留单明细号') colIdx = i;
      });
    });
    if (colIdx < 0) throw new Error('未找到“预留单明细号”列（可能已被隐藏），请先显示该列后再操作。');
    const cells = tr.querySelectorAll('td');
    if (!cells[colIdx]) throw new Error('未找到“预留单明细号”列。');
    const v = cells[colIdx].innerText.replace(/\s+/g, ' ').trim();
    if (!v) throw new Error('“预留单明细号”列为空，无法取得明细行id。');
    return v;
  }

  // ---------------- 库存可用量弹窗 ----------------
  function openStockModal(materialNo, productName, initialQty) {
    return new Promise(function (resolve) {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;';
      const box = document.createElement('div');
      box.style.cssText = 'background:#fff;border-radius:6px;width:94%;max-width:1280px;height:84vh;display:flex;flex-direction:column;box-shadow:0 6px 24px rgba(0,0,0,.3);';
      box.innerHTML =
        '<style>.gnx-stock-row:hover{background:#f5f7fa;}</style>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #eee;">' +
          '<strong>库存可用量</strong>' +
          '<button data-close style="border:none;background:none;font-size:22px;cursor:pointer;color:#666;">&times;</button>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 16px;background:#fafafa;border-bottom:1px solid #eee;font-size:13px;">' +
          '<label>库存类型&nbsp;<select data-type style="height:30px;padding:0 6px;border:1px solid #dcdfe6;border-radius:4px;">' +
            '<option value="">全部</option><option value="在库">在库</option><option value="在途">在途</option>' +
          '</select></label>' +
          '<label>批次号&nbsp;<input data-batch placeholder="请输入批次号" style="width:150px;height:30px;padding:0 8px;border:1px solid #dcdfe6;border-radius:4px;"></label>' +
          '<button data-query style="height:30px;padding:0 14px;border:none;border-radius:4px;background:#409eff;color:#fff;cursor:pointer;">查询</button>' +
          '<button data-reset style="height:30px;padding:0 14px;border:1px solid #dcdfe6;border-radius:4px;background:#fff;color:#606266;cursor:pointer;">重置</button>' +
        '</div>' +
        '<div style="flex:1;overflow:auto;">' +
          '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
            '<thead><tr style="background:#f0f2f5;text-align:left;position:sticky;top:0;">' +
              '<th style="padding:8px 10px;width:36px;"></th>' +
              '<th style="padding:8px 10px;">物料编码</th><th style="padding:8px 10px;">物料名称</th><th style="padding:8px 10px;">型号</th>' +
              '<th style="padding:8px 10px;">仓库名称</th><th style="padding:8px 10px;">库存组织</th><th style="padding:8px 10px;">类型</th>' +
              '<th style="padding:8px 10px;">数量</th><th style="padding:8px 10px;">可用量</th><th style="padding:8px 10px;">批次号</th>' +
              '<th style="padding:8px 10px;">预计入库时间</th><th style="padding:8px 10px;">调拨单号</th><th style="padding:8px 10px;">调拨出单号</th>' +
            '</tr></thead>' +
            '<tbody><tr><td colspan="13" style="padding:24px;text-align:center;color:#999;">加载中…</td></tr></tbody>' +
          '</table>' +
        '</div>' +
        '<div style="display:flex;align-items:center;padding:10px 16px;border-top:1px solid #eee;">' +
          '<label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#606266;">申请数量' +
            '<input id="gnx-apply-qty" type="number" min="0" step="1" value="' + (initialQty != null ? initialQty : '') + '" style="width:84px;height:30px;padding:0 8px;border:1px solid #dcdfe6;border-radius:4px;font-size:13px;">' +
          '</label>' +
          '<span style="flex:1;"></span>' +
          '<button data-cancel style="height:32px;padding:0 16px;margin-right:8px;border:1px solid #dcdfe6;border-radius:4px;background:#fff;cursor:pointer;">取消</button>' +
          '<button data-ok style="height:32px;padding:0 16px;border:none;border-radius:4px;background:#409eff;color:#fff;cursor:pointer;">确定</button>' +
        '</div>';
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      let selected = null;
      box.querySelector('[data-close]').addEventListener('click', function () { overlay.remove(); resolve({ canceled: true }); });
      box.querySelector('[data-cancel]').addEventListener('click', function () { overlay.remove(); resolve({ canceled: true }); });

      function buildQuery() {
        const parts = ['pageNo=1', 'pageSize=10', 'orgCode=' + ORG_CODE, 'materialNo=' + encodeURIComponent(materialNo)];
        const type = box.querySelector('[data-type]').value;
        const batch = box.querySelector('[data-batch]').value.trim();
        parts.push('columnFilters%5B0%5D.column=availability&columnFilters%5B0%5D.values%5B0%5D=1&columnFilters%5B0%5D.values%5B1%5D=' + MAX_OFFER + '&columnFilters%5B0%5D.mode=BETWEEN');
        if (type) parts.push('columnFilters%5B1%5D.column=type&columnFilters%5B1%5D.values%5B0%5D=' + encodeURIComponent(type));
        if (batch) parts.push('columnFilters%5B2%5D.column=batchNo&columnFilters%5B2%5D.values%5B0%5D=' + encodeURIComponent(batch));
        return API_BASE + '/crm/stock-availability/page?' + parts.join('&');
      }

      function load() {
        const tb = box.querySelector('tbody');
        tb.innerHTML = '<tr><td colspan="13" style="padding:24px;text-align:center;color:#999;">查询中…</td></tr>';
        api('GET', buildQuery()).then(function (j) {
          const list = (j && j.data && (j.data.list || j.data.records)) || [];
          tb.innerHTML = '';
          if (!list.length) { tb.innerHTML = '<tr><td colspan="13" style="padding:24px;text-align:center;color:#999;">无可用库存</td></tr>'; return; }
          list.forEach(function (rec) {
            const tr = document.createElement('tr');
            tr.className = 'gnx-stock-row';
            tr.style.cssText = 'cursor:default;border-bottom:1px solid #f0f0f0;';
            tr.innerHTML =
              '<td style="padding:8px 10px;text-align:center;"><span style="display:inline-block;width:14px;height:14px;border:1px solid #999;border-radius:50%;cursor:pointer;"></span></td>' +
              '<td style="padding:8px 10px;">' + escHtml(rec.materialNo) + '</td>' +
              '<td style="padding:8px 10px;">' + escHtml(productName || '') + '</td>' +
              '<td style="padding:8px 10px;">' + escHtml(rec.productModel || '') + '</td>' +
              '<td style="padding:8px 10px;">' + escHtml(rec.warehouseName || '') + '</td>' +
              '<td style="padding:8px 10px;">' + escHtml(rec.orgCode || '') + '</td>' +
              '<td style="padding:8px 10px;">' + escHtml(rec.type || '') + '</td>' +
              '<td style="padding:8px 10px;">' + escHtml(rec.stockNum != null ? rec.stockNum : '') + '</td>' +
              '<td style="padding:8px 10px;color:#67c23a;">' + escHtml(rec.availability != null ? rec.availability : '') + '</td>' +
              '<td style="padding:8px 10px;">' + escHtml(rec.batchNo || '') + '</td>' +
              '<td style="padding:8px 10px;">' + escHtml(fmtDate(rec.expectStockTime) || '') + '</td>' +
              '<td style="padding:8px 10px;">' + escHtml(rec.transferApplyNo || '') + '</td>' +
              '<td style="padding:8px 10px;">' + escHtml(rec.transferOrderApplyNo || '') + '</td>';
            tr.addEventListener('click', function () {
              box.querySelectorAll('tbody tr').forEach(function (r) { const rb = r.querySelector('span'); if (rb) { rb.style.background = ''; rb.style.borderColor = '#999'; } });
              const rb = tr.querySelector('span'); if (rb) { rb.style.background = '#409eff'; rb.style.borderColor = '#409eff'; }
              selected = rec;
              // ★ 输入框 = min(选中行可用量, 申请数量基准(预留数量))：可用量更大时回升，但不超预留数量
              const base = (initialQty != null && !isNaN(initialQty)) ? Number(initialQty) : null;
              const avail = (rec && rec.availability != null) ? Number(rec.availability) : null;
              if (avail != null) {
                const target = (base != null) ? Math.min(avail, base) : avail;
                setQtyInput(target);
              }
            });
            tb.appendChild(tr);
          });
        }).catch(function (err) {
          tb.innerHTML = '<tr><td colspan="13" style="padding:24px;text-align:center;color:#c00;">查询失败：' + escHtml(String(err && err.message ? err.message : err)) + '</td></tr>';
        });
      }

      box.querySelector('[data-query]').addEventListener('click', load);
      box.querySelector('[data-reset]').addEventListener('click', function () {
        box.querySelector('[data-batch]').value = '';
        box.querySelector('[data-type]').value = '';
        load();
      });
      box.querySelector('[data-ok]').addEventListener('click', async function () {
        if (!selected) { await showAlert('请先选择一行库存。', 'warn'); return; }
        const q = getQtyValue();
        if (q == null) { await showAlert('请输入申请数量。', 'warn'); return; }
        const avail = (selected.availability != null) ? Number(selected.availability) : q;
        if (q > avail) { await showAlert('可用库存不足：申请数量 ' + q + ' > 可用量 ' + avail + '，无法提交。', 'warn'); return; }
        const reserve = (initialQty != null && !isNaN(initialQty)) ? Number(initialQty) : q;
        if (q > reserve) { await showAlert('申请数量不能超过预留数量(预留数量 ' + reserve + ')，无法提交。', 'warn'); return; }
        overlay.remove();
        resolve({ rec: selected, qty: q });
      });

      load();
    });
  }

  // 取某订单下的明细行列表
  async function orderItems(orderId) {
    const j = await api('GET', API_BASE + '/crm/order/item/page?pageNo=1&pageSize=200&id=' + encodeURIComponent(orderId));
    return (j && j.data && (j.data.list || j.data.records)) || [];
  }

  // 第二步：跨库挪单（move-item-v2）。sourceItemId=新订单明细行B，targetItemId=选中行“预留单明细号”，moveQuantity=申请数量
  async function doCrossWarehouseMove(orderBId, targetItemId, qty) {
    if (!targetItemId) throw new Error('缺少源订单明细行id（targetItemId）');
    const newItems = await orderItems(orderBId);
    const sourceItemId = (newItems[0] || {}).id;
    if (!sourceItemId) throw new Error('未获取到新订单明细行id（sourceItemId）');
    const mv = await api('PUT', API_BASE + '/crm/order/move-item-v2', {
      sourceItemId: sourceItemId,
      targetItemId: targetItemId,
      moveQuantity: qty,
    });
    return mv.data;
  }

  // 第三步：撤回临时订单（删除前置，否则删除会失败）
  async function doWithdrawTempOrder(orderId) {
    const w = await api('PUT', API_BASE + '/crm/order/withdraw?id=' + encodeURIComponent(orderId));
    return w.data;
  }

  // 第四步：删除临时订单（闭环）
  async function doDeleteTempOrder(orderId) {
    const d = await api('DELETE', API_BASE + '/crm/order/delete?id=' + encodeURIComponent(orderId));
    return d.data;
  }

  // ---------------- 核心：创建并提交 ----------------
  async function createAndSubmit(stock, row, product, applyQty, targetItemId) {
    const srcId = getSrcOrderId();
    if (!srcId) throw new Error('无法从地址栏解析源订单 id');
    const src = (await api('GET', API_BASE + '/crm/order/get?id=' + srcId)).data || {};
    product = product || await getProductInfo(stock.materialNo);

    // ★ 申请数量校验：默认用选中行预留数量；若（手动改后的）申请数量 > 可用量 或 > 预留数量 则提交失败
    if (applyQty == null || isNaN(applyQty)) applyQty = row.reserveQty || 1;
    const avail = (stock.availability != null) ? Number(stock.availability) : Number(applyQty);
    if (Number(applyQty) > avail) throw new Error('可用库存不足：申请数量 ' + applyQty + ' > 可用量 ' + avail + '，提交失败');
    const reserve = (row.reserveQty != null) ? Number(row.reserveQty) : Number(applyQty);
    if (Number(applyQty) > reserve) throw new Error('申请数量不能超过预留数量(预留数量 ' + reserve + ')，提交失败');
    applyQty = Number(applyQty);

    const body = {
      reservationNo: newReservationNo(),              // ★ 预留单号=时间戳
      orderType: 1,
      reservationType: 1,
      customerNo: src.customerNo,
      customerName: src.customerName,
      warehouseNo: stock.wareCode,                    // ★ 仓库=选中库存行
      warehouseId: stock.warehouseId,
      warehouseName: stock.warehouseName,
      destinationCountry: src.destinationCountry,
      deliveryAddress: '',
      receiverName: '',
      receiverPhone: '',
      vatNo: src.vatNo,
      tradeTerms: '',
      currency: '',
      prioritySpecialStock: true,
      customerContractNo: '',
      paymentAgreementNo: src.paymentAgreementNo,
      shippingPlace: '海外仓',
      salesOrganization: '010501',
      orderNoticeUrl: '',
      orderOrg: 1,
      remark: '',
      items: [{
        productCode: stock.materialNo,                 // ★ 明细=选中库存行
        productName: product.productName,
        model: product.model || stock.productModel,
        stockAvailabileId: stock.id,
        lineId: stock.lineId,
        warehouseId: stock.warehouseId,
        warehouseName: stock.warehouseName,
        ownerCode: stock.ownerCode,
        ownerName: stock.ownerName,
        expectedStockTime: fmtDate(stock.expectStockTime),
        type: stock.type,
        quantity: stock.stockNum,
        availableQuantity: stock.availability,
        applyQuantity: applyQty,                     // ★ 申请数量=输入框值(已校验<=可用量)
        demandDeliveryDate: todayStr(),               // ★ 需求发货日期=今天
        price: 0,                                     // ★ 价格=0
        warranty: product.warranty,
        spareWarranty: product.spareWarranty,
        standardWarranty: product.standardWarranty,
        batchNo: strOrNull(stock.batchNo),
        transferOrderNo: strOrNull(stock.transferApplyNo),
        transferOutNo: strOrNull(stock.transferOrderApplyNo),
      }],
    };

    const created = await api('POST', API_BASE + '/crm/order/create', body);
    if (!created.data) throw new Error('创建订单失败（未返回订单id）：' + JSON.stringify(created).slice(0, 200));
    const newId = String(created.data);
    const sub = await api('PUT', API_BASE + '/crm/order/submit?id=' + encodeURIComponent(newId));
    // ★ 第二步：跨库挪单（创建+提交订单B 后自动执行）
    const move = await doCrossWarehouseMove(newId, targetItemId, applyQty);
    // ★ 第三步：撤回临时订单（删除前置）
    const wdr = await doWithdrawTempOrder(newId);
    // ★ 第四步：删除临时订单（创建→提交→挪单→撤回→删除 完成闭环）
    const del = await doDeleteTempOrder(newId);
    return { newId: newId, submit: sub.data, move: move, withdraw: wdr.data, delete: del.data };
  }

  // 让当前详情页重新取数并更新 DOM，且不刷新整个文档
  // 1) 首选：直接点应用自带的 TagsView「刷新当前标签页」按钮（svg[data-icon="ep:refresh-right"]）
  // 2) 备选：自己复刻 —— 先清 keep-alive 缓存，再走 /redirect/:path(.*) 重挂载组件
  // 3) 兜底：都拿不到时退回整页 location.reload()
  function refreshPageData() {
    try {
      const root = document.querySelector('#v-tags-view') || document;
      const svg = root.querySelector('svg[data-icon="ep:refresh-right"]');
      const tool = svg && (svg.closest('.v-tags-view__tool') || svg.closest('span') || svg.parentElement);
      if (tool && typeof tool.click === 'function') { tool.click(); return true; }
    } catch (e) { /* 落到备选 */ }

    try {
      const appEl = document.querySelector('#app');
      const app = appEl && appEl.__vue_app__;
      const gp = app && app.config && app.config.globalProperties;
      const router = gp && gp.$router;
      const cur = router && router.currentRoute && router.currentRoute.value;
      if (router && cur && typeof cur.fullPath === 'string' && cur.fullPath.indexOf('/redirect') !== 0) {
        try {
          const pinia = gp.$pinia;
          const tagsView = (pinia && pinia._s && typeof pinia._s.get === 'function') ? pinia._s.get('tagsView') : null;
          if (tagsView && typeof tagsView.delCachedView === 'function') {
            tagsView.delCachedView({ name: cur.name, fullPath: cur.fullPath });
          }
        } catch (e) { /* 清缓存失败也继续试 /redirect */ }
        router.replace('/redirect' + cur.fullPath);
        return true;
      }
    } catch (e) { /* 走兜底 */ }

    location.reload();
    return false;
  }

  // 刷新后把标签页切回「预留明细」
  //   ⚠ 关键：必须先等组件重建完成，再去判断/点击。一上来就查 is-active 的话，
  //     那时 DOM 还是旧的、「预留明细」本来就处于激活态，会被误判成“已就位”直接返回，
  //     重建完成后就停在默认的「预留单明细」。
  function findDetailTab() {
    return Array.from(document.querySelectorAll('.el-tabs__item')).filter(function (t) {
      return (t.innerText || '').trim() === '预留明细';
    })[0] || null;
  }
  function ensureDetailTab(tries) {
    const tab = findDetailTab();
    if (tab && tab.className.toString().indexOf('is-active') >= 0) return;   // 已就位，收工
    if (tab) tab.click();
    if (tries > 0) setTimeout(function () { ensureDetailTab(tries - 1); }, 250);
  }
  function restoreDetailTab() {
    // 拿旧组件的标签节点当锚点：它从文档里消失 == 组件已重建完成
    const oldTab = findDetailTab() || document.querySelector('.el-tabs__item');
    let waited = 0;
    (function waitRemount() {
      waited += 100;
      if (oldTab && oldTab.isConnected && waited < 3000) { setTimeout(waitRemount, 100); return; }
      ensureDetailTab(24);
    })();
  }

  // ---------------- 挪库存主流程 ----------------
  let _busy = false;
  async function moveStockMain() {
    if (!featureOn('move.crossMove')) { await showAlert('「挪用公共库存」功能已在 Nexus 工具箱中关闭。', 'warn'); return; }
    if (_busy) { await showAlert('正在处理中，请稍候…'); return; }
    _busy = true;
    try {
      // ★ 前置校验：只有「预留单」(reservationType === 1) 才允许挪用公共库存。
      //   必须在弹窗/建单之前拦住——否则会白填一遍库存再在提交/挪单环节炸掉，甚至留下脏数据。
      let resType = null;
      try {
        resType = await getSrcReservationType();
      } catch (e) {
        await showAlert('操作失败：' + (e && e.message ? e.message : String(e)), 'error');
        return;
      }
      if (String(resType) !== String(RESERVATION_TYPE_OK)) {
        await showAlert('操作失败：不支持该类型的订单（预留类型：' + await reservationTypeText(resType) + '）', 'error');
        return;
      }

      const body = findDetailBody();
      if (!body) { await showAlert('未找到“预留明细”表格，请先切换到“预留明细”标签页再试。', 'warn'); return; }
      const rows = Array.from(body.tbody.querySelectorAll('tr'));
      const checked = rows.filter(function (tr) { try { return isRowChecked(tr); } catch (e) { return false; } });
      if (checked.length === 0) { await showAlert('请先在“预留明细”中勾选一行，再点击库存搜索。', 'warn'); return; }
      if (checked.length > 1) { await showAlert('只能勾选一行明细，请取消多选后再点击。', 'warn'); return; }

      const row = readRow(checked[0]);
      if (!row.materialNo) { await showAlert('无法读取该行的物料编码。', 'warn'); return; }
      const targetItemId = getSelectedItemId(checked[0]);   // ★ 选中行的“预留单明细号”，找不到会抛错

      const product = await getProductInfo(row.materialNo).catch(function () {
        return { productName: '', model: '', warranty: 10, standardWarranty: 10, spareWarranty: 0 };
      });
      const stock = await openStockModal(row.materialNo, product.productName, row.reserveQty);   // ★ 初始申请数量=该行预留数量
      if (!stock || stock.canceled) return;
      const res = await createAndSubmit(stock.rec, row, product, stock.qty, targetItemId);   // ★ qty 为输入框(自动/手动)最终值
      // ⚠ 必须 await：原来的 alert() 是阻塞的，靠它保证「用户确认后」才刷新表格。
      await showAlert('挪库成功', 'success');
      console.log('[Nexus 挪用公共库存] 完成', { row: row, stock: stock, result: res });
      // ★ 任务成功后，让详情页重新取数并更新 DOM（不刷新整个文档）
      if (refreshPageData()) restoreDetailTab();
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      await showAlert('操作失败：' + msg, 'error');
      console.error('[Nexus 挪用公共库存] 出错', err);
    } finally {
      _busy = false;
    }
  }

  // ---------------- 注入控件（“挪用公共库存”按钮 + 申请数量输入框） ----------------
  function injectMoveButton() {
    let wrap = document.getElementById('gnx-controls');
    if (!wrap) {
      const oldBtn = document.getElementById('gnx-stock-order-btn');
      if (oldBtn && oldBtn.parentElement && oldBtn.parentElement.id !== 'gnx-controls') oldBtn.remove();

      wrap = document.createElement('span');
      wrap.id = 'gnx-controls';
      wrap.style.cssText = 'display:inline-flex;align-items:center;gap:6px;margin-right:8px;';

      const btn = document.createElement('button');
      btn.id = 'gnx-stock-order-btn';
      btn.type = 'button';
      btn.className = 'el-button el-button--primary el-button--small';
      btn.innerHTML = '<span>挪用公共库存</span>';
      btn.addEventListener('click', function () { moveStockMain(); });
      wrap.appendChild(btn);
    }
    return wrap;
  }

  function applyMoveButtonPlacement() {
    if (!featureOn('move.crossMove') || !RESERVATION_RE.test(location.href)) {
      const wrap = document.getElementById('gnx-controls');
      if (wrap) wrap.remove();
      return false;
    }
    // 按钮属于「预留明细」标签页：不在该标签页（或该容器还没渲染）时不要注入，
    // 免得「延期释放」不存在时把按钮塞到别处去。
    if (!hasDeferReleaseButton() || !isDetailTabActive()) {
      const stale = document.getElementById('gnx-controls');
      if (stale) stale.remove();
      return false;
    }
    const wrap = injectMoveButton();
    const ys = Array.from(document.querySelectorAll('button')).filter(function (b) { return (b.innerText || '').trim() === '延期释放'; })[0];
    const container = ys && ys.parentElement;
    if (!container) return false;
    wrap.style.position = ''; wrap.style.top = ''; wrap.style.right = ''; wrap.style.zIndex = '';
    if (wrap.parentElement !== container) container.appendChild(wrap);
    if (wrap !== ys.previousElementSibling) container.insertBefore(wrap, ys);
    return true;
  }

  function setupMoveButton() {
    if (window.__gnxMoveBtnReady) return;
    window.__gnxMoveBtnReady = true;
    applyMoveButtonPlacement();
    // 持久监听：SPA 切换 / 详情页重绘导致控件被清掉时自动补回（不断开）
    new MutationObserver(function () { applyMoveButtonPlacement(); })
      .observe(document.body, { childList: true, subtree: true });
    // 兜底轮询：个别重绘不被 observer 捕获时，也能在 1s 内补回
    setInterval(applyMoveButtonPlacement, 1000);
  }

  /* =========================================================================
   * 8. 跨库挪单：未选仓库免校验 + 去掉必填红星
   * =======================================================================*/

  const DUMMY_ID   = '__GNX_ANY__';
  const DUMMY_NAME = '不限仓库';
  const SEARCH_API = '/admin-api/crm/order/item/page';        // 跨库挪单的目标行搜索
  const MOVE_API   = '/admin-api/crm/order/move-item-v2';     // 跨库挪单提交
  const FALLBACK_MS = 30000;                                   // 兜底复位

  let bypassActive = false;          // 是否处于“本次按钮点击触发的放行窗口”
  let bypassFallbackTimer = null;
  let cachedPage = null;

  // ---------- 定位页面组件实例（模板 ref 挂在它上面） ----------
  function findPageInst() {
    const appEl = document.querySelector('#app');
    const app = appEl && appEl.__vue_app__;
    const root = app && app._container && app._container._vnode;
    if (!root) return null;
    const stack = [root];
    let visited = 0;
    while (stack.length && visited < 400000) {
      const vn = stack.pop(); visited++;
      if (!vn) continue;
      const comp = vn.component;
      if (comp) {
        const nm = (comp.type && (comp.type.__name || comp.type.name)) || '';
        if (nm === 'ReservationDetailPage') return comp;
        if (comp.subTree) stack.push(comp.subTree);
      }
      const ch = vn.children;
      if (Array.isArray(ch)) { for (let i = 0; i < ch.length; i++) stack.push(ch[i]); }
      else if (ch && typeof ch === 'object' && typeof ch.default === 'function') {
        try { const r = ch.default(); if (Array.isArray(r)) for (let j = 0; j < r.length; j++) stack.push(r[j]); } catch (e) { /* 忽略 */ }
      }
      if (vn.dynamicChildren) { for (let k = 0; k < vn.dynamicChildren.length; k++) stack.push(vn.dynamicChildren[k]); }
      if (vn.suspense && vn.suspense.activeBranch) stack.push(vn.suspense.activeBranch);
    }
    return null;
  }
  function pageInst() {
    if (cachedPage && !cachedPage.isUnmounted) return cachedPage;
    cachedPage = findPageInst();
    return cachedPage;
  }

  // ---------- 拿“仓库选择器”回调 onSuccess（父组件写 _ 的那段） ----------
  function onSuccessFn() {
    const page = pageInst();
    if (!page) return null;
    const ref = page.refs && page.refs.crossWarehouseWarehouseDialogRef;
    const inst = ref && ref.$;
    const props = inst && inst.vnode && inst.vnode.props;
    const fn = props && props.onSuccess;
    if (typeof fn === 'function') return fn;
    cachedPage = null;
    return null;
  }
  function setWarehouse(id, name) {
    const fn = onSuccessFn();
    if (!fn) return false;
    fn({ id: id, name: name, warehouseArea: '' });
    return true;
  }

  // ---------- 「跨库挪单」弹窗与目标仓库显示值 ----------
  function findKuakDialog() {
    let dlg = null;
    document.querySelectorAll('.el-dialog').forEach(function (d) {
      if (!dlg && d.offsetParent !== null && (d.innerText || '').indexOf('跨库挪单') >= 0) dlg = d;
    });
    return dlg;
  }
  function warehouseDisplay() {
    const dlg = findKuakDialog();
    if (!dlg) return null;
    let inp = null;
    dlg.querySelectorAll('input').forEach(function (i) {
      if (!inp && (i.placeholder || '').indexOf('仓库') >= 0) inp = i;
    });
    return inp ? inp.value.trim() : null;
  }

  // ---------- 复位：把目标仓库恢复置空 ----------
  function bypassReset() {
    bypassActive = false;
    setBypassActive(false);
    if (bypassFallbackTimer) { clearTimeout(bypassFallbackTimer); bypassFallbackTimer = null; }
    try { setWarehouse('', ''); } catch (e) { /* 忽略 */ }
  }
  function onRelevantDone() { if (bypassActive) bypassReset(); }

  // ---------- 请求层：仅在放行窗口内剔除 warehouseId ----------
  // 说明：包装器常驻安装、只判断行为开关，所以开关能随时开/关，不需要重新打补丁，
  //       也不会与「排序优化」对 XHR.open 的包装互相覆盖。
  (function installRequestHooks() {
    const prevOpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (method, url) {
      const on = featureOn('move.warehouseBypass');
      const u = String(url);
      if (on && bypassActive && u.indexOf(SEARCH_API) >= 0) {
        const stripped = u.replace(/([?&])warehouseId=[^&]*/g, '$1')
                          .replace(/[?&]{2,}/g, '&')
                          .replace(/[?&]$/, '');
        try { this.addEventListener('loadend', onRelevantDone, { once: true }); } catch (e) { /* 忽略 */ }
        return prevOpen.apply(this, [method, stripped].concat(Array.prototype.slice.call(arguments, 2)));
      }
      if (on && bypassActive && u.indexOf(MOVE_API) >= 0) {
        try { this.addEventListener('loadend', onRelevantDone, { once: true }); } catch (e) { /* 忽略 */ }
      }
      return prevOpen.apply(this, arguments);
    };

    const prevFetch = window.fetch;
    window.fetch = function (input, init) {
      const on = featureOn('move.warehouseBypass');
      const u = (typeof input === 'string') ? input : (input && input.url) || '';
      if (on && bypassActive && u.indexOf(SEARCH_API) >= 0) {
        const stripped = u.replace(/([?&])warehouseId=[^&]*/g, '$1')
                          .replace(/[?&]{2,}/g, '&')
                          .replace(/[?&]$/, '');
        return prevFetch.call(this, stripped, init)
          .then(function (res) { onRelevantDone(); return res; },
                function (err) { onRelevantDone(); throw err; });
      }
      return prevFetch.apply(this, arguments);
    };
  })();

  // ---------- 捕获阶段监听「查询 / 确定」点击（唯一触发点） ----------
  document.addEventListener('click', function (e) {
    if (!featureOn('move.warehouseBypass')) return;
    const btn = e.target && e.target.closest && e.target.closest('button');
    if (!btn) return;
    const label = (btn.innerText || '').trim();
    if (label !== '查询' && label !== '确定') return;

    const dlg = findKuakDialog();
    if (!dlg || !dlg.contains(btn)) return;     // 只认「跨库挪单」弹窗里的这两个按钮

    // 情况1：用户已主动选择仓库 → 什么都不做
    if (warehouseDisplay()) return;

    // 情况2：未选仓库 → 临时写入占位仓库让校验通过（不阻止默认行为，应用逻辑继续跑）
    if (!setWarehouse(DUMMY_ID, DUMMY_NAME)) return;
    bypassActive = true;
    setBypassActive(true);   // 同时让静默层不再连「跨库挪单」弹窗一起隐藏
    if (bypassFallbackTimer) clearTimeout(bypassFallbackTimer);
    bypassFallbackTimer = setTimeout(bypassReset, FALLBACK_MS);
  }, true);

  // ---------- 去掉「目标仓库」的必填红星（现已非必填） ----------
  function removeRequiredStar() {
    if (!featureOn('move.warehouseBypass')) return;
    const dlg = findKuakDialog();
    if (!dlg) return;
    dlg.querySelectorAll('span.text-red-500').forEach(function (s) {
      if ((s.innerText || '').trim() !== '*') return;
      const p = s.parentElement;
      if (p && p.classList && p.classList.contains('filter-label') && (p.innerText || '').indexOf('目标仓库') >= 0) {
        s.style.display = 'none';
      }
    });
  }
  let starTimer = null;
  new MutationObserver(function () {
    if (starTimer) return;
    starTimer = window.setTimeout(function () { starTimer = null; removeRequiredStar(); }, 150);
  }).observe(document.body, { childList: true, subtree: true });
  removeRequiredStar();

  /* =========================================================================
   * 9. 设置面板（⚙）：每个功能一个开关，切换即生效
   * =======================================================================*/

  const PANEL_ID = 'gnx-toolbox-panel';
  const GEAR_ID  = 'gnx-toolbox-gear';

  const ORG_CACHE_KEY = 'goodwe_nexus_org_options';

  function collectOrgOptions() {
    // ⚠ 库存组织候选**只能**来自库存可用量页：
    //   其它页面（新增/编辑预留单、订单列表…）的下拉项是客户/国家/仓库/批次等，
    //   一旦混进来就会把「库存组织」选错。所以这里只在库存可用量页（含其内嵌 iframe）
    //   采集并写入缓存；其它页面一律读缓存（没有缓存时退回当前配置值）。
    const TYPE_VALUES = ['在库', '在途', '在制', '专项', '专项-在途', '实单'];
    const targetDocs = [];
    if (TARGET_RE.test(window.location.href)) targetDocs.push(document);
    [...document.querySelectorAll('iframe')].forEach((f) => {
      try {
        if (f.src && TARGET_RE.test(f.src) && f.contentDocument) targetDocs.push(f.contentDocument);
      } catch (e) { /* 跨域忽略 */ }
    });

    if (targetDocs.length) {
      const seen = [];
      targetDocs.forEach((doc) => [...doc.querySelectorAll('.el-select-dropdown__item')].forEach((it) => {
        const t = it.textContent.trim();
        if (!t || TYPE_VALUES.includes(t) || /^\d+条\/页$/.test(t)) return;
        if (!seen.includes(t)) seen.push(t);
      }));
      if (seen.length) {
        try { localStorage.setItem(ORG_CACHE_KEY, JSON.stringify(seen)); } catch (e) { /* 忽略 */ }
        return seen;
      }
    }

    try {
      const raw = localStorage.getItem(ORG_CACHE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) return arr;
      }
    } catch (e) { /* 忽略 */ }
    return [S.orgName];
  }

  function removeSettingsPanel() {
    const overlay = document.getElementById(PANEL_ID);
    if (overlay) overlay.remove();
  }

  // 开关切换后把改动立刻反映到页面上
  function applyEverything(win, doc) {
    if (!S.enabled) {
      // 总开关关闭：撤掉本脚本注入的一切（⚙ 保留，否则没法再打开）
      try {
        const w = document.getElementById('gnx-controls'); if (w) w.remove();
        const p = document.getElementById('gw-status-panel'); if (p) p.remove();
        cleanupStatusFilter(document);
        applyWeekTooltip(window, document);
        restorePopups(document);
      } catch (e) { /* 忽略 */ }
      ensureGearButton(win, doc);
      return;
    }
    try { const st = win.__gwGlobalArrivalSort; if (st && typeof st.render === 'function') st.render(); } catch (e) { /* 忽略 */ }
    try { if (typeof win.__gwReservationApply === 'function') win.__gwReservationApply(); } catch (e) { /* 忽略 */ }
    try { resyncReservation(); } catch (e) { /* 忽略 */ }
    try { applyMoveButtonPlacement(); } catch (e) { /* 忽略 */ }
    ensureGearButton(win, doc);
  }

  function openSettingsPanel(win, doc) {
    removeSettingsPanel();
    const overlay = doc.createElement('div');
    overlay.id = PANEL_ID;
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(17,24,39,.5);display:flex;align-items:center;justify-content:center;font:14px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1f2937;';
    const panel = doc.createElement('div');
    panel.style.cssText = 'width:560px;max-width:94vw;max-height:90vh;overflow:auto;background:#fff;border-radius:14px;box-shadow:0 10px 60px rgba(0,0,0,.35);';

    const head = doc.createElement('div');
    head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #e5e7eb;';
    const titleWrap = doc.createElement('div');
    const title = doc.createElement('div');
    title.textContent = 'Nexus工具箱(For EU)';
    title.style.cssText = 'font-weight:700;font-size:16px;color:#111827;';
    const subtitle = doc.createElement('div');
    subtitle.textContent = '所有功能仅对EU定制，其他区域未适配';
    subtitle.style.cssText = 'font-size:12px;color:#9ca3af;margin-top:2px;';
    titleWrap.appendChild(title); titleWrap.appendChild(subtitle);
    const close = doc.createElement('button');
    close.textContent = '×';
    close.style.cssText = 'border:none;background:none;font-size:22px;line-height:1;cursor:pointer;color:#6b7280;padding:0 4px;';
    close.onclick = () => removeSettingsPanel();
    head.appendChild(titleWrap); head.appendChild(close);
    panel.appendChild(head);

    const body = doc.createElement('div');
    body.style.cssText = 'padding:10px 20px 20px;';

    const makeSwitch = (path) => {
      const wrap = doc.createElement('label');
      wrap.style.cssText = 'position:relative;display:inline-block;width:40px;height:22px;flex:none;';
      const cb = doc.createElement('input');
      cb.type = 'checkbox'; cb.checked = !!S[path];
      cb.style.cssText = 'position:absolute;opacity:0;width:100%;height:100%;margin:0;cursor:pointer;';
      const track = doc.createElement('span');
      track.style.cssText = 'position:absolute;inset:0;border-radius:22px;background:' + (S[path] ? '#409eff' : '#cbd5e1') + ';transition:background .15s;';
      const thumb = doc.createElement('span');
      thumb.style.cssText = 'position:absolute;top:2px;left:' + (S[path] ? '20px' : '2px') + ';width:18px;height:18px;border-radius:50%;background:#fff;transition:left .15s;box-shadow:0 1px 2px rgba(0,0,0,.3);';
      wrap.appendChild(cb); wrap.appendChild(track); wrap.appendChild(thumb);

      cb.addEventListener('change', () => {
        S[path] = cb.checked;
        saveSettings();
        track.style.background = cb.checked ? '#409eff' : '#cbd5e1';
        thumb.style.left = cb.checked ? '20px' : '2px';
        applyEverything(win, doc);
      });
      return wrap;
    };

    const showToggle = (labelText, path, hint) => {
      const row = doc.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid #f3f4f6;';
      const left = doc.createElement('div');
      const label = doc.createElement('div');
      label.textContent = labelText;
      label.style.cssText = 'color:#374151;';
      left.appendChild(label);
      if (hint) {
        const h = doc.createElement('div');
        h.textContent = hint;
        h.style.cssText = 'font-size:12px;color:#9ca3af;margin-top:2px;';
        left.appendChild(h);
      }
      row.appendChild(left); row.appendChild(makeSwitch(path));
      return row;
    };

    const moduleHeader = (text, isFirst) => {
      const wrap = doc.createElement('div');
      wrap.style.cssText = 'margin:' + (isFirst ? '2px 0 8px' : '18px 0 8px') + ';';
      if (!isFirst) {
        const line = doc.createElement('div');
        line.style.cssText = 'height:1px;background:#e5e7eb;margin-bottom:10px;';
        wrap.appendChild(line);
      }
      const label = doc.createElement('div');
      label.textContent = text;
      label.style.cssText = 'font-size:13px;color:#1f2937;font-weight:700;letter-spacing:.4px;';
      wrap.appendChild(label);
      return wrap;
    };

    const makeOrgRow = () => {
      const row = doc.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 0;border-bottom:1px solid #f3f4f6;';
      const label = doc.createElement('span');
      label.textContent = '库存组织';
      label.style.cssText = 'color:#374151;';
      const sel = doc.createElement('select');
      sel.style.cssText = 'max-width:240px;padding:6px 8px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;';
      const orgs = collectOrgOptions();   // 只来自库存可用量页（带缓存）
      const list = orgs.slice();
      // 保证当前配置值一定在选项里，否则 select 会显示成第一项（看起来像"默认值错了"）
      if (S.orgName && !list.includes(S.orgName)) list.unshift(S.orgName);
      if (!list.length) list.push(S.orgName);
      list.forEach((o) => {
        const op = doc.createElement('option'); op.value = o; op.textContent = o;
        if (o === S.orgName) op.selected = true;
        sel.appendChild(op);
      });
      sel.value = S.orgName;
      sel.addEventListener('change', () => { S.orgName = sel.value; saveSettings(); });
      row.appendChild(label); row.appendChild(sel);
      return row;
    };

    const mkNum = (key, w) => {
      const i = doc.createElement('input');
      i.type = 'number'; i.value = S[key];
      i.style.cssText = 'width:' + w + ';padding:6px 8px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;';
      i.addEventListener('change', () => { S[key] = String(i.value); saveSettings(); });
      return i;
    };

    // —— 总开关 ——
    const master = showToggle('启用 Nexus 工具箱', 'enabled', '关闭后所有功能立即停用（含下方全部开关）');
    master.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border:1px solid #dbeafe;background:#f8fbff;border-radius:10px;margin:6px 0 4px;';
    body.appendChild(master);

    // —— 库存可用量 ——
    body.appendChild(moduleHeader('库存可用量', false));
    body.appendChild(showToggle('自动选择库存组织', 'stock.autoOrg', '进页面后自动把「库存组织编码」切到下面选定的组织'));
    body.appendChild(makeOrgRow());

    const autoRow = doc.createElement('div');
    autoRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 0;border-bottom:1px solid #f3f4f6;';
    const autoLeft = doc.createElement('div');
    autoLeft.style.cssText = 'display:flex;align-items:center;gap:10px;';
    const autoLabel = doc.createElement('span');
    autoLabel.textContent = '自动筛选可用量';
    autoLabel.style.cssText = 'color:#374151;';
    autoLeft.appendChild(autoLabel); autoLeft.appendChild(makeSwitch('stock.autoFilter'));
    const range = doc.createElement('div');
    range.style.cssText = 'display:flex;align-items:center;gap:6px;';
    range.appendChild(mkNum('availMin', '70px'));
    const dash = doc.createElement('span'); dash.textContent = '—'; dash.style.cssText = 'color:#9ca3af;';
    range.appendChild(dash);
    range.appendChild(mkNum('availMax', '90px'));
    autoRow.appendChild(autoLeft); autoRow.appendChild(range);
    body.appendChild(autoRow);

    body.appendChild(showToggle('排序优化', 'stock.sortOptimize', '按预计入库时间对全部数据整体排序（点该列表头可切换升降序）'));

    // —— 预留单 ——
    body.appendChild(moduleHeader('预留单', false));
    body.appendChild(showToggle('隐藏预留数量为0的行', 'res.hideZeroQty', '预留数量为 0 的明细行不展示'));
    body.appendChild(showToggle('预计入库时间悬停显示 ISO 周数', 'res.weekTooltip', '悬停「预计入库时间」单元格显示「xxxx年第N周 星期X」'));
    body.appendChild(showToggle('库存状态客户端筛选', 'res.statusFilter', '在「库存状态」列表头加筛选图标，可勾选显示哪些状态'));

    const sizeRow = doc.createElement('div');
    sizeRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 0;border-bottom:1px solid #f3f4f6;';
    const sizeLabel = doc.createElement('span');
    sizeLabel.textContent = '预留明细默认每页条数';
    sizeLabel.style.cssText = 'color:#374151;';
    const sizeSel = doc.createElement('select');
    sizeSel.style.cssText = 'padding:6px 8px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;';
    ['10', '20', '50', '100'].forEach((v) => {
      const op = doc.createElement('option'); op.value = v; op.textContent = v + ' 条/页';
      if (String(S.pageSize) === v) op.selected = true;
      sizeSel.appendChild(op);
    });
    sizeSel.addEventListener('change', () => {
      S.pageSize = sizeSel.value; saveSettings();
      // 允许切换后重新应用一次（旧实现用 Set 去重，一次页面只设一次）
      window.__gwPageSizeDone = new Set();
      try { if (typeof window.__gwReservationApply === 'function') window.__gwReservationApply(); } catch (e) { /* 忽略 */ }
    });
    sizeRow.appendChild(sizeLabel); sizeRow.appendChild(sizeSel);
    body.appendChild(sizeRow);

    // —— 挪库存 / 跨库挪单 ——
    body.appendChild(moduleHeader('挪库存 · 跨库挪单', false));
    body.appendChild(showToggle('挪用公共库存', 'move.crossMove', '预留明细页新增按钮'));
    body.appendChild(showToggle('跨库挪单·未选仓库免校验', 'move.warehouseBypass', '去除跨库挪单功能的仓库必选限制'));

    // —— 新增预留单 · 明细行 ——
    body.appendChild(moduleHeader('新增预留单 · 明细行', false));
    body.appendChild(showToggle('添加行Beta', 'create.addRowBeta', '在「添加行」旁新增按钮：去除新增行仓库限制'));

    const foot = doc.createElement('div');
    foot.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:16px 0 0;';
    const resetBtn = doc.createElement('button');
    resetBtn.textContent = '恢复默认';
    resetBtn.style.cssText = 'padding:7px 14px;border:1px solid #d1d5db;background:#fff;border-radius:8px;cursor:pointer;color:#374151;';
    resetBtn.onclick = () => {
      Object.assign(S, DEFAULTS); saveSettings();
      applyEverything(win, doc);
      removeSettingsPanel(); openSettingsPanel(win, doc);
    };
    const saveBtn = doc.createElement('button');
    saveBtn.textContent = '保存并关闭';
    saveBtn.style.cssText = 'padding:8px 16px;border:none;background:#409eff;color:#fff;border-radius:8px;cursor:pointer;font-weight:600;';
    saveBtn.onclick = () => {
      saveSettings();
      applyEverything(win, doc);
      notifyPeers({ type: 'gnx-toolbox-settings-changed', settings: Object.assign({}, S) });
      removeSettingsPanel();
    };
    foot.appendChild(resetBtn); foot.appendChild(saveBtn);
    body.appendChild(foot);

    panel.appendChild(body);
    overlay.appendChild(panel);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) removeSettingsPanel(); });
    (doc.body || doc.documentElement).appendChild(overlay);
  }

  function ensureGearButton(win, doc) {
    // ⚠ 即使总开关关闭也保留齿轮，否则用户没法再打开面板把它开回来
    if (doc.getElementById(GEAR_ID)) return;
    const btn = doc.createElement('div');
    btn.id = GEAR_ID;
    btn.textContent = '⚙';
    btn.title = 'Nexus 工具箱(For EU) · 设置（可单独开关每个功能）';
    btn.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:999998;width:44px;height:44px;border-radius:50%;background:' + (S.enabled ? '#409eff' : '#9ca3af') + ';color:#fff;font-size:20px;line-height:44px;text-align:center;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.25);user-select:none;';
    btn.addEventListener('click', () => openSettingsPanel(win, doc));
    (doc.body || doc.documentElement).appendChild(btn);
  }

  // 面板可能开在 iframe 里：把改动广播出去，外层 / 内嵌页各自重新同步一次
  function notifyPeers(message) {
    try { window.postMessage(message, '*'); } catch (e) { /* 忽略 */ }
  }
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || typeof data !== 'object' || data.type !== 'gnx-toolbox-settings-changed') return;
    if (data.settings) {
      Object.keys(DEFAULTS).forEach((k) => { if (data.settings[k] !== undefined) S[k] = data.settings[k]; });
    }
    try { runOnce(window, document); } catch (e) { /* 忽略 */ }
    try { applyMoveButtonPlacement(); } catch (e) { /* 忽略 */ }
  });

  /* =========================================================================
   * 11. 新增预留单：「添加行Beta」——用 /stock-availability/page 跨仓库加明细行
   *   为什么另开按钮：原生「添加行」走 /stock-availability/query，该接口**强制
   *   要求 warehouseCode**（缺则 400「仓库编码不能为空」），只能查当前订单仓库；
   *   而 /stock-availability/page 不要求仓库，天然支持跨仓库。原生弹窗完全不动。
   *   加行落点：复用页面 ref（stockAvailabilityAddDialogRef）上的 onSuccess(rows[])
   *   —— 它会补 preOrderNo/customerNo/customerName、调 product-v2 富化
   *   （productName / warranty / standardWarranty / spareWarranty）并追加到 form.items。
   * =======================================================================*/

  const ADD_ROW_BETA_BTN_ID = 'gnx-add-row-beta-btn';
  const ADD_ROW_BETA_DLG_ID = 'gnx-add-row-beta-dialog';

  // 创建/编辑预留单页的组件实例（模板 ref 挂在它上面）
  function findReservationEditPage() {
    const appEl = document.querySelector('#app');
    const app = appEl && appEl.__vue_app__;
    const root = app && app._container && app._container._vnode;
    if (!root) return null;
    const stack = [root];
    let visited = 0;
    while (stack.length && visited < 400000) {
      const vn = stack.pop(); visited++;
      if (!vn) continue;
      const comp = vn.component;
      if (comp) {
        const nm = (comp.type && (comp.type.__name || comp.type.name)) || '';
        if (nm === 'ReservationEditPage') return comp;
        if (comp.subTree) stack.push(comp.subTree);
      }
      const ch = vn.children;
      if (Array.isArray(ch)) { for (let i = 0; i < ch.length; i++) stack.push(ch[i]); }
      else if (ch && typeof ch === 'object' && typeof ch.default === 'function') {
        try { const r = ch.default(); if (Array.isArray(r)) for (let j = 0; j < r.length; j++) stack.push(r[j]); } catch (e) { /* 忽略 */ }
      }
      if (vn.dynamicChildren) { for (let k = 0; k < vn.dynamicChildren.length; k++) stack.push(vn.dynamicChildren[k]); }
      if (vn.suspense && vn.suspense.activeBranch) stack.push(vn.suspense.activeBranch);
    }
    return null;
  }

  function addRowSuccessFn() {
    const page = findReservationEditPage();
    if (!page) return null;
    const ref = page.refs && page.refs.stockAvailabilityAddDialogRef;
    const inst = ref && ref.$;
    const props = inst && inst.vnode && inst.vnode.props;
    const fn = props && props.onSuccess;
    return typeof fn === 'function' ? fn : null;
  }

  // page 行 → 「添加行」交给 onSuccess 的行形状（productName/质保由页面 product-v2 富化）
  function mapStockRowToAddRow(rec, productName) {
    const s = (v) => (v == null ? '' : v);
    return {
      productCode: rec.materialNo,
      productName: s(productName),
      model: s(rec.productModel),
      stockAvailabileId: rec.id,
      stockAvailable: null,
      lineId: rec.lineId == null ? null : rec.lineId,
      warehouseId: rec.warehouseId,
      warehouseName: s(rec.warehouseName),
      ownerCode: rec.ownerCode == null ? null : rec.ownerCode,
      ownerName: s(rec.ownerName),
      expectedStockTime: fmtDate(rec.expectStockTime) || '',
      type: s(rec.type),
      quantity: rec.stockNum,
      availableQuantity: rec.availability,
      applyQuantity: 0,
      price: '',
      demandDeliveryDate: '',
      batchNo: s(rec.batchNo),
      transferOrderNo: s(rec.transferApplyNo),
      transferOutNo: s(rec.transferOrderApplyNo),
      deliveryDate: s(rec.deliveryDate),
      deliveryDateUpdate: s(rec.deliveryDateUpdate),
      editing: true,
    };
  }

  // 按需求拼 /stock-availability/page 的查询 URL
  //   固定：orgCode=010501 + availability(1~999999,BETWEEN)
  //   类型：未选 → columnFilters[1]=type IN (在库,在途,在制)；已选 → type=<值>
  //   仓库：warehouseName=<输入值>（不限仓库时不带）
  function buildAddRowBetaUrl(opt) {
    const p = ['pageNo=' + (opt.pageNo || 1), 'pageSize=' + (opt.pageSize || 10), 'orgCode=' + ORG_CODE];
    p.push('materialNo=' + encodeURIComponent(opt.materialNo || ''));
    if (opt.warehouseName) p.push('warehouseName=' + encodeURIComponent(opt.warehouseName));
    if (opt.batchNo) p.push('batchNo=' + encodeURIComponent(opt.batchNo));
    p.push('columnFilters%5B0%5D.column=availability&columnFilters%5B0%5D.values%5B0%5D=1'
      + '&columnFilters%5B0%5D.values%5B1%5D=999999&columnFilters%5B0%5D.mode=BETWEEN');
    if (opt.type) {
      p.push('type=' + encodeURIComponent(opt.type));
    } else {
      p.push('columnFilters%5B1%5D.column=type'
        + '&columnFilters%5B1%5D.values%5B0%5D=' + encodeURIComponent('在库')
        + '&columnFilters%5B1%5D.values%5B1%5D=' + encodeURIComponent('在途')
        + '&columnFilters%5B1%5D.values%5B2%5D=' + encodeURIComponent('在制')
        + '&columnFilters%5B1%5D.mode=IN');
    }
    return API_BASE + '/crm/stock-availability/page?' + p.join('&');
  }

  // 补「物料名称」（page 接口不返回，用 product-v2 取，带缓存 + 去重并发）
  const betaNameCache = new Map();      // materialNo -> productDesc
  const betaNamePending = new Map();    // materialNo -> Promise

  function fetchMaterialName(code) {
    if (!code) return Promise.resolve('');
    if (betaNameCache.has(code)) return Promise.resolve(betaNameCache.get(code));
    if (betaNamePending.has(code)) return betaNamePending.get(code);
    const p = api('GET', API_BASE + '/crm/product-v2/fuzzy-page?keyword=' + encodeURIComponent(code)
      + '&pageNo=1&pageSize=20&countryCode=DE')
      .then((j) => {
        const it = ((j && j.data && (j.data.list || j.data.records)) || [])[0] || {};
        const name = it.productDesc || it.productName || '';
        betaNameCache.set(code, name);
        betaNamePending.delete(code);
        return name;
      })
      .catch(() => { betaNamePending.delete(code); return ''; });
    betaNamePending.set(code, p);
    return p;
  }

  function fillBetaMaterialName(code, cell) {
    if (!code || !cell) return;
    fetchMaterialName(code).then(function (name) { if (cell.isConnected) cell.textContent = name; });
  }

  function openAddRowBetaDialog(win) {
    return new Promise(function (resolve) {
      const doc = win.document;
      const overlay = doc.createElement('div');
      overlay.id = ADD_ROW_BETA_DLG_ID;
      overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.45);'
        + 'display:flex;align-items:center;justify-content:center;visibility:visible!important;'
        + 'font:14px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,"Microsoft YaHei",sans-serif;';
      const box = doc.createElement('div');
      box.style.cssText = 'width:1280px;max-width:96vw;height:84vh;background:#fff;border-radius:12px;'
        + 'display:flex;flex-direction:column;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.22);';

      const TH = (t) => '<th style="padding:8px 10px;white-space:nowrap;">' + t + '</th>';
      box.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #ebeef5;">'
        + '<div style="font-weight:700;font-size:15px;">添加行Beta · 库存可用量（跨仓库）</div>'
        + '<button data-close type="button" style="border:0;background:none;font-size:20px;line-height:1;cursor:pointer;color:#a8abb2;">&times;</button>'
        + '</div>'
        + '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 16px;background:#fafafa;border-bottom:1px solid #ebeef5;font-size:13px;">'
        + '<label>物料编码&nbsp;<input data-material placeholder="请输入物料编码" style="width:170px;height:30px;padding:0 8px;border:1px solid #dcdfe6;border-radius:4px;"></label>'
        + '<label>仓库名称&nbsp;<input data-warehouse placeholder="请输入仓库名称" style="width:200px;height:30px;padding:0 8px;border:1px solid #dcdfe6;border-radius:4px;"></label>'
        + '<label>批次号&nbsp;<input data-batch placeholder="批次号（精确匹配）" style="width:170px;height:30px;padding:0 8px;border:1px solid #dcdfe6;border-radius:4px;"></label>'
        + '<label>库存类型&nbsp;<select data-type style="height:30px;padding:0 6px;border:1px solid #dcdfe6;border-radius:4px;">'
        + '<option value="">全部</option>'
        + '<option value="在库">在库</option><option value="在途">在途</option><option value="在制">在制</option>'
        + '</select></label>'
        + '<button data-query type="button" style="height:30px;padding:0 16px;border:0;border-radius:4px;background:#409eff;color:#fff;cursor:pointer;">查询</button>'
        + '<button data-reset type="button" style="height:30px;padding:0 16px;border:1px solid #dcdfe6;border-radius:4px;background:#fff;color:#606266;cursor:pointer;">重置</button>'
        + '</div>'
        + '<div style="flex:1;overflow:auto;">'
        + '<table style="width:100%;border-collapse:collapse;font-size:13px;">'
        + '<thead><tr style="background:#f0f2f5;text-align:left;position:sticky;top:0;">'
        + '<th style="padding:8px 10px;width:36px;"><input type="checkbox" data-all style="cursor:pointer;"></th>'
        + TH('物料编码') + TH('物料名称') + TH('型号') + TH('仓库名称') + TH('库存组织')
        + TH('预计入库时间') + TH('类型') + TH('数量') + TH('可用量') + TH('批次号')
        + TH('调拨单号') + TH('调拨出单号') + TH('在制交付日期') + TH('在制交付日期更新')
        + '</tr></thead>'
        + '<tbody><tr><td colspan="15" style="padding:24px;text-align:center;color:#909399;">加载中…</td></tr></tbody>'
        + '</table>'
        + '</div>'
        + '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 16px;border-top:1px solid #ebeef5;font-size:13px;color:#606266;">'
        + '<span data-count></span>'
        + '<span style="display:flex;align-items:center;gap:8px;">'
        + '<span data-total></span>'
        + '<select data-pagesize style="height:28px;padding:0 6px;border:1px solid #dcdfe6;border-radius:4px;">'
        + '<option value="10">10 条/页</option><option value="20">20 条/页</option>'
        + '<option value="50">50 条/页</option><option value="100">100 条/页</option>'
        + '</select>'
        + '<button data-prev type="button" style="height:28px;padding:0 12px;border:1px solid #dcdfe6;border-radius:4px;background:#fff;cursor:pointer;">上一页</button>'
        + '<span data-pageinfo></span>'
        + '<button data-next type="button" style="height:28px;padding:0 12px;border:1px solid #dcdfe6;border-radius:4px;background:#fff;cursor:pointer;">下一页</button>'
        + '</span>'
        + '<span>'
        + '<button data-cancel type="button" style="height:32px;padding:0 16px;margin-right:8px;border:1px solid #dcdfe6;border-radius:4px;background:#fff;cursor:pointer;">取消</button>'
        + '<button data-ok type="button" style="height:32px;padding:0 16px;border:0;border-radius:4px;background:#409eff;color:#fff;cursor:pointer;">确定</button>'
        + '</span></div>';
      overlay.appendChild(box);
      (doc.body || doc.documentElement).appendChild(overlay);
      // 行悬停淡高亮（与「挪用公共库存」一致的观感）
      if (!doc.getElementById('gnx-beta-style')) {
        const st = doc.createElement('style');
        st.id = 'gnx-beta-style';
        st.textContent = '#gnx-add-row-beta-dialog tbody tr:hover{background:#f5f7fa;}';
        (doc.head || doc.documentElement).appendChild(st);
      }

      const selected = new Map();   // stockAvailabileId -> rec（跨页保留勾选）
      let betaLastList = [];
      let betaPage = 1;
      let betaPageSize = 10;
      let betaTotal = 0;
      function close() { overlay.remove(); }

      function renderRows(list) {
        betaLastList = list || [];
        const tb = box.querySelector('tbody');
        tb.innerHTML = '';
        if (!list.length) {
          tb.innerHTML = '<tr><td colspan="15" style="padding:24px;text-align:center;color:#909399;">无可用库存</td></tr>';
          return;
        }
        list.forEach(function (rec) {
          const tr = doc.createElement('tr');
          tr.style.cssText = 'border-bottom:1px solid #f2f3f5;';
          const cell = (v) => '<td style="padding:8px 10px;white-space:nowrap;">' + escHtml(v == null ? '' : v) + '</td>';
          const orgText = (rec.orgCode === ORG_CODE && S.orgName) ? S.orgName : (rec.orgCode || '');
          tr.innerHTML =
            '<td style="padding:8px 10px;"><input type="checkbox" style="cursor:pointer;"></td>'
            + cell(rec.materialNo) + '<td style="padding:8px 10px;white-space:nowrap;" data-name></td>'
            + cell(rec.productModel) + cell(rec.warehouseName) + cell(orgText)
            + cell(fmtDate(rec.expectStockTime)) + cell(rec.type)
            + cell(rec.stockNum) + '<td style="padding:8px 10px;color:#67c23a;">' + escHtml(rec.availability == null ? '' : rec.availability) + '</td>'
            + cell(rec.batchNo) + cell(rec.transferApplyNo) + cell(rec.transferOrderApplyNo)
            + cell(rec.deliveryDate) + cell(rec.deliveryDateUpdate);
          const cb = tr.querySelector('input[type=checkbox]');
          if (selected.has(rec.id)) cb.checked = true;   // 跨页返回时恢复勾选
          cb.addEventListener('change', function () {
            if (cb.checked) selected.set(rec.id, rec); else selected.delete(rec.id);
            updateCount();
          });
          tr.addEventListener('dblclick', function () {
            cb.checked = !cb.checked;
            if (cb.checked) selected.set(rec.id, rec); else selected.delete(rec.id);
            updateCount();
          });
          tb.appendChild(tr);
          fillBetaMaterialName(rec.materialNo, tr.querySelector('[data-name]'));
        });
      }

      function updateCount() {
        const el = box.querySelector('[data-count]');
        if (el) el.textContent = selected.size ? ('已选 ' + selected.size + ' 行') : '勾选一行或多行后点「确定」';
      }

      function renderPager() {
        const pages = Math.max(1, Math.ceil(betaTotal / betaPageSize));
        const t = box.querySelector('[data-total]');
        const i = box.querySelector('[data-pageinfo]');
        if (t) t.textContent = '共 ' + betaTotal + ' 条';
        if (i) i.textContent = betaPage + ' / ' + pages;
        const pv = box.querySelector('[data-prev]');
        const nx = box.querySelector('[data-next]');
        if (pv) pv.disabled = betaPage <= 1;
        if (nx) nx.disabled = betaPage >= pages;
      }

      function load(keepSelection) {
        const tb = box.querySelector('tbody');
        tb.innerHTML = '<tr><td colspan="15" style="padding:24px;text-align:center;color:#909399;">查询中…</td></tr>';
        const url = buildAddRowBetaUrl({
          materialNo: box.querySelector('[data-material]').value.trim(),
          warehouseName: box.querySelector('[data-warehouse]').value.trim(),
          batchNo: box.querySelector('[data-batch]').value.trim(),
          type: box.querySelector('[data-type]').value,
          pageNo: betaPage,
          pageSize: betaPageSize,
        });
        if (!keepSelection) selected.clear();
        updateCount();
        api('GET', url).then(function (j) {
          const d = (j && j.data) || {};
          betaTotal = Number(d.total || 0);
          renderRows(d.list || d.records || []);
          renderPager();
        }).catch(function (err) {
          tb.innerHTML = '<tr><td colspan="15" style="padding:24px;text-align:center;color:#f56c6c;">查询失败：'
            + escHtml(err && err.message ? err.message : String(err)) + '</td></tr>';
          betaTotal = 0;
          renderPager();
        });
      }

      box.querySelector('[data-close]').addEventListener('click', function () { close(); resolve([]); });
      box.querySelector('[data-cancel]').addEventListener('click', function () { close(); resolve([]); });
      box.querySelector('[data-query]').addEventListener('click', function () { betaPage = 1; load(false); });
      box.querySelector('[data-reset]').addEventListener('click', function () {
        box.querySelector('[data-material]').value = '';
        box.querySelector('[data-warehouse]').value = '';
        box.querySelector('[data-batch]').value = '';
        box.querySelector('[data-type]').value = '';
        betaPage = 1;
        load(false);
      });
      box.querySelector('[data-pagesize]').addEventListener('change', function (e) {
        betaPageSize = Number(e.target.value) || 10;
        betaPage = 1;
        load(true);
      });
      box.querySelector('[data-prev]').addEventListener('click', function () {
        if (betaPage > 1) { betaPage--; load(true); }
      });
      box.querySelector('[data-next]').addEventListener('click', function () {
        if (betaPage * betaPageSize < betaTotal) { betaPage++; load(true); }
      });
      box.querySelector('[data-all]').addEventListener('change', function (e) {
        const on = e.target.checked;
        betaLastList.forEach(function (r) { if (on) selected.set(r.id, r); else selected.delete(r.id); });
        box.querySelectorAll('tbody tr').forEach(function (tr) {
          const cb = tr.querySelector('input[type=checkbox]');
          if (cb) cb.checked = on;
        });
        updateCount();
      });
      box.querySelector('[data-ok]').addEventListener('click', function () {
        if (!selected.size) { showDialog({ message: '请先勾选要添加的明细行。', type: 'warn' }); return; }
        const picked = Array.from(selected.values());
        // 确保每行的「物料名称」已取到（page 接口不返回，用 product-v2 补），再交给页面 onSuccess
        Promise.all(picked.map(function (rec) {
          return fetchMaterialName(rec.materialNo).then(function (name) {
            return mapStockRowToAddRow(rec, name);
          });
        })).then(function (rows) {
          close();
          resolve(rows);
        }).catch(function (err) {
          showDialog({ message: '准备明细行失败：' + (err && err.message ? err.message : String(err)), type: 'error' });
        });
      });

      updateCount();
      load(false);
    });
  }

  // 「添加行Beta」按钮：插在原生「添加行」后面
  function setupAddRowBeta(win, doc) {
    if (!featureOn('create.addRowBeta')) {
      const old = doc.getElementById(ADD_ROW_BETA_BTN_ID);
      if (old) old.remove();
      return;
    }
    if (doc.getElementById(ADD_ROW_BETA_BTN_ID)) return;

    const addBtn = Array.from(doc.querySelectorAll('button')).find(function (b) {
      return (b.innerText || '').trim() === '添加行';
    });
    if (!addBtn || !addBtn.parentElement) return;

    const btn = doc.createElement('button');
    btn.id = ADD_ROW_BETA_BTN_ID;
    btn.type = 'button';
    btn.className = addBtn.className;
    btn.innerHTML = '<span>添加行Beta</span>';
    btn.style.marginLeft = '8px';
    btn.addEventListener('click', function () {
      if (!featureOn('create.addRowBeta')) return;
      openAddRowBetaDialog(win).then(function (rows) {
        if (!rows || !rows.length) return;
        const onSuccess = addRowSuccessFn();
        if (!onSuccess) { showDialog({ message: '未找到页面的加行回调，请刷新页面后重试。', type: 'error' }); return; }
        onSuccess(rows);
      }).catch(function (err) {
        showDialog({ message: '添加行Beta 出错：' + (err && err.message ? err.message : String(err)), type: 'error' });
      });
    });
    addBtn.parentElement.insertBefore(btn, addBtn.nextSibling);
  }

  /* =========================================================================
   * 10. 启动：按需激活
   * =======================================================================*/

  function runOnce(win, doc) {
    // ⚙ 设置入口：会用到本脚本的页面上常驻
    // ⚙ 设置入口：CRM 内**所有**页面常驻（含订单列表 /crm/order 等），
    //    否则切到那些页面就没法再打开面板开关功能
    const onCrm = /\/crm\//.test(win.location.href);
    const hasStockIframe = [...doc.querySelectorAll('iframe')].some((f) => f.src && TARGET_RE.test(f.src));
    if (onCrm || hasStockIframe) {
      ensureGearButton(win, doc);
    }

    if (!S.enabled) return;

    // 模式一：当前 frame 本身就是库存可用量页（顶层直开 / SPA 路由 / 内嵌 iframe）
    if (TARGET_RE.test(win.location.href)) {
      // 只有目标表单已经挂载，才建立本次页面实例的状态；否则等待 DOM 监听
      const pageRoot = [...doc.querySelectorAll('.el-form-item')]
        .find((item) => item.textContent.includes('库存组织编码'));
      if (pageRoot) {
        const oldState = win.__gwFilterState;
        if (oldState && oldState.href === win.location.href && oldState.pageRoot === pageRoot) {
          if (!oldState.running && !oldState.done) runAutomation(win, doc, oldState); // 上次失败→重试
        } else {
          const state = { href: win.location.href, pageRoot, running: false, done: false };
          win.__gwFilterState = state;
          runAutomation(win, doc, state);
        }
      }
      // 排序优化控件绑定（开关关闭时不绑定、也不改写表格）
      if (featureOn('stock.sortOptimize') && win.__gwGlobalArrivalSort) {
        try { win.__gwGlobalArrivalSort.bind(); } catch (e) { /* 忽略 */ }
      }
    } else {
      // 离开目标路由时清除旧状态，确保复用同一个内嵌 window 再次进入时会重跑
      delete win.__gwFilterState;
    }

    if (RESERVATION_RE.test(win.location.href)) {
      // 预留单详情·预计入库时间：悬停显示 ISO 周数（独立于预留明细表格）
      setupWeekTooltips(win, doc);
      // 预留单详情·预留明细：库存状态筛选 / 预留数量为0的显隐 / 默认每页条数
      setupReservation(win, doc);
      // 预留单详情·「挪用公共库存」按钮
      setupMoveButton();
      applyMoveButtonPlacement();
      // 关掉的功能立刻恢复原样
      resyncReservation();
    }

    // 新增/编辑预留单：「添加行Beta」按钮（跨仓库加明细行）
    if (CREATE_RE.test(win.location.href)) {
      setupAddRowBeta(win, doc);
    }

    // 模式二：当前页面是外层壳，页面里有指向库存页的内嵌 iframe
    const iframe = [...doc.querySelectorAll('iframe')]
      .find((f) => f.src && TARGET_RE.test(f.src));
    if (iframe && iframe.contentWindow) {
      try { runOnce(iframe.contentWindow, iframe.contentDocument); }
      catch (e) { /* 跨域 iframe：内嵌脚本会自己跑 */ }
    }
  }

  function start(win, doc) {
    runOnce(win, doc);
    new MutationObserver(() => runOnce(win, doc)).observe(doc.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  start(window, document);
})();
