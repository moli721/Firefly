# 博客日常工作流程 / Daily Workflow

> **适用场景**：使用 Git Submodule 方案管理博客文章

---

## 📝 场景一：写完新文章后发布

### 1️⃣ 在文章仓库中提交

```bash
# 进入文章仓库目录
cd H:\博客专用\Firefly\src\content\posts

# 查看改动
git status

# 添加新文章或修改
git add .

# 提交（建议使用有意义的 commit message）
git commit -m "feat: 新增《XXX》文章"
# 或
git commit -m "fix: 修复《XXX》文章中的错误"

# 推送到远程仓库
git push origin main
```

### 2️⃣ 在主仓库中更新 submodule 引用

```bash
# 返回主仓库目录
cd H:\博客专用\Firefly

# 提交 submodule 指针更新
git add src/content/posts
git commit -m "chore: update posts to latest version"

# 推送到 GitHub（触发 Vercel 自动部署）
git push origin master
```

### ✅ 完成！

Vercel 会自动检测到更新并重新部署你的博客。

---

## 🔄 场景二：从远程拉取最新文章

**使用场景**：
- 在另一台电脑上工作
- 团队协作时同步他人的文章
- 远程仓库有新内容

### 方法一：自动更新（推荐）

```bash
# 在主仓库目录下
cd H:\博客专用\Firefly

# 更新 submodule 到远程最新版本
git submodule update --remote src/content/posts

# 本地预览确认
npm run dev

# 提交更新
git add src/content/posts
git commit -m "chore: update posts to latest version"
git push origin master
```

### 方法二：手动更新

```bash
# 进入 submodule 目录
cd H:\博客专用\Firefly\src\content\posts

# 拉取最新更改
git pull origin main

# 返回主仓库
cd H:\博客专用\Firefly

# 提交更新
git add src/content/posts
git commit -m "chore: sync posts from remote"
git push origin master
```

---

## 🛠️ 场景三：修改已发布的文章

```bash
# 1. 进入文章目录
cd H:\博客专用\Firefly\src\content\posts

# 2. 修改文章（使用你喜欢的编辑器）

# 3. 查看改动
git diff

# 4. 提交修改
git add .
git commit -m "fix: 修正《XXX》文章中的表述"
git push origin main

# 5. 回到主仓库更新引用
cd H:\博客专用\Firefly
git add src/content/posts
git commit -m "chore: update posts - fix article XXX"
git push origin master
```

---

## 🚨 常见问题排查

### 问题 1：`git submodule update --remote` 不生效

**原因**：submodule 配置错误（本次修复已解决）

**确认是否修复成功**：

```bash
git ls-files --stage src/content/posts
```

应该显示 `160000` 开头（表示 submodule），而不是 `100644`（普通文件）。

### 问题 2：Astro 报 "Duplicate id" 警告

**原因**：文章被加载了两次（主仓库 + submodule）

**解决方案**：本次修复已解决。如果仍有问题，检查是否有文件被直接提交到主仓库：

```bash
git ls-files src/content/posts
```

应该只显示一行 `src/content/posts`。

### 问题 3：新文章缺少 frontmatter 导致构建失败

**错误信息**：
```
[InvalidContentEntryDataError] posts → XXX data does not match collection schema.
  title: Required
  published: Required
```

**解决方案**：

每篇文章都必须包含 frontmatter，格式如下：

```markdown
---
title: 文章标题
description: 文章描述（用于 SEO 和摘要）
published: 2025-01-13
tags: ['标签1', '标签2']
category: 分类名称
draft: false
image: "./FILES/文章名.assets/封面图.png"  # 可选
---

# 文章正文开始...
```

### 问题 4：Vercel 部署时 submodule 没有被拉取

**原因**：Vercel 默认不会自动初始化 submodule

**解决方案**：

在 Vercel 项目设置中添加构建命令：

```bash
# Build Command
git submodule update --init --recursive && npm run build
```

---

## 📋 快速参考表

| 操作 | 命令 | 目录 |
|------|------|------|
| 写新文章后提交 | `git add . && git commit -m "feat: XXX" && git push` | `src/content/posts/` |
| 更新主仓库引用 | `git add src/content/posts && git commit -m "chore: update posts" && git push` | 主目录 |
| 拉取最新文章 | `git submodule update --remote src/content/posts` | 主目录 |
| 本地预览 | `npm run dev` | 主目录 |
| 构建生产版本 | `npm run build` | 主目录 |

---

## 💡 最佳实践

### 1. **Commit Message 规范**

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新增文章
- `fix:` 修复文章错误
- `docs:` 文档更新
- `chore:` 日常维护（如更新 submodule 引用）

### 2. **本地预览后再推送**

```bash
# 在主仓库目录
npm run dev

# 浏览器访问 http://localhost:4321
# 确认无误后再推送
```

### 3. **定期同步远程更新**

```bash
# 每周或开始工作前执行
git submodule update --remote src/content/posts
```

### 4. **文章目录结构**

```
src/content/posts/
├── 文章标题.md
└── FILES/
    └── 文章标题.assets/
        ├── 图片1.png
        └── 图片2.png
```

---

## 🎯 一键脚本（可选）

你可以创建快捷脚本简化操作：

### Windows (PowerShell)

创建 `update-posts.ps1`：

```powershell
# 更新文章并部署
cd H:\博客专用\Firefly
Write-Host "正在更新文章..." -ForegroundColor Green
git submodule update --remote src/content/posts
git add src/content/posts
git commit -m "chore: update posts to latest version"
git push origin master
Write-Host "部署完成！" -ForegroundColor Green
```

使用方法：
```powershell
.\update-posts.ps1
```

### Linux/Mac (Bash)

创建 `update-posts.sh`：

```bash
#!/bin/bash
# 更新文章并部署
cd /path/to/Firefly
echo "正在更新文章..."
git submodule update --remote src/content/posts
git add src/content/posts
git commit -m "chore: update posts to latest version"
git push origin master
echo "部署完成！"
```

使用方法：
```bash
chmod +x update-posts.sh
./update-posts.sh
```

---

**🎉 现在你已经掌握了完整的博客工作流程！**
