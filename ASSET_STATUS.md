# 原始素材抓取状态

本文件记录原始抓取包中缺少、或由恢复版提供回退处理的资源。目录整理不会自动补造原站图片或音频。

## 图片 / 装饰素材

- `images/opening-celebration-mobile.webp`：原始抓取包没有独立移动端版本；当前文件是桌面版 `opening-celebration.webp` 的回退副本。
- `images/stage-thanks-v2.png`：结束感谢画面原图未取得。
- `images/pairs-reference.webp`：图书馆配对游戏背景原图未取得；配对游戏逻辑仍保留。
- `images/memory/ui/note-tape-envelope.png`
- `images/memory/ui/note-tape-cloud.png`
- `images/memory/ui/note-tape-leaf.png`
- `images/memory/cover/cover-preview.png`：记忆册分享图封面渲染用；普通翻页封面由已取得素材组成。
- `images/role-blue-moon.png`：原图未取得；代码中有已取得的 `images/moon-person-only.png` 回退素材。
- `images/archive/27.png`：旧模板引用，原始抓取包没有该文件；当前角色剧场使用其他已取得角色图。

## 音频素材

- `audio/peach-blossom-smile.mp3`
- `audio/record-pretend.mp3`
- `audio/record-xiaoban.mp3`
- `audio/voice-mom-photo.mp3`
- `audio/voice-dad-photo.mp3`
- `audio/brave-princess.mp3`：记忆册独立播放列表引用；主站已取得 `audio/fairytale-adventure.wav`。

## 其他非静态依赖

- `POST /api/hug`：照相亭生成 AI 拥抱合照的后端接口。抓取包只有前端调用代码，没有服务端实现或模型依赖。
- `manifest.webmanifest`：原始抓取包未提供；恢复版已补充基础 PWA manifest。

本项目保留已取得的原始页面、样式、脚本和素材。以上缺失资源及后端接口不属于本次目录整理范围，因此不能据此宣称像素级 100% 完整复制。
