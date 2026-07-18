import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const app = readFileSync(new URL("app.js", root), "utf8");
const html = readFileSync(new URL("index.html", root), "utf8");

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
assert(app.includes('const APP_VERSION = "2.2.4"'), "app version should be bumped for this iteration");
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
assert(app.includes('const SHARE_API_BASE_URL = "https://bai-d0g23uiiz96a4f50d-1428838698.ap-shanghai.app.tcloudbase.com/share"'), "cloud share should use Tencent CloudBase HTTP gateway");
assert(!app.includes("workers.dev"), "cloud share should not reference Cloudflare workers");
assert(!html.includes("workers.dev"), "UI examples should not reference Cloudflare workers");
assert(!app.includes("/api/share"), "cloud share should not call old Cloudflare API paths");
assert(app.includes("body: JSON.stringify({ payload: buildImportPayload() })"), "cloud upload should send payload wrapper expected by CloudBase function");
assert(app.includes('shareId ? `${SHARE_API_BASE_URL}?id=${encodeURIComponent(shareId)}` : data?.url || data?.shortUrl || ""'), "cloud upload should prefer canonical CloudBase gateway URL built from id");
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
