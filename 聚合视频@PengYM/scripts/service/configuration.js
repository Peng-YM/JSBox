const PATH = "conf/setting.json";

class Configuration {
  static getInstance() {
    if (Configuration.instance === undefined) {
      Configuration.instance = new Configuration();
    }
    return Configuration.instance;
  }

  constructor() {
    this.config = this.loadConf();
    console.log(`当前设置：\n${JSON.stringify(this.config)}`);
  }

  getConf() {
    return this.config;
  }

  loadConf() {
    let file = $file.read(PATH);
    return JSON.parse(file.string);
  }

  writeConf(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    };
    this.saveConf();
  }

  saveConf() {
    $file.write({
      data: $data({ string: JSON.stringify(this.config) }),
      path: PATH
    });
  }
}

module.exports = Configuration;
