import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const app = readFileSync(new URL("app.js", root), "utf8");
const html = readFileSync(new URL("index.html", root), "utf8");
const cloudbaseFunction = readFileSync(new URL("cloudbase/share/index.js", root), "utf8");

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  }
}

assert(html.includes('id="overviewListView"'), "overview module should contain the flat list result container");
assert(!html.includes('data-view="table"'), "records module should not expose a list/table tab");
assert(app.includes("function renderOverviewList"), "app should render the list inside overview");
assert(app.includes("askDueCheckStatusChange"), "due check should ask whether status changed");
assert(app.includes("data-due-status"), "due check dialog should offer target statuses");
assert(!/if \(filterTarget\)[\s\S]{0,400}setModule\("records"\)/.test(app), "status filter should stay in overview");
assert(!/els\.sortSelect\.addEventListener\("change", render\)/.test(app), "sort changes should render overview results directly");
assert(app.includes('const APP_VERSION = "2.2.8"'), "app version should be bumped for this iteration");
assert(app.includes("function recordsFromRawImportInput"), "link import should support pasted raw JSON data");
assert(app.includes("const rawRecords = recordsFromRawImportInput(input)"), "link import should try raw/original data before import tokens");
assert(html.includes("原始长链接 / 原始 JSON"), "import UI should explicitly mention original long links and raw JSON");
assert(app.includes("const AUTO_BACKUP_INTERVAL_MS = 12 * 60 * 60 * 1000"), "auto backup should run after 12 hours");
assert(app.includes("const MAX_CLOUD_BACKUPS = 30"), "cloud backup history should keep the latest 30 entries");
assert(html.includes('id="cloudBackupPanel"'), "profile should include cloud backup center");
assert(html.includes('id="backupNowBtn"'), "cloud backup center should include manual backup button");
assert(html.includes('id="cloudBackupList"'), "cloud backup center should show backup history");
assert(app.includes("scheduleAutoCloudBackupCheck()"), "app should schedule automatic cloud backup on startup");
assert(app.includes("async function runCloudBackup"), "app should implement cloud backup runner");
assert(app.includes("function renderCloudBackupPanel"), "app should render cloud backup center");
assert(app.includes("async function restoreCloudBackup"), "app should support restoring a cloud backup");
assert(app.includes("saveCloudBackups(nextBackups.slice(0, MAX_CLOUD_BACKUPS))"), "backup history should be trimmed to 30");
assert(!html.includes("云同步码"), "cloud sync code UI should be removed");
assert(!html.includes('id="newAccountSyncCodeInput"'), "login form should not collect a separate cloud sync code");
assert(!html.includes('id="currentSyncCodeInput"'), "cloud backup center should not collect a separate cloud sync code");
assert(!html.includes('id="enableCloudSyncBtn"'), "cloud sync should be enabled by account password, not a separate enable button");
assert(html.includes('id="checkCloudSyncBtn"'), "cloud backup center should include cloud sync check button");
assert(html.includes("登录账号"), "account creator should be renamed to account login");
assert(app.includes('name: "本地游客"'), "default account should be local guest");
assert(app.includes("const CLOUD_SYNC_SETTINGS_PREFIX"), "app should store per-account cloud sync settings");
assert(app.includes("async function buildCloudSyncKey"), "app should derive a sync key from account name and account password");
assert(app.includes("async function loginAccount"), "app should use login semantics for cloud accounts");
assert(app.includes("await activateCloudSyncWithPassword(account, password)"), "login should derive cloud sync identity from the account password");
assert(app.includes('setAccountFeedback("云端暂无数据。现在开始秋招吧！"'), "login should tell the user when cloud has no backup");
assert(!app.includes("baishenhua"), "cloud sync code must not be hard-coded in the app");
assert(app.includes('action: "sync-put"'), "automatic backups should publish latest backup to the account sync index");
assert(app.includes('action: "sync-get"'), "new devices should be able to query the account sync index");
assert(app.includes("checkAndOfferCloudSyncRestore"), "app should offer restore when a cloud sync backup exists");
assert(cloudbaseFunction.includes('action === "sync-put"'), "CloudBase function should support sync-put");
assert(cloudbaseFunction.includes('action === "sync-get"'), "CloudBase function should support sync-get");
assert(cloudbaseFunction.includes("latestShareId"), "CloudBase function should store the latest share id for a sync key");
assert(cloudbaseFunction.includes("lookupKey"), "CloudBase function should query by lookupKey instead of relying on custom document ids");
assert(app.includes('const SHARE_API_BASE_URL = "https://bai-d0g23uiiz96a4f50d-1428838698.ap-shanghai.app.tcloudbase.com/share"'), "cloud share should use Tencent CloudBase HTTP gateway");
assert(!app.includes("workers.dev"), "cloud share should not reference Cloudflare workers");
assert(!html.includes("workers.dev"), "UI examples should not reference Cloudflare workers");
assert(!app.includes("/api/share"), "cloud share should not call old Cloudflare API paths");
assert(app.includes("body: JSON.stringify({ payload: buildImportPayload() })"), "cloud upload should send payload wrapper expected by CloudBase function");
assert(app.includes('shareId ? `${SHARE_API_BASE_URL}?id=${encodeURIComponent(shareId)}` : data?.url || data?.shortUrl || ""'), "cloud upload should prefer canonical CloudBase gateway URL built from id");
assert(app.includes("await verifyCloudShareId(shareId)"), "cloud upload should verify the generated share id can be read before copying it");
assert(app.includes('`${SHARE_API_BASE_URL}?id=${encodeURIComponent(id)}`'), "cloud import should fetch CloudBase id query URL");
assert(app.includes("const importPayload = data?.payload || data?.data || data"), "cloud import should unwrap CloudBase payload responses");
assert(app.includes("function formatLocalDateISO(date)"), "date defaults should use local calendar dates instead of UTC slices");
assert(!app.includes("return new Date().toISOString().slice(0, 10);"), "todayISO should not use UTC date slices");
assert(app.includes('const CITY_OPTIONS = [\n  "全国任意城市",\n  "杭州",\n  "北京",\n  "深圳",\n  "广州",\n  "上海"'), "city options should start with nationwide, fixed top three, then remaining first-tier cities");
assert(!html.includes('name="sourceType"'), "record form should no longer collect source type");
assert(!html.includes('id="sourceDetailField"'), "record form should no longer collect source detail");
assert(!html.includes("来源类型"), "record form should not show source type copy");
assert(!app.includes("<h3>来源分布</h3>"), "profile insights should not show source distribution after source collection is removed");
assert(app.includes('sourceType: record.sourceType || "官网"'), "normalized legacy records should keep a default source type internally");
assert(app.includes("nextCheckAt: data.nextCheckAt || addDaysISO(now, 7)"), "new records should default next check to 7 days after creation");
assert(app.includes("const selectedCities = record ? recordCities(record).slice(0, MAX_RECORD_CITIES) : []"), "new record dialog should not call recordCities(null)");
assert(!html.includes("当前账号概览"), "profile should not duplicate the account overview stats card");
assert(!html.includes("账号统计"), "profile should not show the account stats section");

if (!process.exitCode) {
  console.log("regression-check passed");
}
