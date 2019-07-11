const parser = require("../service/parser").getInstance();
const confManager = require("../../conf/configuration")
  .getInstance();

class VideoPlayer {
  constructor(video) {
    const conf = confManager.getConf();
    this.video = video;
    this.apis = parser.getAPIs();
    // 设置默认解析接口
    this.currentParser = this.apis.get(conf.defaultParser);
    // 展开字典成数组
    this.apis = [...this.apis.values()];
  }

  render() {
    return {
      props: {
        navBarHidden: true,
        statusBarHidden: true,
        homeIndicatorHidden: true,
        bgcolor: $color("black")
      },
      views: [
        // 浏览器界面
        {
          type: "web",
          props: {
            id: "player",
            url: this.getVideoURL(),
            bgcolor: $color("black"),
            script: function(){
              
              var images = document.getElementsByTagName("img")
                  for (var i=0; i<images.length; ++i) {
                    var element = images[i]
                    element.onclick = function(event) {
                      console.log("tapped img")
                      return false
                    }
                  }
                  var iframes = document.getElementsByTagName("iframe")
                  console.log(`there are ${iframes.length} iframes`)
            }
          },
          layout: $layout.fillSafeArea
        },
        // 换源按钮，位于右下角
        {
          type: "button",
          props: {
            radius: 5,
            title: "换源"
          },
          layout: (make, view) => {
            make.width.equalTo(60);
            make.height.equalTo(40);
            make.right.inset(10);
            make.bottom.equalTo(view.super).offset(-40);
          },
          events: {
            tapped: sender => {
              this.showChangeParserMenu();
            }
          }
        }
      ],
      layout: $layout.fill
    };
  }

  getVideoURL() {
    const url = `${this.currentParser.url}${encodeURIComponent(
      this.video.link
    )}`;
    console.log(`视频URL：${url}`);
    return url;
  }

  // 显示换源菜单
  showChangeParserMenu() {
    $ui.menu({
      items: this.apis
      .filter(parser => parser.enabled)
      .map(parser => {
        if (parser.id === this.currentParser.id) {
          return `${parser.name}(选中)`;
        } else {
          return parser.name;
        }
      }),
      handler: (title, idx) => {
        this.currentParser = this.apis[idx];
      },
      finished: cancelled => {
        if (!cancelled) {
          $("player").stopLoading();
          $("player").url = this.getVideoURL();
        }
      }
    });
  }
}

module.exports = VideoPlayer;
