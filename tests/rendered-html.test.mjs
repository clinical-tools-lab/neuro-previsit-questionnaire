import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("defines the neurology pre-visit questionnaire experience", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /头晕头痛专病门诊 · 预诊问卷/);
  assert.match(page, /浙江省人民医院/);
  assert.match(page, /基本信息/);
  assert.match(page, /预计用时约 3 分钟/);
  assert.match(page, /信息将加密提交/);
  assert.match(page, /fetch\("\/api\/submissions"/);
  assert.doesNotMatch(page + layout, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("declares the database-backed submission surface", async () => {
  const [hosting, route, schema] = await Promise.all([
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../app/api/submissions/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
  ]);

  assert.match(hosting, /"d1": "DB"/);
  assert.match(route, /questionnaireSubmissions/);
  assert.match(schema, /questionnaire_submissions/);
  await access(new URL("../drizzle/0000_small_fantastic_four.sql", import.meta.url));
});
