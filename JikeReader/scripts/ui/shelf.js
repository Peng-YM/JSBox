const utils = require("../utils");
const Storage = require("../domain/data/storage");

const ChapterList = require("./chapter-list");

const modes = {
  NORMAL: 0,
  EDIT: 1
};

class BookShelf {
  constructor({ id = utils.uuidv4(), hidden = false }) {
    this.id = id;
    this.hidden = hidden;

    this.mode = modes.NORMAL;
    this.selected = new Map();
    this.userBooks = new Map();
  }

  render() {
    return {
      type: "view",
      layout: $layout.fill,
      props: {
        id: this.id,
        hidden: this.hidden
      },
      views: [
        this.getHeaderView(),
        this.getBookShelfView(),
        this.getEmptyView()
      ],
      events: {
        ready: () => {
          $app.listen({
            bookshelfNeedUpdate: () => this.refresh()
          });
          $app.listen({
            bookshelfCheckUpdae: () => this.checkUpdate()
          });
          this.refresh();
        }
      }
    };
  }

  refresh() {
    // refresh
    Storage.getInstance()
      .getUserBooks()
      .then(books => {
        this.updateList(books);
        this.checkUpdate();
      })
      .catch(err => {
        console.log(err);
        $ui.error("无法加载书架！");
      });
  }

  switchMode(targetMode) {
    this.mode = targetMode;
    this.selected = new Map();
    switch (targetMode) {
      case modes.NORMAL:
        $("manage").hidden = true;
        break;
      case modes.EDIT:
        $("manage").hidden = false;
        break;
      default:
        console.err("ERROR");
    }
    // update list
    $("book_list").data = this.getDataSource(this.userBooks);
  }

  getHeaderView() {
    return {
      type: "view",
      props: {
        id: "bookshelfHeader"
      },
      views: [
        {
          type: "label",
          props: {
            id: "bookshelfHeaderLabel",
            text: "书架",
            font: $font("Avenir-Black", 35),
            textColor: $color("black"),
            align: $align.center
          },
          layout: function(make, view) {
            make.left.inset(15);
            make.top.inset(50);
            make.height.equalTo(45);
          }
        },
        {
          type: "image",
          props: {
            id: "bookshelfMenu",
            icon: $icon("129", $color("black"), $size(25, 25))
          },
          layout: function(make, view) {
            make.centerY.equalTo($("bookshelfHeaderLabel"));
            make.right.equalTo(view.super.right).inset(20);
          },
          events: {
            tapped: sender => {
              console.log("Clicked");
            }
          }
        },
        {
          type: "image",
          props: {
            id: "manage",
            hidden: true,
            icon: $icon("102", $color("black"), $size(25, 25))
          },
          layout: function(make, view) {
            make.centerY.equalTo($("bookshelfMenu"));
            make.left.equalTo($("bookshelfMenu").left).inset(-50);
          },
          events: {
            tapped: sender => {
              // create menu
              $ui.menu({
                items: ["全选", "删除", "完成"],
                handler: (_, idx) => {
                  this.handleBookManager(idx);
                },
                finished: cancelled => {
                  if (cancelled) {
                    console.log("Cancelled");
                  }
                }
              });
            }
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

  getEmptyView() {
    return {
      type: "view",
      props: {
        id: "empty_view",
        hidden: this.userBooks.size > 0,
        bgcolor: utils.COLOR_PRESETS.light_gray
      },
      layout: function(make, view) {
        make.left.right.bottom.inset(0);
        make.top.equalTo($("bookshelfHeader").bottom);
      },
      views: [
        {
          type: "image",
          props: {
            src: "assets/book.png"
          },
          layout: function(make, view) {
            make.centerX.equalTo(view.super);
            make.centerY.equalTo(view.super).offset(-30);
          }
        },
        {
          type: "label",
          props: {
            text: "这里空空如也",
            font: $font("Avenir-Black", 15),
            textColor: $color("gray")
          },
          layout: function(make, view) {
            make.centerX.equalTo(view.prev);
            make.centerY.equalTo(view.prev.bottom).offset(10);
          }
        }
      ]
    };
  }

  getBookShelfView() {
    return {
      type: "matrix",
      props: {
        id: "book_list",
        bgcolor: utils.COLOR_PRESETS.light_gray,
        hidden: this.userBooks.size === 0,
        columns: $device.isIpad ? 5 : 3,
        itemHeight: 180,
        spacing: 20,
        template: [
          {
            type: "image",
            props: {
              id: "book_cover"
            },
            layout: function(make, view) {
              make.centerX.equalTo(view.super);
              make.size.equalTo($size(100, 145));
            }
          },
          {
            type: "label",
            props: {
              id: "book_name",
              font: $font("Avenir-Black", 12),
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
              id: "book_selected",
              circular: true,
              bgcolor: $color("white")
            },
            layout: function(make, view) {
              make.centerX.equalTo($("book_cover").right).inset(10);
              make.centerY.equalTo($("book_cover").top).inset(10);
            }
          },
          {
            type: "label",
            props: {
              id: "book_unread_chapter",
              circular: true,
              bgcolor: $color("red"),
              textColor: $color("white"),
              align: $align.center,
              font: $font(13),
              hidden: true
            },
            layout: function(make, view) {
              make.centerX.equalTo($("book_cover").left).inset(10);
              make.centerY.equalTo($("book_cover").top).inset(10);
              make.size.equalTo($size(20, 20));
            }
          }
        ],
        data: this.getDataSource(this.userBooks)
      },
      layout: function(make, view) {
        make.width.equalTo(view.super);
        make.left.right.equalTo(0);
        make.top.equalTo(view.prev.bottom);
        make.bottom.inset(0);
      },
      events: {
        didSelect: (sender, indexPath, data) => {
          console.log(`You selected book with id = ${data.id}`);
          switch (this.mode) {
            case modes.EDIT:
              if (this.selected.has(data.id)) {
                // deselect
                this.selected.delete(data.id);
              } else {
                // select
                this.selected.set(data.id, true);
              }
              sender.data = this.getDataSource(this.userBooks);
              break;
            case modes.NORMAL:
              const selectedBook = this.userBooks.get(data.id);
              console.log(`loading chapters for book ${selectedBook.title}`);
              $ui.push(new ChapterList(selectedBook).render());
              break;
          }
        },

        didLongPress: (sender, indexPath, data) => {
          this.switchMode(modes.EDIT);
          this.selected.set(data.id);
          sender.data = this.getDataSource(this.userBooks);
        },

        pulled: sender => {
          this.checkUpdate()
            .catch(err => {
              console.log(err);
              $ui.error("刷新失败！");
            });
          sender.endRefreshing();
        }
      }
    };
  }

  getDataSource(booksMap) {
    let data = [];
    for (let [id, book] of booksMap) {
      let color = $color("gray");
      if (this.mode === modes.EDIT && this.selected.has(id)) {
        color = $color("red");
      }
      let item = {
        id: id,
        book_name: {
          text: utils.cutString(book.title, 8)
        },
        book_cover: {
          src: book.coverURL
        },
        book_selected: {
          icon: $icon("064", color, $size(20, 20)),
          hidden: this.mode === modes.NORMAL
        }
      };
      data.push(item);
    }
    return data;
  }

  handleBookManager(idx) {
    switch (idx) {
      // 全选
      case 0:
        for (let key of this.userBooks.keys()) {
          this.selected.set(key, true);
        }
        this.updateList(this.userBooks);
        break;
      case 1:
        // handle delete
        $ui.alert({
          title: "警告",
          message: `是否删除所选的${this.selected.size}本书籍？`,
          actions: [
            {
              title: $l10n("OK"),
              disabled: false, // Optional
              handler: () => {
                console.log(`Deleting ${this.selected.size} books...`);
                for (let key of this.selected.keys()) {
                  this.userBooks.delete(key);
                }
                Storage.getInstance().removeUserBooks(this.selected.keys());
                this.selected = new Map();
                this.updateList(this.userBooks);
                this.switchMode(modes.NORMAL);
              }
            },
            {
              title: $l10n("CANCEL")
            }
          ]
        });
        break;
      case 2:
        this.switchMode(modes.NORMAL);
    }
  }

  async updateList(newBooks) {
    // update book list status
    this.userBooks = newBooks;
    if (this.userBooks.size > 0) {
      $("book_list").hidden = false;
      $("empty_view").hidden = true;
    } else {
      $("book_list").hidden = true;
      $("empty_view").hidden = false;
    }

    $("book_list").data = this.getDataSource(this.userBooks);
  }

  async checkUpdate() {
    let calls = [];
    let records = new Map();
    for (let key of this.userBooks.keys()) {
      const promise = Storage.getInstance()
        .checkUpdate(key)
        .then(num => {
          records.set(key, num);
        });
      calls.push(promise);
    }
    Promise.all(calls).then(() => {
      let data = $("book_list").data;
      data = data.map(item => {
        const num = records.get(item.id);
        return {
          ...item,
          book_unread_chapter: {
            hidden: num == 0,
            text: num > 99 ? "99" : num.toString()
          }
        };
      });
      $("book_list").data = data;
    });
  }
}

module.exports = BookShelf;
