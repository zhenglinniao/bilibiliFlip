# 调研与技术取舍

调研日期：2026-10-10。

## 采用的方案

1. 使用 Chrome Manifest V3；B 站通过静态内容脚本获得稳定的动态 DOM 监听能力。
2. 其他站点使用 `activeTab + scripting` 按需注入，不申请 `<all_urls>`，缩小权限范围。
3. 使用 CSS `transform` 旋转视频，不操作视频流、不重新编码，因此即时生效且没有画质损失。
4. 不旋转播放器外层容器，避免控制栏、弹幕层和全屏布局一起倾斜。
5. 使用 MutationObserver 处理 B 站单页导航/播放器重建，ResizeObserver 处理播放器尺寸及全屏变化。

## 资料依据

- Chrome Content Scripts：内容脚本可读取并修改页面 DOM，静态声明适合已知站点。  
  https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
- Chrome activeTab：点击扩展或触发扩展快捷键时，临时授予当前标签页访问能力，可避免 `<all_urls>`。  
  https://developer.chrome.com/docs/extensions/develop/concepts/activeTab
- Chrome Commands API：Manifest 可声明扩展快捷键，用户也能在浏览器扩展快捷键页面重映射。  
  https://developer.chrome.com/docs/extensions/reference/api/commands
- Chrome Storage API：扩展上下文可异步持久化少量设置。  
  https://developer.chrome.com/docs/extensions/reference/api/storage
- MDN CSS transform：`transform` 可对可变换元素执行 rotate 和 scale。  
  https://developer.mozilla.org/docs/Web/CSS/transform
- MDN Fullscreen API：全屏可以作用于视频或其祖先元素，因此扩展同时监听 fullscreenchange 和尺寸变化。  
  https://developer.mozilla.org/docs/Web/API/Fullscreen_API/Guide

## 已知边界

- 浏览器内置页面、Chrome Web Store 等受保护页面禁止扩展脚本注入。
- 个别网站使用 Canvas、WebGL 或封闭 Shadow DOM 绘制画面而不是标准 `<video>`，此扩展无法旋转。
- 网站若自身对 `<video>` 使用强制 transform，两个效果可能发生冲突；移除旋转会完整撤销本扩展添加的类与 CSS 变量。
