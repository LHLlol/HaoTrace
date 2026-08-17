# HaoTrace · 浩迹

发布网站https://lhllol.github.io/HaoTrace/

HaoTrace 是一个本地优先的聊天记忆检索网页。它不要求用户准确记得原话，而是允许用户用“我记得她以前好像说过……”这样的模糊描述，找回相关的对话片段。

项目当前使用浏览器端加载的本地对话数据，并通过概念词、关键词、上下文和时间信息进行确定性的相关性排序。

## 功能

- 黑色彩点交互背景和居中的记忆搜索入口
- 支持模糊中文描述、关键词和时间条件的本地搜索
- 概念词映射，例如“猫咪”会关联到“宠物”，“熬夜”会关联到“睡眠”
- 搜索结果展示命中消息前后的上下文、相关度、标签和所属对话
- 按年份筛选结果，并支持在当前浏览器中保存最近搜索
- 对话详情页：查看完整片段、参与者、消息数量和主题
- 时间线页：按年份浏览所有对话片段
- 支持导入符合固定格式的聊天记录文本
- 支持 `prefers-reduced-motion`，并提供可访问的搜索表单和跳过链接
- 使用当前网页设计制作的 `512 × 512` 图标作为 favicon 和移动端主屏图标

## 技术栈

- React 18 + TypeScript
- Vite 6
- React Router
- Framer Motion
- Lucide React
- `border-beam`
- ZCOOL KuaiLe：中文标题字体
- Fredoka：英文标题字体
- GitHub Pages + GitHub Actions 部署

## 快速开始

环境要求：Node.js 18+，推荐使用 Node.js 20。

```bash
npm install
npm run dev
```

启动后打开终端输出的本地地址，通常是 `http://localhost:5173/`。

常用命令：

```bash
# 类型检查
npm run lint

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 页面路由

| 路由 | 说明 |
| --- | --- |
| `/` | 首页和记忆搜索入口 |
| `/search?q=...` | 搜索结果页，`q` 是搜索内容 |
| `/timeline` | 按年份浏览对话片段 |
| `/conversation/:conversationId?message=...` | 查看单个对话片段，并定位到指定消息 |

项目使用 `BrowserRouter`。GitHub Pages 部署流程会把 `dist/index.html` 复制为 `dist/404.html`，以支持直接访问子路由。

## 数据与搜索逻辑

### 数据加载

默认数据位于：

```text
public/data/haotrace-conversations.json
```

当前数据文件包含 248 个对话片段和 181,315 条消息，浏览器会在运行时从静态 JSON 文件加载它。数据加载失败时，应用会回退到 `src/lib/data/mockConversationRepository.ts` 中的演示数据。

对话数据的核心结构包括：

```ts
interface Conversation {
  id: string
  title?: string
  participants: string[]
  messages: Message[]
  startTime: string
  endTime: string
  coverTone?: 'coral' | 'blue' | 'mint' | 'yellow' | 'pink'
  topics?: string[]
}
```

### 搜索排序

搜索实现位于 `src/lib/search/mockSemanticSearch.ts`，目前不是远程向量数据库或 AI embedding，而是浏览器端的可解释排序：

1. 标准化查询文本，提取概念词、中文片段和年份/月份。
2. 对消息内容、发送者、标签、主题和情绪建立搜索索引。
3. 对每条主要说话者消息计算四类分数：概念相关度、关键词命中、上下文命中和时间匹配。
4. 按加权结果排序，并按对话去重，默认返回最多 8 个结果。

当前加权比例为：

```text
semantic  55%
keyword   20%
context   15%
time      10%
```

主要说话者目前配置为 `王木木`，位于 `src/lib/search/index.ts`。如果要更换数据来源或检索对象，需要同步调整这里的配置和数据格式。

## 导入聊天记录

项目提供 `scripts/import-chat.mjs`，可以把固定格式的聊天记录文本转换为应用可读取的 JSON：

```bash
npm run import:chat -- "/absolute/path/to/chat.txt"
```

也可以指定输出路径：

```bash
npm run import:chat -- \
  "/absolute/path/to/chat.txt" \
  "public/data/haotrace-conversations.json"
```

输入文本需要使用以下消息头格式：

```text
2026-08-16 18:32:16 '王木木'
消息内容

2026-08-16 18:32:29 '我'
另一条消息
```

脚本会：

- 解析时间、发送者和多行消息内容
- 将时间间隔达到 6 小时的消息切分为不同对话片段
- 自动生成对话 ID、参与者、起止时间和颜色主题
- 将结果写入 `public/data/haotrace-conversations.json`

注意：`public/` 下的文件会作为静态资源直接提供给浏览器。如果数据包含私人聊天内容，请不要在未确认访问范围的情况下把项目部署到公开站点或提交到公开仓库。

## 目录结构

```text
.
├── public/
│   ├── assets/memory-landscape.png       # 记忆景观插图
│   ├── data/haotrace-conversations.json  # 导入后的本地对话数据
│   └── haotrace-icon.png                 # favicon / 移动端图标
├── scripts/
│   └── import-chat.mjs                   # 聊天记录导入脚本
├── src/
│   ├── components/                       # 搜索框、结果卡片、上下文、时间线组件
│   ├── components/ui/                    # 彩点背景和 BorderBeam 封装
│   ├── lib/data/                         # 对话仓储和本地数据加载
│   ├── lib/search/                       # 查询解析、索引和排序
│   ├── pages/                            # 首页、搜索、详情和时间线页面
│   ├── types/                            # Conversation、Message、SearchResult 类型
│   ├── App.tsx                           # 路由、页面框架和站点导航
│   ├── main.tsx                          # React 入口和字体加载
│   └── styles.css                        # 全局视觉样式和响应式规则
├── index.html                            # 页面元信息和图标配置
├── design-qa.md                          # 设计验收记录
├── vite.config.ts                        # Vite 与 GitHub Pages 配置
└── package.json                          # 依赖和脚本
```

## 视觉设计

首页采用全屏黑色背景和彩色圆点阵列，鼠标移动时圆点会产生排斥效果。中文标题使用 ZCOOL KuaiLe，英文标题使用 Fredoka，搜索框使用 BorderBeam 彩色边框和暗色玻璃质感。

非首页页面延续纸张感、细分隔线、手账式信息层级和记忆景观插图。动画由 Framer Motion 驱动，并在用户启用减少动态效果时自动降低或关闭。

图标文件 `public/haotrace-icon.png` 是从当前首页实际渲染画面中截取“浩迹 HaoTrace”字样后合成的黑底彩点图标，并通过 `index.html` 配置为：

- `icon`
- `shortcut icon`
- `apple-touch-icon`

## 部署

推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动：

1. 使用 Node.js 20 安装依赖
2. 执行 `npm ci` 和 `npm run build`
3. 创建 GitHub Pages 所需的 SPA fallback
4. 发布 `dist/` 目录

GitHub Pages 的项目基础路径由 `GITHUB_ACTIONS` 环境变量控制：本地开发使用 `/`，GitHub Actions 构建时使用 `/HaoTrace/`。

## 校验

提交修改前建议执行：

```bash
npm run lint
npm run build
```

设计验收记录和截图见：

- [`design-qa.md`](./design-qa.md)
- [`design-qa-preview.png`](./design-qa-preview.png)
