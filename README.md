# 噜噜晓生日探险网站（分类整理版）

## 文件夹结构

```text
luluxiao-organized/
├─ index.html                 # 网站首页（直接放在项目根目录）
├─ manifest.webmanifest       # PWA 配置
├─ css/                       # 所有 CSS 样式
│  ├─ styles.css
│  ├─ adventure.css
│  ├─ paper-play.css
│  ├─ stage-ui.css
│  ├─ opening-depth.css
│  ├─ journey-refinements.css
│  ├─ mobile-fit.css
│  └─ memory/                 # 记忆相册页面样式
├─ js/                        # 所有 JavaScript
│  ├─ app.js
│  ├─ adventure.js
│  ├─ paper-play.js
│  ├─ stage-ui.js
│  ├─ journey-refinements.js
│  ├─ illustrated-games.js
│  ├─ memory/                 # 记忆相册翻页逻辑
│  └─ vendor/                 # 翻页与截图依赖库
├─ images/                    # 所有图片、SVG 插画
│  ├─ archive/
│  ├─ memory/
│  │  ├─ cover/
│  │  └─ photos/
│  └─ reference/
├─ audio/                     # 音乐、语音、音效
├─ fonts/                     # 本地字体
│  └─ memory/
└─ pages/
   └─ memory/
      └─ index.html           # 朋友群像记忆册子页面
```

## 本地查看

建议使用 VS Code 的 Live Server，或在项目根目录运行：

```bash
python -m http.server 8080
```

浏览器访问 `http://localhost:8080/`。首页文件就是根目录下的 `index.html`。

## 部署到宝塔 / Nginx

将本项目内的全部文件和文件夹上传到网站根目录，确保 `index.html` 直接位于网站根目录。不要只上传 HTML 文件；CSS、JS、images、audio、fonts 和 pages 文件夹都需要一起上传。

无需 Node.js、MySQL 或 Docker。建议通过 HTTP/HTTPS 服务访问，不要只把 HTML 单独复制出来，否则相对路径资源无法加载。

## 说明

本次只调整文件夹组织和资源引用路径，保留现有页面内容、样式、脚本与已取得的素材。抓取包中原本缺失的资源仍会在 `ASSET_STATUS.md` 中列出；原站 `/api/hug` 后端接口也不包含在静态前端项目内。
