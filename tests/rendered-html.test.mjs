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
  assert.match(page, /rest\/v1\/rpc\/submit_questionnaire/);
  assert.doesNotMatch(page + layout, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("declares the GitHub Pages and Supabase RPC submission surface", async () => {
  const [environment, config, workflow, migration, rpc] = await Promise.all([
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/001_create_questionnaire_submissions.sql", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/002_submit_questionnaire_rpc.sql", import.meta.url), "utf8"),
  ]);

  assert.match(environment, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  assert.match(config, /output: "export"/);
  assert.match(config, /neuro-previsit-questionnaire/);
  assert.match(workflow, /actions\/deploy-pages/);
  assert.match(migration, /enable row level security/);
  assert.match(rpc, /security definer/);
  assert.match(rpc, /grant execute.*anon/);
  await access(new URL("../supabase/migrations/001_create_questionnaire_submissions.sql", import.meta.url));
  await access(new URL("../supabase/migrations/002_submit_questionnaire_rpc.sql", import.meta.url));
});
