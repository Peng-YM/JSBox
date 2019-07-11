// const api = {
//     id: "uuid", // key
//     name: "接口1", // 接口名称
//     url: "https://cdn.yangju.vip/k/?url=", // 解析地址
//     enabled: true // 是否启用该接口
// };

const confManager = require("./configuration").getInstance();


class Parser {
  static getInstance() {
    if (Parser.instance) {
      return Parser.instance;
    } else {
      Parser.instance = new Parser();
      return Parser.instance;
    }
  }

  constructor() {
    this.apis = this.loadAPIs();
    this.apis.forEach(api => console.log(`加载API：${api.url}`));
  }

  getAPIs() {
    return this.apis;
  }

  addAPI(api) {
    this.apis.set(api.id, api);
    this.saveAPIs(this.apis);
  }

  removeAPI(key){
    this.apis.delete(key);
    this.saveAPIs(this.apis);
  }

  changeAPI(key, newAPI) {
    const oldAPI = this.apis.get(key);
    if (oldAPI) {
      this.apis.set(key,newAPI);
    }
    this.saveAPIs(this.apis);
  }

  loadAPIs() {
    console.log(`正在加载API...`);
    const userAPIs = confManager.getConf().apis;

    // load user APIs
    const apis = new Map();
    userAPIs.forEach(api => {
      console.log(`加载API: ${api.url}`);
      apis.set(api.id, api);
    });
    return apis;
  }

  async saveAPIs(apis) {
    console.log(`正在保存API改动...`);
    confManager.writeConf({
      apis: [...apis.values()]
    });
  }
}

module.exports = Parser;
