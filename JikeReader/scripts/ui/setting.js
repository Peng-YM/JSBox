const utils = require("../utils");
class Settings {
  constructor({ id = utils.uuidv4(), hidden = true }) {
    this.id = id;
    this.hidden = hidden;
  }
  render() {
    return {
      type: "view",
      props: {
        id: this.id,
        hidden: this.hidden
      },
      layout: $layout.fill,
      views: [this.getHeaderView(), this.getContentView()]
    };
  }
  getHeaderView() {
    return {
      type: "view",
      props: {
        height: 100
      },
      views: [
        {
          type: "label",
          props: {
            id: "settingHeader",
            text: "设置",
            font: $font("Avenir-Black", 35),
            textColor: $color("black"),
            align: $align.center
          },
          layout: function(make, view) {
            make.left.inset(15);
            make.top.inset(50);
            make.height.equalTo(45);
          }
        }
      ],
      layout: function(make, view) {
        make.left.right.inset(0);
        make.top.equalTo(view.super);
        make.height.equalTo(100);
      }
    };
  }
  getContentView() {
    return {
      type: "list",
      layout: function(make, view) {
        make.top.equalTo($("settingHeader").bottom);
        make.left.right.bottom.inset(0);
      },
      props: {
        id: "settingContent",
        bgcolor: utils.COLOR_PRESETS.light_gray,
        data: [
          {
            title: "关于",
            rows: ["在Github上关注我", "请我喝咖啡", "给我提建议"]
          },
          {
            title: "版权所有©Peng-YM"
          }
        ]
      },
      events: {
        didSelect: (sender, indexPath, data) => {
          switch (indexPath.section) {
            case 0:
              switch (indexPath.row) {
                // Github
                case 0:
                  console.log("Opening Repository");
                  $safari.open({
                    url: "https://www.github.com/Peng-YM",
                    entersReader: false
                  });
                  break;
                // 打赏
                case 1:
                  $ui.push({
                    type: "view",
                    props: {
                      title: "赞赏码"
                    },
                    views: [
                      {
                        type: "image",
                        props: {
                          src: "assets/code.png"
                        },
                        layout: $layout.fill
                      }
                    ]
                  });
                  break;
                // Issues
                case 2:
                  $safari.open({
                    url: "https://github.com/Peng-YM/JikeReader/issues",
                    entersReader: false
                  });
                  break;
              }
              break;
          }
        }
      }
    };
  }
}

module.exports = Settings;
