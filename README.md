# 视频转转

一个轻量的 Manifest V3 浏览器扩展，用于旋转网页里的主视频，重点适配哔哩哔哩 Web 播放器。

## 功能

- 一键切换 `0° / 90° / 180° / 270°`
- 顺时针、逆时针逐次旋转
- 90° 与 270° 时自动缩放，完整显示画面
- 兼容 B 站普通模式、网页全屏和浏览器全屏
- 监听动态播放器，B 站切集或播放器重建后自动重新应用
- 可选择刷新页面后恢复上次角度
- 快捷键：`Alt + Shift + R` 顺时针、`Alt + Shift + L` 逆时针
- 除 B 站外，也可以点击扩展图标后临时用于其他 HTML5 视频网站

## 本地安装

1. 打开 Chrome 或 Edge 的扩展管理页：
   - Chrome：`chrome://extensions/`
   - Edge：`edge://extensions/`
2. 开启右上角的“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择本项目根目录（包含 `manifest.json` 的目录）。
5. 打开一个 B 站视频，点击工具栏中的“视频转转”。

修改代码后，在扩展管理页点击本扩展的“重新加载”即可。

## 权限说明

- `storage`：保存“记住上次角度”的设置。
- `activeTab`：只在用户点击扩展或按快捷键时，临时作用于当前非 B 站网页。
- `scripting`：把旋转逻辑注入用户主动操作的当前网页。
- `bilibili.com` 主机权限：让 B 站播放器在页面加载和动态切集后持续可用。

扩展不联网、不收集数据，也不读取视频内容。

## 快捷键设置

浏览器可能占用某些组合键。可在 `chrome://extensions/shortcuts` 或 `edge://extensions/shortcuts` 中重新绑定，也可以给“恢复视频方向”添加快捷键。

## 开发与验证

核心角度和缩放计算不依赖第三方库：

```powershell
node tests/core.test.js
```

重新生成图标：

```powershell
powershell -ExecutionPolicy Bypass -File tools/make-icons.ps1
```

## Edge 商店上架材料

完整的 Partner Center 文案、隐私政策、权限说明、审核步骤、300×300 Logo 和 1280×800 截图位于 `store/`。商店专用扩展包可使用以下命令重新生成：

```powershell
powershell -ExecutionPolicy Bypass -File tools/build-store-package.ps1
```

提交前请按 `store/submission-checklist.md` 替换联系邮箱并完成账号侧信息。

## 实现说明

扩展只给检测到的主 `<video>` 元素添加 CSS 变换，因此播放器控制栏和弹幕层保持正常方向。主视频通过播放器容器优先级与可见面积判断；`MutationObserver` 处理单页导航和播放器替换，`ResizeObserver` 处理全屏与窗口尺寸变化。

对于 90°/270°，缩放比例按 `min(宽/高, 高/宽)` 计算，避免旋转后的画面被播放器边界裁切。
