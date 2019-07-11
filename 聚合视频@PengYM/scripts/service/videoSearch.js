const base = "http://mv.688ing.com";

const confManager = require("./configuration")
  .getInstance();
  
function albumSearch(video_name) {
  const conf = confManager.getConf();
  console.log(`Searching for ${video_name} ...`);
  const encoded_name = encodeURIComponent(video_name);
  const url = `${base}/video/ml/${encoded_name}`;
  const regexp = /\{"data"[\S\s]+/;
  return $http.get(url)
    .then(resp => {
      const html = resp.data;
      const data = JSON.parse(regexp.exec(html)[0]).data.docinfos;
      console.log(JSON.stringify(data));
      return data ? data : [];
    })
    .then(items =>
      conf.filterSearchResults ? items.filter(i => i.pos == 1) : items
    )
    .then(items =>
      conf.sortSearchResults ? items.sort((a, b) => a.pos - b.pos) : items
    )
    .then(items => Promise.all(items.map(item => extractAlbumInfo(item))))
    .then(items => items.filter(i => i.videos.length > 0));
}

// 重构返回的对象
async function extractAlbumInfo(rawAlbum) {
  const info = rawAlbum.albumDocInfo;
  const videos = await getAlbumVideos(rawAlbum.doc_id) || [];
  return {
    id: rawAlbum.doc_id, // id
    score: info.score || 0.0, // 评分
    playCount: info.playCount || 0, // 播放量
    coverURL: info.albumImg, // 封面URL
    title: info.albumTitle, // 标题
    description: info.video_lib_meta.description || "", // 描述
    category: info.video_lib_meta.category || [], // 分类
    channel: info.channel ? info.channel.split(",")[0] : "未知频道", // 频道
    site: info.siteName || "来源未知", // 站点名称
    link: info.video_lib_meta.link, // 链接
    region: info.video_lib_meta.region || "未知地区",
    videos
  };
}

async function getAlbumVideos(id){
  const url = `http://search.video.iqiyi.com/m?if=video_library&video_library_type=play_source&platform=1&ls=1&site=&key=${id}`;
  return $http.get(url)
    .then(resp => resp.data)
    .then(resp => {
      return resp.video_info === undefined ? [] :  resp.video_info.map(item => {
        return {
          title: item.title,
          link: item.play_url
        }
      });
    })
}

module.exports = albumSearch;
