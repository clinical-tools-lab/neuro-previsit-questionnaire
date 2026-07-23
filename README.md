# 头晕头痛专病门诊预诊问卷

面向浙江省人民医院神经内科头晕头痛专病门诊的全栈问卷。患者可分步填写症状、生活影响、发作情况与治疗意愿；提交后由服务端生成 V-DAS-6 预诊评估，并将问卷记录持久保存到 Cloudflare D1。

## 本地开发

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

常用命令：

- `npm run build`：生成可部署版本
- `npm test`：构建并验证服务端渲染页面
- `npm run db:generate`：在数据库结构变化后生成迁移

## 数据与安全

- `.openai/hosting.json` 声明 D1 逻辑绑定 `DB`
- `db/schema.ts` 定义问卷记录结构
- `app/api/submissions/route.ts` 校验、评分并保存提交
- `drizzle/` 保存可审查的数据库迁移

当前部署应保持私有，仅用于产品验证。正式用于临床前，需要由医院完成隐私合规、权限、数据留存与医疗文案审核。本问卷结果只用于就诊前信息整理，不构成诊断或治疗建议。
