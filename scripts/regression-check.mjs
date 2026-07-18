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

if (!process.exitCode) {
  console.log("regression-check passed");
}
