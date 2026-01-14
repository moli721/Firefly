---
title: 博客填坑记：放弃 Git Submodule，拥抱正确的上游同步姿势
published: 2026-01-14
description: 记录在搭建 Firefly 博客时遇到的 Git 子模块冲突问题，以及如何解决 "posts~HEAD" 报错，建立正确的 Upstream 同步工作流。
image: api
tags: [Git, 博客搭建, Firefly, 踩坑记录]
category: 避坑排查
draft: false
---


## 前言

最近在使用 Firefly 主题搭建个人博客时，为了能持续获取原作者的更新，我最初在 AI 的建议下尝试使用了 `git submodule`（子模块）来管理我的文章目录。

结果，当我试图同步上游代码（Upstream）时，灾难发生了……

## 遇到的问题

同步时，VS Code 疯狂报错，终端提示 `fatal: not removing 'src/content/posts' recursively`，而且文件列表中出现了一个诡异的 `posts~HEAD` 红色冲突，删都删不掉。

同时，启动项目时还遇到了 `Cannot find module 'rehype-callouts'` 的报错。

经过一番折腾（和高人指点），我终于明白：**对于个人博客这种“魔改+写作”并行的项目，使用 Git Submodule 是过度设计，更是给自己挖坑。**

## 为什么 Submodule 是个坑？

1.  **双向修改的噩梦**：子模块的设计初衷是“只读引用”。但我需要频繁修改 `posts` 里的文章，这导致 Git 无法判断版本，产生了“游离指针”和嵌套仓库冲突。
2.  **操作繁琐**：每次更新都需要在两个仓库里分别提交，极易出错。
3.  **配置残留**：即使删除了文件夹，`.gitmodules` 和 `.git` 隐藏目录依然会导致 Git 索引错乱。

## 解决方案：彻底移除子模块

如果你也遇到了 `warning: adding embedded git repository` 或者 `posts~HEAD` 无法消除的问题，可以照着我的步骤“外科手术”一下：

### 1. 清理隐藏的 .git 文件夹
问题的根源在于 `src/content/posts` 文件夹里藏了一个 `.git` 文件夹。需要强制删除它：

```bash
# 在终端执行（确保路径正确）
rm -rf src/content/posts/.git
# 或者在 Windows PowerShell 下：
Remove-Item -Path "src\content\posts\.git" -Recurse -Force
```

### 2. 清除 Git 缓存索引
告诉 Git 忘记这个文件夹之前的“特殊身份”：

```bash
git rm -r --cached src/content/posts
```

### 3. 删除配置文件
一定要把项目根目录下的 `.gitmodules` 文件删掉，这是子模块的“户口本”，不删会一直报错。

### 4. 重新添加为普通文件
现在，把文章目录当做普通的文件夹加回来：

```bash
git add src/content/posts/*
git add .
git commit -m "彻底移除子模块，转为普通文件夹管理"
```

---

## 正确的工作流：如何优雅地同步上游

填完坑后，我总结了一套**标准同步流程（SOP）**。以后获取原作者更新，只需要照着这个做，再也不怕覆盖文章了。

### 第一步：保护现场
在同步前，永远先提交自己手头的修改：
```bash
git add .
git commit -m "同步前备份我的修改"
```

### 第二步：拉取并合并
```bash
git fetch upstream
git merge upstream/master
# 注意：如果作者分支是 main，则用 upstream/main
```

### 第三步：处理冲突（关键）
合并时，VS Code 左侧的“源代码管理”通常会出现冲突列表。
*   **对于文章和配置文件 (`config.ts`)**：毫不犹豫选择 **“采用当前更改 (Accept Current Change)”**，保留自己的。
*   **对于系统代码**：通常选择 **“采用传入的更改 (Accept Incoming Change)”**，使用作者的新功能。

    ![Img](./FILES/博客填坑记：放弃%20Git%20Submodule，拥抱正确的上游同步姿势.assets/img-20260114153712.png)


### 第四步：安装新依赖
如果启动时报错缺包，是因为作者加了新插件。执行一行命令即可解决：
```bash
pnpm install
# 或者 npm install
```

## 总结

折腾这一通，虽然走了弯路，但也彻底搞懂了 Git 的合并逻辑。对于博客这种项目，**Upstream Merge（上游合并）** 才是正道，Submodule 还是留给大型项目组件化去用吧。

希望这篇避坑指南能帮到同样在使用 Astro 博客模板的朋友们！
```

