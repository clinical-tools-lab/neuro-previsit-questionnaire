# 头晕头痛专病门诊 · 预诊问卷

浙江省人民医院神经内科预诊评估工具，供患者在头晕头痛专病门诊就诊前填写，辅助医生进行病情分级与诊后套餐推荐。

## 技术栈

| 类别 | 技术 |
|---|---|
| 框架 | Next.js 16 (React 19) · TypeScript · Tailwind CSS 4 |
| 输出 | 静态导出 → GitHub Pages |
| 后端 | Supabase PostgreSQL · PL/pgSQL RPC |
| 二维码 | `qrcode` 客户端生成 |

## 快速开始

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # 静态导出到 out/
npm test          # Node.js 原生测试
```

## 环境变量

复制 `.env.example` → `.env.local`，填入 Supabase 项目凭证：

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 部署

推送到 `main` 分支后，GitHub Actions 自动构建并部署到 GitHub Pages。

### Supabase 迁移

首次部署需在 Supabase SQL Editor 中执行迁移文件：

```
supabase/migrations/003_reset_full_schema.sql
```

此文件会重建数据表和 RPC 函数。

## 问卷结构

共 8 步（基本信息 + 7 道题）：

1. **基本信息** — 姓名、性别、年龄、就诊类型、病程
2. **症状评估** — 9 项症状多选 + 其他
3. **生活影响** — 4 级单选
4. **发作频率** — 5 级单选
5. **合并症** — 7 项多选
6. **特殊人群** — 8 项多选
7. **治疗方式** — 药物/非药物单选
8. **复诊方式** — 3 选 1

## 推荐引擎

提交后根据 **R1-R7**（影响×频率）、**U1-U8**（升级规则）、**D1-D3**（降级规则）自动匹配三档套餐：

| 套餐 | 名称 | 价格 |
|---|---|---|
| 套餐一 | 互联网专病团队咨询 | 25元/次 |
| 套餐二 | 生活调理包 | 150元/30天 / 390元/90天 |
| 套餐三 | 专病管理包 | 500元/30天 |

## 项目结构

```
app/
├── page.tsx          # 主页（问卷 + 结果）
├── preview/page.tsx  # 三类套餐预览对比
├── layout.tsx        # 布局 + SEO 元数据
└── globals.css       # 全局样式
lib/
└── recommendation.ts # 推荐引擎（类型 + 规则）
supabase/migrations/  # 数据库迁移
tests/                # 测试
```

## 预览

`/preview` 页面展示三种推荐结果并排对比，用于设计审查。
