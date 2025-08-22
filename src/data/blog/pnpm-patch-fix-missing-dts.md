---
title: '修复第三方包类型导出问题（如何 patch node modules）'
author: Indusy
description: '修复第三方包类型导出问题（如何 patch node modules）'
slug: pnpm-patch-fix-missing-dts
featured: false
draft: false
tags:
  - Frontend
pubDatetime: 2025-08-22T14:40:55+08:00
---

最近在一个项目中，我依赖了 [`@wangeditor/editor-for-vue`](https://www.npmjs.com/package/@wangeditor/editor-for-vue) 这个包，结果遇到了一个小问题：它在导出模块时仅在 types 字段导出了 `.d.ts` 文件，其实这是一个兼容字段，新项目一般会写在 exports 字段，这个情况导致在 TypeScript 项目中导入这个模块时无法获取类型提示。

## 思路一：Fork 源码

最先想到的方案是直接 fork 一份源码，修改后重新编译生成类型文件。但是有几个限制让我不想走这条路：

- 不想把修改后的包发布到 `npmjs.org`
- 也不想自建私有 registry

所以这个方案被放弃了。

## 思路二：打补丁

于是我想到了打补丁的方式。查了一下，发现了 [`patch-package`](https://www.npmjs.com/package/patch-package) 这个包，文档上写得很清楚，直接安装、修改 `node_modules`，然后生成 patch 文件即可。

然而，当我尝试在项目里使用时，发现 `patch-package` 对 `pnpm` 并不完全支持，会出现一些问题。

## pnpm 自带 patch 功能

于是我又在网上搜了一下，发现 `pnpm` 自带了 patch 功能，正好可以满足需求。操作流程大致如下：

首先，用下面的命令进入补丁编辑模式：

```bash
pnpm patch @wangeditor/editor-for-vue
```

这条命令会在 node_modules/.pnpm_patches 生成一个临时目录，并把包内容复制到里面，进入那个包直接修改内容就行了。

接着，用下面的命令提交补丁：

```bash
pnpm patch-commit @wangeditor/editor-for-vue
```

之后会在项目根目录生成 patches 文件夹，里面就是 patch 文件。
此外，pnpm 还会将几轮添加到 pnpm-workspace.yaml 和 pnpm-lock.yaml 中，下次安装依赖时会自动应用 patch。

```bash
pnpm install
```

整个过程非常流畅，打完补丁之后，模块类型问题完美解决，TypeScript 项目中可以正常获取类型提示了。
