const LEGACY_STORAGE_KEY = "campus-application-tracker:v1";
const ACCOUNTS_KEY = "campus-application-tracker:accounts:v1";
const ACTIVE_ACCOUNT_KEY = "campus-application-tracker:active-account:v1";
const ACCOUNT_RECORDS_PREFIX = "campus-application-tracker:records:v1:";
const OVERDUE_MONTHS_KEY = "campus-application-tracker:overdue-months:v1";
const MASTER_PASSWORD_KEY = "campus-application-tracker:master-password:v1";
const APP_VERSION = "2.2.1";
const APP_UPDATED_AT = "2026.07.18";

const STATUSES = [
  { id: "待初筛", label: "待初筛" },
  { id: "待测评", label: "待测评" },
  { id: "待笔试", label: "待笔试" },
  { id: "待面试", label: "待面试" },
  { id: "已拒绝", label: "已拒绝" },
  { id: "offer", label: "offer" },
];
const BOARD_STATUSES = ["待测评", "待笔试", "待面试", "待初筛", "offer", "已拒绝"]
  .map((id) => STATUSES.find((status) => status.id === id))
  .filter(Boolean);
const REAPPLY_STATUS = { id: "可再次投递", label: "可再次投递" };
const CREATE_STATUSES = STATUSES.filter((status) => ["待初筛", "待笔试"].includes(status.id));
const QUICK_FLOW_STATUSES = STATUSES.filter((status) => status.id !== "待初筛");

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
const REMINDER_ALERT_WINDOW_MS = 12 * 60 * 60 * 1000;
const DEADLINE_REQUIRED_STATUSES = new Set(["待测评", "待笔试", "待面试"]);
const LINK_IMPORT_PARAM = "import";
const LINK_IMPORT_VERSION = 1;
const PUBLIC_IMPORT_BASE_URL = "https://bai1623444091-coder.github.io/campus-application-tracker/";
const SHARE_API_BASE_URL = "https://bai.a1623444091.workers.dev";
const CLOUD_SHARE_TIMEOUT_MS = 8000;

const icons = {
  home:
    '<svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8"></path><path d="M5 10v10h5v-6h4v6h5V10"></path></svg>',
  briefcase:
    '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M3 12h18"></path></svg>',
  bell:
    '<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path></svg>',
  user:
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>',
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
  alert:
    '<svg viewBox="0 0 24 24"><path d="M12 9v4"></path><path d="M12 17h.01"></path><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"></path></svg>',
};

let records = [];
let accounts = [];
let activeAccountId = "";
let activeStatus = "all";
let activeMetric = "all";
let activeModule = "overview";
let overviewListVisible = false;
let editingId = null;
let selectedId = null;
let draggedId = null;
let pendingSwitchAccountId = "";
let pendingDeleteAccountId = "";
let masterPasswordUnlocked = false;
let toastTimer = null;
let swipeState = null;
let actionConfirmResolve = null;
let statusDeadlineResolve = null;
let dueStatusResolve = null;
let cloudShareRequestPending = false;

const els = {
  searchInput: document.querySelector("#searchInput"),
  searchButton: document.querySelector("#searchButton"),
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
  deleteAccountConfirm: document.querySelector("#deleteAccountConfirm"),
  deleteAccountConfirmText: document.querySelector("#deleteAccountConfirmText"),
  confirmDeleteAccountBtn: document.querySelector("#confirmDeleteAccountBtn"),
  cancelDeleteAccountBtn: document.querySelector("#cancelDeleteAccountBtn"),
  accountFeedback: document.querySelector("#accountFeedback"),
  overviewPage: document.querySelector("#overviewPage"),
  recordsPage: document.querySelector("#recordsPage"),
  remindersPage: document.querySelector("#remindersPage"),
  profilePage: document.querySelector("#profilePage"),
  overviewResultsPanel: document.querySelector("#overviewResultsPanel"),
  overviewListView: document.querySelector("#overviewListView"),
  statusFilters: document.querySelector("#statusFilters"),
  sourceFilter: document.querySelector("#sourceFilter"),
  cityFilter: document.querySelector("#cityFilter"),
  sortSelect: document.querySelector("#sortSelect"),
  overdueMonthsInput: document.querySelector("#overdueMonthsInput"),
  dueList: document.querySelector("#dueList"),
  statsGrid: document.querySelector("#statsGrid"),
  resultMeta: document.querySelector("#resultMeta"),
  boardView: document.querySelector("#boardView"),
  insightsView: document.querySelector("#insightsView"),
  addBtn: document.querySelector("#addBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  importBtn: document.querySelector("#importBtn"),
  importInput: document.querySelector("#importInput"),
  exportDialog: document.querySelector("#exportDialog"),
  exportFeedback: document.querySelector("#exportFeedback"),
  closeExportDialogBtn: document.querySelector("#closeExportDialogBtn"),
  shareExportBtn: document.querySelector("#shareExportBtn"),
  saveExportBtn: document.querySelector("#saveExportBtn"),
  copyExportBtn: document.querySelector("#copyExportBtn"),
  copyImportLinkBtn: document.querySelector("#copyImportLinkBtn"),
  linkImportDialog: document.querySelector("#linkImportDialog"),
  chooseJsonImportBtn: document.querySelector("#chooseJsonImportBtn"),
  importLinkInput: document.querySelector("#importLinkInput"),
  importLinkFeedback: document.querySelector("#importLinkFeedback"),
  confirmLinkImportBtn: document.querySelector("#confirmLinkImportBtn"),
  rejectLinkImportBtn: document.querySelector("#rejectLinkImportBtn"),
  cancelLinkImportBtn: document.querySelector("#cancelLinkImportBtn"),
  mobileBtn: document.querySelector("#mobileBtn"),
  mobileDialog: document.querySelector("#mobileDialog"),
  closeMobileDialogBtn: document.querySelector("#closeMobileDialogBtn"),
  authorContactBtn: document.querySelector("#authorContactBtn"),
  authorDialog: document.querySelector("#authorDialog"),
  closeAuthorDialogBtn: document.querySelector("#closeAuthorDialogBtn"),
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
  importantReminderAtField: document.querySelector("#importantReminderAtField"),
  importantReminderHoursField: document.querySelector("#importantReminderHoursField"),
  importantReminderNoteField: document.querySelector("#importantReminderNoteField"),
  drawerBackdrop: document.querySelector("#drawerBackdrop"),
  detailDrawer: document.querySelector("#detailDrawer"),
  modalBackdrop: document.querySelector("#modalBackdrop"),
  importantReminderDialog: document.querySelector("#importantReminderDialog"),
  closeImportantReminderBtn: document.querySelector("#closeImportantReminderBtn"),
  importantReminderList: document.querySelector("#importantReminderList"),
  reminderHubList: document.querySelector("#reminderHubList"),
  actionConfirmDialog: document.querySelector("#actionConfirmDialog"),
  actionConfirmTitle: document.querySelector("#actionConfirmTitle"),
  actionConfirmMessage: document.querySelector("#actionConfirmMessage"),
  actionCancelBtn: document.querySelector("#actionCancelBtn"),
  actionConfirmBtn: document.querySelector("#actionConfirmBtn"),
  statusDeadlineDialog: document.querySelector("#statusDeadlineDialog"),
  statusDeadlineTitle: document.querySelector("#statusDeadlineTitle"),
  statusDeadlineMessage: document.querySelector("#statusDeadlineMessage"),
  statusDeadlineInput: document.querySelector("#statusDeadlineInput"),
  statusDeadlineNoteInput: document.querySelector("#statusDeadlineNoteInput"),
  statusDeadlineError: document.querySelector("#statusDeadlineError"),
  statusDeadlineCancelBtn: document.querySelector("#statusDeadlineCancelBtn"),
  statusDeadlineConfirmBtn: document.querySelector("#statusDeadlineConfirmBtn"),
  dueStatusDialog: document.querySelector("#dueStatusDialog"),
  dueStatusTitle: document.querySelector("#dueStatusTitle"),
  dueStatusMessage: document.querySelector("#dueStatusMessage"),
  dueStatusCancelBtn: document.querySelector("#dueStatusCancelBtn"),
  appVersionInfo: document.querySelector("#appVersionInfo"),
  toast: document.querySelector("#toast"),
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

function toDateTimeLocalValue(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function localDateTimeToISO(value = "") {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function formatDateTime(value = "") {
  if (!value) return "未设置";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未设置";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function recordCreatedAt(record) {
  if (record?.createdAt) return record.createdAt;
  if (record?.appliedAt) return new Date(`${record.appliedAt}T00:00:00`).toISOString();
  return new Date().toISOString();
}

function durationFromCreated(record, endISO) {
  const start = new Date(recordCreatedAt(record));
  const end = new Date(endISO);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(0, end.getTime() - start.getTime());
}

function formatDuration(ms = 0) {
  const hours = Math.round(ms / 3600000);
  if (hours < 24) return `${hours} 小时`;
  const days = Math.round(hours / 24);
  return `${days} 天`;
}

function reapplySnapshot(record) {
  return {
    company: record.company || "",
    rejectedAt: record.rejectedAt || new Date().toISOString(),
    position: record.position || "",
  };
}

function isReapplyRecord(record) {
  return Boolean(record?.canReapply);
}

function reminderDeadline(record) {
  if (!record?.importantReminderAt || record.importantReminderType === "none") return null;
  const date = new Date(record.importantReminderAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isReminderActive(record, now = new Date()) {
  const deadline = reminderDeadline(record);
  if (!deadline) return false;
  const diff = deadline.getTime() - now.getTime();
  return diff >= 0 && diff <= REMINDER_ALERT_WINDOW_MS;
}

function reminderRemainingText(record, now = new Date()) {
  const deadline = reminderDeadline(record);
  if (!deadline) return "";
  const diff = Math.max(0, deadline.getTime() - now.getTime());
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.ceil((diff % 3600000) / 60000);
  if (hours <= 0) return `${Math.max(1, minutes)} 分钟内`;
  return minutes >= 60 ? `${hours + 1} 小时内` : `${hours} 小时 ${minutes} 分钟内`;
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

function showToast(message = "已完成") {
  if (!els.toast) return;
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  els.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    els.toast.classList.remove("is-visible");
    toastTimer = window.setTimeout(() => els.toast.classList.add("hidden"), 180);
  }, 1600);
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
    if (activeDialog === els.actionConfirmDialog && actionConfirmResolve) {
      actionConfirmResolve(false);
      actionConfirmResolve = null;
    }
    if (activeDialog === els.statusDeadlineDialog && statusDeadlineResolve) {
      statusDeadlineResolve(null);
      statusDeadlineResolve = null;
    }
    if (activeDialog === els.dueStatusDialog && dueStatusResolve) {
      dueStatusResolve(null);
      dueStatusResolve = null;
    }
    closeDialog(activeDialog);
    if (activeDialog === els.recordDialog) {
      editingId = null;
    }
    if (activeDialog === els.linkImportDialog) {
      clearImportTokenFromUrl();
    }
    return true;
  }
  return false;
}

function askActionConfirm({
  title = "确认操作",
  message = "确认继续吗？",
  confirmLabel = "确认",
  cancelLabel = "取消",
  tone = "default",
} = {}) {
  if (actionConfirmResolve) {
    actionConfirmResolve(false);
    actionConfirmResolve = null;
  }
  els.actionConfirmDialog.dataset.tone = tone;
  els.actionConfirmTitle.textContent = title;
  els.actionConfirmMessage.textContent = message;
  els.actionConfirmBtn.innerHTML = `<span data-icon="check"></span>${escapeHTML(confirmLabel)}`;
  els.actionCancelBtn.textContent = cancelLabel;
  openDialog(els.actionConfirmDialog);
  hydrateIcons(els.actionConfirmDialog);
  return new Promise((resolve) => {
    actionConfirmResolve = resolve;
  });
}

function resolveActionConfirm(value) {
  if (!actionConfirmResolve) return;
  actionConfirmResolve(value);
  actionConfirmResolve = null;
  closeDialog(els.actionConfirmDialog);
}

function askStatusDeadline(status, record) {
  if (statusDeadlineResolve) {
    statusDeadlineResolve(null);
    statusDeadlineResolve = null;
  }
  const defaultNote = status === "待测评"
    ? "完成在线测评"
    : status === "待笔试"
      ? "参加笔试"
      : "参加面试";
  els.statusDeadlineTitle.textContent = `设置${status}截止时间`;
  els.statusDeadlineMessage.textContent = `「${record.company || "这条记录"}」将流转到「${status}」，请设置截止时间。截止前 12 小时内打开 App 会强提醒。`;
  els.statusDeadlineInput.value = record.importantReminderAt ? toDateTimeLocalValue(record.importantReminderAt) : "";
  els.statusDeadlineNoteInput.value = record.importantReminderNote || defaultNote;
  els.statusDeadlineError.textContent = "";
  openDialog(els.statusDeadlineDialog);
  hydrateIcons(els.statusDeadlineDialog);
  window.setTimeout(() => els.statusDeadlineInput.focus(), 80);
  return new Promise((resolve) => {
    statusDeadlineResolve = resolve;
  });
}

function resolveStatusDeadline(value) {
  if (!statusDeadlineResolve) return;
  statusDeadlineResolve(value);
  statusDeadlineResolve = null;
  closeDialog(els.statusDeadlineDialog);
}

function confirmStatusDeadline() {
  const deadlineISO = localDateTimeToISO(els.statusDeadlineInput.value);
  if (!deadlineISO) {
    els.statusDeadlineError.textContent = "请先选择截止日期时间。";
    els.statusDeadlineInput.focus();
    return;
  }
  if (new Date(deadlineISO).getTime() <= Date.now()) {
    els.statusDeadlineError.textContent = "截止时间需要晚于当前时间。";
    els.statusDeadlineInput.focus();
    return;
  }
  resolveStatusDeadline({
    deadlineISO,
    note: els.statusDeadlineNoteInput.value.trim(),
  });
}

function askDueCheckStatusChange(record) {
  return askActionConfirm({
    title: "状态是否已变更？",
    message: `你刚检查了「${record.company || "这家公司"}」。这条投递的状态有变化吗？`,
    confirmLabel: "是，选择状态",
    cancelLabel: "否，仅更新检查时间",
    tone: "check",
  });
}

function askDueStatus(record) {
  if (dueStatusResolve) {
    dueStatusResolve(null);
    dueStatusResolve = null;
  }
  els.dueStatusTitle.textContent = "状态变更为";
  els.dueStatusMessage.textContent = `「${record.company || "这家公司"}」现在进入哪个阶段？`;
  openDialog(els.dueStatusDialog);
  hydrateIcons(els.dueStatusDialog);
  return new Promise((resolve) => {
    dueStatusResolve = resolve;
  });
}

function resolveDueStatus(status) {
  if (!dueStatusResolve) return;
  dueStatusResolve(status);
  dueStatusResolve = null;
  closeDialog(els.dueStatusDialog);
}

function calendarReminderTime(deadlineISO) {
  return new Date(new Date(deadlineISO).getTime() - REMINDER_ALERT_WINDOW_MS);
}

function calendarEventPayload(record, status, deadlineISO, note = "") {
  const reminderAt = calendarReminderTime(deadlineISO);
  const endAt = new Date(reminderAt.getTime() + 30 * 60 * 1000);
  const title = `秋招提醒：${record.company || "投递记录"} ${status}`;
  const description = [
    `公司：${record.company || "未填写"}`,
    `岗位：${record.position || "未填写"}`,
    `状态：${status}`,
    `截止时间：${formatDateTime(deadlineISO)}`,
    note ? `备注：${note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return {
    title,
    description,
    location: cityText(record),
    beginTime: reminderAt.getTime(),
    endTime: endAt.getTime(),
  };
}

async function offerCalendarCreation(record, status, deadlineISO, note = "") {
  const shouldCreate = await askActionConfirm({
    title: "创建系统日历提醒？",
    message: `是否在手机系统日历里创建「${record.company || "这条记录"}」的${status}提醒？时间会设为截止前 12 小时。`,
    confirmLabel: "是，创建日历",
    cancelLabel: "否",
    tone: "calendar",
  });
  if (!shouldCreate) return;
  const payload = calendarEventPayload(record, status, deadlineISO, note);
  if (window.AndroidBridge?.createCalendarEvent) {
    window.AndroidBridge.createCalendarEvent(
      payload.title,
      payload.description,
      payload.location,
      String(payload.beginTime),
      String(payload.endTime),
    );
    return;
  }
  showToast("当前网页版无法打开系统日历，请在 APK 中使用");
}

function getFilteredRecords() {
  const query = normalize(els.searchInput.value);
  const source = els.sourceFilter?.value || "all";
  const city = els.cityFilter.value;
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
      (activeMetric === "overdue" && isUpdateOverdue(record)) ||
      (activeMetric === "reapply" && isReapplyRecord(record));
    return statusMatch && sourceMatch && cityMatch && queryMatch && metricMatch;
  });

  return list.sort((a, b) => {
    const overdueDiff = Number(isUpdateOverdue(a)) - Number(isUpdateOverdue(b));
    if (overdueDiff !== 0) return overdueDiff;

    if (!isUpdateOverdue(a) && !isUpdateOverdue(b)) {
      const pinnedDiff = Number(Boolean(b.pinnedAt)) - Number(Boolean(a.pinnedAt));
      if (pinnedDiff !== 0) return pinnedDiff;
      if (a.pinnedAt && b.pinnedAt) return b.pinnedAt.localeCompare(a.pinnedAt);
    }

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
    { id: "all", label: "全部记录", count: allCount, metric: "all" },
    ...STATUSES.map((status) => ({
      ...status,
      count: records.filter((record) => record.status === status.id).length,
      metric: "all",
    })),
    {
      id: "all",
      label: REAPPLY_STATUS.label,
      count: records.filter(isReapplyRecord).length,
      metric: "reapply",
      statusId: REAPPLY_STATUS.id,
    },
    {
      id: "all",
      label: "逾期预警",
      count: records.filter(isUpdateOverdue).length,
      metric: "overdue",
      statusId: "已拒绝",
    },
  ];

  els.statusFilters.innerHTML = buttons
    .map(
      (item) => `
        <button class="filter-chip ${activeStatus === item.id && activeMetric === item.metric ? "active" : ""}" type="button" data-filter-status="${item.id}" data-filter-metric="${item.metric}" ${item.id === "all" ? "" : `data-status="${item.id}"`}>
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
  if (!els.sourceFilter) return;
  const current = els.sourceFilter.value || "all";
  els.sourceFilter.innerHTML = [
    '<option value="all">全部来源</option>',
    ...SOURCE_TYPES.map((source) => `<option value="${source}">${source}</option>`),
  ].join("");
  els.sourceFilter.value = SOURCE_TYPES.includes(current) ? current : "all";
}

function renderCityFilter() {
  const current = els.cityFilter.value || "all";
  els.cityFilter.innerHTML = [
    '<option value="all">全部城市</option>',
    ...CITY_OPTIONS.map((city) => `<option value="${city}">${city}</option>`),
  ].join("");
  els.cityFilter.value = CITY_OPTIONS.includes(current) ? current : "all";
}

function setAccountFeedback(message = "每个账号的数据本地隔离保存。", tone = "info") {
  els.accountFeedback.textContent = message;
  els.accountFeedback.classList.toggle("is-error", tone === "error");
  els.accountFeedback.classList.toggle("is-success", tone === "success");
}

function toggleAccountMenu(forceOpen) {
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : activeModule !== "profile";
  if (shouldOpen) {
    setModule("profile");
  } else {
    setModule("overview");
  }
  els.accountMenuBtn.setAttribute("aria-expanded", String(shouldOpen));
  if (shouldOpen) {
    renderAccountPanel();
    window.setTimeout(() => els.newAccountNameInput.focus({ preventScroll: true }), 80);
  } else {
    pendingSwitchAccountId = "";
    pendingDeleteAccountId = "";
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
          <div class="account-admin-actions">
            <button class="mini-button" type="button" data-reset-password-account="${account.id}">重置密码</button>
            <button class="mini-button danger-mini" type="button" data-admin-delete-account="${account.id}" ${accounts.length <= 1 ? "disabled" : ""}>删除账号</button>
          </div>
        </div>
      `,
    )
    .join("");
  els.accountSecurityHint.textContent = "旧密码不会显示；这里可以重置任意账号密码，也可以删除不再使用的账号。";
}

function resetFiltersForAccount() {
  activeStatus = "all";
  activeMetric = "all";
  overviewListVisible = false;
  els.searchInput.value = "";
  if (els.sourceFilter) els.sourceFilter.value = "all";
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
  window.setTimeout(showImportantReminderDialog, 180);
}

async function createAccount() {
  const normalizedName = els.newAccountNameInput.value.trim();
  const password = els.newAccountPasswordInput.value;
  if (!normalizedName) {
    setAccountFeedback("先给新账号起个名字。", "error");
    els.newAccountNameInput.focus();
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
  if (password) await setAccountPassword(account, password);
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
  toggleAccountMenu(false);
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

function requestDeleteAccount(accountId) {
  if (accounts.length <= 1) {
    setAccountFeedback("至少保留一个账号。", "error");
    return;
  }
  if (!masterPasswordUnlocked) {
    setAccountFeedback("请先输入管理密码进入管理员账户。", "error");
    return;
  }
  const account = accounts.find((item) => item.id === accountId);
  if (!account) return;
  pendingDeleteAccountId = account.id;
  els.deleteAccountConfirmText.textContent = `确认删除「${account.name}」和它的全部记录？`;
  els.deleteAccountConfirm.classList.remove("hidden");
  setAccountFeedback("删除后，这个账号下的投递记录也会一起删除。", "error");
}

function deleteAccount() {
  if (accounts.length <= 1) {
    setAccountFeedback("至少保留一个账号。", "error");
    return;
  }
  const account = accounts.find((item) => item.id === pendingDeleteAccountId);
  if (!account) return;
  localStorage.removeItem(recordsKey(account.id));
  accounts = accounts.filter((item) => item.id !== account.id);
  if (activeAccountId === account.id) {
    activeAccountId = accounts[0].id;
    loadRecords();
    resetFiltersForAccount();
  }
  pendingDeleteAccountId = "";
  saveAccounts();
  setAccountFeedback(`已删除「${account.name}」。`, "success");
  els.deleteAccountConfirm.classList.add("hidden");
  render();
  toggleAccountMenu(true);
}

function renderStats() {
  const stats = [
    { label: "总投递", value: records.length, status: "all", metric: "all" },
    ...STATUSES.map((status) => ({
      label: status.label,
      value: records.filter((record) => record.status === status.id).length,
      status: status.id,
      metric: "all",
    })),
    {
      label: `逾期预警`,
      value: records.filter(isUpdateOverdue).length,
      status: "all",
      metric: "overdue",
    },
    {
      label: "可再次投递",
      value: records.filter(isReapplyRecord).length,
      status: "all",
      metric: "reapply",
    },
  ];

  els.statsGrid.innerHTML = stats
    .map(
      (stat) => `
        <button class="stat-card ${activeStatus === stat.status && activeMetric === stat.metric ? "active" : ""}" type="button" data-stat-status="${stat.status}" data-stat-metric="${stat.metric}">
          <span>${escapeHTML(stat.label)}</span>
          <strong>${stat.value}</strong>
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

function renderReminderHub() {
  if (!els.reminderHubList) return;
  const list = upcomingImportantReminders().slice(0, 10);
  if (!list.length) {
    els.reminderHubList.innerHTML = '<p class="empty-mini">当前没有 12 小时内截止的重要事项。</p>';
    return;
  }
  els.reminderHubList.innerHTML = list
    .map(
      (record) => `
        <button class="reminder-item" type="button" data-reminder-open-id="${record.id}">
          <span class="reminder-time">${escapeHTML(reminderRemainingText(record))}</span>
          <strong>${escapeHTML(record.company)}</strong>
          <em>${escapeHTML(record.status)} · ${escapeHTML(record.position || "未填写岗位")}</em>
          <span>${formatDateTime(record.importantReminderAt)}${record.importantReminderNote ? ` · ${escapeHTML(record.importantReminderNote)}` : ""}</span>
        </button>
      `,
    )
    .join("");
}

function renderBoard(list) {
  const statusColumns = BOARD_STATUSES.map((status) => {
    const columnRecords = list.filter(
      (record) => record.status === status.id && !(status.id === "已拒绝" && isReapplyRecord(record)),
    );
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
  const reapplyRecords = list.filter(isReapplyRecord);
  els.boardView.innerHTML = `
    ${statusColumns}
    <section class="kanban-column" data-status="${REAPPLY_STATUS.id}">
      <div class="column-head">
        <div class="column-title">
          <span class="status-dot"></span>
          ${REAPPLY_STATUS.label}
        </div>
        <span class="count-pill">${reapplyRecords.length}</span>
      </div>
      <div class="column-body">
        ${reapplyRecords.map(reapplyCardHTML).join("") || emptyStateHTML()}
      </div>
    </section>
  `;
}

function reapplyCardHTML(record) {
  const snapshot = record.reapplyRecord || reapplySnapshot(record);
  return `
    <article class="record-card reapply-card" data-card-id="${record.id}" data-status="${REAPPLY_STATUS.id}" data-importance="${normalizeImportance(record)}" data-update-overdue="false" data-pinned="${record.pinnedAt ? "true" : "false"}">
      <div class="record-card-actions" aria-label="记录操作">
        <button class="swipe-action pin-action" type="button" data-pin-id="${record.id}">${record.pinnedAt ? "取消置顶" : "置顶"}</button>
        <button class="swipe-action delete-action" type="button" data-delete-id="${record.id}">删除</button>
      </div>
      <div class="record-card-surface" data-open-id="${record.id}">
        <div class="card-top">
          <div>
            <h3 class="card-title">${escapeHTML(snapshot.company || record.company)}</h3>
            <div class="card-subtitle">${escapeHTML(snapshot.position || "未填写岗位")}</div>
          </div>
          <span class="importance-badge">${stars(normalizeImportance(record))}</span>
        </div>
        <div class="tag-row">
          <span class="tag reapply-tag">可再次投递</span>
          <span class="tag danger">拒绝于 ${formatDateTime(snapshot.rejectedAt)}</span>
        </div>
        <div class="meta-line">上次投递岗位 · ${escapeHTML(snapshot.position || "未填写")}</div>
      </div>
    </article>
  `;
}

function quickStatusButtonsHTML(record, buttonClass = "") {
  const statuses = record.status === "已拒绝"
    ? [
        ...QUICK_FLOW_STATUSES.filter((status) => status.id !== "已拒绝"),
        STATUSES.find((status) => status.id === "待初筛"),
      ].filter(Boolean)
    : QUICK_FLOW_STATUSES;
  const statusButtons = statuses
    .map(
      (status) =>
        `<button ${buttonClass ? `class="${buttonClass}"` : ""} type="button" data-quick-status="${status.id}" data-record-id="${record.id}" ${status.id === record.status ? "disabled" : ""}>${status.label}</button>`,
    )
    .join("");
  const reapplyButton = record.status === "已拒绝" && !record.canReapply
    ? `<button ${buttonClass ? `class="${buttonClass}"` : ""} type="button" data-mark-reapply-id="${record.id}">${REAPPLY_STATUS.label}</button>`
    : "";
  return `${statusButtons}${reapplyButton}`;
}

function recordCardHTML(record, variant = "") {
  const stale = isStale(record);
  const due = isDue(record);
  const updateOverdue = isUpdateOverdue(record);
  const importance = normalizeImportance(record);
  const pinned = Boolean(record.pinnedAt);
  const activeReminder = isReminderActive(record);
  const tags = [
    pinned ? `<span class="tag pin-tag">已置顶</span>` : "",
    `<span class="tag status-badge">${escapeHTML(record.status)}</span>`,
    `<span class="tag city-tag">${escapeHTML(cityText(record))}</span>`,
    `<span class="tag">${escapeHTML(record.sourceType)}</span>`,
    record.importantReminderAt
      ? `<span class="tag ${activeReminder ? "danger" : "reminder-tag"}">重要提醒 · ${formatDateTime(record.importantReminderAt)}</span>`
      : "",
    updateOverdue ? `<span class="tag danger">逾期预警 · ${monthsBetween(record.updatedAt)} 个月未更新</span>` : "",
    stale ? `<span class="tag warn">${daysBetween(record.updatedAt)} 天未更新</span>` : "",
    due ? `<span class="tag warn">今日检查</span>` : "",
  ]
    .filter(Boolean)
    .join("");

  return `
    <article class="record-card ${variant} ${due ? "overdue" : ""} ${updateOverdue ? "update-overdue" : ""}" draggable="true" data-card-id="${record.id}" data-status="${record.status}" data-importance="${importance}" data-update-overdue="${updateOverdue ? "true" : "false"}" data-pinned="${pinned ? "true" : "false"}">
      <div class="record-card-actions" aria-label="记录操作">
        <button class="swipe-action pin-action" type="button" data-pin-id="${record.id}">${pinned ? "取消置顶" : "置顶"}</button>
        <button class="swipe-action delete-action" type="button" data-delete-id="${record.id}">删除</button>
      </div>
      <div class="record-card-surface" data-open-id="${record.id}">
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
          ${quickStatusButtonsHTML(record)}
        </div>
      </div>
    </article>
  `;
}

function renderOverviewList(list) {
  if (!els.overviewResultsPanel || !els.overviewListView) return;
  els.overviewResultsPanel.classList.toggle("hidden", !overviewListVisible);
  if (!overviewListVisible) {
    els.overviewListView.innerHTML = "";
    return;
  }
  if (!list.length) {
    els.overviewListView.innerHTML = emptyStateHTML();
    return;
  }

  els.overviewListView.innerHTML = `
    <div class="record-list-cards">
      ${list.map((record) => recordCardHTML(record, "list-card")).join("")}
    </div>
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
  els.resultMeta.classList.remove("is-warning");
  renderAccountPanel();
  renderStatusFilters();
  renderSourceFilter();
  renderCityFilter();
  renderStats();
  renderDueList();
  renderReminderHub();
  renderBoard(list);
  renderOverviewList(list);
  renderInsights();
  els.resultMeta.textContent = `${account?.name || "当前账号"} · 显示 ${list.length} 条，共 ${records.length} 条`;
  hydrateIcons(document);
}

function renderVersionInfo() {
  if (!els.appVersionInfo) return;
  els.appVersionInfo.textContent = `v${APP_VERSION} · 更新于 ${APP_UPDATED_AT}`;
}

function handleSearchInput() {
  render();
}

function submitSearch() {
  const query = normalize(els.searchInput.value);
  const list = getFilteredRecords();
  if (!query) return;
  overviewListVisible = true;
  setModule("overview");
  render();
  els.resultMeta.classList.remove("is-warning");
  if (!list.length) {
    els.resultMeta.textContent = "当前暂无该信息，可以换个关键词试试。";
    els.resultMeta.classList.add("is-warning");
    els.overviewResultsPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  els.overviewResultsPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setModule(module) {
  activeModule = module;
  const modules = {
    overview: els.overviewPage,
    records: els.recordsPage,
    reminders: els.remindersPage,
    profile: els.profilePage,
  };
  Object.entries(modules).forEach(([key, element]) => {
    if (!element) return;
    element.classList.toggle("hidden", key !== module);
    element.classList.toggle("is-active", key === module);
  });
  document.querySelectorAll("[data-module-nav]").forEach((button) => {
    button.classList.toggle("active", button.dataset.moduleNav === module);
  });
  els.accountMenuBtn?.setAttribute("aria-expanded", String(module === "profile"));
  if (module === "profile") {
    els.insightsView?.classList.remove("hidden");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function revealOverviewList(scroll = false) {
  overviewListVisible = true;
  setModule("overview");
  render();
  if (scroll) {
    els.overviewResultsPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function populateSelects() {
  const statusSelect = els.recordForm.elements.status;
  const sourceSelect = els.recordForm.elements.sourceType;
  const citySelect = els.recordForm.elements.cities;
  populateStatusSelect(statusSelect, CREATE_STATUSES);
  sourceSelect.innerHTML = SOURCE_TYPES.map(
    (source) => `<option value="${source}">${source}</option>`,
  ).join("");
  citySelect.innerHTML = [
    ...CITY_OPTIONS.map((city) => `<option value="${city}">${city}</option>`),
  ].join("");
}

function populateStatusSelect(select, statuses) {
  select.innerHTML = statuses.map(
    (status) => `<option value="${status.id}">${status.label}</option>`,
  ).join("");
}

function openRecordDialog(record = null) {
  editingId = record?.id || null;
  els.formError.textContent = "";
  els.dialogTitle.textContent = record ? "编辑投递记录" : "添加投递记录";
  els.deleteFromFormBtn.classList.toggle("hidden", !record);

  const form = els.recordForm;
  form.reset();
  populateStatusSelect(form.elements.status, record ? STATUSES : CREATE_STATUSES);
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
  form.elements.importantReminderType.value = record
    ? (record.importantReminderAt ? "deadline" : "none")
    : "deadline";
  form.elements.importantReminderAt.value = toDateTimeLocalValue(record?.importantReminderAt || "");
  form.elements.importantReminderHours.value = "";
  form.elements.importantReminderNote.value = record?.importantReminderNote || "";
  form.elements.note.value = record?.note || "";
  updateSourceLabel();
  updateImportantReminderFields();
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

function updateImportantReminderFields() {
  const type = els.recordForm.elements.importantReminderType.value;
  const enabled = type !== "none";
  els.importantReminderAtField.classList.toggle("hidden", type !== "deadline");
  els.importantReminderHoursField.classList.toggle("hidden", type !== "relative");
  els.importantReminderNoteField.classList.toggle("hidden", !enabled);
  if (!enabled) {
    els.recordForm.elements.importantReminderAt.value = "";
    els.recordForm.elements.importantReminderHours.value = "";
    els.recordForm.elements.importantReminderNote.value = "";
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
  const reminderType = data.importantReminderType || "none";
  const relativeHours = Number(data.importantReminderHours || 0);
  const importantReminderAt =
    reminderType === "deadline"
      ? localDateTimeToISO(data.importantReminderAt)
      : reminderType === "relative" && relativeHours > 0
        ? new Date(Date.now() + relativeHours * 3600000).toISOString()
        : "";

  return {
    id: base?.id || uid(),
    company: data.company.trim(),
    position: data.position.trim(),
    cities,
    sourceType: data.sourceType,
    sourceDetail: data.sourceDetail.trim(),
    status: data.status,
    createdAt: base ? recordCreatedAt(base) : new Date().toISOString(),
    appliedAt: data.appliedAt || now,
    updatedAt: data.updatedAt || now,
    nextCheckAt: data.nextCheckAt || "",
    importance: data.importance || normalizeImportance(base),
    pinnedAt: base?.pinnedAt || "",
    importantReminderType: importantReminderAt ? "deadline" : "none",
    importantReminderAt,
    importantReminderNote: importantReminderAt ? (data.importantReminderNote || "").trim() : "",
    assessmentAt: base?.assessmentAt || "",
    assessmentDurationMs: Number(base?.assessmentDurationMs || 0),
    rejectedAt: base?.rejectedAt || "",
    rejectedDurationMs: Number(base?.rejectedDurationMs || 0),
    canReapply: Boolean(base?.canReapply),
    reapplyRecord: base?.reapplyRecord || null,
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

async function applyStatusMetrics(record, status, forceDeadline = false) {
  const clickedAt = new Date().toISOString();
  if (!record.createdAt) {
    record.createdAt = recordCreatedAt(record);
  }
  if (DEADLINE_REQUIRED_STATUSES.has(status)) {
    const deadlineReady = await ensureStatusDeadline(record, status, forceDeadline);
    if (!deadlineReady) return false;
  }
  if (status === "待测评") {
    record.assessmentAt = clickedAt;
    record.assessmentDurationMs = durationFromCreated(record, clickedAt);
  }
  if (status === "已拒绝") {
    record.rejectedAt = clickedAt;
    record.rejectedDurationMs = durationFromCreated(record, clickedAt);
    const canReapply = await askActionConfirm({
      title: "是否加入可再次投递？",
      message: `「${record.company || "这家公司"}」已经标记为已拒绝。后续还能再次投递吗？`,
      confirmLabel: "是，加入",
      cancelLabel: "否，保持已拒绝",
      tone: "reapply",
    });
    record.canReapply = canReapply;
    record.reapplyRecord = canReapply ? reapplySnapshot(record) : null;
    return true;
  }
  record.canReapply = false;
  record.reapplyRecord = null;
  return true;
}

async function ensureStatusDeadline(record, status, force = false) {
  if (!DEADLINE_REQUIRED_STATUSES.has(status)) return true;
  if (!force && record.importantReminderAt) return true;
  const deadline = await askStatusDeadline(status, record);
  if (!deadline) return false;
  record.importantReminderType = "deadline";
  record.importantReminderAt = deadline.deadlineISO;
  record.importantReminderNote = deadline.note || `${status}截止时间`;
  await offerCalendarCreation(record, status, deadline.deadlineISO, record.importantReminderNote);
  return true;
}

function validateRecord(record) {
  if (!record.company) return "公司名称必须填写。";
  const cities = recordCities(record);
  if (!cities.length) return "城市必须至少选择 1 个。";
  if (cities.length > MAX_RECORD_CITIES) return `城市最多选择 ${MAX_RECORD_CITIES} 个。`;
  if (!SOURCE_TYPES.includes(record.sourceType)) return "来源类型必须选择。";
  if (!record.appliedAt || !record.updatedAt) return "投递日期和更新时间必须填写。";
  const reminderType = els.recordForm.elements.importantReminderType.value;
  if (!["none", "deadline", "relative"].includes(reminderType)) return "重要提醒必须选择。";
  if (reminderType === "deadline" && !record.importantReminderAt) return "请选择重要提醒时间。";
  if (reminderType === "relative") {
    const hours = Number(els.recordForm.elements.importantReminderHours.value || 0);
    if (!Number.isFinite(hours) || hours <= 0) return "请填写从现在起多少小时。";
  }
  if (record.sourceType === "自定义") {
    if (!record.sourceDetail) return "自定义来源需要填写网址。";
    try {
      new URL(/^https?:\/\//i.test(record.sourceDetail) ? record.sourceDetail : `https://${record.sourceDetail}`);
    } catch {
      return "来源网址格式不太对。";
    }
  }
  if (DEADLINE_REQUIRED_STATUSES.has(record.status) && !record.importantReminderAt) {
    return `${record.status} 需要设置截止时间。`;
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

async function saveFromForm(event) {
  event.preventDefault();
  const existing = editingId ? records.find((record) => record.id === editingId) : null;
  const next = formToRecord(existing);
  if (DEADLINE_REQUIRED_STATUSES.has(next.status) && !next.importantReminderAt) {
    const deadlineReady = await ensureStatusDeadline(next, next.status, true);
    if (!deadlineReady) return;
  }
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
    if (existing.status !== next.status) {
      const canContinue = await applyStatusMetrics(next, next.status);
      if (!canContinue) return;
    }
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

async function setRecordStatus(record, status, note = "快速切换状态", forceDeadline = true) {
  if (!record) return false;
  if (record.status === status) {
    record.updatedAt = todayISO();
    record.note = note;
    record.history.unshift({
      id: uid(),
      status,
      updatedAt: record.updatedAt,
      note,
    });
    return true;
  }
  const canContinue = await applyStatusMetrics(record, status, forceDeadline);
  if (!canContinue) return false;
  record.status = status;
  record.updatedAt = todayISO();
  record.note = note;
  record.history.unshift({
    id: uid(),
    status,
    updatedAt: record.updatedAt,
    note,
    assessmentAt: status === "待测评" ? record.assessmentAt : "",
    rejectedAt: status === "已拒绝" ? record.rejectedAt : "",
  });
  return true;
}

async function updateRecordStatus(id, status, note = "快速切换状态") {
  const record = records.find((item) => item.id === id);
  const changed = await setRecordStatus(record, status, note, true);
  if (!changed) return false;
  saveRecords();
  render();
  if (selectedId === id) openDrawer(id);
  return true;
}

function markRecordReapply(id) {
  const record = records.find((item) => item.id === id);
  if (!record || record.status !== "已拒绝") return;
  if (!record.rejectedAt) {
    record.rejectedAt = new Date().toISOString();
    record.rejectedDurationMs = durationFromCreated(record, record.rejectedAt);
  }
  record.canReapply = true;
  record.reapplyRecord = reapplySnapshot(record);
  record.history.unshift({
    id: uid(),
    status: REAPPLY_STATUS.id,
    updatedAt: todayISO(),
    note: "标记为可再次投递",
    rejectedAt: record.rejectedAt,
  });
  saveRecords();
  render();
  if (selectedId === id) openDrawer(id);
  showToast("已加入可再次投递");
}

function toggleRecordPin(id) {
  const record = records.find((item) => item.id === id);
  if (!record) return;
  record.pinnedAt = record.pinnedAt ? "" : new Date().toISOString();
  saveRecords();
  render();
  if (selectedId === id) openDrawer(id);
  showToast(record.pinnedAt ? "已置顶" : "已取消置顶");
}

async function markDueChecked(id) {
  const record = records.find((item) => item.id === id);
  if (!record) return;
  const hasStatusChange = await askDueCheckStatusChange(record);
  if (hasStatusChange) {
    const nextStatus = await askDueStatus(record);
    if (!nextStatus) return;
    const changed = await setRecordStatus(record, nextStatus, `已检查，状态变更为${nextStatus}`, true);
    if (!changed) return;
  } else {
    record.updatedAt = todayISO();
    record.note = "已检查，状态未变更";
    record.history.unshift({
      id: uid(),
      status: record.status,
      updatedAt: record.updatedAt,
      note: "已检查，状态未变更",
    });
  }
  record.nextCheckAt = addDaysISO(todayISO(), 7);
  saveRecords();
  render();
  if (selectedId === id) openDrawer(id);
  showToast(hasStatusChange ? "状态已更新" : "已更新检查时间");
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

function closeSwipedCards(exceptCard = null) {
  document.querySelectorAll(".record-card.is-swiped").forEach((card) => {
    if (card === exceptCard) return;
    card.classList.remove("is-swiped");
    card.querySelector(".record-card-surface")?.style.removeProperty("transform");
  });
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
  const assessmentInfo = record.assessmentAt
    ? `${formatDuration(record.assessmentDurationMs)} · ${formatDateTime(record.assessmentAt)}`
    : "未记录";
  const rejectedInfo = record.rejectedAt
    ? `${formatDuration(record.rejectedDurationMs)} · ${formatDateTime(record.rejectedAt)}`
    : "未记录";
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
            ${record.importantReminderAt ? `<span class="tag ${isReminderActive(record) ? "danger" : "reminder-tag"}">重要提醒 · ${formatDateTime(record.importantReminderAt)}</span>` : ""}
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
          <span>推进耗时</span><strong>${assessmentInfo}</strong>
          <span>拒绝耗时</span><strong>${rejectedInfo}</strong>
          <span>可再次投递</span><strong>${record.canReapply ? "是" : "否"}</strong>
          <span>下次检查</span><strong>${formatDate(record.nextCheckAt)}</strong>
          <span>重要提醒</span><strong>${record.importantReminderAt ? `${formatDateTime(record.importantReminderAt)}${record.importantReminderNote ? ` · ${escapeHTML(record.importantReminderNote)}` : ""}` : "无"}</strong>
        </div>
      </section>
      <section class="detail-section">
        <h4>快速操作</h4>
        <div class="quick-actions">
          <button class="primary-button" type="button" data-edit-id="${record.id}">
            <span data-icon="edit"></span>
            编辑
          </button>
          ${quickStatusButtonsHTML(record, "mini-button")}
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
  setExportFeedback("正在连接云端并生成短链接...");
  openDialog(els.exportDialog);
  hydrateIcons(els.exportDialog);
  copyImportLink();
}

function exportJsonText() {
  return JSON.stringify(records, null, 2);
}

function normalizeImportedRecords(input) {
  const list = Array.isArray(input) ? input : Array.isArray(input?.records) ? input.records : null;
  if (!list) throw new Error("Invalid data");
  return list.map((record) => ({
    id: record.id || uid(),
    company: record.company || "",
    position: record.position || "",
    cities: recordCities(record).slice(0, MAX_RECORD_CITIES),
    sourceType: SOURCE_TYPES.includes(record.sourceType) ? record.sourceType : "官网",
    sourceDetail: record.sourceDetail || record.sourceName || record.sourceUrl || "",
    status: STATUSES.some((status) => status.id === record.status) ? record.status : "待初筛",
    createdAt: record.createdAt || new Date(`${record.appliedAt || todayISO()}T00:00:00`).toISOString(),
    appliedAt: record.appliedAt || todayISO(),
    updatedAt: record.updatedAt || todayISO(),
    nextCheckAt: record.nextCheckAt || "",
    importance: normalizeImportance(record),
    pinnedAt: record.pinnedAt || "",
    importantReminderType: record.importantReminderAt ? "deadline" : "none",
    importantReminderAt: record.importantReminderAt || "",
    importantReminderNote: record.importantReminderNote || "",
    assessmentAt: record.assessmentAt || "",
    assessmentDurationMs: Number(record.assessmentDurationMs || 0),
    rejectedAt: record.rejectedAt || "",
    rejectedDurationMs: Number(record.rejectedDurationMs || 0),
    canReapply: Boolean(record.canReapply),
    reapplyRecord: record.reapplyRecord || null,
    note: record.note || "",
    history: Array.isArray(record.history) ? record.history : [],
  }));
}

function applyImportedRecords(nextRecords) {
  records = nextRecords;
  saveRecords();
  render();
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

function bytesToBase64Url(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(index, index + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function gzipText(text) {
  if (!("CompressionStream" in window)) return null;
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzipText(bytes) {
  if (!("DecompressionStream" in window)) throw new Error("Decompression not supported");
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

async function encodeImportToken(payload) {
  const text = JSON.stringify(payload);
  const compressed = await gzipText(text);
  if (compressed) return `gz.${bytesToBase64Url(compressed)}`;
  return `raw.${bytesToBase64Url(new TextEncoder().encode(text))}`;
}

async function decodeImportToken(token) {
  const [format, value] = token.split(".", 2);
  if (!format || !value) throw new Error("Invalid import token");
  const bytes = base64UrlToBytes(value);
  const text = format === "gz" ? await gunzipText(bytes) : new TextDecoder().decode(bytes);
  const payload = JSON.parse(text);
  if (payload?.version && payload.version > LINK_IMPORT_VERSION) throw new Error("Unsupported import version");
  return normalizeImportedRecords(payload);
}

function buildImportPayload() {
  const account = accounts.find((item) => item.id === activeAccountId);
  return {
    version: LINK_IMPORT_VERSION,
    exportedAt: new Date().toISOString(),
    accountName: account?.name || "当前账号",
    records,
  };
}

async function buildImportLinkParts() {
  const baseUrl = window.location.protocol === "file:" ? PUBLIC_IMPORT_BASE_URL : window.location.href;
  const url = new URL(baseUrl);
  url.searchParams.delete("reset");
  url.hash = "";
  const token = await encodeImportToken(buildImportPayload());
  url.hash = `${LINK_IMPORT_PARAM}=${encodeURIComponent(token)}`;
  return { link: url.toString(), token };
}

async function buildImportLink() {
  return (await buildImportLinkParts()).link;
}

async function buildCloudImportLink() {
  const response = await fetchWithTimeout(`${SHARE_API_BASE_URL}/api/share`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildImportPayload()),
  });

  if (!response.ok) throw new Error("Share upload failed");

  const data = await response.json();
  const shareId = data?.id || data?.key || "";
  const candidate = data?.url || data?.shortUrl || (shareId ? `${SHARE_API_BASE_URL}/i/${shareId}` : "");
  if (!candidate) throw new Error("Share url missing");

  const url = new URL(candidate, `${SHARE_API_BASE_URL}/`).toString();
  if (!cloudShareIdFromInput(url)) throw new Error("Share url invalid");
  return url;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = CLOUD_SHARE_TIMEOUT_MS) {
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  let timeoutId = null;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      controller?.abort();
      reject(new Error("Cloud request timed out"));
    }, timeoutMs);
  });

  try {
    const request = fetch(url, controller ? { ...options, signal: controller.signal } : options);
    return await Promise.race([request, timeout]);
  } finally {
    if (timeoutId !== null) window.clearTimeout(timeoutId);
  }
}

function copyText(text) {
  if (window.AndroidBridge?.copyTextSilent) {
    window.AndroidBridge.copyTextSilent(text);
    return Promise.resolve();
  }
  if (window.AndroidBridge?.copyJson) {
    window.AndroidBridge.copyJson(text);
    return Promise.resolve();
  }
  if (navigator.clipboard) return navigator.clipboard.writeText(text);
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  return Promise.resolve();
}

function setExportFeedback(message = "", tone = "info") {
  if (!els.exportFeedback) return;
  els.exportFeedback.textContent = message;
  els.exportFeedback.classList.toggle("is-error", tone === "error");
  els.exportFeedback.classList.toggle("is-success", tone === "success");
}

async function copyImportLink() {
  if (cloudShareRequestPending) return;
  cloudShareRequestPending = true;
  els.copyImportLinkBtn.disabled = true;
  setExportFeedback("正在连接云端并生成短链接...");

  try {
    const link = await buildCloudImportLink();
    await copyText(link);
    setExportFeedback(`云端短链接已生成并复制：${link}`, "success");
    showToast("云端短链接已复制");
  } catch (error) {
    try {
      const { link } = await buildImportLinkParts();
      await copyText(link);
      const reason = error?.message?.includes("timed out") ? "云端连接超时" : "云端服务不可用";
      setExportFeedback(`${reason}，已复制包含数据的本地备份链接。`, "error");
      showToast("云端失败，已复制备份链接");
    } catch {
      setExportFeedback("短链接和备份链接均生成失败，请稍后重试。", "error");
      showToast("复制失败");
    }
  } finally {
    cloudShareRequestPending = false;
    els.copyImportLinkBtn.disabled = false;
  }
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      applyImportedRecords(normalizeImportedRecords(parsed));
      closeLinkImportDialog();
      showToast("已导入");
    } catch {
      setImportLinkFeedback("导入失败，请确认文件是本应用导出的 JSON。", "error");
    } finally {
      els.importInput.value = "";
    }
  };
  reader.readAsText(file);
}

function openImportDialog() {
  els.importLinkInput.value = "";
  setImportLinkFeedback("");
  openDialog(els.linkImportDialog);
  hydrateIcons(els.linkImportDialog);
  window.setTimeout(() => els.importLinkInput.focus({ preventScroll: true }), 80);
}

function setImportLinkFeedback(message = "", tone = "info") {
  els.importLinkFeedback.textContent = message;
  els.importLinkFeedback.classList.toggle("is-error", tone === "error");
  els.importLinkFeedback.classList.toggle("is-success", tone === "success");
}

function clearImportTokenFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete(LINK_IMPORT_PARAM);
  const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
  const hashParams = new URLSearchParams(hash);
  hashParams.delete(LINK_IMPORT_PARAM);
  const nextHash = hashParams.toString();
  url.hash = nextHash ? nextHash : "";
  window.history.replaceState(null, "", url.toString());
}

function closeLinkImportDialog() {
  closeDialog(els.linkImportDialog);
  clearImportTokenFromUrl();
}

function tokenFromImportInput(value = "") {
  const text = value.trim();
  if (!text) return "";
  try {
    const url = new URL(text);
    const hash = url.hash.startsWith("#") ? url.hash.slice(1) : "";
    const hashToken = hash ? new URLSearchParams(hash).get(LINK_IMPORT_PARAM) : "";
    return hashToken || url.searchParams.get(LINK_IMPORT_PARAM) || text;
  } catch {
    const hashStart = text.indexOf("#");
    if (hashStart >= 0) {
      const params = new URLSearchParams(text.slice(hashStart + 1));
      return params.get(LINK_IMPORT_PARAM) || text;
    }
    return text.startsWith(`${LINK_IMPORT_PARAM}=`) ? new URLSearchParams(text).get(LINK_IMPORT_PARAM) || "" : text;
  }
}

function cloudShareIdFromInput(value = "") {
  const text = value.trim();
  if (!text) return "";

  try {
    const url = new URL(text);
    if (url.hostname !== new URL(SHARE_API_BASE_URL).hostname) return "";

    const shareMatch = url.pathname.match(/^\/api\/share\/([A-Za-z0-9]{6,32})$/);
    if (shareMatch) return shareMatch[1];

    const shortMatch = url.pathname.match(/^\/i\/([A-Za-z0-9]{6,32})$/);
    if (shortMatch) return shortMatch[1];
  } catch {
    return "";
  }

  return "";
}

async function importCloudShare(id) {
  const response = await fetchWithTimeout(`${SHARE_API_BASE_URL}/api/share/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error("Share not found");
  const payload = await response.json();
  return normalizeImportedRecords(payload);
}

async function importFromLinkInput() {
  const input = els.importLinkInput.value.trim();
  const shareId = cloudShareIdFromInput(input);
  const token = tokenFromImportInput(input);

  if (!shareId && !token) {
    setImportLinkFeedback("先粘贴导入链接。", "error");
    els.importLinkInput.focus();
    return;
  }

  setImportLinkFeedback("正在导入...", "info");

  try {
    const nextRecords = shareId
      ? await importCloudShare(shareId)
      : await decodeImportToken(decodeURIComponent(token));
    applyImportedRecords(nextRecords);
    closeLinkImportDialog();
    showToast("已导入");
  } catch {
    setImportLinkFeedback("导入链接无效、已过期或网络不可用。", "error");
  }
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

function openAuthorDialog() {
  openDialog(els.authorDialog);
}

function closeAuthorDialog() {
  closeDialog(els.authorDialog);
}

function upcomingImportantReminders() {
  const now = new Date();
  return records
    .filter((record) => record.status !== "已拒绝" && isReminderActive(record, now))
    .sort((a, b) => new Date(a.importantReminderAt) - new Date(b.importantReminderAt));
}

function closeImportantReminderDialog() {
  closeDialog(els.importantReminderDialog);
}

function showImportantReminderDialog() {
  if (els.importantReminderDialog.classList.contains("is-open")) return;
  const list = upcomingImportantReminders();
  if (!list.length) return;
  els.importantReminderList.innerHTML = list
    .map(
      (record) => `
        <button class="reminder-item" type="button" data-reminder-open-id="${record.id}">
          <span class="reminder-time">${escapeHTML(reminderRemainingText(record))}</span>
          <strong>${escapeHTML(record.company)}</strong>
          <em>${escapeHTML(record.status)} · ${escapeHTML(record.position || "未填写岗位")}</em>
          <span>${formatDateTime(record.importantReminderAt)}${record.importantReminderNote ? ` · ${escapeHTML(record.importantReminderNote)}` : ""}</span>
        </button>
      `,
    )
    .join("");
  openDialog(els.importantReminderDialog);
  hydrateIcons(els.importantReminderDialog);
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
  els.confirmDeleteAccountBtn.addEventListener("click", deleteAccount);
  els.cancelDeleteAccountBtn.addEventListener("click", () => {
    pendingDeleteAccountId = "";
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
  els.copyImportLinkBtn.addEventListener("click", copyImportLink);
  els.importBtn.addEventListener("click", openImportDialog);
  els.chooseJsonImportBtn.addEventListener("click", () => els.importInput.click());
  els.confirmLinkImportBtn.addEventListener("click", importFromLinkInput);
  els.rejectLinkImportBtn.addEventListener("click", closeLinkImportDialog);
  els.cancelLinkImportBtn.addEventListener("click", closeLinkImportDialog);
  els.importInput.addEventListener("change", (event) => importData(event.target.files[0]));
  els.mobileBtn.addEventListener("click", openMobileDialog);
  els.closeMobileDialogBtn.addEventListener("click", closeMobileDialog);
  els.authorContactBtn.addEventListener("click", openAuthorDialog);
  els.closeAuthorDialogBtn.addEventListener("click", closeAuthorDialog);
  els.closeImportantReminderBtn.addEventListener("click", closeImportantReminderDialog);
  els.actionCancelBtn.addEventListener("click", () => resolveActionConfirm(false));
  els.actionConfirmBtn.addEventListener("click", () => resolveActionConfirm(true));
  els.statusDeadlineCancelBtn.addEventListener("click", () => resolveStatusDeadline(null));
  els.statusDeadlineConfirmBtn.addEventListener("click", confirmStatusDeadline);
  els.dueStatusCancelBtn.addEventListener("click", () => resolveDueStatus(null));
  els.copyLinkBtn.addEventListener("click", copyShareLink);
  els.nativeShareBtn.addEventListener("click", nativeShareLink);
  els.searchInput.addEventListener("input", handleSearchInput);
  els.searchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    submitSearch();
  });
  els.searchButton.addEventListener("click", submitSearch);
  els.sourceFilter?.addEventListener("change", render);
  els.cityFilter.addEventListener("change", () => revealOverviewList(true));
  els.sortSelect.addEventListener("change", () => revealOverviewList(true));
  els.overdueMonthsInput.addEventListener("change", () => {
    saveOverdueMonthsSetting();
    revealOverviewList(true);
  });
  els.overdueMonthsInput.addEventListener("input", () => {
    if (!els.overdueMonthsInput.value) return;
    saveOverdueMonthsSetting();
    revealOverviewList(false);
  });
  els.recordForm.addEventListener("submit", saveFromForm);
  els.recordForm.elements.sourceType.addEventListener("change", updateSourceLabel);
  els.recordForm.elements.importantReminderType.addEventListener("change", updateImportantReminderFields);
  els.recordForm.elements.cities.addEventListener("change", enforceCitySelectionLimit);
  els.closeDialogBtn.addEventListener("click", closeRecordDialog);
  els.cancelDialogBtn.addEventListener("click", closeRecordDialog);
  els.deleteFromFormBtn.addEventListener("click", () => editingId && deleteRecord(editingId));
  els.drawerBackdrop.addEventListener("click", closeDrawer);
  els.modalBackdrop?.addEventListener("click", closeActiveDialog);

  document.addEventListener("click", async (event) => {
    const moduleTarget = event.target.closest("[data-module-nav]");
    const accountTarget = event.target.closest("[data-switch-account]");
    const confirmSwitchTarget = event.target.closest("[data-confirm-switch]");
    const saveAccountNameTarget = event.target.closest("#saveAccountNameBtn");
    const saveAccountPasswordTarget = event.target.closest("#saveAccountPasswordBtn");
    const resetPasswordTarget = event.target.closest("[data-reset-password-account]");
    const adminDeleteAccountTarget = event.target.closest("[data-admin-delete-account]");
    const setMasterPasswordTarget = event.target.closest("[data-set-master-password]");
    const unlockMasterPasswordTarget = event.target.closest("[data-unlock-master-password]");
    const lockMasterPasswordTarget = event.target.closest("[data-lock-master-password]");
    const openTarget = event.target.closest("[data-open-id]");
    const editTarget = event.target.closest("[data-edit-id]");
    const deleteTarget = event.target.closest("[data-delete-id]");
    const pinTarget = event.target.closest("[data-pin-id]");
    const dueCheckedTarget = event.target.closest("[data-due-checked-id]");
    const quickTarget = event.target.closest("[data-quick-status]");
    const markReapplyTarget = event.target.closest("[data-mark-reapply-id]");
    const filterTarget = event.target.closest("[data-filter-status]");
    const statTarget = event.target.closest("[data-stat-status]");
    const dueStatusTarget = event.target.closest("[data-due-status]");
    const closeTarget = event.target.closest("[data-close-drawer]");
    const reminderOpenTarget = event.target.closest("[data-reminder-open-id]");

    if (moduleTarget) {
      setModule(moduleTarget.dataset.moduleNav);
      return;
    }

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

    if (adminDeleteAccountTarget) {
      requestDeleteAccount(adminDeleteAccountTarget.dataset.adminDeleteAccount);
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

    if (dueStatusTarget) {
      resolveDueStatus(dueStatusTarget.dataset.dueStatus);
      return;
    }

    if (dueCheckedTarget) {
      event.stopPropagation();
      await markDueChecked(dueCheckedTarget.dataset.dueCheckedId);
      return;
    }

    if (quickTarget) {
      event.stopPropagation();
      await updateRecordStatus(
        quickTarget.dataset.recordId,
        quickTarget.dataset.quickStatus,
        "快速切换状态",
      );
      return;
    }

    if (markReapplyTarget) {
      event.stopPropagation();
      markRecordReapply(markReapplyTarget.dataset.markReapplyId);
      return;
    }

    if (filterTarget) {
      activeStatus = filterTarget.dataset.filterStatus;
      activeMetric = filterTarget.dataset.filterMetric || "all";
      revealOverviewList(true);
      return;
    }

    if (statTarget) {
      activeStatus = statTarget.dataset.statStatus;
      activeMetric = statTarget.dataset.statMetric;
      revealOverviewList(true);
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

    if (pinTarget) {
      event.stopPropagation();
      toggleRecordPin(pinTarget.dataset.pinId);
      return;
    }

    if (closeTarget) {
      closeDrawer();
      return;
    }

    if (reminderOpenTarget) {
      closeImportantReminderDialog();
      openDrawer(reminderOpenTarget.dataset.reminderOpenId);
      return;
    }

    if (openTarget) {
      const swipedCard = event.target.closest(".record-card.is-swiped");
      if (swipedCard) {
        closeSwipedCards();
        return;
      }
      openDrawer(openTarget.dataset.openId);
    }
  });

  document.addEventListener("pointerdown", (event) => {
    const surface = event.target.closest(".record-card-surface");
    if (!surface || event.target.closest("button, a, input, textarea, select")) return;
    const card = surface.closest(".record-card");
    if (!card) return;
    swipeState = {
      card,
      surface,
      startX: event.clientX,
      startY: event.clientY,
      deltaX: 0,
      dragging: false,
      pointerId: event.pointerId,
    };
  });

  document.addEventListener("pointermove", (event) => {
    if (!swipeState || event.pointerId !== swipeState.pointerId) return;
    const deltaX = event.clientX - swipeState.startX;
    const deltaY = event.clientY - swipeState.startY;
    if (!swipeState.dragging && Math.abs(deltaX) < 10) return;
    if (!swipeState.dragging && Math.abs(deltaY) > Math.abs(deltaX)) {
      swipeState = null;
      return;
    }
    swipeState.dragging = true;
    swipeState.deltaX = deltaX;
    const offset = Math.max(-132, Math.min(0, deltaX));
    swipeState.card.classList.add("is-swiping");
    swipeState.surface.style.transform = `translateX(${offset}px)`;
    event.preventDefault();
  }, { passive: false });

  document.addEventListener("pointerup", (event) => {
    if (!swipeState || event.pointerId !== swipeState.pointerId) return;
    const { card, surface, deltaX, dragging } = swipeState;
    swipeState = null;
    card.classList.remove("is-swiping");
    if (!dragging) return;
    if (deltaX < -56) {
      closeSwipedCards(card);
      card.classList.add("is-swiped");
      surface.style.transform = "translateX(-132px)";
    } else {
      card.classList.remove("is-swiped");
      surface.style.removeProperty("transform");
    }
  });

  document.addEventListener("pointercancel", () => {
    if (!swipeState) return;
    swipeState.card.classList.remove("is-swiping");
    swipeState.surface.style.removeProperty("transform");
    swipeState = null;
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

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if (document.querySelector(".record-dialog.is-open")) return;
    window.setTimeout(showImportantReminderDialog, 180);
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
  renderVersionInfo();
  render();
  bindEvents();
  setModule(activeModule);
  registerServiceWorker();
  window.setTimeout(showImportantReminderDialog, 260);
}

init();
