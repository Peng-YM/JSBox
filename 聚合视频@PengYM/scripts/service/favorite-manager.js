const CACHE_KEY = "FAVORITES";
const utils = require("../utils");

class FavoriteManager {
  static getInstance() {
    if (FavoriteManager.instance === undefined) {
      FavoriteManager.instance = new FavoriteManager();
    }
    return FavoriteManager.instance;
  }

  constructor() {
    this.favorites = this.loadFavorite();
    console.log("收藏夹内容Start：-------------------------------");
    this.favorites.forEach(v => {
      console.log(v.title);
    });
    console.log("收藏夹内容End：-------------------------------");
  }

  getFavorites() {
    return this.favorites;
  }

  addFavorite(item) {
    console.log(`成功添加《${item.title}》到收藏夹！`);
    this.favorites.set(item.id, item);
    this.saveFavorite(this.favorites);
    console.log("收藏夹内容Start：-------------------------------");
    this.favorites.forEach(v => {
      console.log(v.title);
    });
    console.log("收藏夹内容End：-------------------------------");
  }

  removeFavorite(key) {
    console.log(`成功将《${this.favorites.get(key).title}》从收藏夹移除！`);
    this.favorites.delete(key);
    this.saveFavorite(this.favorites);
    console.log("收藏夹内容Start：-------------------------------");
    this.favorites.forEach(v => {
      console.log(v.title);
    });
    console.log("收藏夹内容End：-------------------------------");
  }

  loadFavorite() {
    console.log(`正在加载收藏夹...`);
    // load cache
    let result = $cache.get(CACHE_KEY);
    if (result) {
      return utils.obj2Map(result);
    } else {
      result = new Map();
      this.saveFavorite(result);
      return result;
    }
  }

  saveFavorite(favorites) {
    console.log(`正在保存收藏夹...`);
    $app.notify({
      name: "favoritesUpdated"
    });
    $cache.set(CACHE_KEY, utils.map2Obj(favorites));
  }
}

module.exports = FavoriteManager;
