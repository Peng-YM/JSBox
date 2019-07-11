const utils = require("../utils");
const SupportView = require("./support");

const confManager = require("../service/configuration").getInstance();
const parserManager = require("../service/parser").getInstance();
const managerView = require("./parser-manager");

class Settings {
  constructor() {
    this.id = utils.uuidv4();
  }

  render() {
    return {
      type: "list",
      layout: $layout.fill,
      props: {
        id: this.id,
        header: this.getHeaderView(),
        bgcolor: utils.COLOR_PRESETS.light_gray,
        showsVerticalIndicator: false,
        info: { pulled: null },
        footer: {
          type: "view",
          props: {
            height: 50
          },
          views: [
            {
              type: "label",
              props: {
                text: $l10n("detail_footer"),
                font: $font(12),
                textColor: $color("#AAAAAA"),
                align: $align.center
              },
              layout: function(make) {
                make.left.top.right.inset(10);
              }
            }
          ]
        },
        data: this.generateSettingData()
      },
      events: {
        didScroll: this.onScroll
      }
    };
  }

  generateSettingData() {
    const defaultParserId = confManager.getConf().defaultParser;
    let currentParser = parserManager.getAPIs().get(defaultParserId);
    const parsers = [...parserManager.getAPIs().values()];
    let d = [
      {
        title: "搜索设置",
        rows: [
          this.makeOptionSwitch(
            "过滤低相关性结果",
            confManager.getConf().filterSearchResults,
            sender => {
              console.log(sender.on);
              confManager.writeConf({
                filterSearchResults: sender.on
              });
            }
          ),
          this.makeOptionSwitch(
            "智能排序",
            confManager.getConf().sortSearchResult,
            sender => {
              confManager.writeConf({
                sortSearchResult: sender.on
              });
            }
          )
        ]
      },
      {
        title: "视频解析设置",
        rows: [
          {
            type: "view",
            views: [
              {
                type: "label",
                props: {
                  text: "默认解析接口"
                },
                layout: (make, view) => {
                  make.centerY.equalTo(view.super);
                  make.left.inset(15);
                }
              },
              {
                type: "label",
                props: {
                  id: "currentParserLabel",
                  text: currentParser.name || currentParser.url,
                  textColor: $color("gray"),
                  font: $font(14)
                },
                layout: (make, view) => {
                  make.centerY.equalTo(view.super);
                  make.right.inset(15);
                }
              }
            ],
            layout: $layout.fill,
            events: {
              tapped: sender => {
                $ui.menu({
                  items: [...parserManager.getAPIs().values()]
                  .filter(parser => parser.enabled)
                  .map(parser => {
                    if (parser.id === currentParser.id) {
                      return `${parser.name}(选中)`;
                    } else {
                      return parser.name;
                    }
                  }),
                  handler: function(title, idx) {
                    currentParser = parsers[idx];
                    confManager.writeConf({
                      defaultParser: currentParser.id
                    });
                    $("currentParserLabel").text =
                      currentParser.name || currentParser.link;
                  }
                });
              }
            }
          },
          {
            type: "view",
            views: [
              {
                type: "label",
                props: {
                  text: "解析接口管理"
                },
                layout: (make, view) => {
                  make.centerY.equalTo(view.super);
                  make.left.inset(15);
                }
              },
              {
                type: "label",
                props: {
                  text: ">",
                  textColor: $color("gray"),
                  font: $font(14)
                },
                layout: (make, view) => {
                  make.centerY.equalTo(view.super);
                  make.right.inset(15);
                }
              }
            ],
            layout: $layout.fill,
            events: {
              tapped: () => {
                $ui.push(new managerView().render());
              }
            }
          }
        ]
      },
      {
        title: "关于",
        rows: [
          {
            type: "view",
            views: [
              {
                type: "label",
                props: {
                  text: "支持与赞赏👏",
                  font: $font("bold", 17),
                  textColor: $color("red")
                },
                layout: (make, view) => {
                  make.centerY.equalTo(view.super);
                  make.left.inset(15);
                }
              },
              {
                type: "label",
                props: {
                  text: ">",
                  textColor: $color("gray"),
                  font: $font(14)
                },
                layout: (make, view) => {
                  make.centerY.equalTo(view.super);
                  make.right.inset(15);
                }
              }
            ],
            layout: $layout.fill,
            events: {
              tapped: sender => {
                $ui.push(new SupportView().render());
              }
            }
          }
        ]
      }
    ];
    return d;
  }

  makeOptionSwitch(title, initialSwitchStatus, onSwitch) {
    return {
      type: "view",
      views: [
        {
          type: "label",
          props: {
            text: title
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super);
            make.left.inset(15);
          }
        },
        {
          type: "switch",
          props: {
            on: initialSwitchStatus
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super);
            make.right.inset(10);
          },
          events: {
            changed: onSwitch
          }
        }
      ],
      layout: $layout.fill
    };
  }

  getHeaderView() {
    return {
      type: "view",
      props: {
        id: "searchHeader",
        bgcolor: $color("white"),
        height: 110
      },
      views: [
        {
          type: "label",
          props: {
            text: "设置",
            font: $font("Avenir-Black", 35),
            textColor: $color("black"),
            align: $align.center
          },
          layout: function(make, view) {
            make.left.inset(20);
            make.top.inset(50);
            make.height.equalTo(65);
          }
        }
      ],
      layout: $layout.fill
    };
  }
}

module.exports = Settings;
