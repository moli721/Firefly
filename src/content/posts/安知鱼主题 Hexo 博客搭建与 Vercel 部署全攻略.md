---
title: 安知鱼主题Hexo博客搭建与Vercel部署指南
published: 2024-12-30
description: 安知鱼主题Hexo博客的完整搭建流程和Vercel部署步骤，包含ERR_REQUIRE_ESM错误解决方案
image: api
tags: ['Hexo', '安知鱼', 'Vercel', '博客', '部署']
category: 部署搭建
draft: false
---

# 安知鱼主题 Hexo 博客搭建与 Vercel 部署全攻略

最近把博客换成了安知鱼主题，折腾了一圈，把这套最稳的搭建流程记下来。希望能帮后来人少走弯路。

### 一、 环境准备与初始化
首先，确保你的电脑里有 Node.js（推荐 v18+）。

1. **安装 Hexo 全局脚手架：**
   ```bash
   npm install hexo-cli -g
   ```
2. **找个干净的目录，初始化项目：**
   ```bash
   hexo init anzhiyu-blog
   cd anzhiyu-blog
   yarn install  # 建议统一用 yarn，速度快且稳
   ```

### 二、 安装安知鱼主题
安知鱼支持多种安装方式，**这里建议选插件化安装**，以后更新主题只要一行命令。

1. **安装主题核心：**
   ```bash
   yarn add hexo-theme-anzhiyu
   ```
2. **应用主题：**
   打开根目录的 `_config.yml`，把 `theme` 改成 `anzhiyu`。
3. **配置文件备份：**
   为了方便自定义样式，建议把主题的配置拷到根目录：
   ```bash
   cp -rf ./themes/anzhiyu/_config.yml ./_config.anzhiyu.yml
   ```

### 三、 避坑：解决 ERR_REQUIRE_ESM 冲突
**这是最关键的一步。** 现在的 Node 环境下跑 `hexo generate` 经常会报 `strip-ansi` 相关的红字错误，因为依赖库版本打架了。

**解决方案：**
在 `package.json` 里手动加上 `resolutions`（Yarn）或 `overrides`（npm）来强行锁版本：

```json
"resolutions": {
  "strip-ansi": "6.0.1",
  "ansi-regex": "5.0.1"
}
```
改完后，执行以下命令重装依赖：
```powershell
Remove-Item -Recurse -Force node_modules  # 删掉旧的
yarn install                              # 重新洗牌
```

### 四、 补齐必备插件
安知鱼主题是用 Pug 和 Stylus 写的，Hexo 默认不带，必须手动装上：
```bash
yarn add hexo-renderer-pug hexo-renderer-stylus
```
*注：如果 npm 慢，直接用 cnpm 或者换淘宝源，别死磕。*

### 五、 关联 GitHub 仓库
1. 在 GitHub 上新建仓库，名字随便起，但**不要**勾选初始化 README。
2. 终端执行：
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```
   **注意：** 如果你之前是用 `git clone` 下的主题，记得删掉 `themes/anzhiyu` 里的 `.git` 隐藏文件夹，不然主题代码传不上去。

### 六、 部署至 Vercel
1. 登录 Vercel，Import 你刚传上去的仓库。
2. **Framework Preset** 选 **Hexo**。
3. **关键点**：在 **Settings -> General** 里的 **Install Command**，一定要手动开启并填入 `yarn install` 或 `npm install`。
4. 点击 **Deploy**。看到漫天烟花就代表成了。

### 七、 日常怎么玩？
- **写新文章**：`hexo new "我的第一篇博客"`，然后去 `source/_posts` 找 md 文件改就行。
- **本地看效果**：`hexo clean && hexo s`，浏览器看 `localhost:4000`。
- **云端同步**：本地改爽了直接 `git push`，Vercel 会自动帮你重新编译上线，完全不用手动传文件。

---

**最后多说一句：** 
改配置的时候，`_config.yml` 里的冒号后面**必须有空格**，这种低级错误能让你白忙活半天。祝大家都能顺利跑起来！

---

### 补充建议：
1. **关于 Git Clone**：你在正文里提到了 `git clone` 主题，但我建议你在教程中统一推荐 **npm/yarn 安装模式**。因为克隆模式如果不删子仓库的 `.git`，新手大概率会遇到 Vercel 部署出来是白屏的问题。
2. **代码块格式**：确保你在博客发布时，Markdown 的代码块语法正确（比如用 `json` 或 `bash` 指明语言），这样高亮才好看。
3. **图片干货**：如果可以，顺手截一张 Vercel 的配置图贴上去，效果更直观。