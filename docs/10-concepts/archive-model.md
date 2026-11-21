# 档案模型

## 为什么不是网盘

网盘能存文件，但回答不了交接时最关键的四个问题：

1. 这场赛事一共有哪些资料，缺什么？
2. 这份资料是哪一版，谁确认过？
3. 谁能看，能不能对外发？
4. 下一届从哪里开始？

档案模型把"文件"升级为"有归属、有类型、有状态、有密级、有来源的条目"，再用卷宗把它们组织起来。

## 聚合根：卷宗

卷宗（Case）是一个可归档的事务单元，是全系统的聚合根。

| 类型 | 用途 | 例子 |
|---|---|---|
| `competition` | 赛事届次 | 2026 算法精英大赛 |
| `operation` | 部门运营事项 | 2026 秋季招新、年度总结 |

赛事品牌（如"算法精英大赛"）与届次分离：品牌是长期存在的名称，届次才承载资料。下一届可以复制上一届的模板与目录结构，但不复制敏感数据。

## 实体

### 卷宗 Case

| 字段 | 说明 |
|---|---|
| `id` | 主键 |
| `type` | `competition` / `operation` |
| `title` | 显示名称，含年份与届次 |
| `slug` | URL 用短名 |
| `year` | 年份 |
| `edition` | 届次，如"第 3 届" |
| `competition_id` | 赛事品牌，运营卷宗为空 |
| `status` | `draft` / `active` / `closing` / `archived` |
| `owner_id` | 赛事负责人 |
| `starts_at` / `ends_at` | 起止日期 |
| `classification` | 卷宗内最高密级 |
| `template_id` | 使用的模板 |
| `summary` | 一段话说明 |
| `completeness` | 计算值，不手工填 |

### 阶段 Phase

| 字段 | 说明 |
|---|---|
| `case_id` | 所属卷宗 |
| `key` | 固定键，如 `registration`、`judging` |
| `name` | 显示名 |
| `order` | 顺序 |
| `status` | `pending` / `in_progress` / `done` / `skipped` |
| `owner_id` | 阶段负责人 |
| `start_at` / `end_at` | 时间窗 |

### 档案条目 ArchiveItem

| 字段 | 说明 |
|---|---|
| `id` | 主键 |
| `case_id` | 所属卷宗 |
| `phase_key` | 所属阶段 |
| `type` | 条目类型，见下表 |
| `title` | 标题 |
| `summary` | 摘要，便于检索 |
| `source` | 来源渠道与原始位置 |
| `owner_id` | 对这条内容负责的人 |
| `classification` | L1–L4 |
| `status` | `draft` / `in_review` / `active` / `superseded` / `archived` |
| `version` | 版本号 |
| `supersedes_id` | 替代的旧条目 |
| `file_refs` | 关联文件对象 |
| `tags` | 标签 |
| `published` | 是否已对外发布 |
| `retention_until` | 保留到期日 |
| `intake_id` | 来源收集项（可空） |
| `ai_assisted` | 是否使用 AI 辅助 |
| `reviewer_id` | 复核人 |

### 资料收集项 IntakeItem

| 字段 | 说明 |
|---|---|
| `id` | 主键 |
| `title` | 原始资料名称 |
| `channel` | 来源：群聊/邮件/网盘/现场/其他 |
| `received_at` | 收到日期 |
| `source_ref` | 原始位置（链接或路径，注意密级） |
| `related_case_id` | 关联卷宗（可空，待归类） |
| `related_phase` | 关联阶段（可空） |
| `classification` | 收到时先标密级 |
| `status` | `captured` / `triaged` / `processing` / `ready` / `archived` / `rejected` |
| `processor_id` | 处理人 |
| `processed_at` | 处理日期 |
| `ai_tool` | 使用的工具（可空） |
| `output_item_ids` | 产出的档案条目 |
| `notes` | 备注 |

### 文件对象 FileObject

| 字段 | 说明 |
|---|---|
| `item_id` | 所属条目 |
| `filename` | 原始文件名 |
| `mime` / `size` | 类型与大小 |
| `checksum` | 内容校验和，防重复与篡改 |
| `storage_key` | 实际存储位置 |
| `uploaded_by` / `uploaded_at` | 上传信息 |
| `version` | 文件版本 |

## 条目类型

| 类型 | 典型内容 | 默认密级 | 可公开 |
|---|---|---|---|
| `notice` | 通知、公告 | L1/L2 | 审校后可 |
| `rule` | 规则、章程、FAQ | L1 | 可 |
| `registration` | 报名表、审核记录 | L3 | 否 |
| `participant` | 选手/队伍名单 | L3 | 脱敏后可 |
| `problem` | 赛题、数据、答案 | L4 | 赛后按规则 |
| `submission` | 作品、代码、提交记录 | L3/L4 | 否 |
| `result` | 成绩、排名、获奖名单 | L3→L1 | 公示后 |
| `judging` | 评分表、评审意见 | L4 | 否 |
| `appeal` | 申诉与处理记录 | L4 | 否 |
| `media` | 海报、照片、推文、视频 | L1/L2 | 可 |
| `logistics` | 场地、物资、志愿者 | L2 | 否 |
| `finance` | 预算、报销 | L3 | 否 |
| `certificate` | 证书、奖品 | L2/L3 | 否 |
| `retrospective` | 复盘、总结 | L2 | 可摘要公开 |
| `handover` | 交接包、下届建议 | L2 | 否 |

## 状态机

```text
卷宗：draft → active → closing → archived
                    ↑         │
                    └─────────┘（重新开启需审计）

条目：draft → in_review → active → superseded
                     │         └→ archived
                     └→ draft（退回修改）

收集：captured → triaged → processing → ready → archived
                      │          │        └→ rejected
                      └──────────┘（退回重做）
```

规则：

- 只有 `active` 条目可发布；发布即 `published = true`。
- 已发布条目不改内容，只新建版本并 `supersedes_id` 指向旧版。
- 删除是软删除；物理删除只用于保留期结束且无审计要求的数据。

## 完整性清单

每个模板自带阶段清单，例如：

| 阶段 | 必备条目 | 负责人角色 |
|---|---|---|
| 筹备 | 立项单、预算、时间线 | 赛事负责人 |
| 宣传报名 | 通知、规则、报名数据、审核记录 | 宣传 + 赛事负责人 |
| 赛前 | 规则定稿、赛题、场地/物资、评委名单、应急预案 | 赛事负责人 + 各组长 |
| 执行 | 签到、现场记录、异常记录、媒体素材 | 现场负责人 |
| 评审 | 评分表、评审记录、排名 | 评审负责人 |
| 公示 | 公示稿、申诉记录、最终名单 | 赛事负责人 |
| 收尾 | 证书、财务、复盘、交接包 | 赛事负责人 + 档案管理员 |

`completeness = 已满足必备项 / 必备项总数`，按阶段显示缺件与责任角色。

## 版本与来源

- 每条正式档案都要能回答：从哪来、谁处理、谁复核、何时入档。
- 来源字段至少记录渠道与原始位置；L3/L4 的原始位置不写进公开内容。
- 同一条目允许多个文件；文件有独立校验和。
- 旧版本不删除，检索时默认只显示 `active`，需要时可展开历史。

## 检索维度

卷宗、年份、赛事品牌、卷宗类型、阶段、条目类型、负责人、密级、标签、状态、全文、日期范围。

## 交接包

从卷宗或岗位生成，至少包含：

- 清单：条目列表、缺件列表、未决事项。
- 文件：manifest（路径、校验和、密级），大文件给链接。
- 责任：当前负责人、下一任、关键联系人。
- 历史：上一届同类资料入口。
- 确认：导出人、接收人、日期。

## 反模式

- 只有文件夹，没有元数据。
- 同一资料存多份"最终版"，没有权威版本。
- 把 L3/L4 资料混进公开目录。
- 归档一切，没有保留期，最后没人敢删。
- 用聊天记录代替档案。

## 未决问题

- 文件存储上限与备份方式。
- 是否需要保留原始扫描件/聊天截图。
- 档案管理员是独立岗位还是赛事负责人兼任。
- 完整性清单的必备项是否需要按赛事级别调整。
