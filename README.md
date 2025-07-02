# 使用文档
## 说明

本主题是根据 dewjonh 的 hexo 主题 [Klise](https://github.com/dewjohn/hexo-theme-Klise) 改的，为了适应不同种类的背景图片，大量运用毛玻璃效果作为文字背景。此外用 AI 写了一些基础的渐入渐出动画，看起来不那么像一个“静态”网页了。

这个主题继承了两个开发者的代码，css还只有一个，改的地方很可能有冲突。有任何问题欢迎 issue。

## 主题概览

<img width="1315" alt="image" src="https://github.com/user-attachments/assets/7c3bdc1e-4e1b-4697-bcd5-2ecd61769932" />

<img width="1315" alt="image" src="https://github.com/user-attachments/assets/0d2bf87f-0b5c-4437-9879-f8ec81047e2e" />

<img width="1315" alt="image" src="https://github.com/user-attachments/assets/9e2b42d0-294f-4313-8c78-612c5a92464b" />

<img width="1315" alt="image" src="https://github.com/user-attachments/assets/0d0ff39b-ea42-46f4-aa98-7a98c3b7664b" />


你可以查看[illlights blog](https://blog.illlights.com/)来阅览主题效果。

## 相较于原版有何改动

- 😢把scss全编译为css了，只有一个main.css文件，包含了所有的渲染样式....不过不用担心我注释了🤓
- 将原主题的深色模式进一步适配，并修改了一些元素的显示风格。
- 改用随机图片作为背景，随机图使用 https://api.illlights.com/v1/img。
- 大量使用毛玻璃背景版，提高文字显示效果。
- 增加页面动画。


## 使用方法

### 首先，
你需要下载一个字数统计插件:
```bash
npm install hexo-wordcount --save
```

如果不想要下载或无法下载成功，你也可以放弃字数统计功能。前往主题文件夹下的`layout\post.ejs`删除
```ejs
字数: <span class="post-count"><%= wordcount(page.content) %></span>

预计阅读时间: <span class="post-count"><%= min2read(page.content) %>min</span>
```
两行。

### 然后，
安装主题文件
```bash
git clone https://github.com/g0dmao/hexo-theme-Klise-enhanced.git
```

将主题根目录的`_config.hexo-theme-Klise-enhanced.yml`移动到博客根目录。你可以打开该文件进行主题的一些配置。

在博客配置文件`_config.yml`中启用主题。主题设置为`hexo-theme-Klise-enhanced`

### 最后，
请关闭 CloudFlare [Rocket Loader](https://developers.cloudflare.com/speed/optimization/content/rocket-loader/) 功能，它会延迟加载 JavaScript 来提升“首次渲染速度”，这会让暗色主题下切换页面时出现亮色主题闪烁，直到 JS 被加载再恢复到暗色主题。这东西让我以为是我写的 JS 有问题白忙活了两天。

## 个性化部分

### 自定义背景
打开主题文件夹下的`source\css\main.css`在头部修改，可以自定义明暗模式下不同的背景，已做好注释。

### 当网页失去焦点时标签页标题的显示文字
打开主题文件夹下的`layout\layout.ejs` 修改document.title即可。
```html
<script defer>

  document.addEventListener('visibilitychange', function () {

  if (document.visibilityState == 'hidden') {

      normal_title = document.title;

      document.title = '点一下';

  } else document.title = normal_title;

});

</script>
```
### 可选
你可以安装如下插件获得更好的浏览体验。
#### hexo-renderer-markdown-it-plus
不使用自带的md渲染器。使用markdown-it渲染器，丰富的插件提供更好的md浏览体验。

####  hexo-tips
在文章中生成各种提示卡片，此主题已做好适配。

#### hexo-blog-encrypt
文章加密插件。

### tags、categories、friends页面
首先创建页面`hexo new page tags`。并在相应页面的`index.md` 里添加type和layout标签：

tags页面 type、layout 为tags。

categories页面 type、layout 为 categories。

friends页面 layout 为 friends

friends页面的记录方式如下
```markdown
---
title: 随便写，不会被使用
date: 随便写，不会被使用
layout: friends
---

<ul>
<li>站点名称</li>
<li>站点地址</li>
<li>头像</li>
<li>简介</li>

<li>站点名称</li>
<li>站点地址</li>
<li>头像</li>
<li>简介</li>

...
</ul>
```
