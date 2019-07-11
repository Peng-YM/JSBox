const utils = require("../utils");
const parserManager = require("../service/parser").getInstance();
const common = require("./common");
const confManager = require("../service/configuration").getInstance();

class ManagerView {
  constructor() {
    this.currentParserList = [...parserManager.getAPIs().values()];
    this.defaultParserIdx = 0;
    for (let i = 0; i < this.currentParserList.length; i++) {
      if (
        confManager.getConf().defaultParser === this.currentParserList[i].id
      ) {
        this.defaultParserIdx = i;
        break;
      }
    }
    console.log(`默认接口索引:${this.defaultParserIdx}`);
  }

  handleAddParser(name, url, enabled) {
    const parser = {
      id: utils.uuidv4(),
      url,
      name,
      enabled
    };
    console.log(`添加新解析接口：${JSON.stringify(parser)}`);
    common.customToast(`添加 ${parser.name}`);
    parserManager.addAPI(parser);
    this.currentParserList.push(parser);
    this.refresh();
  }

  handleChangeParserStatus(id) {
    const parser = parserManager.getAPIs().get(id);
    console.log(`改变接口${parser.id}状态`);
    common.customToast(`${parser.name} 已${parser.enabled ? "禁用" : "启用"}`);
    parserManager.changeAPI(id, {
      ...parser,
      enabled: !parser.enabled
    });
    this.refresh();
  }

  handleRemoveParser(idx) {
    const parserToBeDeleted = this.currentParserList[idx];
    common.customToast(`${parserToBeDeleted.name} 已删除`);
    parserManager.removeAPI(parserToBeDeleted.id);
    this.currentParserList.splice(idx, 1);
    this.refresh();
  }

  refresh() {
    this.defaultParserIdx = 0;
    for (let i = 0; i < this.currentParserList.length; i++) {
      if (
        confManager.getConf().defaultParser === this.currentParserList[i].id
      ) {
        this.defaultParserIdx = i;
        break;
      }
    }
    console.log(`当前接口列表:\n${JSON.stringify(this.currentParserList)}`);
  }

  render() {
    return {
      props: {
        navBarHidden: true,
        statusBarHidden: true,
        homeIndicatorHidden: true,
        bgcolor: $color("white")
      },
      views: [
        {
          type: "list",
          props: {
            id: "main_list",
            header: this.getHeaderView(),
            bgcolor: utils.COLOR_PRESETS.light_gray,
            footer: common.getFooter(),
            data: this.generateData(),
            actions: [
              {
                title: "delete",
                color: $color("red"),
                handler: (sender, indexPath) => {
                  this.handleRemoveParser(indexPath.row);
                }
              }
            ]
          },
          layout: $layout.fillSafeArea,
          events: {
            ready: () => {
              common.customToast("列表左滑可以删除接口");
            },
            rowHeight: (sender, indexPath) => {
              if (indexPath.section == 1) {
                return 50;
              }
            },
            swipeEnabled: (sender, indexPath) => {
              return (
                indexPath.section == 1 && indexPath.row != this.defaultParserIdx
              );
            }
          }
        }
      ],
      layout: $layout.fill
    };
  }

  generateData() {
    return [
      {
        title: "新增接口",
        rows: [
          {
            type: "input",
            props: {
              id: "parser_name",
              placeholder: "接口名称",
              bgcolor: $color("white")
            },
            layout: function(make, view) {
              make.top.bottom.inset(0);
              make.left.right.inset(10);
            }
          },
          {
            type: "input",
            props: {
              id: "parser_url",
              bgcolor: $color("white"),
              placeholder: "接口URL (http://www.xxx.com?url=)"
            },
            layout: function(make, view) {
              make.top.bottom.inset(0);
              make.left.right.inset(10);
            }
          },
          {
            type: "view",
            views: [
              {
                type: "label",
                props: {
                  text: "是否启用该接口"
                },
                layout: (make, view) => {
                  make.centerY.equalTo(view.super);
                  make.left.inset(15);
                }
              },
              {
                type: "switch",
                props: {
                  id: "parser_enabled",
                  on: true
                },
                layout: (make, view) => {
                  make.centerY.equalTo(view.super);
                  make.right.inset(10);
                }
              }
            ],
            layout: $layout.fill
          },
          {
            type: "label",
            props: {
              text: "新增接口",
              align: $align.center,
              bgcolor: $rgb(230, 230, 230)
            },
            layout: $layout.fill,
            events: {
              tapped: () => {
                const parser_name = $("parser_name").text.trim();
                const parser_url = $("parser_url").text.trim();
                const parser_enabled = $("parser_enabled").on;

                // validation
                if (parser_name.length == 0) {
                  $ui.error("接口名称不能为空");
                  $("parser_name").focus();
                } else if (parser_url.length == 0) {
                  $ui.error("接口URL不能为空");
                  $("parser_url").focus();
                } else {
                  $("parser_url").blur();
                  $("parser_name").blur();
                  $("parser_url").text = "";
                  $("parser_name").text = "";
                  this.handleAddParser(parser_name, parser_url, parser_enabled);
                }
              }
            }
          }
        ]
      },
      {
        title: "接口列表",
        rows: this.generateParserListData()
      }
    ];
  }

  generateParserListData() {
    return this.currentParserList.map((parser, idx) => {
      return {
        type: "view",
        views: [
          {
            type: "label",
            props: {
              text:
                parser.name +
                `${idx === this.defaultParserIdx ? " (使用中)" : ""}`
            },
            layout: (make, view) => {
              make.top.inset(5);
              make.left.inset(15);
            }
          },
          {
            type: "label",
            props: {
              text: parser.url,
              textColor: $color("lightGray"),
              font: $font(12)
            },
            layout: (make, view) => {
              make.left.inset(15);
              make.top.equalTo(view.prev.bottom).offset(5);
            }
          },
          {
            type: "switch",
            props: {
              on: parser.enabled,
              hidden: idx === this.defaultParserIdx
            },
            events: {
              changed: () => {
                this.handleChangeParserStatus(parser.id);
              }
            },
            layout: function(make, view) {
              make.centerY.equalTo(view.super);
              make.right.inset(10);
            }
          }
        ],
        layout: $layout.fill
      };
    });
  }

  getHeaderView() {
    return {
      type: "view",
      props: {
        id: "parserManagerViewHeader",
        bgcolor: $color("white"),
        height: 50
      },
      views: [
        {
          type: "label",
          props: {
            text: "解析接口管理",
            font: $font("Avenir-Black", 20),
            textColor: $color("black"),
            align: $align.center
          },
          layout: function(make, view) {
            make.left.inset(15);
            make.centerY.equalTo(view.super);
          }
        }
      ],
      layout: $layout.fill
    };
  }
}

module.exports = ManagerView;
