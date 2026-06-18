静态电影网站生成完成

文件说明：
- index.html：网站首页，包含 Hero 轮播、热门分类、推荐、排行入口。
- categories.html：分类总览页。
- categories/*.html：12 个独立分类页，合计覆盖全部影片。
- archive.html：完整片库索引，包含 2000 个影片卡片。
- ranking.html：排行榜页面。
- search.html：搜索页面。
- movies/movie-1.html 至 movies/movie-2000.html：2000 个影片详情页。
- assets/style.css、assets/site.js、assets/player.js：站点样式与交互逻辑。
- streams/sample.m3u8：本地 HLS 播放源，用于验证播放器点击与播放逻辑。

图片说明：
请将 1.jpg 到 150.jpg 放在网站顶级目录。ZIP 中未包含 JPG 文件。
封面按影片顺序循环引用：第 N 部影片使用 ((N - 1) % 150) + 1.jpg。

部署建议：
请通过静态服务器访问，例如 Nginx、Apache、宝塔、Vercel、Netlify 或任意静态托管服务。
如直接双击本地 HTML，部分浏览器会限制 HLS 模块加载，建议使用本地静态服务器预览。
