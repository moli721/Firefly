---
title: Firefly博客部署：Git Submodule方案完整指南
description: 采用 Git Submodule 方案部署 Firefly 博客的完整教程,包含 Fork 仓库、子模块配置、Vercel 部署等八个关键步骤,实现文章与框架完全解耦。
published: 2025-12-31
tags: ['Firefly', 'Git', 'Submodule', 'Vercel', '博客', '部署']
category: 部署搭建
draft: false
image: "./FILES/Firefly博客部署指南.assets/img-20251231160054.png"
---

# Firefly 博客搭建全流程指南(Git Submodule 方案)

## 一、为什么选择 Git Submodule 方案?

在开始搭建之前,先了解一下这套方案的核心优势。

### 1. 文章库(Posts)绝对安全

当你执行 `git merge upstream/main`(同步上游)时:

- **完全不会冲突**: Git 知道 `src/content/posts` 是一个子模块(Submodule),它在主库里只是一行"版本号指引",上游作者无论怎么修改他自己的示例文章,都绝对碰不到你私有仓库里的文章
- **唯一的变化**: 如果上游作者修改了 `src/content/posts` 这个文件夹的名称(比如改成 `src/content/articles`),你才需要动一下。但这种改动在成熟的框架里极少发生

### 2. 配置文件(Config)手动决策

这是你唯一需要花 1 分钟"动脑子"的地方。当你执行同步命令时:

```bash
git fetch upstream
git merge upstream/main
```

- **如果没有冲突**: Git 会自动合并
- **如果有冲突**(通常在 `src/config.ts`): VS Code 会变红,显示"合并冲突",你会看到类似这样的代码:

```typescript
<<<<<<< HEAD (你的代码)
title: "陌离的博客",
=======
title: "Firefly Demo",
>>>>>>> upstream/main (作者的代码)
```

**操作**: 你只需要点击 VS Code 顶部的 **"Accept Current Change"**(保留我的更改),或者手动删掉作者的那几行,保留你自己的配置即可。

### 3. 上游增加新功能自动获得

如果上游作者在 `src/config.ts` 里新增了一个功能配置(比如新增了评论系统设置):
- Git 会很聪明地把这一行加进来
- 你只需要在合并完后,去填一下这个新配置的值就行了

---

## 二、Fork Firefly 仓库

首先前往 [https://github.com/CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly) 博客主页,点击右上角的 **Fork** 按钮到自己账号下。

![Fork仓库](./FILES/Firefly博客部署指南.assets/img-20251231144502.png)

**Repository name** 和 **Description** 直接按照默认的即可,也可以自行修改,然后点击 **Create fork**。

到这里你就已经 Fork 完成了,有了代码,后面就可以部署到 Vercel 上面。但现在我们还需要创建一个新的仓库,专门用来写文章。

---

## 三、创建内容仓库

我们现在开始创建内容仓库:

1. 登录 GitHub,点击右上角的 **New repository**
2. 仓库名称建议: `my-blog-posts`(可自定义)
3. **重要**: 必须选择 **Private**(私有),这样可以保护你的草稿和未发布内容
4. **不要** 勾选 "Initialize this repository with a README"
5. 点击 **Create repository**

![创建仓库](./FILES/Firefly博客部署指南.assets/img-20251231145214.png)

---

## 四、迁移现有文章(Fuwari 用户专用,可选)

> 由于 Firefly 是 Secondary development based on Fuwari,我本来用的是 Fuwari 博客,也是 Astro 框架,所以迁移起来不需要改太多东西。**不需要迁移的可以跳过这一节。**

### 迁移步骤

1. **先小范围测试**: 首先我先复制了一两个我原来 Fuwari 博客的文章到 Firefly 下面,发现能正常显示,于是便开始大规模迁移。

   > **注意**: 不要一来就将全部内容复制到 Firefly 下面,要是报错了就难搞了。

2. **准备目录结构**: 我在 H 盘创建了一个专门存放博客的目录 `H:\博客专用`,然后:

```bash
# 克隆自己 Fork 的 Firefly(不是原仓库)
git clone https://github.com/moli721/Firefly.git

# 新建 posts 文件夹,专门存放文章
mkdir posts
```

这样做的好处是:以后只需要去 `H:\博客专用\posts` 修改文章,然后推送到 GitHub,再让 `moli721/Firefly.git` 拉取子模块就行。`git merge upstream/main`(同步上游)时不会冲突。

3. **保留示例文章**: 先把 `H:\博客专用\Firefly\src\content\posts` 复制到我的 `H:\博客专用\posts` 下面,这样做的好处是保留了原来 Firefly 博客的一些样例和基本格式,以后可以对照。

4. **迁移旧文章**: 最后一步就是将 `H:\代码\fuwari博客\fuwari-moli721\src\content\posts` 下的博客复制到 `H:\博客专用\posts` 下面直接迁移。

### 整理示例文章

迁移后,我让 Claude Code 把原来 Firefly 的示例文章放在 `examples` 目录下(手动迁移也行)。

![示例文章整理](./FILES/Firefly博客部署指南.assets/img-20251231150732.png)

### 修复 Frontmatter 格式

但是后来也发现 Firefly 的 frontmatter 顺序和 Fuwari 的有些不一样,然后还有些补充。对于强迫症的我不会允许这里不一样,由于文章数量很多,这里不推荐手动修改,**直接让 Claude Code 帮你干活,狠狠鞭策 AI!**

```bash
# 让 Claude Code 帮你批量检查和修复
# 1. 打开文章目录
# 2. 告诉 Claude: "firefly的frontmatter顺序和fuwari的有些不一样,帮我检查所有文章的 Frontmatter,修复格式问题"
# 3. Claude 会自动扫描并修复所有文章
```

到这里,博客文章基本迁移完成了。

---

## 五、推送文章到 GitHub

下面将 posts 目录推送到 GitHub:

```bash
# 进入文章目录
cd H:\博客专用\posts

# 初始化 Git 仓库
git init

# 添加所有文章文件
git add .

# 提交到本地仓库
git commit -m "Initial posts backup from Fuwari"

# 设置主分支名称
git branch -M main

# 关联远程仓库(替换为你的用户名)
git remote add origin https://github.com/moli721/my-blog-posts.git
```

> **注意**: 这里应该换成你自己的用户名和仓库名:
> `git remote add origin https://github.com/你的用户名/my-blog-posts.git`

```bash
# 推送到 GitHub
git push -u origin main
```

---

## 六、配置子模块(关键步骤)

下一步就是配置子模块了。这是整个流程中最关键的一步,我们将通过 Git Submodule 把文章仓库"挂载"到框架中。

### 1. 删除 Firefly 自带的示例文章

```bash
# 确保在 Firefly 根目录下
cd H:\博客专用\Firefly

# 注意: 是 posts(复数)
git rm -r src/content/posts
```

### 2. 挂载你的私有文章库

```bash
# 将你的文章仓库作为子模块添加(替换为你的用户名)
git submodule add https://github.com/你的用户名/my-blog-posts.git src/content/posts
```

### 3. 安装依赖并启动项目

**重要提示**: Firefly 框架的作者强制要求必须使用 **pnpm**。这是因为 pnpm 速度更快、节省磁盘空间,且能有效避免依赖冲突。如果你执行 `npm install`,会被内置的校验脚本 `only-allow pnpm` 拦截。用 npm install 会报错,作者亲身体验!

#### 安装 pnpm(全局安装)

如果你的电脑还没有安装 pnpm,先用 npm 安装它:

```bash
npm install -g pnpm
```

安装完成后,可以输入 `pnpm -v` 验证是否成功,你应该能看到版本号(如 9.x 或 10.x)。

#### 使用 pnpm 安装依赖

```bash
# 安装项目依赖
pnpm install
```

你会发现 pnpm 的安装速度非常快,它会自动处理好所有依赖关系。

#### 启动开发服务器

```bash
# 启动本地预览
pnpm dev
```

现在打开浏览器访问 `http://localhost:4321`,你应该能看到你的博客了!

**如果这里出现报错**: 就看报错提示解决吧,没有报错就提交子模块。

### 4. 提交子模块配置

```bash
# 添加所有更改
git add .

# 提交到本地
git commit -m "chore: link posts submodule"

# 推送到你的 GitHub 仓库
git push origin main
```

---

## 七、部署到 Vercel(重要配置)

下一步就是部署到 Vercel。

由于使用了私有子模块,Vercel 默认没有权限访问你的文章仓库,需要额外配置。否则即使你的 Firefly 项目下面的 `src\content\posts` 下面有文章,部署出来的项目也会一篇文章都没有,全是空的。

在询问 Gemini 和 Claude 后,找到了解决方案。

### 1. 修改 vercel.json

**解决方案**: 删除 `vercel.json` 中的 `installCommand` 行。

这里我们需要修改原项目的 `vercel.json`,将其修改为以下内容,然后提交到项目里:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "astro",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/_astro/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "cleanUrls": true
}
```

### 2. 确保 .gitmodules 使用绝对路径

然后确保 `.gitmodules` 使用绝对路径(没改过的不用改,我是因为之前改过)。

**原因**: 不能用相对路径,在某些环境下好用,但在 Vercel 这种特定的构建容器里会产生歧义。

在本地打开 `.gitmodules`,将 URL 改回完整的 HTTPS 地址:

```bash
[submodule "src/content/posts"]
	path = src/content/posts
	url = https://github.com/moli721/my-blog-posts.git
```

提交并推送到 GitHub:

```bash
git add .gitmodules
git commit -m "chore: restore absolute URL for submodule"
git push origin main
```

### 3. 创建 GitHub "经典" Token(Classic Token)

之前用的 Fine-grained Token(细粒度令牌)虽然安全,但有可能会报错。我试过了,搜索发现它目前对子模块的支持非常差,经常报 403 Write access 错误。我们换成最稳的 **Classic Token**。

#### 生成 Token

1. 去 **GitHub Settings** → **Developer settings**(在最下面) → **Personal access tokens** → **Tokens (classic)**
2. 点击 **Generate new token (classic)**
3. **Note** 填 `Vercel-Firefly`
4. **Expiration** 选 `No expiration`(或者你喜欢的时长)
5. **重要**: 勾选整个 **repo** 权限
6. 生成后,复制这个以 `ghp_` 开头的字符串(只显示一次,记下来)

![生成Token](./FILES/Firefly博客部署指南.assets/img-20251231152645.png)

### 4. 在 Vercel 配置环境变量

然后前往 Vercel 填写相关信息。

#### 步骤 1: 添加环境变量

在 Vercel 项目 **Settings** → **Environment Variables** 里,添加一个变量:

- **Key**: `BLOG_TOKEN`
- **Value**: 填入你刚才复制的 `ghp_...` 令牌

![配置环境变量](./FILES/Firefly博客部署指南.assets/img-20251231152838.png)

#### 步骤 2: 配置 Install Command

去 **Settings** → **Build and Deployment** → **Install Command**。

确保 **Override** 开启,填入这行代码(避开 403 错误):

```bash
git config --global url."https://moli721:$BLOG_TOKEN@github.com/".insteadOf "https://github.com/" && git submodule update --init --recursive && pnpm install
```

> **注意**: 将 `moli721` 替换为你的 GitHub 用户名。

![配置Install Command](./FILES/Firefly博客部署指南.assets/img-20251231152957.png)

### 5. 重新部署(Redeploy)

回到 **Deployments**,找最近一次失败的,点 **...** 选 **Redeploy**。

---

## 八、大功告成!

到这里就完全搭建完成了!

![部署成功](./FILES/Firefly博客部署指南.assets/img-20251231153307.png)

---

## 九、日常使用工作流程

配置完成后,日常写作和发布的流程非常简单。记住核心原则:**改文章去 posts 目录,预览和部署在 Firefly 目录**。

### 1. 日常写文章

在独立的 `posts` 目录工作:

```bash
# 进入文章目录
cd H:\博客专用\posts

# 创建或编辑文章
# 注意:必须添加完整的 frontmatter(见下方示例)

# 提交到文章仓库
git add .
git commit -m "feat: 新增文章《xxx》"
git push origin main
```

**⚠️ 重要提醒**: 每篇文章**必须**包含 frontmatter,否则 Firefly 会报错!

基本 frontmatter 模板:
```markdown
---
title: 文章标题
published: 2025-12-31
description: 文章简介
tags: [标签1, 标签2]
category: 分类名称
draft: false
---

# 文章标题

文章内容...
```

可选字段:
```markdown
---
title: 文章标题
published: 2025-12-31
pinned: true              # 添加这行可以置顶文章
description: 文章简介
image: "./FILES/xxx.png"  # 添加封面图
tags: [标签1, 标签2]
category: 分类名称
draft: false
---
```

### 2. 本地预览博客

在 Firefly 目录更新子模块并预览:

```bash
# 进入 Firefly 目录
cd H:\博客专用\Firefly

# 拉取最新文章
git submodule update --remote src/content/posts

# 本地预览
pnpm dev
```

打开浏览器访问 `http://localhost:4321` 查看效果。

### 3. 部署到 Vercel

确认预览无误后,提交子模块更新:

```bash
# 在 Firefly 目录下
cd H:\博客专用\Firefly

# 提交子模块引用更新
git add src/content/posts
git commit -m "chore: update posts to latest version"

# 推送到 GitHub(Firefly 使用 master 分支)
git push origin master
```

推送后,Vercel 会自动触发部署,大约 1-2 分钟后你的博客就更新了!

---

## 十、同步上游更新(Merge Upstream)

当 Firefly 官方仓库有新功能或 bug 修复时,你需要同步这些更新。得益于 Submodule 方案,这个过程非常安全和可控。

### 为什么 Submodule 方案同步更新超安全?

- **文章库绝对安全**: `src/content/posts` 是子模块,上游无法修改你的私有文章仓库
- **配置冲突可控**: 只有 `src/config/` 目录可能冲突,且可以手动选择保留哪个版本
- **新功能自动获得**: 上游新增的代码功能会自动合并,无需手动复制

### 1. 添加上游仓库(首次执行)

如果你是第一次同步,需要先添加上游仓库:

```bash
# 进入 Firefly 目录
cd H:\博客专用\Firefly

# 添加官方仓库为上游(upstream)
git remote add upstream https://github.com/CuteLeaf/Firefly.git

# 验证是否添加成功
git remote -v
# 应该看到:
# origin    https://github.com/你的用户名/Firefly.git (你的 fork)
# upstream  https://github.com/CuteLeaf/Firefly.git (官方仓库)
```

### 2. 备份配置文件(强烈推荐)

在合并前,先备份你的个人配置:

```bash
# 创建带时间戳的备份目录
mkdir ../firefly-config-backup-$(date +%Y%m%d-%H%M%S)

# 备份配置文件和自定义资源
cp -r src/config ../firefly-config-backup-*/
cp -r public/assets/images ../firefly-config-backup-*/images
```

**Windows PowerShell 用户**:
```powershell
# 使用 PowerShell 创建备份
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
New-Item -ItemType Directory -Path "..\firefly-config-backup-$timestamp"
Copy-Item -Recurse src/config "..\firefly-config-backup-$timestamp\"
Copy-Item -Recurse public/assets/images "..\firefly-config-backup-$timestamp\images"
```

### 3. 获取上游更新并检查状态

```bash
# 获取上游最新代码(不会修改本地文件)
git fetch upstream

# 检查有哪些新提交
git log HEAD..upstream/master --oneline
# 这会显示上游的新提交列表,例如:
# a1b2c3d feat: 新增暗色模式切换功能
# e4f5g6h fix: 修复移动端导航栏问题
# i7j8k9l docs: 更新配置文件注释

# 查看具体改动的文件统计
git diff HEAD..upstream/master --stat
# 这会显示哪些文件被修改,例如:
# src/config/siteConfig.ts          | 15 ++++---
# src/components/Navbar.astro       | 42 +++++++++++-------
# package.json                      |  3 +-
```

**⚠️ 重点关注**: 如果 `git diff --stat` 显示 `src/config/` 目录有修改,说明可能会有配置冲突。

### 4. 手动合并(推荐方式)

使用 `--no-commit --no-ff` 参数可以让你在提交前检查合并结果:

```bash
# 执行合并,但不自动提交
git merge upstream/master --no-commit --no-ff
```

**可能的三种情况**:

#### 情况 A: 自动合并成功(无冲突)

```bash
# 终端显示:
Automatic merge went well; stopped before committing as requested
```

这说明没有冲突!检查改动后直接提交即可:

```bash
# 查看改动
git status

# 测试运行
pnpm dev

# 确认无误后提交
git commit -m "merge: 同步上游更新 $(git log upstream/master -1 --format='%h %s')"
```

#### 情况 B: 有冲突(通常在配置文件)

```bash
# 终端显示:
CONFLICT (content): Merge conflict in src/config/siteConfig.ts
Automatic merge failed; fix conflicts and then commit the result.
```

**解决步骤**:

1. **打开 VS Code 查看冲突文件**(通常在 `src/config/` 目录):

```typescript
<<<<<<< HEAD (你的版本)
title: "陌灬离的博客",
navbar: {
  logo: "/assets/images/mylogo.svg",
  title: "𝓜𝓞𝓵𝓲"
},
=======
title: "Firefly",
navbar: {
  logo: "/assets/images/logo.svg",
  title: "Firefly"
},
>>>>>>> upstream/master (上游版本)
```

2. **手动选择保留哪个版本**:
   - 点击 VS Code 顶部的 **"Accept Current Change"**(保留你的)
   - 或点击 **"Accept Incoming Change"**(使用上游的)
   - 或点击 **"Accept Both Changes"**(保留两者,手动整合)

3. **处理配置文件建议**:
   - **`src/config/siteConfig.ts`**: 保留你的个人信息(标题、描述、链接等)
   - **`src/config/commentConfig.ts`**: 保留你的评论系统配置(Twikoo/Giscus)
   - **`src/config/profileConfig.ts`**: 保留你的个人资料
   - **新增的配置项**: 接受上游的默认值,稍后根据需要修改

4. **恢复自定义资源**(如果被删除):

```bash
# 检查自定义图片是否存在
ls public/assets/images/

# 如果图片被删除,从备份恢复
cp ../firefly-config-backup-*/images/* public/assets/images/
```

5. **标记冲突已解决**:

```bash
# 添加已解决的文件
git add .

# 检查状态
git status
```

6. **测试运行**:

```bash
pnpm dev
# 在浏览器访问 http://localhost:4321 检查
# 重点检查: 导航栏、个人资料、评论系统、文章列表
```

7. **提交合并**:

```bash
git commit -m "merge: 合并上游更新,保留个人配置"
```

#### 情况 C: Submodule 冲突(极少见)

如果 `src/content/posts` 显示冲突:

```bash
# 查看冲突
git status
# 可能显示: both modified: src/content/posts

# 保留你的子模块版本
git checkout --ours src/content/posts

# 添加到暂存区
git add src/content/posts

# 继续提交
git commit -m "merge: 同步上游更新,保留文章子模块"
```

### 5. 推送并部署

```bash
# 推送到你的 GitHub 仓库
git push origin master

# Vercel 会自动部署,等待 1-2 分钟即可
```

### 6. 验证部署

访问你的 Vercel 部署地址,检查:
- ✅ 博客能正常访问
- ✅ 文章列表完整
- ✅ 个人配置(标题、头像、评论系统)正确
- ✅ 新功能正常工作

---

### 🤖 给 AI 助手的状态摘要模板

如果你在同步过程中需要切换 AI 对话,或者让新的 AI 助手帮你继续,可以复制以下模板并填入实际信息:

```markdown
## Firefly 博客上游同步状态摘要

**项目信息**:
- 主项目: [你的GitHub用户名]/Firefly (fork from CuteLeaf/Firefly)
- 文章仓库: [你的GitHub用户名]/my-blog-posts (私有,通过 Git Submodule 挂载到 `src/content/posts`)
- 本地路径: `H:\博客专用\Firefly`
- Posts 路径: `H:\博客专用\posts`

**个性化配置**:
- 博客标题: [你的博客标题]
- 导航栏 Logo: `/assets/images/[你的logo文件名]`
- 评论系统: [Twikoo/Giscus/其他] + 配置地址
- 自定义图片: [列出你的自定义图片文件名]
- Bangumi UID: [你的番组计划ID,如有]

**当前同步状态**:
- [ ] 已执行 `git fetch upstream`
- [ ] 已检查 `git log HEAD..upstream/master` (发现 X 个新提交)
- [ ] 已备份配置文件到: `../firefly-config-backup-[时间戳]/`
- [ ] 已执行 `git merge upstream/master --no-commit --no-ff`
- [ ] 冲突状态: [无冲突 / 有冲突在以下文件: xxx]
- [ ] 已解决冲突并测试(`pnpm dev` 正常运行)
- [ ] 已提交合并

**冲突解决策略** (如有):
- `src/config/siteConfig.ts`: 保留我的个人信息,接受新增配置项的默认值
- `src/config/commentConfig.ts`: 完全保留我的配置(`git checkout --ours`)
- `src/config/profileConfig.ts`: 完全保留我的配置
- 自定义图片: 如被删除则从备份恢复

**待办事项**:
- [ ] 继续解决剩余冲突
- [ ] 本地测试通过
- [ ] 提交并推送
- [ ] 验证 Vercel 部署

**备注**: [其他重要信息或遇到的问题]
```

**使用方法**: 复制上面的模板,填入你的实际信息,然后粘贴给新的 AI 对话。AI 会根据这个摘要快速理解你的状态并继续帮助你。

---

### 常见问题

**Q1: 多久同步一次上游?**
A: 建议每 1-2 个月检查一次,或者当你在 GitHub 看到上游有重大更新时。

**Q2: 如果不小心把自定义配置覆盖了怎么办?**
A: 这就是为什么我们要先备份!从 `../firefly-config-backup-*/` 恢复即可。

**Q3: 能直接用 `git pull upstream master` 吗?**
A: 不推荐。`pull` = `fetch` + `merge`,会自动提交。使用 `--no-commit` 可以先检查再提交,更安全。

**Q4: Submodule 同步会影响我的文章吗?**
A: 不会!`src/content/posts` 指向你的私有仓库,上游无法修改。最多只是子模块引用的 commit ID 可能冲突,用 `git checkout --ours` 保留你的版本即可。

---

## 参考资源

- [Firefly 官方文档](https://docs-firefly.cuteleaf.cn/)
- [Git Submodule 官方文档](https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E5%AD%90%E6%A8%A1%E5%9D%97)

---

**祝你的博客之旅顺利!** 🎉
