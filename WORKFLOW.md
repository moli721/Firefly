# Firefly 博客日常工作流程

> 当前文章目录 `src/content/posts/` 是主仓库中的普通目录，不再使用 Git Submodule。

## 核心规则

1. `master` 只保存已经检查、可以部署的版本。
2. 新文章使用 `post/*` 分支。
3. 同步官方仓库使用 `sync/*` 分支。
4. 文章、个人配置、上游同步分别提交，不混在同一个提交中。
5. 开始操作前先确认 `git status` 干净。

## 分支与远端分别代表什么

```text
master            本地博客成品：主题＋个人文章＋个人配置
origin/master     GitHub 上自己的博客成品
upstream/master   Firefly 官方主题
post/*            从完整博客成品复制出来的文章工作分支
sync/*            从完整博客成品复制出来的上游合并测试分支
backup/*          操作前的恢复点
```

下面的命令只会从自己的 GitHub 更新本地 `master`，不会把 `master` 替换成官方主题：

```powershell
git switch master
git pull --ff-only origin master
```

官方主题只有在明确执行下面的命令时才会参与合并：

```powershell
git fetch upstream
git merge upstream/master
```

`--ff-only` 表示只允许安全的快进更新；如果本地和 GitHub 出现分叉，命令会停止并提示处理，不会擅自覆盖本地提交。

## 一、发布新文章

### 1. 从最新 master 创建文章分支

```powershell
git switch master
git pull --ff-only origin master
git switch -c post/20260807-article-slug
```

`git switch -c` 会以当前 `master` 的完整状态创建分支。因此新分支已经包含全部主题、历史文章和个人配置，并不是一个空目录。

随时可以切回成品分支：

```powershell
git switch master
```

切换分支前应先提交当前修改；存在可能被覆盖的未提交修改时，Git 通常会停止切换并给出提示。

### 2. 创建或编辑文章

使用项目自带脚本创建文章：

```powershell
pnpm run new-post -- "文章标题"
```

文章和配图放在：

```text
src/content/posts/
├── 文章标题.md
└── FILES/
    └── 文章标题.assets/
        ├── 图片1.png
        └── 图片2.png
```

### 3. 检查并提交

```powershell
pnpm check
pnpm type-check

git add -- src/content/posts
git commit -m "content: 新增《文章标题》"
```

只执行 `git add src/content/posts`，避免把主题源码或临时文件一起提交。

### 4. 合并并发布

```powershell
git switch master
git merge --ff-only post/20260807-article-slug
git push origin master
git branch -d post/20260807-article-slug
```

如果文章分支已经推送到 GitHub，也可以通过 Pull Request 合并。

## 二、同步官方上游

建议每周一次，或在准备写新文章之前同步。不要累积几百个提交后再处理。

### 1. 更新远端引用并备份

```powershell
git switch master
git pull --ff-only origin master
git status

git fetch --prune upstream
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
git branch "backup/pre-upstream-$stamp"
git switch -c "sync/upstream-$stamp"
```

### 2. 合并官方更新

```powershell
git merge --no-ff upstream/master
```

发生冲突时：

- `src/content/posts/` 中自己的文章保留个人版本。
- 主题组件、样式和类型定义优先采用上游新结构。
- `src/config/`、About、Vercel 配置手动融合。
- `ours` 表示当前个人分支，`theirs` 表示官方上游。

```powershell
# 保留自己的文件
git restore --ours -- "文件路径"

# 采用上游文件
git restore --theirs -- "文件路径"

# 标记已经解决
git add -- "文件路径"

# 完成合并
git commit
```

放弃本次同步：

```powershell
git merge --abort
git switch master
```

### 3. 验证合并结果

```powershell
pnpm install --frozen-lockfile
pnpm check
pnpm type-check
pnpm build
pnpm dev --host 127.0.0.1
```

访问：

```text
http://127.0.0.1:4321/
```

### 4. 更新 master 并推送

```powershell
git switch master
git merge --ff-only sync/upstream-YYYYMMDD-HHMMSS
git push origin master
git branch -d sync/upstream-YYYYMMDD-HHMMSS
```

将命令里的时间替换成实际同步分支名称。

## 三、修改个人配置

个人配置同样保存在 `master` 中，并自动包含在以后创建的 `post/*` 和 `sync/*` 分支里。

配置修改建议使用独立分支，不要和文章提交混在一起：

```powershell
git switch master
git pull --ff-only origin master
git switch -c config/update-profile

# 修改 src/config、个人图片或 vercel.json
pnpm check
pnpm type-check

git add -- src/config public/assets/images vercel.json
git commit -m "config: 更新个人站点配置"

git switch master
git merge --ff-only config/update-profile
git push origin master
git branch -d config/update-profile
```

同步上游时，如果官方也修改了相同配置文件，Git 才会要求手动融合；已经启用的 `rerere` 会记录解决方式，后续相似冲突可以自动复用。

## 四、既要写文章，又要同步上游

最简单的顺序：

1. 先同步上游并更新 `master`。
2. 再从最新 `master` 创建 `post/*` 分支。
3. 写文章、检查、提交和发布。

如果文章已经写到一半：

```powershell
git add -- src/content/posts
git commit -m "content: WIP 文章标题"

git switch master
# 按“同步官方上游”流程更新 master

git switch post/文章分支名
git rebase master
```

文章只新增独立 Markdown 文件时，rebase 通常不会产生冲突。

## 五、常用检查命令

```powershell
# 查看当前分支和改动
git status --short --branch

# 查看个人仓库与官方仓库地址
git remote -v

# 查看相对上游的提交数量
git fetch upstream
git rev-list --left-right --count master...upstream/master

# 查看最近提交
git log --graph --oneline --decorate -10
```

## 六、恢复方法

切换到同步前的备份分支：

```powershell
git branch --list "backup/pre-upstream-*"
git switch backup/pre-upstream-时间
```

恢复后不要立即强制覆盖远端；先运行 `pnpm check` 和 `pnpm build` 确认版本。

需要注意：`post/*` 是工作分支，`backup/*` 才是专门用于恢复的分支。文章分支合并进 `master` 后，即使删除 `post/*`，文章提交仍然保存在 `master` 中。

## 最佳实践

- 自定义图片使用独特文件名，不覆盖上游示例资源。
- 尽量通过 `src/config/` 自定义，不直接修改主题组件。
- 一篇文章一个提交，例如 `content: 新增《标题》`。
- 一次上游同步一个 merge commit，例如 `merge: sync upstream Firefly 6.15.6`。
- 不再将 `src/content/posts/` 转换成 Submodule。
- GitHub 的 Sync fork 适合无冲突更新；有个人配置时优先在本地合并。
