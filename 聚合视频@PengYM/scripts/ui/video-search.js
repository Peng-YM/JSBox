const utils = require("../utils");
const videoSearch = require("../service/videoSearch");
const AlbumDetailView = require("./album-detail");
const common = require("./common");

class VideoSearch {
  constructor() {
    this.id = utils.uuidv4();
    this.albumList = [];
  }

  render() {
    return {
      type: "view",
      layout: $layout.fill,
      props: {
        id: this.id
      },
      views: [this.getHeaderView(), this.getContentView()],
      events: {
        ready: () => {
          // load data when component ready
        }
      }
    };
  }

  handleSearch(text) {
    const video_name = text.trim();
    if (video_name.length > 0) {
      // perform search
      console.log(`搜索视频：${video_name}`);
      videoSearch(video_name).then(result => {
        const resultIsEmpty = result.length == 0;
        console.log(result);
        this.updateSearchList(result);
        if(resultIsEmpty){
          common.customToast("无搜索结果！", true);
        }
      });
    }
  }

  getHeaderView() {
    return {
      type: "view",
      props: {
        id: "searchHeader",
        bgcolor: $color("white"),
        height: 180
      },
      views: [
        {
          type: "label",
          props: {
            id: "searchHeaderLabel",
            text: "视频搜索",
            font: $font("Avenir-Black", 35),
            textColor: $color("black"),
            align: $align.center
          },
          layout: function(make, view) {
            make.left.inset(20);
            make.top.inset(50);
            make.height.equalTo(65);
          }
        },
        this.getSearchBarView()
      ]
    };
  }

  getSearchBarView() {
    let searchBar = {
      type: "view",
      props: {
        clipsToBounds: true
      },
      views: [
        {
          type: "input",
          props: {
            id: "searchInput",
            placeholder: "搜索视频",
            clearOnBeginEditing: true
          },
          layout: function(make, view) {
            make.left.top.inset(10);
            make.right.inset(40);
            make.height.equalTo(35);
          },
          events: {
            returned: sender => {
              this.handleSearch(sender.text);
              sender.blur();
            }
          }
        },
        {
          type: "image",
          props: {
            icon: $icon("023", $color("black"), $size(20, 20)),
            bgcolor: $color("clear")
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.prev);
            make.left.equalTo(view.prev.right).inset(10);
            make.size.equalTo($size(25, 25));
          },
          events: {
            tapped: () => {
              this.handleSearch($("searchInput").text);
              $("searchInput").blur();
            }
          }
        }
      ],
      layout: function(make, view) {
        make.left.right.inset(10);
        make.top.equalTo($("searchHeaderLabel").bottom);
        make.height.equalTo(100);
      }
    };
    return searchBar;
  }

  getContentView() {
    const loadingView = {
      type: "spinner",
      props: {
        id: "loadingSpinner",
        loading: false
      },
      layout: function(make, view) {
        make.center.equalTo(view.super);
        make.size.equalTo($size(100, 100));
      }
    };

    const contentView = {
      type: "view",
      props: {
        id: "searchContent",
        bgcolor: utils.COLOR_PRESETS.light_gray
      },
      views: [loadingView, this.getSearchListView()],
      layout: $layout.fill
    };
    return contentView;
  }

  getSearchListView() {
    return {
      type: "matrix",
      props: {
        id: "searchResultList",
        hidden: false,
        itemHeight: 180,
        columns: 1,
        spacing: 8,
        bgcolor: utils.COLOR_PRESETS.light_gray,
        header: this.getHeaderView(),
        template: {
          props: {
            radius: 8,
            bgcolor: $color("white"),
            selectable: true
          },
          views: [
            {
              type: "image",
              props: {
                id: "cover"
              },
              layout: function(make, view) {
                make.left.top.bottom.inset(0);
                make.size.equalTo($size(120, 180));
              }
            },
            {
              type: "label",
              props: {
                id: "title",
                font: $font(20)
              },
              layout: function(make, view) {
                make.top.equalTo(view.super).inset(10);
                make.left.equalTo($("cover").right).inset(10);
                make.right.inset(10);
              }
            },
            {
              type: "text",
              props: {
                id: "description",
                editable: false,
                selectable: false,
                textColor: $("gray"),
                font: $font(15),
                scrollEnabled: false
              },
              layout: function(make, view) {
                make.top.equalTo($("title").bottom).inset(10);
                make.left.equalTo($("cover").right).inset(0);
                make.right.inset(10);
                make.height.equalTo(80);
              }
            },
            {
              type: "label",
              props: {
                id: "site",
                textColor: utils.COLOR_PRESETS.blue
              },
              layout: function(make, view) {
                make.bottom.inset(10);
                make.left.equalTo($("cover").right).inset(10);
              }
            }
          ],
          layout: function(make, view) {
            make.left.right.inset(10);
            utils.shadowView(view);
          }
        },
        data: [],
        footer: {
          type: "view",
          props: {
            bgcolor: utils.COLOR_PRESETS.light_gray
          },
          layout: function(make, view) {
            make.left.right.inset(0);
            make.top.equalTo($("searchResultList").bottom);
            make.height.equalTo(250);
          }
        }
      },
      layout: $layout.fill,
      events: {
        didSelect: (sender, indexPath, data) => {
          const selectedAlbum = this.albumList[indexPath.row];
          console.log(`加载视频：${selectedAlbum.title}`);
          $ui.push(new AlbumDetailView(selectedAlbum).render());
        },
        didScroll: this.onScroll
      }
    };
  }

  updateSearchList(albumList) {
    this.albumList = albumList;

    let data = [];
    albumList.forEach(album => {
      data.push({
        id: album.id,
        cover: {
          src: album.coverURL
        },
        title: {
          text: album.title
        },
        site: {
          text: album.site
        },
        description: {
          text: album.description
        }
      });
    });
    $("searchResultList").data = data;
  }
}

module.exports = VideoSearch;
