# 竞赛中心 · CompetitionCenter

计算机科学与技术学院竞赛中心的信息管理与对外协同平台。当前处于**设计阶段**：先定模型与流程，代码尚未开始。

## 为什么做

部门事务以赛事为单位展开：一场比赛从筹备、报名、赛前准备、执行、评审、公示到收尾，会产生大量通知、规则、名单、成绩与媒体物料。这些资料长期散落在群聊、网盘和个人电脑里，换届后无法有效交接。

这个系统要同时服务三件事：

| 主线 | 要解决的问题 |
|---|---|
| 数据管理 | 以赛事为聚合根建立档案，资料可查、可复用、可交接 |
| 内部事务 | 赛事看板、轻量任务、岗位与交接，不靠个人记忆 |
| 对外协同 | 公开门户、报名、咨询接洽，对外信息只有一个来源 |

## 设计原则

1. **赛事为聚合根**：档案、任务、通知、名单、成绩都挂在具体届次上。
2. **档案优先**：流程可以轻，档案必须全；交接靠查询，不靠口口相传。
3. **低负担收集**：收集箱只填最少字段，AI 处理在个人侧完成，人工复核后入档。
4. **内外分离**：公开门户只读已发布的 L1 内容，内部数据默认不公开。
5. **可迁移**：元数据与文件可整体导出，不把部门资料锁进某个平台。

## 当前阶段

P0 设计。本轮产出是 `docs/` 下的模型与需求文档，不是可运行网站。

明确不做：通用 IM、在线评测（OJ）、财务/人事系统、视频平台。

## 文档

| 文档 | 内容 |
|---|---|
| [`docs/00-charter.md`](docs/00-charter.md) | 定位、问题、目标、非目标、成功标准 |
| [`docs/01-roadmap.md`](docs/01-roadmap.md) | P0–P4 阶段与退出条件 |
| [`docs/10-concepts/archive-model.md`](docs/10-concepts/archive-model.md) | 档案模型：卷宗、条目、收集项、交接包 |
| [`docs/10-concepts/competition-lifecycle.md`](docs/10-concepts/competition-lifecycle.md) | 赛事七阶段与各阶段产出物 |
| [`docs/10-concepts/organization-model.md`](docs/10-concepts/organization-model.md) | 四组交叉成员、岗位与权限 |
| [`docs/10-concepts/ai-collaboration.md`](docs/10-concepts/ai-collaboration.md) | 资料收集与 AI 协同边界 |
| [`docs/20-requirements/features.md`](docs/20-requirements/features.md) | 功能清单与 MVP 切割线 |
| [`docs/20-requirements/information-architecture.md`](docs/20-requirements/information-architecture.md) | 公开端/内部端站点地图与权限 |
| [`docs/20-requirements/blueprint/README.md`](docs/20-requirements/blueprint/README.md) | 系统→页面→板块→板块设计→设计逻辑 |
| [`docs/20-requirements/blueprint/wireframes.html`](docs/20-requirements/blueprint/wireframes.html) | 公开端/内部端低保真线框图 |
| [`docs/30-architecture/system-overview.md`](docs/30-architecture/system-overview.md) | 领域模块、数据流与边界 |
| [`docs/50-operations/handover.md`](docs/50-operations/handover.md) | 岗位包、赛事交接包与交接流程 |

## 数据红线

- 真实选手姓名、学号、手机号、成绩、评审细节**不进入本仓库**。
- 原始资料只放本地 `data/raw/`（已被 gitignore），入库前脱敏。
- 对外门户只发布 L1 内容；L3/L4 按赛事授权访问。
- 详见 [`data/README.md`](data/README.md)。

## 仓库说明

本仓库为公开设计仓库，只包含可公开的设计文档。维护者的本地上下文（`.agent/`、`AGENTS.md`）不入库。

## 许可

未设置开源许可证，保留所有权利。是否开放复用待定。
