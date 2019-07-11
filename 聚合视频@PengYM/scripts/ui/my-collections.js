const utils = require("../utils");
const favoriteManager = require("../service/favorite-manager").getInstance();
const AlbumDetailView = require("./album-detail");

const coverWidth = $device.isIpad
  ? $device.info.screen.width / 6
  : $device.info.screen.width / 4;
const coverHeight = coverWidth * (8 / 6);

class MyCollections {
  constructor() {
    this.id = utils.uuidv4();
    this.selected = new Map();
    this.userAlbums = favoriteManager.getFavorites();
  }

  render() {
    return {
      type: "view",
      layout: $layout.fill,
      props: {
        id: this.id
      },
      views: [this.getHeaderView(), this.getContentView(), this.getEmptyView()],
      events: {
        ready: () => {
          // load data when component ready
          $app.listen({
            favoritesUpdated: () => this.refresh()
          });
          this.refresh();
        }
      }
    };
  }

  refresh() {
    console.log(`收藏夹刷新中...`);
    this.userAlbums = favoriteManager.getFavorites();
    $("album_list").data = this.getDataSource(this.userAlbums);

    $("album_list").hidden = this.userAlbums.size == 0;
    $("emptyView").hidden = this.userAlbums.size > 0;
  }

  getHeaderView() {
    return {
      type: "view",
      props: {
        id: "collectionHeader",
        height: 100,
        bgcolor: $color("white")
      },
      views: [
        {
          type: "label",
          props: {
            id: "favorite_label",
            text: "收藏",
            font: $font("Avenir-Black", 35),
            textColor: $color("black"),
            align: $align.center
          },
          layout: function(make, view) {
            make.left.inset(20);
            make.top.inset(50);
            make.bottom.inset(10);
          }
        }
      ]
    };
  }

  getContentView() {
    return {
      type: "matrix",
      props: {
        id: "album_list",
        reorder: true,
        bgcolor: utils.COLOR_PRESETS.light_gray,
        hidden: this.userAlbums.size === 0,
        columns: $device.isIpad ? 5 : 3,
        itemHeight: 180,
        spacing: 20,
        header: this.getHeaderView(),
        template: [
          {
            type: "view",
            props: {
              id: "shadow",
              clipsToBounds: false
            },
            layout: function(make, view) {
              make.width.equalTo(coverWidth);
              make.height.equalTo(coverHeight);
              shadowImage(view, coverWidth, coverHeight);
            }
          },
          {
            type: "image",
            props: {
              id: "album_cover",
              smoothRadius: 3
            },
            layout: function(make, view) {
              make.width.equalTo(coverWidth);
              make.height.equalTo(coverHeight);
              make.centerX.centerY.equalTo($("shadow"));
            }
          },
          {
            type: "label",
            props: {
              id: "album_name",
              font: $font("Avenir-Black", 14),
              align: $align.center
            },
            layout: function(make, view) {
              make.centerX.equalTo(view.prev);
              make.top.equalTo(view.prev.bottom).inset(10);
            }
          },
          {
            type: "image",
            props: {
              id: "album_selected",
              circular: true,
              bgcolor: $color("white")
            },
            layout: function(make, view) {
              make.centerX.equalTo($("album_cover").right).inset(10);
              make.centerY.equalTo($("album_cover").top).inset(10);
            }
          }
        ],
        data: this.getDataSource(this.userAlbums)
      },
      layout: $layout.fill,
      events: {
        didSelect: (sender, indexPath, data) => {
          console.log(`You selected album with id = ${data.id}`);
          const selectedAlbum = this.userAlbums.get(data.id);
          // enter album detail page
          $ui.push(new AlbumDetailView(selectedAlbum).render());
        },
        didScroll: this.onScroll,
        reorderFinished: function(data) {
          console.log("结束排序")
        }
      }
    };
  }

  getDataSource(userAlbums) {
    let data = [];
    for (let [id, album] of userAlbums) {
      let item = {
        id: id,
        album_name: {
          text: utils.cutString(album.title, 8)
        },
        album_cover: {
          src: album.coverURL
        }
      };
      data.push(item);
    }
    return data;
  }

  getEmptyView() {
    return {
      type: "view",
      props: {
        id: "emptyView",
        hidden: this.userAlbums.size > 0
      },
      views: [
        {
          type: "label",
          props: {
            text: "收藏",
            font: $font("Avenir-Black", 35),
            textColor: $color("black"),
            align: $align.center
          },
          layout: function(make, view) {
            make.left.inset(20);
            make.top.inset(50);
          }
        },
        {
          type: "image",
          props: {
            src: "assets/404.png"
          },
          layout: function(make, view) {
            make.centerX.equalTo(view.super);
            make.centerY.equalTo(view.super).offset(-30);
            make.size.equalTo(80);
          }
        },
        {
          type: "label",
          props: {
            text: "这里空空如也",
            font: $font("Avenir-Black", 18),
            textColor: $color("gray")
          },
          layout: function(make, view) {
            make.centerX.equalTo(view.prev);
            make.centerY.equalTo(view.prev.bottom).offset(20);
          }
        }
      ],
      layout: $layout.fill
    };
  }
}

function shadowImage(view, width, height) {
  var layer = view.runtimeValue().invoke("layer");

  var subLayer = $objc("CALayer").invoke("layer");
  subLayer.invoke("setFrame", $rect(0, 0, width, height));
  subLayer.invoke(
    "setBackgroundColor",
    $color("white")
      .runtimeValue()
      .invoke("CGColor")
  );
  subLayer.invoke("setMasksToBounds", false);
  subLayer.invoke("setShadowOffset", $size(10, 10));
  subLayer.invoke(
    "setShadowColor",
    $color("gray")
      .runtimeValue()
      .invoke("CGColor")
  );
  subLayer.invoke("setShadowOpacity", 0.5);
  subLayer.invoke("setShadowRadius", 10);
  layer.invoke("addSublayer", subLayer);
}

module.exports = MyCollections;
