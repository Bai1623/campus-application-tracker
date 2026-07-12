const LEGACY_STORAGE_KEY = "campus-application-tracker:v1";
const ACCOUNTS_KEY = "campus-application-tracker:accounts:v1";
const ACTIVE_ACCOUNT_KEY = "campus-application-tracker:active-account:v1";
const ACCOUNT_RECORDS_PREFIX = "campus-application-tracker:records:v1:";
const OVERDUE_MONTHS_KEY = "campus-application-tracker:overdue-months:v1";
const MASTER_PASSWORD_KEY = "campus-application-tracker:master-password:v1";

const STATUSES = [
  { id: "待初筛", label: "待初筛" },
  { id: "待面试", label: "待面试" },
  { id: "已拒绝", label: "已拒绝" },
];

const SOURCE_TYPES = ["官网", "公众号", "牛客", "Boss", "实习僧", "自定义"];
const CITY_OPTIONS = [
  "杭州",
  "北京",
  "深圳",
  "广州",
  "保定",
  "长春",
  "长沙",
  "常州",
  "成都",
  "重庆",
  "大连",
  "东莞",
  "佛山",
  "福州",
  "贵阳",
  "哈尔滨",
  "合肥",
  "惠州",
  "嘉兴",
  "济南",
  "金华",
  "昆明",
  "临沂",
  "洛阳",
  "南昌",
  "南京",
  "南宁",
  "南通",
  "宁波",
  "青岛",
  "泉州",
  "上海",
  "绍兴",
  "沈阳",
  "石家庄",
  "苏州",
  "太原",
  "台州",
  "天津",
  "潍坊",
  "温州",
  "武汉",
  "无锡",
  "厦门",
  "西安",
  "徐州",
  "烟台",
  "郑州",
  "珠海",
];
const STALE_DAYS = 7;
const DEFAULT_OVERDUE_MONTHS = 2;
const MAX_RECORD_CITIES = 3;

const icons = {
  search:
    '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>',
  download:
    '<svg viewBox="0 0 24 24"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>',
  upload:
    '<svg viewBox="0 0 24 24"><path d="M12 21V9"></path><path d="m7 14 5-5 5 5"></path><path d="M5 3h14"></path></svg>',
  plus:
    '<svg viewBox="0 0 24 24"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>',
  check:
    '<svg viewBox="0 0 24 24"><path d="m20 6-11 11-5-5"></path></svg>',
  trash:
    '<svg viewBox="0 0 24 24"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M6 6l1 15h10l1-15"></path></svg>',
  inbox:
    '<svg viewBox="0 0 24 24"><path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="m5 5-3 7v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3-7Z"></path></svg>',
  edit:
    '<svg viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>',
  external:
    '<svg viewBox="0 0 24 24"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>',
  phone:
    '<svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"></rect><path d="M11 18h2"></path></svg>',
  copy:
    '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"></rect><rect x="4" y="4" width="11" height="11" rx="2"></rect></svg>',
  share:
    '<svg viewBox="0 0 24 24"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"></path><path d="M12 16V3"></path><path d="m7 8 5-5 5 5"></path></svg>',
};

let records = [];
let accounts = [];
let activeAccountId = "";
let activeStatus = "all";
let activeMetric = "all";
let activeView = "board";
let editingId = null;
let selectedId = null;
let draggedId = null;
let pendingSwitchAccountId = "";
let masterPasswordUnlocked = false;
let searchJumpTimer = null;

const els = {
  searchInput: document.querySelector("#searchInput"),
  accountMenuBtn: document.querySelector("#accountMenuBtn"),
  accountMenu: document.querySelector("#accountMenu"),
  closeAccountMenuBtn: document.querySelector("#closeAccountMenuBtn"),
  activeAccountName: document.querySelector("#activeAccountName"),
  accountList: document.querySelector("#accountList"),
  newAccountNameInput: document.querySelector("#newAccountNameInput"),
  newAccountPasswordInput: document.querySelector("#newAccountPasswordInput"),
  createAccountBtn: document.querySelector("#createAccountBtn"),
  accountPasswordGate: document.querySelector("#accountPasswordGate"),
  accountRecoveryList: document.querySelector("#accountRecoveryList"),
  accountSecurityHint: document.querySelector("#accountSecurityHint"),
  requestDeleteAccountBtn: document.querySelector("#requestDeleteAccountBtn"),
  deleteAccountConfirm: document.querySelector("#deleteAccountConfirm"),
  confirmDeleteAccountBtn: document.querySelector("#confirmDeleteAccountBtn"),
  cancelDeleteAccountBtn: document.querySelector("#cancelDeleteAccountBtn"),
  accountFeedback: document.querySelector("#accountFeedback"),
  statusFilters: document.querySelector("#statusFilters"),
  sourceFilter: document.querySelector("#sourceFilter"),
  cityFilter: document.querySelector("#cityFilter"),
  sortSelect: document.querySelector("#sortSelect"),
  overdueMonthsInput: document.querySelector("#overdueMonthsInput"),
  dueList: document.querySelector("#dueList"),
  statsGrid: document.querySelector("#statsGrid"),
  resultMeta: document.querySelector("#resultMeta"),
  boardView: document.querySelector("#boardView"),
  tableView: document.querySelector("#tableView"),
  insightsView: document.querySelector("#insightsView"),
  addBtn: document.querySelector("#addBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  importInput: document.querySelector("#importInput"),
  exportDialog: document.querySelector("#exportDialog"),
  closeExportDialogBtn: document.querySelector("#closeExportDialogBtn"),
  shareExportBtn: document.querySelector("#shareExportBtn"),
  saveExportBtn: document.querySelector("#saveExportBtn"),
  copyExportBtn: document.querySelector("#copyExportBtn"),
  mobileBtn: document.querySelector("#mobileBtn"),
  mobileDialog: document.querySelector("#mobileDialog"),
  closeMobileDialogBtn: document.querySelector("#closeMobileDialogBtn"),
  shareUrl: document.querySelector("#shareUrl"),
  copyLinkBtn: document.querySelector("#copyLinkBtn"),
  nativeShareBtn: document.querySelector("#nativeShareBtn"),
  shareHint: document.querySelector("#shareHint"),
  recordDialog: document.querySelector("#recordDialog"),
  recordForm: document.querySelector("#recordForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  closeDialogBtn: document.querySelector("#closeDialogBtn"),
  cancelDialogBtn: document.querySelector("#cancelDialogBtn"),
  deleteFromFormBtn: document.querySelector("#deleteFromFormBtn"),
  formError: document.querySelector("#formError"),
  sourceDetailField: document.querySelector("#sourceDetailField"),
  sourceDetailLabel: document.querySelector("#sourceDetailLabel"),
  drawerBackdrop: document.querySelector("#drawerBackdrop"),
  detailDrawer: document.querySelector("#detailDrawer"),
  modalBackdrop: document.querySelector("#modalBackdrop"),
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(dateISO, days) {
  const date = new Date(`${dateISO}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function addMonthsISO(dateISO, months) {
  const date = new Date(`${dateISO}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function daysBetween(startISO, endISO = todayISO()) {
  const start = new Date(`${startISO}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);
  return Math.floor((end - start) / 86400000);
}

function monthsBetween(startISO, endISO = todayISO()) {
  const start = new Date(`${startISO}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);
  let months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
  if (end.getDate() < start.getDate()) months -= 1;
  return Math.max(0, months);
}

function formatDate(dateISO) {
  if (!dateISO) return "未设置";
  return dateISO.replaceAll("-", ".");
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function randomSalt() {
  const bytes = new Uint8Array(16);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    bytes.forEach((_, index) => {
      bytes[index] = Math.floor(Math.random() * 256);
    });
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password, salt) {
  const input = `${salt}:${password}`;
  if (!window.crypto?.subtle) {
    return btoa(unescape(encodeURIComponent(input)));
  }
  const buffer = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function accountHasPassword(account) {
  return Boolean(account?.passwordSalt && account?.passwordHash);
}

async function setAccountPassword(account, password) {
  const salt = randomSalt();
  account.passwordSalt = salt;
  account.passwordHash = await hashPassword(password, salt);
}

async function accountPasswordMatches(account, password) {
  if (!accountHasPassword(account)) return true;
  const passwordHash = await hashPassword(password, account.passwordSalt);
  return passwordHash === account.passwordHash;
}

function getMasterPasswordRecord() {
  try {
    const raw = localStorage.getItem(MASTER_PASSWORD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function hasMasterPassword() {
  const record = getMasterPasswordRecord();
  return Boolean(record?.salt && record?.hash);
}

async function saveMasterPassword(password) {
  const salt = randomSalt();
  const hash = await hashPassword(password, salt);
  localStorage.setItem(MASTER_PASSWORD_KEY, JSON.stringify({ salt, hash, updatedAt: todayISO() }));
}

async function masterPasswordMatches(password) {
  const record = getMasterPasswordRecord();
  if (!record?.salt || !record?.hash) return false;
  const hash = await hashPassword(password, record.salt);
  return hash === record.hash;
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalize(value = "") {
  return value.toLowerCase().replace(/\s+/g, "").trim();
}

function recordCities(record = {}) {
  const rawCities = Array.isArray(record.cities) ? record.cities : record.city ? [record.city] : [];
  return rawCities.filter(
    (city, index, array) => CITY_OPTIONS.includes(city) && array.indexOf(city) === index,
  );
}

function cityText(record = {}) {
  const cities = recordCities(record);
  return cities.length ? cities.join(" / ") : "未选择";
}

function normalizeImportance(record = {}) {
  if (record.importance) return String(record.importance);
  if (record.priority === "重点") return "5";
  if (record.priority === "保底") return "2";
  return "3";
}

function importanceValue(record = {}) {
  return Number(normalizeImportance(record)) || 3;
}

function stars(value) {
  const count = Number(value || 3);
  return "★★★★★".slice(0, count);
}

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function exportFilename() {
  const account = accounts.find((item) => item.id === activeAccountId);
  const accountName = (account?.name || "默认账号").replace(/[\\/:*?"<>|]/g, "_");
  return `秋招投递记录-${accountName}-${todayISO()}.json`;
}

function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((node) => {
    const name = node.getAttribute("data-icon");
    node.innerHTML = icons[name] || "";
  });
}

function recordsKey(accountId = activeAccountId) {
  return `${ACCOUNT_RECORDS_PREFIX}${accountId}`;
}

function defaultAccount() {
  return {
    id: "default",
    name: "默认账号",
    createdAt: todayISO(),
  };
}

function loadAccounts() {
  try {
    const rawAccounts = localStorage.getItem(ACCOUNTS_KEY);
    accounts = rawAccounts ? JSON.parse(rawAccounts) : [];
  } catch {
    accounts = [];
  }

  if (!Array.isArray(accounts) || accounts.length === 0) {
    const account = defaultAccount();
    accounts = [account];
    activeAccountId = account.id;
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw && !localStorage.getItem(recordsKey(account.id))) {
      localStorage.setItem(recordsKey(account.id), legacyRaw);
    }
    saveAccounts();
    return;
  }

  const savedActiveId = localStorage.getItem(ACTIVE_ACCOUNT_KEY);
  activeAccountId = accounts.some((account) => account.id === savedActiveId)
    ? savedActiveId
    : accounts[0].id;
  localStorage.setItem(ACTIVE_ACCOUNT_KEY, activeAccountId);
}

function saveAccounts() {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  localStorage.setItem(ACTIVE_ACCOUNT_KEY, activeAccountId);
}

function overdueMonthsThreshold() {
  const value = Number.parseInt(els.overdueMonthsInput?.value || "", 10);
  return Number.isFinite(value) && value >= 1 ? value : DEFAULT_OVERDUE_MONTHS;
}

function loadOverdueMonthsSetting() {
  const stored = Number.parseInt(localStorage.getItem(OVERDUE_MONTHS_KEY) || "", 10);
  const value = Number.isFinite(stored) && stored >= 1 ? stored : DEFAULT_OVERDUE_MONTHS;
  els.overdueMonthsInput.value = String(value);
}

function saveOverdueMonthsSetting() {
  const value = overdueMonthsThreshold();
  els.overdueMonthsInput.value = String(value);
  localStorage.setItem(OVERDUE_MONTHS_KEY, String(value));
}

function activeAccount() {
  return accounts.find((item) => item.id === activeAccountId) || accounts[0] || defaultAccount();
}

function recordCountForAccount(accountId) {
  if (accountId === activeAccountId) return records.length;
  try {
    const raw = localStorage.getItem(recordsKey(accountId));
    const storedRecords = raw ? JSON.parse(raw) : [];
    return Array.isArray(storedRecords) ? storedRecords.length : 0;
  } catch {
    return 0;
  }
}

function loadRecords() {
  try {
    const raw = localStorage.getItem(recordsKey());
    records = raw ? JSON.parse(raw) : [];
  } catch {
    records = [];
  }
}

function saveRecords() {
  localStorage.setItem(recordsKey(), JSON.stringify(records));
}

function openDialog(dialog) {
  dialog.classList.remove("hidden");
  dialog.classList.add("is-open");
  dialog.setAttribute("aria-hidden", "false");
  els.modalBackdrop?.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeDialog(dialog) {
  dialog.classList.remove("is-open");
  dialog.classList.add("hidden");
  dialog.setAttribute("aria-hidden", "true");
  if (!document.querySelector(".record-dialog.is-open")) {
    els.modalBackdrop?.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }
}

function closeActiveDialog() {
  const activeDialog = document.querySelector(".record-dialog.is-open");
  if (activeDialog) {
    closeDialog(activeDialog);
    if (activeDialog === els.recordDialog) {
      editingId = null;
    }
    return true;
  }
  return false;
}

function getFilteredRecords() {
  const query = normalize(els.searchInput.value);
  const source = els.sourceFilter.value;
  const city = els.cityFilter.value;
  const weekStart = addDaysISO(todayISO(), -6);
  const list = records.filter((record) => {
    const haystack = normalize(
      [
        record.company,
        record.position,
        cityText(record),
        record.sourceType,
        record.sourceDetail,
        record.note,
        stars(normalizeImportance(record)),
      ].join(" "),
    );
    const statusMatch = activeStatus === "all" || record.status === activeStatus;
    const sourceMatch = source === "all" || record.sourceType === source;
    const cityMatch = city === "all" || recordCities(record).includes(city);
    const queryMatch = !query || haystack.includes(query);
    const metricMatch =
      activeMetric === "all" ||
      (activeMetric === "week" && record.appliedAt >= weekStart) ||
      (activeMetric === "stale" && isStale(record)) ||
      (activeMetric === "overdue" && isUpdateOverdue(record));
    return statusMatch && sourceMatch && cityMatch && queryMatch && metricMatch;
  });

  return list.sort((a, b) => {
    const overdueDiff = Number(isUpdateOverdue(a)) - Number(isUpdateOverdue(b));
    if (overdueDiff !== 0) return overdueDiff;

    const importanceDiff = importanceValue(b) - importanceValue(a);
    if (importanceDiff !== 0) return importanceDiff;

    if (isUpdateOverdue(a) && isUpdateOverdue(b)) {
      const overdueAgeDiff = monthsBetween(b.updatedAt) - monthsBetween(a.updatedAt);
      if (overdueAgeDiff !== 0) return overdueAgeDiff;
    }

    switch (els.sortSelect.value) {
      case "staleDesc":
        return daysBetween(b.updatedAt) - daysBetween(a.updatedAt);
      case "appliedDesc":
        return b.appliedAt.localeCompare(a.appliedAt);
      case "companyAsc":
        return a.company.localeCompare(b.company, "zh-Hans-CN");
      default:
        return b.updatedAt.localeCompare(a.updatedAt);
    }
  });
}

function isDue(record) {
  return record.nextCheckAt && record.nextCheckAt <= todayISO() && record.status !== "已拒绝";
}

function isStale(record) {
  return record.status !== "已拒绝" && daysBetween(record.updatedAt) > STALE_DAYS;
}

function isUpdateOverdue(record) {
  if (!record.updatedAt) return false;
  return record.updatedAt < addMonthsISO(todayISO(), -overdueMonthsThreshold());
}

function sourceToHTML(record) {
  const text = record.sourceDetail || record.sourceType;
  if (record.sourceType === "自定义" || /^https?:\/\//i.test(text)) {
    const href = /^https?:\/\//i.test(text) ? text : `https://${text}`;
    return `<a class="source-link" href="${escapeHTML(href)}" target="_blank" rel="noreferrer">${escapeHTML(text)}</a>`;
  }
  return escapeHTML(text);
}

function renderStatusFilters() {
  const allCount = records.length;
  const buttons = [
    { id: "all", label: "全部记录", count: allCount },
    ...STATUSES.map((status) => ({
      ...status,
      count: records.filter((record) => record.status === status.id).length,
    })),
  ];

  els.statusFilters.innerHTML = buttons
    .map(
      (item) => `
        <button class="filter-chip ${activeStatus === item.id ? "active" : ""}" type="button" data-filter-status="${item.id}" ${item.id === "all" ? "" : `data-status="${item.id}"`}>
          <span class="chip-left">
            ${item.id === "all" ? '<span data-icon="inbox"></span>' : '<span class="status-dot"></span>'}
            ${escapeHTML(item.label)}
          </span>
          <span class="count-pill">${item.count}</span>
        </button>
      `,
    )
    .join("");

  hydrateIcons(els.statusFilters);
}

function renderSourceFilter() {
  const current = els.sourceFilter.value || "all";
  els.sourceFilter.innerHTML = [
    '<option value="all">全部来源</option>',
    ...SOURCE_TYPES.map((source) => `<option value="${source}">${source}</option>`),
  ].join("");
  els.sourceFilter.value = SOURCE_TYPES.includes(current) ? current : "all";
}

function renderCityFilter() {
  const current = els.cityFilter.value || "all";
  const usedCities = CITY_OPTIONS.filter((city) =>
    records.some((record) => recordCities(record).includes(city)),
  );
  els.cityFilter.innerHTML = [
    '<option value="all">全部城市</option>',
    ...usedCities.map((city) => `<option value="${city}">${city}</option>`),
  ].join("");
  els.cityFilter.value = usedCities.includes(current) ? current : "all";
}

function setAccountFeedback(message = "每个账号的数据本地隔离保存。", tone = "info") {
  els.accountFeedback.textContent = message;
  els.accountFeedback.classList.toggle("is-error", tone === "error");
  els.accountFeedback.classList.toggle("is-success", tone === "success");
}

function toggleAccountMenu(forceOpen) {
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : els.accountMenu.classList.contains("hidden");
  els.accountMenu.classList.toggle("hidden", !shouldOpen);
  els.accountMenuBtn.setAttribute("aria-expanded", String(shouldOpen));
  if (shouldOpen) {
    renderAccountPanel();
    window.setTimeout(() => els.newAccountNameInput.focus({ preventScroll: true }), 80);
  } else {
    pendingSwitchAccountId = "";
    masterPasswordUnlocked = false;
    els.deleteAccountConfirm.classList.add("hidden");
    setAccountFeedback();
  }
}

function renderAccountPanel() {
  const currentAccount = activeAccount();
  els.activeAccountName.textContent = currentAccount.name;
  els.accountList.innerHTML = accounts
    .map((account) => {
      const isActive = account.id === activeAccountId;
      const count = recordCountForAccount(account.id);
      const hasPassword = accountHasPassword(account);
      const isPending = pendingSwitchAccountId === account.id && !isActive;
      return `
        <div class="account-list-item${isActive ? " is-current" : ""}">
          <div>
            <button
              class="account-switch${isActive ? " is-active" : ""}"
              type="button"
              data-switch-account="${account.id}"
              aria-current="${isActive ? "true" : "false"}"
            >
              <span class="account-switch-name">${escapeHTML(account.name)}</span>
              <span class="account-switch-count">${count} 条</span>
              <span class="account-switch-lock">${hasPassword ? "已设密码" : "未设密码"}${isActive ? " · 当前" : ""}</span>
            </button>
          </div>
          ${
            isActive
              ? `<div class="account-current-tools" aria-label="当前账号操作">
                  <div class="account-inline-editor">
                    <label for="renameAccountInput">重命名当前账号</label>
                    <div class="account-input-row">
                      <input id="renameAccountInput" type="text" maxlength="24" value="${escapeHTML(account.name)}" autocomplete="off" />
                      <button id="saveAccountNameBtn" class="mini-button" type="button">保存</button>
                    </div>
                  </div>
                  <div class="account-inline-editor">
                    <label for="currentAccountPasswordInput">${hasPassword ? "更改当前密码" : "账号设置密码"}</label>
                    <div class="account-input-row">
                      <input id="currentAccountPasswordInput" type="password" placeholder="${hasPassword ? "输入新密码" : "设置账号密码"}" autocomplete="new-password" />
                      <button id="saveAccountPasswordBtn" class="mini-button" type="button">${hasPassword ? "更改" : "设置"}</button>
                    </div>
                  </div>
                </div>`
              : ""
          }
          ${
            isPending
              ? `<div class="account-unlock">
                  <input id="switchAccountPasswordInput" type="password" placeholder="输入账号密码" autocomplete="current-password" data-switch-password="${account.id}" />
                  <button class="mini-button strong-mini" type="button" data-confirm-switch="${account.id}">进入</button>
                </div>`
              : ""
          }
        </div>
      `;
    })
    .join("");
  renderPasswordManager();
  els.requestDeleteAccountBtn.disabled = accounts.length <= 1;
}

function renderPasswordManager() {
  if (!hasMasterPassword()) {
    els.accountPasswordGate.innerHTML = `
      <div class="account-security-row">
        <div>
          <strong>设置管理密码</strong>
          <span>首次使用</span>
        </div>
        <input type="password" placeholder="输入管理密码" autocomplete="new-password" data-master-password-input="set" />
        <button class="mini-button strong-mini" type="button" data-set-master-password>设置</button>
      </div>
    `;
    els.accountRecoveryList.innerHTML = "";
    els.accountSecurityHint.textContent = "设置后，必须输入管理密码才能重置任意账号密码。";
    return;
  }

  if (!masterPasswordUnlocked) {
    els.accountPasswordGate.innerHTML = `
      <div class="account-security-row">
        <div>
          <strong>输入管理密码</strong>
          <span>已锁定</span>
        </div>
        <input type="password" placeholder="管理密码" autocomplete="current-password" data-master-password-input="unlock" />
        <button class="mini-button strong-mini" type="button" data-unlock-master-password>进入</button>
      </div>
    `;
    els.accountRecoveryList.innerHTML = "";
    els.accountSecurityHint.textContent = "旧密码不能查看；验证管理密码后才能重置账号密码。";
    return;
  }

  els.accountPasswordGate.innerHTML = `
    <div class="account-security-unlocked">
      <strong>密码管理已解锁</strong>
      <button class="mini-button" type="button" data-lock-master-password>锁定</button>
    </div>
  `;
  els.accountRecoveryList.innerHTML = accounts
    .map(
      (account) => `
        <div class="account-security-row">
          <div>
            <strong>${escapeHTML(account.name)}</strong>
            <span>${accountHasPassword(account) ? "已设密码" : "未设密码"}</span>
          </div>
          <input type="password" placeholder="输入新密码" autocomplete="new-password" data-reset-password-input="${account.id}" />
          <button class="mini-button" type="button" data-reset-password-account="${account.id}">重置</button>
        </div>
      `,
    )
    .join("");
  els.accountSecurityHint.textContent = "旧密码不会显示；这里只能把账号改成新密码。";
}

function resetFiltersForAccount() {
  activeStatus = "all";
  activeMetric = "all";
  els.searchInput.value = "";
  els.sourceFilter.value = "all";
  els.cityFilter.value = "all";
  closeDrawer();
}

async function switchAccount(accountId, password = "") {
  const account = accounts.find((item) => item.id === accountId);
  if (!account) return;
  if (account.id === activeAccountId) {
    setAccountFeedback(accountHasPassword(account) ? "当前账号已受本地密码保护。" : "当前账号还没有设置密码。");
    return;
  }
  if (accountHasPassword(account) && !password) {
    pendingSwitchAccountId = account.id;
    renderAccountPanel();
    window.setTimeout(() => document.querySelector("#switchAccountPasswordInput")?.focus(), 60);
    setAccountFeedback("输入这个账号的密码后进入。");
    return;
  }
  if (!(await accountPasswordMatches(account, password))) {
    pendingSwitchAccountId = account.id;
    renderAccountPanel();
    window.setTimeout(() => document.querySelector("#switchAccountPasswordInput")?.focus(), 60);
    setAccountFeedback("密码不对，再试一次。", "error");
    return;
  }
  activeAccountId = accountId;
  pendingSwitchAccountId = "";
  saveAccounts();
  loadRecords();
  resetFiltersForAccount();
  render();
  toggleAccountMenu(false);
}

async function createAccount() {
  const normalizedName = els.newAccountNameInput.value.trim();
  const password = els.newAccountPasswordInput.value;
  if (!normalizedName) {
    setAccountFeedback("先给新账号起个名字。", "error");
    els.newAccountNameInput.focus();
    return;
  }
  if (!password) {
    setAccountFeedback("请给这个账号设置一个密码，简单也可以。", "error");
    els.newAccountPasswordInput.focus();
    return;
  }
  if (accounts.some((account) => account.name === normalizedName)) {
    setAccountFeedback("这个账号名已经存在。", "error");
    els.newAccountNameInput.select();
    return;
  }
  const account = {
    id: uid(),
    name: normalizedName,
    createdAt: todayISO(),
  };
  await setAccountPassword(account, password);
  accounts.push(account);
  activeAccountId = account.id;
  pendingSwitchAccountId = "";
  records = [];
  saveAccounts();
  saveRecords();
  resetFiltersForAccount();
  els.newAccountNameInput.value = "";
  els.newAccountPasswordInput.value = "";
  setAccountFeedback(`已切换到「${account.name}」。`, "success");
  render();
  toggleAccountMenu(true);
}

function renameAccount() {
  const account = activeAccount();
  if (!account) return;
  const input = document.querySelector("#renameAccountInput");
  const normalizedName = input?.value.trim() || "";
  if (!normalizedName) {
    setAccountFeedback("账号名不能为空。", "error");
    input?.focus();
    return;
  }
  if (accounts.some((item) => item.id !== account.id && item.name === normalizedName)) {
    setAccountFeedback("这个账号名已经存在。", "error");
    input?.select();
    return;
  }
  account.name = normalizedName;
  saveAccounts();
  renderAccountPanel();
  render();
  setAccountFeedback("账号名已更新。", "success");
}

async function updateCurrentAccountPassword() {
  const account = activeAccount();
  const input = document.querySelector("#currentAccountPasswordInput");
  const password = input?.value || "";
  if (!account) return;
  if (!password) {
    setAccountFeedback("请输入新密码，简单也可以。", "error");
    input?.focus();
    return;
  }
  await setAccountPassword(account, password);
  saveAccounts();
  input.value = "";
  renderAccountPanel();
  setAccountFeedback("当前账号密码已更新。", "success");
}

async function resetAccountPassword(accountId, password) {
  if (!masterPasswordUnlocked) {
    setAccountFeedback("请先输入管理密码进入密码管理。", "error");
    document.querySelector('[data-master-password-input="unlock"]')?.focus();
    return;
  }
  const account = accounts.find((item) => item.id === accountId);
  if (!account) return;
  if (!password) {
    setAccountFeedback("请输入新密码后再重置。", "error");
    document.querySelector(`[data-reset-password-input="${accountId}"]`)?.focus();
    return;
  }
  await setAccountPassword(account, password);
  saveAccounts();
  renderAccountPanel();
  setAccountFeedback(`「${account.name}」的密码已重置。`, "success");
}

async function setMasterPasswordFromInput() {
  const input = document.querySelector('[data-master-password-input="set"]');
  const password = input?.value || "";
  if (!password) {
    setAccountFeedback("请输入管理密码，简单也可以。", "error");
    input?.focus();
    return;
  }
  await saveMasterPassword(password);
  masterPasswordUnlocked = true;
  renderAccountPanel();
  setAccountFeedback("管理密码已设置，密码管理已解锁。", "success");
}

async function unlockMasterPasswordFromInput() {
  const input = document.querySelector('[data-master-password-input="unlock"]');
  const password = input?.value || "";
  if (!password) {
    setAccountFeedback("请输入管理密码。", "error");
    input?.focus();
    return;
  }
  if (!(await masterPasswordMatches(password))) {
    setAccountFeedback("管理密码不对。", "error");
    input.select();
    return;
  }
  masterPasswordUnlocked = true;
  renderAccountPanel();
  setAccountFeedback("密码管理已解锁。", "success");
}

function lockMasterPassword() {
  masterPasswordUnlocked = false;
  renderAccountPanel();
  setAccountFeedback("密码管理已锁定。");
}

function requestDeleteAccount() {
  if (accounts.length <= 1) {
    setAccountFeedback("至少保留一个账号。", "error");
    return;
  }
  els.deleteAccountConfirm.classList.remove("hidden");
  setAccountFeedback("删除后，这个账号下的投递记录也会一起删除。", "error");
}

function deleteAccount() {
  if (accounts.length <= 1) {
    setAccountFeedback("至少保留一个账号。", "error");
    return;
  }
  const account = activeAccount();
  if (!account) return;
  localStorage.removeItem(recordsKey(account.id));
  accounts = accounts.filter((item) => item.id !== account.id);
  activeAccountId = accounts[0].id;
  saveAccounts();
  loadRecords();
  resetFiltersForAccount();
  setAccountFeedback(`已删除「${account.name}」。`, "success");
  render();
  toggleAccountMenu(true);
}

function renderStats() {
  const weekStart = addDaysISO(todayISO(), -6);
  const stats = [
    { label: "总投递", value: records.length, status: "all", metric: "all" },
    {
      label: "待初筛",
      value: records.filter((record) => record.status === "待初筛").length,
      status: "待初筛",
      metric: "all",
    },
    {
      label: "待面试",
      value: records.filter((record) => record.status === "待面试").length,
      status: "待面试",
      metric: "all",
    },
    {
      label: "已拒绝",
      value: records.filter((record) => record.status === "已拒绝").length,
      status: "已拒绝",
      metric: "all",
    },
    {
      label: "本周新增",
      value: records.filter((record) => record.appliedAt >= weekStart).length,
      status: "all",
      metric: "week",
    },
    {
      label: "超过 7 天未更新",
      value: records.filter(isStale).length,
      status: "all",
      metric: "stale",
    },
    {
      label: `逾期预警`,
      value: records.filter(isUpdateOverdue).length,
      status: "all",
      metric: "overdue",
    },
  ];

  els.statsGrid.innerHTML = stats
    .map(
      (stat) => `
        <button class="stat-card ${activeStatus === stat.status && activeMetric === stat.metric ? "active" : ""}" type="button" data-stat-status="${stat.status}" data-stat-metric="${stat.metric}">
          <span>${escapeHTML(stat.label)}</span>
          <strong>${stat.value}</strong>
          <em>查看详情</em>
        </button>
      `,
    )
    .join("");
}

function renderDueList() {
  const due = records
    .filter(isDue)
    .sort((a, b) => a.nextCheckAt.localeCompare(b.nextCheckAt))
    .slice(0, 8);

  if (!due.length) {
    els.dueList.innerHTML = '<p class="empty-mini">今天没有必须回看的投递。</p>';
    return;
  }

  els.dueList.innerHTML = due
    .map(
      (record) => `
        <div class="due-item">
          <button class="due-main" type="button" data-open-id="${record.id}">
            <strong>${escapeHTML(record.company)}</strong>
            <span>${escapeHTML(record.position || "未填写岗位")} · ${formatDate(record.nextCheckAt)}</span>
          </button>
          <button class="due-done" type="button" data-due-checked-id="${record.id}">已检查</button>
        </div>
      `,
    )
    .join("");
}

function renderBoard(list) {
  els.boardView.innerHTML = STATUSES.map((status) => {
    const columnRecords = list.filter((record) => record.status === status.id);
    return `
      <section class="kanban-column" data-drop-status="${status.id}" data-status="${status.id}">
        <div class="column-head">
          <div class="column-title">
            <span class="status-dot"></span>
            ${status.label}
          </div>
          <span class="count-pill">${columnRecords.length}</span>
        </div>
        <div class="column-body">
          ${columnRecords.map(recordCardHTML).join("") || emptyStateHTML()}
        </div>
      </section>
    `;
  }).join("");
}

function recordCardHTML(record) {
  const stale = isStale(record);
  const due = isDue(record);
  const updateOverdue = isUpdateOverdue(record);
  const importance = normalizeImportance(record);
  const tags = [
    `<span class="tag status-badge">${escapeHTML(record.status)}</span>`,
    `<span class="tag city-tag">${escapeHTML(cityText(record))}</span>`,
    `<span class="tag">${escapeHTML(record.sourceType)}</span>`,
    updateOverdue ? `<span class="tag danger">逾期预警 · ${monthsBetween(record.updatedAt)} 个月未更新</span>` : "",
    stale ? `<span class="tag warn">${daysBetween(record.updatedAt)} 天未更新</span>` : "",
    due ? `<span class="tag warn">今日检查</span>` : "",
  ]
    .filter(Boolean)
    .join("");

  return `
    <article class="record-card ${due ? "overdue" : ""} ${updateOverdue ? "update-overdue" : ""}" draggable="true" data-card-id="${record.id}" data-open-id="${record.id}" data-status="${record.status}" data-importance="${importance}" data-update-overdue="${updateOverdue ? "true" : "false"}">
      <div class="card-top">
        <div>
          <h3 class="card-title">${escapeHTML(record.company)}</h3>
          <div class="card-subtitle">${escapeHTML(record.position || "未填写岗位")}</div>
        </div>
        <span class="importance-badge">${stars(importance)}</span>
      </div>
      <div class="tag-row">${tags}</div>
      <div class="meta-line">更新于 ${formatDate(record.updatedAt)} · 投递于 ${formatDate(record.appliedAt)}</div>
      ${record.note ? `<div class="meta-line">${escapeHTML(record.note)}</div>` : ""}
      <div class="quick-status" aria-label="快速切换状态">
        ${STATUSES.filter((status) => status.id !== record.status)
          .map(
            (status) =>
              `<button type="button" data-quick-status="${status.id}" data-record-id="${record.id}">${status.label}</button>`,
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderTable(list) {
  if (!list.length) {
    els.tableView.innerHTML = emptyStateHTML();
    return;
  }

  els.tableView.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>公司</th>
          <th>岗位</th>
          <th>城市</th>
          <th>重要程度</th>
          <th>状态</th>
          <th>来源</th>
          <th>更新</th>
          <th>下次检查</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${list
          .map(
            (record) => {
              const updateOverdue = isUpdateOverdue(record);
              return `
              <tr data-status="${record.status}" data-update-overdue="${updateOverdue ? "true" : "false"}">
                <td>
                  <strong class="table-company">${escapeHTML(record.company)}</strong>
                  ${updateOverdue ? `<div class="meta-line danger-text">逾期预警</div>` : ""}
                </td>
                <td>${escapeHTML(record.position || "未填写")}</td>
                <td>${escapeHTML(cityText(record))}</td>
                <td data-importance="${normalizeImportance(record)}"><span class="importance-badge">${stars(normalizeImportance(record))}</span></td>
                <td><span class="tag status-badge">${escapeHTML(record.status)}</span></td>
                <td>${sourceToHTML(record)}</td>
                <td>${formatDate(record.updatedAt)}<div class="meta-line">${daysBetween(record.updatedAt)} 天前${updateOverdue ? ` · ${monthsBetween(record.updatedAt)} 个月` : ""}</div></td>
                <td>${formatDate(record.nextCheckAt)}</td>
                <td>
                  <div class="row-actions">
                    <button class="mini-button" type="button" data-open-id="${record.id}">查看</button>
                    <button class="mini-button" type="button" data-edit-id="${record.id}">编辑</button>
                  </div>
                </td>
              </tr>
            `;
            },
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderInsights() {
  const total = records.length;
  const activeRecords = records.filter((record) => record.status !== "已拒绝");
  const highPriority = records
    .filter((record) => importanceValue(record) >= 4 && record.status !== "已拒绝")
    .sort((a, b) => {
      const importanceDiff = importanceValue(b) - importanceValue(a);
      if (importanceDiff !== 0) return importanceDiff;
      const dueDiff = Number(isDue(b)) - Number(isDue(a));
      if (dueDiff !== 0) return dueDiff;
      return daysBetween(b.updatedAt) - daysBetween(a.updatedAt);
    })
    .slice(0, 6);
  const statusRows = STATUSES.map((status) => ({
    label: status.label,
    count: records.filter((record) => record.status === status.id).length,
    status: status.id,
  }));
  const sourceRows = SOURCE_TYPES.map((source) => ({
    label: source,
    count: records.filter((record) => record.sourceType === source).length,
  }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
  const cityRows = CITY_OPTIONS.map((city) => ({
    label: city,
    count: records.filter((record) => recordCities(record).includes(city)).length,
  }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count || CITY_OPTIONS.indexOf(a.label) - CITY_OPTIONS.indexOf(b.label))
    .slice(0, 10);
  const importanceRows = [5, 4, 3, 2, 1].map((level) => ({
    level,
    count: records.filter((record) => importanceValue(record) === level).length,
  }));
  const dueCount = records.filter(isDue).length;
  const staleCount = records.filter(isStale).length;
  const interviewCount = records.filter((record) => record.status === "待面试").length;
  const rejectedCount = records.filter((record) => record.status === "已拒绝").length;
  const avgUpdateDays = activeRecords.length
    ? Math.round(
        activeRecords.reduce((sum, record) => sum + daysBetween(record.updatedAt), 0) /
          activeRecords.length,
      )
    : 0;

  els.insightsView.innerHTML = `
    <div class="insight-hero">
      <article>
        <span>面试推进率</span>
        <strong>${percent(interviewCount, total)}%</strong>
        <em>${interviewCount} / ${total || 0} 条进入待面试</em>
      </article>
      <article>
        <span>拒绝占比</span>
        <strong>${percent(rejectedCount, total)}%</strong>
        <em>${rejectedCount} 条已拒绝</em>
      </article>
      <article>
        <span>今日待检查</span>
        <strong>${dueCount}</strong>
        <em>${staleCount} 条超过 ${STALE_DAYS} 天未更新</em>
      </article>
      <article>
        <span>平均未更新</span>
        <strong>${avgUpdateDays}</strong>
        <em>活跃投递平均天数</em>
      </article>
    </div>

    <div class="insight-grid">
      <section class="insight-panel">
        <div class="insight-head">
          <h3>状态漏斗</h3>
          <span>${total} 条记录</span>
        </div>
        <div class="funnel-list">
          ${statusRows
            .map(
              (row) => `
                <button class="funnel-row" type="button" data-stat-status="${row.status}" data-stat-metric="all" data-status="${row.status}">
                  <span class="status-dot"></span>
                  <strong>${row.label}</strong>
                  <em>${row.count} 条</em>
                  <i style="width:${total ? Math.max(percent(row.count, total), 4) : 0}%"></i>
                </button>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="insight-panel">
        <div class="insight-head">
          <h3>高重要待推进</h3>
          <span>4-5 星优先看</span>
        </div>
        <div class="priority-list">
          ${
            highPriority.length
              ? highPriority
                  .map(
                    (record) => `
                      <button class="priority-row" type="button" data-open-id="${record.id}" data-importance="${normalizeImportance(record)}">
                        <strong>${escapeHTML(record.company)}</strong>
                        <span>${escapeHTML(record.position || "未填写岗位")}</span>
                        <em>${stars(normalizeImportance(record))} · ${daysBetween(record.updatedAt)} 天未更新</em>
                      </button>
                    `,
                  )
                  .join("")
              : '<p class="empty-mini">暂时没有 4-5 星的活跃投递。</p>'
          }
        </div>
      </section>

      <section class="insight-panel">
        <div class="insight-head">
          <h3>来源分布</h3>
          <span>判断渠道投入</span>
        </div>
        <div class="bar-list">
          ${
            sourceRows.length
              ? sourceRows
                  .map(
                    (row) => `
                      <div class="bar-row">
                        <span>${escapeHTML(row.label)}</span>
                        <div><i style="width:${total ? Math.max(percent(row.count, total), 4) : 0}%"></i></div>
                        <strong>${row.count}</strong>
                      </div>
                    `,
                  )
                  .join("")
              : '<p class="empty-mini">添加记录后会显示来源统计。</p>'
          }
        </div>
      </section>

      <section class="insight-panel">
        <div class="insight-head">
          <h3>城市分布</h3>
          <span>前 10 个投递城市</span>
        </div>
        <div class="bar-list">
          ${
            cityRows.length
              ? cityRows
                  .map(
                    (row) => `
                      <div class="bar-row">
                        <span>${escapeHTML(row.label)}</span>
                        <div><i style="width:${total ? Math.max(percent(row.count, total), 4) : 0}%"></i></div>
                        <strong>${row.count}</strong>
                      </div>
                    `,
                  )
                  .join("")
              : '<p class="empty-mini">添加城市后会显示城市统计。</p>'
          }
        </div>
      </section>

      <section class="insight-panel">
        <div class="insight-head">
          <h3>星级分布</h3>
          <span>重点池是否健康</span>
        </div>
        <div class="star-list">
          ${importanceRows
            .map(
              (row) => `
                <div class="star-row" data-importance="${row.level}">
                  <span class="importance-badge">${stars(row.level)}</span>
                  <div><i style="width:${total ? Math.max(percent(row.count, total), 4) : 0}%"></i></div>
                  <strong>${row.count}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function emptyStateHTML() {
  return document.querySelector("#emptyStateTemplate").innerHTML;
}

function render() {
  const list = getFilteredRecords();
  const account = accounts.find((item) => item.id === activeAccountId);
  renderAccountPanel();
  renderStatusFilters();
  renderSourceFilter();
  renderCityFilter();
  renderStats();
  renderDueList();
  renderBoard(list);
  renderTable(list);
  renderInsights();
  els.resultMeta.textContent = `${account?.name || "当前账号"} · 显示 ${list.length} 条，共 ${records.length} 条`;
  hydrateIcons(document);
}

function handleSearchInput() {
  render();
  window.clearTimeout(searchJumpTimer);
  if (!normalize(els.searchInput.value)) return;
  searchJumpTimer = window.setTimeout(() => {
    setView("table");
    els.tableView.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 160);
}

function setView(view) {
  activeView = view;
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  els.boardView.classList.toggle("hidden", view !== "board");
  els.tableView.classList.toggle("hidden", view !== "table");
  els.insightsView.classList.toggle("hidden", view !== "insights");
}

function populateSelects() {
  const statusSelect = els.recordForm.elements.status;
  const sourceSelect = els.recordForm.elements.sourceType;
  const citySelect = els.recordForm.elements.cities;
  statusSelect.innerHTML = STATUSES.map(
    (status) => `<option value="${status.id}">${status.label}</option>`,
  ).join("");
  sourceSelect.innerHTML = SOURCE_TYPES.map(
    (source) => `<option value="${source}">${source}</option>`,
  ).join("");
  citySelect.innerHTML = [
    ...CITY_OPTIONS.map((city) => `<option value="${city}">${city}</option>`),
  ].join("");
}

function openRecordDialog(record = null) {
  editingId = record?.id || null;
  els.formError.textContent = "";
  els.dialogTitle.textContent = record ? "编辑投递记录" : "添加投递记录";
  els.deleteFromFormBtn.classList.toggle("hidden", !record);

  const form = els.recordForm;
  form.reset();
  form.elements.company.value = record?.company || "";
  form.elements.position.value = record?.position || "";
  const selectedCities = recordCities(record).slice(0, MAX_RECORD_CITIES);
  Array.from(form.elements.cities.options).forEach((option) => {
    option.selected = selectedCities.includes(option.value);
  });
  form.elements.status.value = record?.status || "待初筛";
  form.elements.sourceType.value = record?.sourceType || "官网";
  form.elements.sourceDetail.value = record?.sourceDetail || "";
  form.elements.appliedAt.value = record?.appliedAt || todayISO();
  form.elements.updatedAt.value = record?.updatedAt || todayISO();
  form.elements.nextCheckAt.value = record?.nextCheckAt || addDaysISO(todayISO(), 7);
  if (form.elements.importance) {
    form.elements.importance.value = normalizeImportance(record);
  }
  form.elements.note.value = record?.note || "";
  updateSourceLabel();
  openDialog(els.recordDialog);
}

function closeRecordDialog() {
  closeDialog(els.recordDialog);
  editingId = null;
}

function updateSourceLabel() {
  const type = els.recordForm.elements.sourceType.value;
  const showUrl = type === "自定义";
  if (els.sourceDetailField) {
    els.sourceDetailField.classList.toggle("hidden", !showUrl);
  }
  els.sourceDetailLabel.textContent = "自定义网址";
  els.recordForm.elements.sourceDetail.placeholder = "https://example.com/recruit";
  if (!showUrl) {
    els.recordForm.elements.sourceDetail.value = "";
  }
}

function enforceCitySelectionLimit(event) {
  const select = event.currentTarget;
  const selected = Array.from(select.selectedOptions);
  if (selected.length <= MAX_RECORD_CITIES) return;
  const changedOption = event.target;
  if (changedOption?.selected) {
    changedOption.selected = false;
  } else {
    selected.slice(MAX_RECORD_CITIES).forEach((option) => {
      option.selected = false;
    });
  }
  els.formError.textContent = `城市最多选择 ${MAX_RECORD_CITIES} 个。`;
}

function formToRecord(base = null) {
  const form = els.recordForm;
  const data = Object.fromEntries(new FormData(form).entries());
  const now = todayISO();
  const note = data.note.trim();
  const cities = Array.from(form.elements.cities.selectedOptions).map((option) => option.value);

  return {
    id: base?.id || uid(),
    company: data.company.trim(),
    position: data.position.trim(),
    cities,
    sourceType: data.sourceType,
    sourceDetail: data.sourceDetail.trim(),
    status: data.status,
    appliedAt: data.appliedAt || now,
    updatedAt: data.updatedAt || now,
    nextCheckAt: data.nextCheckAt || "",
    importance: data.importance || normalizeImportance(base),
    note,
    history: base?.history?.length
      ? [...base.history]
      : [
          {
            id: uid(),
            status: data.status,
            updatedAt: data.updatedAt || now,
            note: note || "创建投递记录",
          },
        ],
  };
}

function validateRecord(record) {
  if (!record.company) return "公司名称必须填写。";
  const cities = recordCities(record);
  if (!cities.length) return "城市必须至少选择 1 个。";
  if (cities.length > MAX_RECORD_CITIES) return `城市最多选择 ${MAX_RECORD_CITIES} 个。`;
  if (!SOURCE_TYPES.includes(record.sourceType)) return "来源类型必须选择。";
  if (!record.appliedAt || !record.updatedAt) return "投递日期和更新时间必须填写。";
  if (record.sourceType === "自定义") {
    if (!record.sourceDetail) return "自定义来源需要填写网址。";
    try {
      new URL(/^https?:\/\//i.test(record.sourceDetail) ? record.sourceDetail : `https://${record.sourceDetail}`);
    } catch {
      return "来源网址格式不太对。";
    }
  }
  return "";
}

function hasPossibleDuplicate(candidate) {
  const company = normalize(candidate.company);
  const position = normalize(candidate.position);
  return records.some((record) => {
    if (record.id === candidate.id) return false;
    const sameCompany = normalize(record.company) === company;
    const samePosition = !position || normalize(record.position) === position;
    return sameCompany && samePosition;
  });
}

function saveFromForm(event) {
  event.preventDefault();
  const existing = editingId ? records.find((record) => record.id === editingId) : null;
  const next = formToRecord(existing);
  const error = validateRecord(next);

  if (error) {
    els.formError.textContent = error;
    return;
  }

  if (!existing && hasPossibleDuplicate(next)) {
    const ok = window.confirm("可能已经存在相同公司或岗位的记录，仍然继续添加吗？");
    if (!ok) return;
  }

  if (existing) {
    const meaningfulUpdate =
      existing.status !== next.status ||
      existing.updatedAt !== next.updatedAt ||
      (next.note && next.note !== existing.note);
    if (meaningfulUpdate) {
      next.history.unshift({
        id: uid(),
        status: next.status,
        updatedAt: next.updatedAt,
        note: next.note || "更新投递状态",
      });
    }
    records = records.map((record) => (record.id === next.id ? next : record));
  } else {
    records.unshift(next);
  }

  saveRecords();
  closeRecordDialog();
  render();
  if (selectedId === next.id) openDrawer(next.id);
}

function updateRecordStatus(id, status, note = "快速切换状态") {
  const record = records.find((item) => item.id === id);
  if (!record || record.status === status) return;
  record.status = status;
  record.updatedAt = todayISO();
  record.note = note;
  record.history.unshift({
    id: uid(),
    status,
    updatedAt: record.updatedAt,
    note,
  });
  saveRecords();
  render();
  if (selectedId === id) openDrawer(id);
}

function markDueChecked(id) {
  const record = records.find((item) => item.id === id);
  if (!record) return;
  record.nextCheckAt = addDaysISO(todayISO(), 7);
  record.history.unshift({
    id: uid(),
    status: record.status,
    updatedAt: todayISO(),
    note: "已检查，下次检查顺延 7 天",
  });
  saveRecords();
  render();
  if (selectedId === id) openDrawer(id);
}

function deleteRecord(id) {
  const record = records.find((item) => item.id === id);
  if (!record) return;
  const ok = window.confirm(`确认删除「${record.company}」这条投递记录吗？`);
  if (!ok) return;
  records = records.filter((item) => item.id !== id);
  saveRecords();
  closeDrawer();
  closeRecordDialog();
  render();
}

function openDrawer(id) {
  const record = records.find((item) => item.id === id);
  if (!record) return;
  selectedId = id;
  els.detailDrawer.classList.remove("hidden");
  els.drawerBackdrop.classList.remove("hidden");
  els.detailDrawer.setAttribute("aria-hidden", "false");
  els.detailDrawer.innerHTML = drawerHTML(record);
  hydrateIcons(els.detailDrawer);
}

function closeDrawer() {
  selectedId = null;
  els.detailDrawer.classList.add("hidden");
  els.drawerBackdrop.classList.add("hidden");
  els.detailDrawer.setAttribute("aria-hidden", "true");
}

function drawerHTML(record) {
  const importance = normalizeImportance(record);
  const updateOverdue = isUpdateOverdue(record);
  return `
    <div class="drawer-head" data-status="${record.status}" data-importance="${importance}" data-update-overdue="${updateOverdue ? "true" : "false"}">
      <div class="drawer-title-row">
        <div>
          <p class="eyebrow">Record Detail</p>
          <h3>${escapeHTML(record.company)}</h3>
          <div class="detail-meta">
            <span class="tag status-badge">${escapeHTML(record.status)}</span>
            <span class="importance-badge">${stars(importance)}</span>
            ${updateOverdue ? `<span class="tag danger">逾期预警 · ${monthsBetween(record.updatedAt)} 个月未更新</span>` : ""}
            ${isDue(record) ? '<span class="tag warn">今日待检查</span>' : ""}
            ${isStale(record) ? `<span class="tag warn">${daysBetween(record.updatedAt)} 天未更新</span>` : ""}
          </div>
        </div>
        <button class="icon-button ghost" type="button" data-close-drawer aria-label="关闭" title="关闭">
          <span data-icon="x"></span>
        </button>
      </div>
    </div>
    <div class="drawer-body">
      <section class="detail-section">
        <h4>基本信息</h4>
        <div class="detail-grid">
          <span>岗位</span><strong>${escapeHTML(record.position || "未填写")}</strong>
          <span>城市</span><strong>${escapeHTML(cityText(record))}</strong>
          <span>重要程度</span><strong>${stars(importance)} · ${importance} 星</strong>
          <span>来源</span><strong>${sourceToHTML(record)}</strong>
          <span>投递日期</span><strong>${formatDate(record.appliedAt)}</strong>
          <span>更新时间</span><strong>${formatDate(record.updatedAt)}</strong>
          <span>下次检查</span><strong>${formatDate(record.nextCheckAt)}</strong>
        </div>
      </section>
      <section class="detail-section">
        <h4>快速操作</h4>
        <div class="quick-actions">
          <button class="primary-button" type="button" data-edit-id="${record.id}">
            <span data-icon="edit"></span>
            编辑
          </button>
          ${STATUSES.filter((status) => status.id !== record.status)
            .map(
              (status) =>
                `<button class="mini-button" type="button" data-quick-status="${status.id}" data-record-id="${record.id}">${status.label}</button>`,
            )
            .join("")}
          <button class="danger-button" type="button" data-delete-id="${record.id}">
            <span data-icon="trash"></span>
            删除
          </button>
        </div>
      </section>
      <section class="detail-section">
        <h4>最近备注</h4>
        <p class="history-note">${escapeHTML(record.note || "还没有备注。")}</p>
      </section>
      <section class="detail-section">
        <h4>更新历史</h4>
        <div class="history-list">
          ${(record.history || [])
            .map(
              (item) => `
                <div class="history-item" data-status="${item.status}">
                  <div class="history-main">
                    <div class="history-title">
                      <span>${escapeHTML(item.status)}</span>
                      <span class="meta-line">${formatDate(item.updatedAt)}</span>
                    </div>
                    <div class="history-note">${escapeHTML(item.note || "更新状态")}</div>
                  </div>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function exportData() {
  openDialog(els.exportDialog);
}

function exportJsonText() {
  return JSON.stringify(records, null, 2);
}

function downloadExportFile() {
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportFilename();
  link.click();
  URL.revokeObjectURL(url);
}

function closeExportDialog() {
  closeDialog(els.exportDialog);
}

function shareExportData() {
  if (window.AndroidBridge?.shareJson) {
    window.AndroidBridge.shareJson(exportJsonText(), exportFilename());
  } else if (navigator.share) {
    navigator.share({
      title: "秋招投递记录",
      text: exportJsonText(),
    }).catch(() => {});
  } else {
    downloadExportFile();
  }
  closeExportDialog();
}

function saveExportData() {
  if (window.AndroidBridge?.saveJson) {
    window.AndroidBridge.saveJson(exportJsonText(), exportFilename());
  } else {
    downloadExportFile();
  }
  closeExportDialog();
}

function copyExportData() {
  if (window.AndroidBridge?.copyJson) {
    window.AndroidBridge.copyJson(exportJsonText());
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(exportJsonText()).catch(copyExportDataFallback);
  } else {
    copyExportDataFallback();
  }
  closeExportDialog();
}

function copyExportDataFallback() {
  const textarea = document.createElement("textarea");
  textarea.value = exportJsonText();
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) throw new Error("Invalid data");
      records = parsed.map((record) => ({
        id: record.id || uid(),
        company: record.company || "",
        position: record.position || "",
        cities: recordCities(record).slice(0, MAX_RECORD_CITIES),
        sourceType: SOURCE_TYPES.includes(record.sourceType) ? record.sourceType : "官网",
        sourceDetail: record.sourceDetail || record.sourceName || record.sourceUrl || "",
        status: STATUSES.some((status) => status.id === record.status) ? record.status : "待初筛",
        appliedAt: record.appliedAt || todayISO(),
        updatedAt: record.updatedAt || todayISO(),
        nextCheckAt: record.nextCheckAt || "",
        importance: normalizeImportance(record),
        note: record.note || "",
        history: Array.isArray(record.history) ? record.history : [],
      }));
      saveRecords();
      render();
      window.alert("导入完成。");
    } catch {
      window.alert("导入失败，请确认文件是本应用导出的 JSON。");
    } finally {
      els.importInput.value = "";
    }
  };
  reader.readAsText(file);
}

function openMobileDialog() {
  const url = window.location.href;
  els.shareUrl.value = url;
  els.shareHint.textContent = url.includes("localhost") || url.includes("127.0.0.1")
    ? "如果手机打不开，把 localhost 或 127.0.0.1 换成电脑的局域网 IP。"
    : "手机打开这个地址后，可以从浏览器菜单添加到主屏幕。";
  openDialog(els.mobileDialog);
}

function closeMobileDialog() {
  closeDialog(els.mobileDialog);
}

async function copyShareLink() {
  try {
    await navigator.clipboard.writeText(els.shareUrl.value);
    els.shareHint.textContent = "链接已复制。发到手机后，如果地址里是 localhost，记得替换成电脑局域网 IP。";
  } catch {
    els.shareUrl.select();
    document.execCommand("copy");
    els.shareHint.textContent = "链接已复制。";
  }
}

async function nativeShareLink() {
  if (!navigator.share) {
    await copyShareLink();
    return;
  }
  try {
    await navigator.share({
      title: "秋招投递管理",
      text: "打开秋招投递管理工具",
      url: els.shareUrl.value,
    });
  } catch {
    els.shareHint.textContent = "分享已取消。";
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!["http:", "https:"].includes(window.location.protocol)) return;
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

function configureRuntimeContext() {
  if (window.location.href.startsWith("file:///android_asset/")) {
    els.mobileBtn.classList.add("hidden");
  }
}

function exposeFallbackActions() {
  window.__trackerOpenAdd = () => openRecordDialog();
}

function bindEvents() {
  els.accountMenuBtn.addEventListener("click", () => toggleAccountMenu());
  els.closeAccountMenuBtn.addEventListener("click", () => toggleAccountMenu(false));
  els.createAccountBtn.addEventListener("click", createAccount);
  els.requestDeleteAccountBtn.addEventListener("click", requestDeleteAccount);
  els.confirmDeleteAccountBtn.addEventListener("click", deleteAccount);
  els.cancelDeleteAccountBtn.addEventListener("click", () => {
    els.deleteAccountConfirm.classList.add("hidden");
    setAccountFeedback();
  });
  els.newAccountNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") createAccount();
  });
  els.newAccountPasswordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") createAccount();
  });
  els.addBtn.addEventListener("click", () => openRecordDialog());
  els.exportBtn.addEventListener("click", exportData);
  els.closeExportDialogBtn.addEventListener("click", closeExportDialog);
  els.shareExportBtn.addEventListener("click", shareExportData);
  els.saveExportBtn.addEventListener("click", saveExportData);
  els.copyExportBtn.addEventListener("click", copyExportData);
  els.importInput.addEventListener("change", (event) => importData(event.target.files[0]));
  els.mobileBtn.addEventListener("click", openMobileDialog);
  els.closeMobileDialogBtn.addEventListener("click", closeMobileDialog);
  els.copyLinkBtn.addEventListener("click", copyShareLink);
  els.nativeShareBtn.addEventListener("click", nativeShareLink);
  els.searchInput.addEventListener("input", handleSearchInput);
  els.sourceFilter.addEventListener("change", render);
  els.cityFilter.addEventListener("change", render);
  els.sortSelect.addEventListener("change", render);
  els.overdueMonthsInput.addEventListener("change", () => {
    saveOverdueMonthsSetting();
    render();
  });
  els.overdueMonthsInput.addEventListener("input", () => {
    if (!els.overdueMonthsInput.value) return;
    saveOverdueMonthsSetting();
    render();
  });
  els.recordForm.addEventListener("submit", saveFromForm);
  els.recordForm.elements.sourceType.addEventListener("change", updateSourceLabel);
  els.recordForm.elements.cities.addEventListener("change", enforceCitySelectionLimit);
  els.closeDialogBtn.addEventListener("click", closeRecordDialog);
  els.cancelDialogBtn.addEventListener("click", closeRecordDialog);
  els.deleteFromFormBtn.addEventListener("click", () => editingId && deleteRecord(editingId));
  els.drawerBackdrop.addEventListener("click", closeDrawer);
  els.modalBackdrop?.addEventListener("click", closeActiveDialog);

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  document.addEventListener("click", (event) => {
    const accountTarget = event.target.closest("[data-switch-account]");
    const confirmSwitchTarget = event.target.closest("[data-confirm-switch]");
    const saveAccountNameTarget = event.target.closest("#saveAccountNameBtn");
    const saveAccountPasswordTarget = event.target.closest("#saveAccountPasswordBtn");
    const resetPasswordTarget = event.target.closest("[data-reset-password-account]");
    const setMasterPasswordTarget = event.target.closest("[data-set-master-password]");
    const unlockMasterPasswordTarget = event.target.closest("[data-unlock-master-password]");
    const lockMasterPasswordTarget = event.target.closest("[data-lock-master-password]");
    const isAccountSurface = event.target.closest("#accountMenu") || event.target.closest("#accountMenuBtn");
    const openTarget = event.target.closest("[data-open-id]");
    const editTarget = event.target.closest("[data-edit-id]");
    const deleteTarget = event.target.closest("[data-delete-id]");
    const dueCheckedTarget = event.target.closest("[data-due-checked-id]");
    const quickTarget = event.target.closest("[data-quick-status]");
    const filterTarget = event.target.closest("[data-filter-status]");
    const statTarget = event.target.closest("[data-stat-status]");
    const closeTarget = event.target.closest("[data-close-drawer]");

    if (confirmSwitchTarget) {
      const accountId = confirmSwitchTarget.dataset.confirmSwitch;
      const passwordInput = document.querySelector(`[data-switch-password="${accountId}"]`);
      switchAccount(accountId, passwordInput?.value || "");
      return;
    }

    if (saveAccountNameTarget) {
      renameAccount();
      return;
    }

    if (saveAccountPasswordTarget) {
      updateCurrentAccountPassword();
      return;
    }

    if (accountTarget) {
      switchAccount(accountTarget.dataset.switchAccount);
      return;
    }

    if (resetPasswordTarget) {
      const accountId = resetPasswordTarget.dataset.resetPasswordAccount;
      const passwordInput = document.querySelector(`[data-reset-password-input="${accountId}"]`);
      resetAccountPassword(accountId, passwordInput?.value || "");
      return;
    }

    if (setMasterPasswordTarget) {
      setMasterPasswordFromInput();
      return;
    }

    if (unlockMasterPasswordTarget) {
      unlockMasterPasswordFromInput();
      return;
    }

    if (lockMasterPasswordTarget) {
      lockMasterPassword();
      return;
    }

    if (!els.accountMenu.classList.contains("hidden") && !isAccountSurface) {
      toggleAccountMenu(false);
    }

    if (dueCheckedTarget) {
      event.stopPropagation();
      markDueChecked(dueCheckedTarget.dataset.dueCheckedId);
      return;
    }

    if (quickTarget) {
      event.stopPropagation();
      updateRecordStatus(
        quickTarget.dataset.recordId,
        quickTarget.dataset.quickStatus,
        "快速切换状态",
      );
      return;
    }

    if (filterTarget) {
      activeStatus = filterTarget.dataset.filterStatus;
      activeMetric = "all";
      render();
      return;
    }

    if (statTarget) {
      activeStatus = statTarget.dataset.statStatus;
      activeMetric = statTarget.dataset.statMetric;
      setView("table");
      render();
      els.tableView.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (editTarget) {
      event.stopPropagation();
      const record = records.find((item) => item.id === editTarget.dataset.editId);
      if (record) openRecordDialog(record);
      return;
    }

    if (deleteTarget) {
      event.stopPropagation();
      deleteRecord(deleteTarget.dataset.deleteId);
      return;
    }

    if (closeTarget) {
      closeDrawer();
      return;
    }

    if (openTarget) {
      openDrawer(openTarget.dataset.openId);
    }
  });

  document.addEventListener("dragstart", (event) => {
    const card = event.target.closest("[data-card-id]");
    if (!card) return;
    draggedId = card.dataset.cardId;
    card.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
  });

  document.addEventListener("dragend", (event) => {
    const card = event.target.closest("[data-card-id]");
    if (card) card.classList.remove("dragging");
    draggedId = null;
  });

  document.addEventListener("dragover", (event) => {
    const column = event.target.closest("[data-drop-status]");
    if (!column) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });

  document.addEventListener("drop", (event) => {
    const column = event.target.closest("[data-drop-status]");
    if (!column || !draggedId) return;
    event.preventDefault();
    updateRecordStatus(draggedId, column.dataset.dropStatus, "拖拽切换状态");
  });

  document.addEventListener("keydown", (event) => {
    const switchPasswordTarget = event.target.closest("[data-switch-password]");
    const renameAccountInput = event.target.closest("#renameAccountInput");
    const currentAccountPasswordInput = event.target.closest("#currentAccountPasswordInput");
    const resetPasswordInput = event.target.closest("[data-reset-password-input]");
    const masterPasswordInput = event.target.closest("[data-master-password-input]");
    if (event.key === "Enter" && renameAccountInput) {
      renameAccount();
      return;
    }
    if (event.key === "Enter" && currentAccountPasswordInput) {
      updateCurrentAccountPassword();
      return;
    }
    if (event.key === "Enter" && masterPasswordInput) {
      if (masterPasswordInput.dataset.masterPasswordInput === "set") {
        setMasterPasswordFromInput();
      } else {
        unlockMasterPasswordFromInput();
      }
      return;
    }
    if (event.key === "Enter" && resetPasswordInput) {
      resetAccountPassword(resetPasswordInput.dataset.resetPasswordInput, resetPasswordInput.value || "");
      return;
    }
    if (event.key === "Enter" && switchPasswordTarget) {
      switchAccount(switchPasswordTarget.dataset.switchPassword, switchPasswordTarget.value || "");
      return;
    }
    if (event.key === "Escape" && closeActiveDialog()) {
      return;
    }
    if (event.key === "Escape" && !els.detailDrawer.classList.contains("hidden")) {
      closeDrawer();
    }
  });
}

function init() {
  if (new URLSearchParams(window.location.search).has("reset")) {
    try {
      const rawAccounts = localStorage.getItem(ACCOUNTS_KEY);
      const storedAccounts = rawAccounts ? JSON.parse(rawAccounts) : [];
      storedAccounts.forEach((account) => localStorage.removeItem(recordsKey(account.id)));
    } catch {}
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(ACCOUNTS_KEY);
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    localStorage.removeItem(OVERDUE_MONTHS_KEY);
    localStorage.removeItem(MASTER_PASSWORD_KEY);
    window.history.replaceState(null, "", window.location.pathname);
  }
  hydrateIcons(document);
  populateSelects();
  loadOverdueMonthsSetting();
  loadAccounts();
  loadRecords();
  configureRuntimeContext();
  exposeFallbackActions();
  render();
  bindEvents();
  setView(activeView);
  registerServiceWorker();
}

init();
