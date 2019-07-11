const utils = require("../utils");
const VideoPlayer = require("./video-player");
const favoriteManager = require("../service/favorite-manager").getInstance();

const PULLED_OFFSET = -150;

class AlbumDetail {
  constructor(album) {
    this.album = album;
    // 判断是否已经在收藏夹中
    this.inFavorite = favoriteManager.getFavorites().has(this.album.id);
    console.log(JSON.stringify(album));
  }

  handleOpen() {
    $safari.open({
      url: this.album.link,
      entersReader: false
    });
  }

  handleFavorite() {
    if (this.inFavorite) {
      // remove from favorite
      favoriteManager.removeFavorite(this.album.id);
      this.inFavorite = false;
    } else {
      // add to favorite
      favoriteManager.addFavorite(this.album);
      this.inFavorite = true;
    }
    $("heartIconGray").hidden = this.inFavorite;
    $("heartIconRed").hidden = !this.inFavorite;
  }

  handleShare() {
    $share.sheet([this.album.link]);
  }

  playVideo(idx) {
    const selectedVideo = this.album.videos[idx];
    const player = new VideoPlayer(selectedVideo);
    $ui.push(player.render());
  }

  render() {
    const showFavorite = true;
    return {
      props: {
        navBarHidden: true,
        statusBarHidden: true,
        homeIndicatorHidden: true
      },
      views: [
        {
          // In order to generate rowHeight
          type: "text",
          props: {
            hidden: true,
            id: "actor",
            font: $font("PingFangSC-Regular", 13),
            text: "类型: " + this.album.category.join(" | ") || "无",
            insets: $insets(0, 10, 0, 10)
          },
          layout: function(make, view) {
            make.top.bottom.inset(0);
            make.left.right.inset(10);
          }
        },
        {
          // In order to generate rowHeight
          type: "text",
          props: {
            hidden: true,
            id: "summary",
            font: $font("PingFangSC-Regular", 15),
            text: this.album.description.replace(/^\s+/gm, ""),
            insets: $insets(8, 8, 8, 8)
          },
          layout: function(make) {
            make.top.bottom.inset(0);
            make.left.right.inset(11);
          }
        },
        {
          type: "list",
          props: {
            id: "detail",
            bgcolor: $color("white"),
            // bounces: false,
            showsVerticalIndicator: false,
            separatorHidden: true,
            data: this.generateDetailViewData(this.album),
            info: { pulled: null },
            header: {
              type: "view",
              props: {
                // Cover Image
                height: 280 + 20
              },
              views: [
                {
                  type: "image",
                  props: {
                    src: this.album.coverURL
                  },
                  layout: function(make) {
                    make.left.right.inset(0);
                    if ($device.isIphoneX && $app.env == $env.app) {
                      make.top.inset(-30);
                      make.height.equalTo(155);
                    } else {
                      make.top.inset(0);
                      make.height.equalTo(125);
                    }
                  }
                },
                {
                  type: "blur",
                  props: {
                    style: 1
                  },
                  layout: function(make) {
                    make.left.top.right.inset(0);
                    if ($device.isIphoneX && $app.env == $env.app) {
                      make.top.inset(-150);
                      make.height.equalTo(305);
                    } else {
                      make.top.inset(-100);
                      make.height.equalTo(255);
                    }
                  }
                },
                {
                  type: "canvas",
                  layout: function(make, view) {
                    var pre = view.prev;
                    make.bottom.equalTo(pre.bottom);
                    make.height.equalTo(15);
                    make.left.right.inset(0);
                  },
                  events: {
                    draw: function(view, ctx) {
                      var width = view.frame.width;
                      var height = view.frame.height;
                      // Back
                      ctx.fillColor = $color("white");
                      //$color("#F9F9F9")
                      ctx.setAlpha(0.5);
                      ctx.moveToPoint(0, height);
                      ctx.addLineToPoint(0, height * 0.75);
                      ctx.addQuadCurveToPoint(
                        width * 0.6,
                        0,
                        width,
                        height * 0.5
                      );
                      ctx.addLineToPoint(width, height);
                      ctx.fillPath();

                      // Front
                      ctx.fillColor = $color("white");
                      //$color("#F9F9F9")
                      ctx.setAlpha(1);
                      ctx.moveToPoint(0, height);
                      ctx.addQuadCurveToPoint(width * 0.5, 0, width, height);

                      ctx.fillPath();
                    }
                  }
                },
                {
                  // For Image Shadow
                  type: "view",
                  props: {
                    clipsToBounds: false
                  },
                  layout: function(make, view) {
                    // Set Shadow
                    utils.shadowImage(view);
                    make.centerX.equalTo(view.super).offset(-60);
                    make.width.equalTo(200);
                    make.top.inset(20);
                    make.bottom.inset(0);
                  },
                  events: {
                    longPressed: sender => {
                      $device.taptic(1);
                      $quicklook.open({
                        url: this.album.coverURL
                      });
                    }
                  }
                },
                {
                  type: "image",
                  props: {
                    smoothRadius: 5,
                    src: this.album.coverURL
                  },
                  layout: function(make, view) {
                    make.centerX.equalTo(view.super).offset(-60);
                    make.width.equalTo(200);
                    make.top.inset(20);
                    make.bottom.inset(0);
                  }
                },
                {
                  type: "view",
                  props: {
                    alpha: 0.8,
                    clipsToBounds: false,
                    bgcolor: $color("white")
                  },
                  layout: (make, view) => {
                    // Set Rate
                    rate(
                      this.album.score === undefined ? 0.0 : this.album.score
                    );
                    // Set Shadow
                    shadowRate(view);

                    var preView = view.prev;
                    make.left.equalTo(preView.right).offset(20);
                    make.width.height.equalTo(100);
                    make.top.inset(30);
                  },
                  views: [
                    {
                      // Average Rate
                      type: "label",
                      props: {
                        id: "rate",
                        font: $font(45),
                        autoFontSize: true,
                        align: $align.center,
                        textColor: $color("darkGray")
                      },
                      layout: function(make, view) {
                        make.centerX.equalTo(view.super);
                        make.width.height.equalTo(50);
                        make.top.inset(10);
                      }
                    },
                    {
                      type: "label",
                      props: {
                        font: $font("bold", 16),
                        autoFontSize: true,
                        align: $align.center,
                        text: this.album.site
                      },
                      layout: function(make, view) {
                        var preView = view.prev;
                        make.centerX.equalTo(view.super);
                        make.top.equalTo(preView.bottom).offset(5);
                      }
                    }
                  ]
                },
                {
                  // Open
                  type: "button",
                  props: {
                    bgcolor: $color("white"),
                    clipsToBounds: false
                  },
                  layout: function(make, view) {
                    // Set Shadow
                    utils.shadowButton(view);

                    var preView = view.prev;
                    make.centerX.equalTo(preView);
                    make.top.equalTo(preView.bottom).offset(40);
                    make.size.equalTo($size(100, 30));
                  },
                  views: [
                    {
                      type: "image",
                      props: {
                        icon: $icon("042", $color("lightGray"), $size(72, 72)),
                        bgcolor: $color("clear")
                      },
                      layout: function(make, view) {
                        make.centerY.equalTo(view.super);
                        make.width.height.equalTo(16);
                        make.left.inset(10);
                      }
                    },
                    {
                      type: "label",
                      props: {
                        text: $l10n("detail_open"),
                        font: $font("bold", 14),
                        autoFontSize: true,
                        align: true,
                        textColor: $color("lightGray")
                      },
                      layout: function(make, view) {
                        var preView = view.prev;
                        make.centerY.equalTo(view.super);
                        make.left.equalTo(preView.right).offset(10);
                        make.right.inset(10);
                      }
                    }
                  ],
                  events: {
                    tapped: sender => {
                      this.handleOpen();
                    }
                  }
                },
                {
                  // Share
                  type: "button",
                  props: {
                    bgcolor: $color("white"),
                    clipsToBounds: false
                  },
                  layout: function(make, view) {
                    // Set Shadow
                    utils.shadowButton(view);

                    var preView = view.prev;
                    make.centerX.equalTo(preView);
                    make.top.equalTo(preView.bottom).offset(10);
                    make.size.equalTo($size(100, 30));
                  },
                  views: [
                    {
                      type: "image",
                      props: {
                        icon: $icon("022", $color("lightGray"), $size(72, 72)),
                        bgcolor: $color("clear")
                      },
                      layout: function(make, view) {
                        make.centerY.equalTo(view.super);
                        make.width.height.equalTo(16);
                        make.left.inset(10);
                      }
                    },
                    {
                      type: "label",
                      props: {
                        text: $l10n("detail_share"),
                        font: $font("bold", 14),
                        autoFontSize: true,
                        align: true,
                        textColor: $color("lightGray")
                      },
                      layout: function(make, view) {
                        var preView = view.prev;
                        make.centerY.equalTo(view.super);
                        make.left.equalTo(preView.right).offset(10);
                        make.right.inset(10);
                      }
                    }
                  ],
                  events: {
                    tapped: sender => {
                      this.handleShare();
                    }
                  }
                },
                {
                  // Favorite
                  type: "button",
                  props: {
                    bgcolor: $color("white"),
                    clipsToBounds: false,
                    //hidden: !showFavorite
                    enabled: showFavorite,
                    alpha: showFavorite ? 1.0 : 0.4
                  },
                  layout: function(make, view) {
                    // Set Shadow
                    utils.shadowButton(view);

                    var preView = view.prev;
                    make.centerX.equalTo(preView);
                    make.top.equalTo(preView.bottom).offset(10);
                    make.size.equalTo($size(100, 30));
                  },
                  views: [
                    {
                      type: "image",
                      props: {
                        id: "heartIconGray",
                        hidden: this.inFavorite,
                        icon: $icon("061", $color("lightGray"), $size(72, 72)),
                        bgcolor: $color("clear")
                      },
                      layout: function(make, view) {
                        make.centerY.equalTo(view.super);
                        make.width.height.equalTo(16);
                        make.left.inset(10);
                      }
                    },
                    {
                      type: "image",
                      props: {
                        id: "heartIconRed",
                        hidden: !this.inFavorite,
                        icon: $icon("061", $color("red"), $size(72, 72)),
                        bgcolor: $color("clear")
                      },
                      layout: function(make, view) {
                        make.centerY.centerX.equalTo($("heartIconGray"));
                        make.width.height.equalTo(16);
                      }
                    },
                    {
                      type: "label",
                      props: {
                        text: $l10n("detail_favorite"),
                        font: $font("bold", 14),
                        autoFontSize: true,
                        align: true,
                        textColor: $color("lightGray")
                      },
                      layout: function(make, view) {
                        var preView = view.prev;
                        make.centerY.equalTo(view.super);
                        make.left.equalTo(preView.right).offset(10);
                        make.right.inset(10);
                      }
                    }
                  ],
                  events: {
                    tapped: sender => {
                      this.handleFavorite();
                    }
                  }
                },
                {
                  // Pull down
                  type: "label",
                  props: {
                    id: "pull",
                    text: $l10n("detail_pull"),
                    textColor: $color("darkGray"),
                    font: $font("PingFangSC-Medium", 13),
                    align: $align.center,
                    bgcolor: $color("white"),
                    alpha: 0.5,
                    circular: true,
                    hidden: true
                  },
                  layout: function(make) {
                    if ($device.isIphoneX && $app.env == $env.app) {
                      make.top.inset(-60);
                    } else {
                      make.top.inset(-30);
                    }
                    make.height.equalTo(25);
                    make.width.equalTo(180);
                    make.centerX.equalTo();
                  }
                }
              ]
            },
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
            }
          },
          layout: $layout.fill,
          events: {
            rowHeight: function(sender, indexPath) {
              if (indexPath.section == 0) {
                return 110 + $("actor").contentSize.height;
              } else if (indexPath.section == 1) {
                return 2 + $("summary").contentSize.height;
              } else {
                return 230;
              }
            },
            willBeginDragging: function(sender) {
              var offset = sender.contentOffset.y;

              if (offset <= 0) {
                sender.info = { pulled: false };
                $("pull").hidden = false;
              }
            },
            didScroll: function(sender) {
              var offset = sender.contentOffset.y;
              var pulled = sender.info.pulled;

              if (offset <= PULLED_OFFSET && pulled === false) {
                $device.taptic(1);
                sender.info = { pulled: true };
                $("pull")
                  .runtimeValue()
                  .invoke("fadeToText", $l10n("detail_release"));
              } else if (offset > PULLED_OFFSET && pulled === true) {
                sender.info = { pulled: false };
                $("pull")
                  .runtimeValue()
                  .invoke("fadeToText", $l10n("detail_pull"));
              }
            },
            didEndDragging: function(sender) {
              var pulled = sender.info.pulled;

              if (pulled === true) $ui.pop();
              else {
                sender.info = { pulled: null };
                $("pull").hidden = true;
              }
            }
          }
        }
      ]
    };
  }

  generateDetailViewData(album) {
    let d = [
      {
        title: " ",
        rows: [
          {
            type: "view",
            props: {
              bgcolor: $color("white")
            },
            layout: function(make, view) {
              make.top.bottom.inset(0);
              make.left.right.inset(10);
              utils.shadowView(view);
            },
            views: [
              {
                type: "canvas",
                props: {
                  alpha: 0.6
                },
                layout: function(make) {
                  make.height.equalTo(10);
                  make.width.equalTo(25);
                  make.top.inset(15);
                  make.left.inset(15);
                },
                events: {
                  draw: function(sender, ctx) {
                    var width = sender.frame.width;
                    var height = sender.frame.height;

                    ctx.fillColor = $color("lightGray");
                    ctx.moveToPoint(0, 0);
                    ctx.addLineToPoint(10, height * 0.5);
                    ctx.addLineToPoint(0, height);
                    ctx.closePath();
                    ctx.fillPath();

                    ctx.setAlpha(0.5);
                    ctx.moveToPoint(13, 0);
                    ctx.addLineToPoint(width - 2, height * 0.5);
                    ctx.addLineToPoint(13, height);
                    ctx.closePath();
                    ctx.fillPath();
                  }
                }
              },
              {
                type: "canvas",
                props: {
                  alpha: 0.6
                },
                layout: function(make) {
                  make.height.equalTo(10);
                  make.width.equalTo(25);
                  make.top.inset(15);
                  make.right.inset(15);
                },
                events: {
                  draw: function(sender, ctx) {
                    var width = sender.frame.width;
                    var height = sender.frame.height;

                    ctx.fillColor = $color("lightGray");
                    ctx.moveToPoint(width, 0);
                    ctx.addLineToPoint(width - 10, height * 0.5);
                    ctx.addLineToPoint(width, height);
                    ctx.closePath();
                    ctx.fillPath();

                    ctx.setAlpha(0.5);
                    ctx.moveToPoint(width - 12, 0);
                    ctx.addLineToPoint(2, height * 0.5);
                    ctx.addLineToPoint(width - 12, height);
                    ctx.closePath();
                    ctx.fillPath();
                  }
                }
              },
              {
                // Title
                type: "label",
                props: {
                  font: $font("PingFangSC-Medium", 20),
                  text: album.title,
                  align: $align.center
                },
                layout: function(make) {
                  make.height.equalTo(30);
                  make.top.inset(5);
                  make.left.right.inset(45);
                }
              },
              {
                type: "canvas",
                layout: function(make, view) {
                  var pre = view.prev;
                  make.top.equalTo(pre.bottom).offset(5);
                  make.height.equalTo(5);
                  make.left.right.inset(5);
                },
                events: {
                  draw: function(sender, ctx) {
                    var width = sender.frame.width;
                    ctx.setAlpha(0.5);
                    ctx.strokeColor = $color("lightGray");
                    ctx.setLineDash(0, [5, 5], 2);
                    ctx.moveToPoint(0, 0);
                    ctx.addLineToPoint(width, 0);
                    ctx.strokePath();
                  }
                }
              },
              {
                // 热度
                type: "label",
                props: {
                  font: $font("PingFangSC-Regular", 13),
                  attributedText: attributed(
                    "热度: " + `${album.playCount}次播放`
                  ),
                  textColor: $color("darkGray")
                },
                layout: function(make, view) {
                  var preView = view.prev;
                  make.top.equalTo(preView.bottom);
                  make.left.right.inset(15);
                }
              },
              {
                // 类型
                type: "label",
                props: {
                  font: $font("PingFangSC-Regular", 13),
                  attributedText: attributed(
                    "类型: " + (album.category.join(" | ") || "无")
                  ),
                  textColor: $color("darkGray")
                },
                layout: function(make, view) {
                  var preView = view.prev;
                  make.top.equalTo(preView.bottom);
                  make.left.right.inset(15);
                }
              },
              {
                // 基本信息
                type: "label",
                props: {
                  font: $font("PingFangSC-Regular", 13),
                  attributedText: attributed(
                    "基本信息: " +
                      `${album.site} | ${album.channel} | ${
                        album.videos.length
                      }个视频`
                  ),
                  textColor: $color("darkGray")
                },
                layout: function(make, view) {
                  var preView = view.prev;
                  make.top.equalTo(preView.bottom);
                  make.left.right.inset(15);
                }
              },
              {
                // 上映地区
                type: "label",
                props: {
                  font: $font("PingFangSC-Regular", 13),
                  attributedText: attributed("上映地区: " + `${album.region}`),
                  textColor: $color("darkGray")
                },
                layout: function(make, view) {
                  var preView = view.prev;
                  make.top.equalTo(preView.bottom);
                  make.left.right.inset(15);
                }
              }
            ]
          }
        ]
      },
      {
        title: $l10n("detail_description"),
        rows: [
          {
            type: "view",
            props: {
              bgcolor: $color("white")
            },
            layout: function(make, view) {
              make.top.bottom.inset(0);
              make.left.right.inset(10);
              utils.shadowView(view);
            },
            views: [
              {
                type: "text",
                props: {
                  editable: false,
                  selectable: false,
                  scrollEnabled: false,
                  font: $font("PingFangSC-Regular", 15),
                  textColor: $color("darkGray"),
                  text: album.description.replace(/^\s+/gm, ""),
                  insets: $insets(8, 8, 8, 8),
                  align: $align.justified
                },
                layout: function(make, view) {
                  make.edges.inset(1);
                  utils.shadowView(view);
                }
              }
            ]
          }
        ]
      },
      {
        title: $l10n("detail_videos"),
        rows: [
          {
            type: "view",
            props: {
              align: $align.justified,
              inset: $insets(8, 8, 8, 8)
            },
            views: [this.getVideosView()],
            layout: function(make, view) {
              utils.shadowView(view);
              make.top.bottom.inset(0);
              make.left.right.inset(10);
            }
          }
        ]
      }
    ];
    if (album.description.length == 0) {
      d.splice(1, 2);
    }
    return d;
  }

  getVideosView() {
    let columns = 4;
    if ($device.isIpad) {
      columns = 9;
    }
    let view = {
      type: "matrix",
      props: {
        columns: columns,
        itemHeight: 40,
        spacing: 20,
        radius: 5,
        data: this.album.videos.map((v, idx) => {
          return {
            id: idx,
            video_item: {
              text: `第${idx + 1}集`
            }
          };
        }),
        template: {
          views: [
            {
              type: "label",
              props: {
                id: "video_item",
                align: $align.center,
                bgcolor: utils.COLOR_PRESETS.light_gray,
                font: $font("PingFangSC-Regular", 15)
              },
              layout: function(make, view) {
                utils.shadowButton(view);
                make.width.equalTo(60);
                make.height.equalTo(40);
              }
            }
          ]
        }
      },
      layout: $layout.fill,
      events: {
        didSelect: (sender, indexPath, data) => this.playVideo(data.id)
      }
    };
    return view;
  }
}

function rate(number) {
  var rate = number.toFixed(1).toString();
  var string = $objc("NSMutableAttributedString").invoke(
    "alloc.initWithString",
    rate
  );
  string.invoke(
    "addAttribute:value:range:",
    "NSFont",
    $font("bold", 25),
    $range(1, 2)
  );
  string.invoke(
    "addAttribute:value:range:",
    "NSBaselineOffset",
    10,
    $range(1, 2)
  );
  $("rate")
    .runtimeValue()
    .invoke("setAttributedText", string);
}
function shadowRate(view) {
  var layer = view.runtimeValue().invoke("layer");

  layer.invoke("setCornerRadius", 5);
  layer.invoke("setShadowOffset", $size(5, 5));
  layer.invoke(
    "setShadowColor",
    $color("darkGray")
      .runtimeValue()
      .invoke("CGColor")
  );
  layer.invoke("setShadowOpacity", 0.5);
  layer.invoke("setShadowRadius", 10);
}
function attributed(text) {
  var start = 0;
  var end = text.indexOf(" ");

  var string = $objc("NSMutableAttributedString").invoke(
    "alloc.initWithString",
    text
  );
  //string.invoke("addAttribute:value:range:", "NSFont", $font("PingFangSC-Medium", 13), $range(start, end))
  string.invoke(
    "addAttribute:value:range:",
    "NSColor",
    $color("lightGray"),
    $range(start, end)
  );

  var i = 0;
  while (text.indexOf("|", i) != -1) {
    i = text.indexOf("|", i);
    string.invoke(
      "addAttribute:value:range:",
      "NSColor",
      $color("#DDDDDD"),
      $range(i, 1)
    );
    i++;
  }

  return string.rawValue();
}

module.exports = AlbumDetail;
