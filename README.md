# 头晕头痛专病门诊预诊问卷

面向浙江省人民医院神经内科头晕头痛专病门诊的问卷原型。患者可分步填写症状、生活影响、发作情况与治疗意愿；提交后由 Supabase PostgreSQL RPC 在服务端校验、生成 V-DAS-6 预诊评估并持久保存记录。

> 非浙江省人民医院官方项目，仅用于产品原型开发与测试。

## 本地开发

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

常用命令：

- `npm run build`：生成可部署版本
- `npm test`：构建并验证服务端渲染页面

## Supabase 配置

1. 在 Supabase 创建项目，优先选择 Singapore 区域。
2. 在 SQL Editor 依次运行 `supabase/migrations/001_create_questionnaire_submissions.sql` 和 `002_submit_questionnaire_rpc.sql`。
3. 将 `.env.example` 复制为 `.env.local`，填写项目 URL 和公开的 anon key。
4. 在 GitHub 仓库 Variables 中设置 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`。

anon key 会随静态前端公开；数据访问由 RLS 和仅允许执行的 RPC 控制。Service Role Key 不得放入前端、GitHub Variables 或提交到 Git。

## 数据与安全

- `supabase/migrations/` 保存可审查的数据库迁移
- `002_submit_questionnaire_rpc.sql` 定义仅允许匿名执行的受控提交函数
- `.github/workflows/deploy-pages.yml` 构建并发布静态站点
- 数据表启用 RLS，不给匿名或普通登录用户开放直接读写权限

当前版本仅用于产品验证。正式用于临床前，需要由医院完成隐私合规、权限、数据留存与医疗文案审核。本问卷结果只用于就诊前信息整理，不构成诊断或治疗建议。
