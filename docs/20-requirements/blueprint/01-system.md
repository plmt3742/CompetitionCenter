# 系统层设计

> 本目录按「系统 → 页面 → 功能板块 → 板块设计 → 设计逻辑」展开。
> 本文是第 1 层：系统是什么、由什么组成、边界在哪、哪些规则全局生效。

## 1. 一句话

竞赛中心的信息管理与对外协同系统：以**卷宗**为聚合根，把赛事届次、档案、收集、事务、岗位与对外接洽放进同一套可查询、可交接、可导出的结构里。

## 2. 三条主线

| 主线 | 主要使用者 | 系统承诺 |
|---|---|---|
| 数据管理 | 赛事负责人、档案管理员、全体成员 | 资料有唯一归属、版本、密级与来源；缺什么一眼可见 |
| 内部事务 | 中心/组负责人、全体成员 | 谁负责、到哪一步、还差什么，不靠个人记忆 |
| 对外协同 | 宣传、外联、选手、合作方 | 对外只有一个信息源；报名与咨询有入口、有记录 |

## 3. 系统边界

| 做 | 不做 |
|---|---|
| 赛事届次与运营事项的卷宗 | 通用 IM、论坛、视频平台 |
| 档案条目、版本、密级、完整性 | 在线评测与判题（OJ） |
| 低负担收集与人工复核入档 | 系统内自动 AI 整理 |
| 轻量任务、通知、日历、接洽台账 | 财务/报销、人事/考勤、绩效 |
| 公开门户与发布状态 | 通用 CMS 与页面搭建器 |
| 岗位包与赛事交接包 | 多租户 SaaS |

外部系统只做对接：学院 SSO、邮件/公众号、OJ/评测机、报名表单、对象存储。对接失败不能阻塞核心档案流程。

## 4. 核心对象

| 对象 | 作用 | 关键字段 | 生命周期 |
|---|---|---|---|
| Case 卷宗 | 聚合根，赛事届次或运营事项 | type、year、edition、status、owner | draft → active → closing → archived |
| Phase 阶段 | 卷宗内的时间段与责任段 | key、order、status、owner | pending → in_progress → done/skipped |
| ChecklistRequirement | 某阶段必须有的条目 | item_type、required、owner_role | 随模板快照生成 |
| ArchiveItem 档案条目 | 正式归档内容 | type、classification、status、version | draft → in_review → active → superseded/archived |
| ItemVersion | 条目的历史版本 | version、supersedes、change_note | 追加，不覆盖 |
| FileObject | 文件与校验和 | filename、checksum、storage_key | 随条目版本 |
| IntakeItem 收集项 | 未正式归档的原始资料 | title、source、classification、status | captured → triaged → processing → ready → archived/rejected |
| Task 任务 | 轻量事务 | assignee、due、status、case_id | todo → doing → done/cancelled |
| Position 岗位 | 长期职责与交接包载体 | scope、duties、permissions | 长期存在 |
| Assignment 任职 | 某人在某任期担任岗位 | person、position、term、event | active → ended/transferred |
| Publication 发布记录 | 对外发布的状态与渠道 | item_id、channel、published_at | published → unpublished |
| OutreachRecord 接洽 | 合作方/评委/赞助商沟通 | org、stage、owner、next_at | new → … → closed |
| HandoverPackage 交接包 | 岗位/赛事交接快照 | scope、snapshot、signoff | draft → review → signed → archived |
| AuditEvent 审计 | 谁在何时改了什么 | actor、action、object、diff | 追加，永久/按保留期 |
| Template 模板 | 卷宗结构与清单的版本 | case_type、version、status | draft → published → deprecated |
| Dictionary 字典 | 可配置的类型/标签/选项 | key、value、version | 版本化 |

## 5. 对象关系

```text
Template 1─N Case 1─N Phase 1─N ChecklistRequirement
Case 1─N ArchiveItem 1─N ItemVersion 1─N FileObject
IntakeItem N─1 Case；IntakeItem N─N ArchiveItem（产出）
Case 1─N Task
Position 1─N Assignment N─1 Person
Case/Position 1─N HandoverPackage
ArchiveItem 1─N Publication
Case 1─N OutreachRecord
全部写操作 ─→ AuditEvent
```

## 6. 全局规则

### 6.1 稳定标识

- 所有对象用不可变 ID（UUID/ULID）；名称、slug、目录可改，引用永远按 ID。
- slug 发布后不改；改名走重定向或新 slug + 旧 slug 保留。
- 删除是软删除；物理删除只用于保留期结束且无审计要求的数据。

### 6.2 模板快照

- 模板本身版本化；卷宗创建时记录 `template_version_id`，并快照阶段与清单。
- 模板后续升级**不自动改写**已有卷宗；需要时由负责人预览后手动升级。
- 克隆只复制结构与空白表单，默认不复制 L3/L4 数据。

### 6.3 状态机

- 状态不允许直接编辑，只能通过动作迁移；每次迁移记录操作人、时间、原因。
- 已发布条目不可改内容，只能新建版本；旧版本标 `superseded`。
- 归档后的卷宗只读；重新开启需要管理员操作与原因。

### 6.4 权限与密级

- 权限 = 角色 × 范围（全局/组/赛事）× 动作 × 密级；默认拒绝。
- 密级 L1–L4 优先于角色：有模块权限也不等于能看 L3/L4。
- 临时授权带到期时间；评委/合作方只读或限定动作。
- 所有查询在数据层过滤密级，不做“先查再隐藏”。

### 6.5 审计

- 写操作、发布、下架、权限变更、导出、删除、越权尝试都记审计。
- 审计只追加，不修改；记录 before/after 摘要与关联 ID。
- 审计对管理员可见；L3/L4 审计本身也按密级保护。

### 6.6 搜索

- 先做结构化筛选，再做全文；索引字段：标题、摘要、标签、卷宗、负责人、类型、年份。
- 搜索在查询层按密级过滤，避免分页泄露。
- 公开端只索引 L1 已发布内容；内部端按授权索引。

### 6.7 导入与导出

- 导出必须包含：schema 版本、对象 JSON/CSV、文件 manifest（路径、校验和、密级）。
- 导入先 dry-run：字段映射、错误行、重复项；按批次 ID 可回滚。
- 去重优先用自然键 + 文件校验和；不靠文件名。

### 6.8 时间与届次

- 时间统一 Asia/Shanghai；截止日期按“当天 23:59”处理。
- 用学年/自然年 + 届次表达周期；不要把年份硬编码进业务规则。
- 保留期从卷宗归档日或赛事结束日起算。

### 6.9 失败与空状态

每个页面必须设计：加载、空、错误、无权限、已归档、并发冲突六种状态。空状态要给下一步动作，错误要可重试，无权限要给申请路径。

## 7. 可复用原则

1. **配置优于硬编码**：组名、条目类型、阶段、标签、保留规则都进字典。
2. **模板版本化**：模板是数据，不是代码；变更不影响历史。
3. **实例快照**：卷宗保存创建时的模板版本，历史可解释。
4. **稳定 ID**：跨届次、跨任期引用不断裂。
5. **追加历史**：版本、审计、发布记录只增不改。
6. **可导出**：任何核心对象都能导出，避免平台锁定。
7. **人机边界**：AI 在系统外，系统只登记来源与复核。
8. **默认拒绝**：权限与公开都是显式开启。
9. **最小字段**：收集 3 个必填，入档再补；不因系统增加记录负担。
10. **可运维**：备份、恢复、迁移、交接都有固定动作。

## 8. 规模假设（待确认）

| 维度 | 设计假设 | 影响 |
|---|---|---|
| 部门成员 | 20–50 人 | 权限与组织模型不需要复杂分级 |
| 每年赛事 | 4–8 场 | 卷宗列表与看板足够 |
| 每年运营事项 | 2–6 项 | 运营卷宗不单独做模块 |
| 每场选手 | 100–500 人 | 导入与报名数据需要批处理 |
| 档案条目 | 1,000–5,000/年 | 关系库 + 元数据检索足够 |
| 文件总量 | 20–100 GB / 3 年 | 对象存储 + 校验和 |
| 峰值并发 | 100–500（报名/公示） | 公开端可缓存，内部端低并发 |
| 租户 | 单部门单租户 | 不做多租户隔离 |

## 9. 与其它文档的关系

- 概念模型：`../../10-concepts/archive-model.md`
- 页面设计：`02-pages.md`
- 板块设计：`03-blocks.md`
- 设计逻辑：`04-logic.md`
- 长期复用：`05-reuse.md`
