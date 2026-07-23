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

test("declares the Supabase-backed submission surface", async () => {
  const [environment, route, client, migration] = await Promise.all([
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
    readFile(new URL("../app/api/submissions/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/supabase-admin.ts", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/001_create_questionnaire_submissions.sql", import.meta.url), "utf8"),
  ]);

  assert.match(environment, /SUPABASE_SECRET_KEY/);
  assert.match(route, /getSupabaseAdmin/);
  assert.match(client, /createClient/);
  assert.match(migration, /enable row level security/);
  await access(new URL("../supabase/migrations/001_create_questionnaire_submissions.sql", import.meta.url));
});
