// ==UserScript==
// @name         Nexus Toolbox(For EU)
// @name:zh-CN   Nexus Toolbox(For EU)
// @namespace    goodwe.nexus.toolbox
// @version      1.0.2
// @description  右下角 ⚙ 打开面板，每个功能都有独立开关，可即时开启/关闭（无需刷新）：库存可用量（自动选组织/自动筛可用量/排序优化）、预留单（隐藏预留数量为0的行/悬停ISO周数/库存状态筛选/默认每页条数）、挪库存（挪用公共库存按钮，含创建→提交→跨库挪单→撤回→删除闭环）、跨库挪单（去除仓库必选限制）、新增预留单（「添加行Beta」：用库存可用量(page)接口跨仓库搜索并加明细行）。设置存本地，并自动继承旧脚本原有设置。
// @description:zh-CN 右下角 ⚙ 打开面板，每个功能都有独立开关，可即时开启/关闭（无需刷新）：库存可用量（自动选组织/自动筛可用量/排序优化）、预留单（隐藏预留数量为0的行/悬停ISO周数/库存状态筛选/默认每页条数）、挪库存（挪用公共库存按钮，含创建→提交→跨库挪单→撤回→删除闭环）、跨库挪单（去除仓库必选限制）、新增预留单（「添加行Beta」：用库存可用量(page)接口跨仓库搜索并加明细行）。设置存本地，并自动继承旧脚本原有设置。
// @author       Ryan
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ij48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIxNCIgZmlsbD0iIzQwOWVmZiIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgsOCkgc2NhbGUoMikiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiLz48cGF0aCBkPSJNMTkuNCAxNWExLjY1IDEuNjUgMCAwIDAgLjMzIDEuODJsLjA2LjA2YTIgMiAwIDAgMSAwIDIuODMgMiAyIDAgMCAxLTIuODMgMGwtLjA2LS4wNmExLjY1IDEuNjUgMCAwIDAtMS44Mi0uMzMgMS42NSAxLjY1IDAgMCAwLTEgMS41MVYyMWEyIDIgMCAwIDEtMiAyIDIgMiAwIDAgMS0yLTJ2LS4wOUExLjY1IDEuNjUgMCAwIDAgOSAxOS40YTEuNjUgMS42NSAwIDAgMC0xLjgyLjMzbC0uMDYuMDZhMiAyIDAgMCAxLTIuODMgMCAyIDIgMCAwIDEgMC0yLjgzbC4wNi0uMDZhMS42NSAxLjY1IDAgMCAwIC4zMy0xLjgyIDEuNjUgMS42NSAwIDAgMC0xLjUxLTFIM2EyIDIgMCAwIDEtMi0yIDIgMiAwIDAgMSAyLTJoLjA5QTEuNjUgMS42NSAwIDAgMCA0LjYgOWExLjY1IDEuNjUgMCAwIDAtLjMzLTEuODJsLS4wNi0uMDZhMiAyIDAgMCAxIDAtMi44MyAyIDIgMCAwIDEgMi44MyAwbC4wNi4wNmExLjY1IDEuNjUgMCAwIDAgMS44Mi4zM0g5YTEuNjUgMS42NSAwIDAgMCAxLTEuNTFWM2EyIDIgMCAwIDEgMi0yIDIgMiAwIDAgMSAyIDJ2LjA5YTEuNjUgMS42NSAwIDAgMCAxIDEuNTEgMS42NSAxLjY1IDAgMCAwIDEuODItLjMzbC4wNi0uMDZhMiAyIDAgMCAxIDIuODMgMCAyIDIgMCAwIDEgMCAyLjgzbC0uMDYuMDZhMS42NSAxLjY1IDAgMCAwLS4zMyAxLjgyVjlhMS42NSAxLjY1IDAgMCAwIDEuNTEgMUgyMWEyIDIgMCAwIDEgMiAyIDIgMiAwIDAgMS0yIDJoLS4wOWExLjY1IDEuNjUgMCAwIDAtMS41MSAxeiIvPjwvZz48L3N2Zz4=
// @match        https://crm.goodwe.com:2001/*
// @run-at       document-idle
// @grant        none
// @downloadURL  https://cdn.jsdelivr.net/gh/1274706509/Nexus-Toolbox@main/Nexus-Toolbox.user.js
// ==/UserScript==
