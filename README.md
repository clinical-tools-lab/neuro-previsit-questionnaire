# 头晕头痛专病门诊预诊问卷

面向浙江省人民医院神经内科头晕头痛专病门诊的全栈问卷。患者可分步填写症状、生活影响、发作情况与治疗意愿；提交后由服务端生成 V-DAS-6 预诊评估，并将问卷记录持久保存到 Supabase PostgreSQL。

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
2. 在 SQL Editor 运行 `supabase/migrations/001_create_questionnaire_submissions.sql`。
3. 将 `.env.example` 复制为 `.env.local`，填写项目 URL 和服务器 Secret Key。
4. 在生产托管平台设置相同的服务器环境变量。

`SUPABASE_SECRET_KEY` 只能用于服务端，不得放入 `NEXT_PUBLIC_*` 或提交到 Git。

## 数据与安全

- `supabase/migrations/` 保存可审查的数据库迁移
- `lib/supabase-admin.ts` 创建仅服务端使用的管理客户端
- `app/api/submissions/route.ts` 校验、评分并保存提交
- 数据表启用 RLS，不给匿名或普通登录用户开放直接读写权限

当前版本仅用于产品验证。正式用于临床前，需要由医院完成隐私合规、权限、数据留存与医疗文案审核。本问卷结果只用于就诊前信息整理，不构成诊断或治疗建议。
