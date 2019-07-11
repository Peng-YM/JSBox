const utils = require("../utils");
const API = require("../domain/service/api");
const Storage = require("../domain/data/storage");

const histories = [];

class BookStore {
  constructor({ id = utils.uuidv4(), hidden = true }) {
    this.id = id;
    this.hidden = hidden;
    this.searchResults = undefined;
  }

  handleSearch(title) {
    console.log(`You are searching for ${title}`);
    histories.push(title);
    this.searchResults = new Map();
    API.searchBooks(title)
      .then(books => {
        console.log(books);
        books.forEach(book => {
          this.searchResults.set(book.id, book);
        });
        $("searchResultsList").data = this.getDataSource(this.searchResults);
        console.log(utils.map2Obj(this.searchResults));
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleSelect(book) {
    $ui.alert({
      title: "确认",
      message: `是否订阅《${book.title}》？`,
      actions: [
        {
          title: $l10n("OK"),
          disabled: false, // Optional
          handler: () => {
            console.log(`Trying to add book 《${book.title}》`);
            this.handleSubscribe(book);
          }
        },
        {
          title: $l10n("CANCEL")
        }
      ]
    });
  }

  handleSubscribe(book) {
    Storage.getInstance()
      .addUserBooks([book.id])
      .then(() => {
        console.log(`Successfully added book ${book.title}`);
        // refresh bookshelf
        $app.notify({
          name: "bookshelfNeedUpdate"
        })
      })
      .catch(err => $console.error(err));
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
        id: "bookStoreHeader"
      },
      views: [
        {
          type: "label",
          props: {
            id: "bookStoreHeaderLabel",
            text: "书城",
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
        this.getSearchBarView()
      ],
      layout: function(make, view) {
        make.left.right.inset(0);
        make.top.equalTo(view.super);
        make.height.equalTo(150);
      }
    };
  }

  getSearchBarView() {
    let searchBar = {
      type: "view",
      props: {
        id: "searchBar",
        clipsToBounds: true
      },
      views: [
        {
          type: "input",
          props: {
            id: "searchBarInput",
            placeholder: "搜索书名或者作者",
            clearOnBeginEditing: true
          },
          layout: function(make, view) {
            make.left.top.inset(10);
            make.right.inset(45);
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
            id: "searchButton",
            src: "assets/filter.png"
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.prev);
            make.left.equalTo(view.prev.right).inset(10);
            make.size.equalTo($size(25, 25));
          }
        }
      ],
      layout: function(make, view) {
        make.left.right.inset(0);
        make.top.equalTo($("bookStoreHeaderLabel").bottom);
        make.height.equalTo(100);
      }
    };
    return searchBar;
  }

  getContentView() {
    return {
      type: "view",
      props: {
        id: "bookStoreContent",
        bgcolor: utils.COLOR_PRESETS.light_gray
      },
      views: [this.getSearchResultView()],
      layout: function(make, view) {
        make.top.equalTo($("bookStoreHeader").bottom);
        make.left.right.bottom.inset(0);
      }
    };
  }

  getSearchResultView() {
    return {
      type: "matrix",
      props: {
        id: "searchResultsList",
        hidden: false,
        itemHeight: 180,
        columns: 1,
        spacing: 5,
        bgcolor: utils.COLOR_PRESETS.light_gray,
        template: {
          props: {
            radius: 5,
            bgcolor: $color("white"),
            selectable: true
          },
          views: [
            {
              type: "image",
              props: {
                id: "book_cover"
              },
              layout: function(make, view) {
                make.left.top.bottom.inset(10);
                make.size.equalTo($size(100, 145));
              }
            },
            {
              type: "label",
              props: {
                id: "book_title",
                font: $font(20)
              },
              layout: function(make, view) {
                make.top.equalTo(view.super).inset(10);
                make.left.equalTo($("book_cover").right).inset(10);
                make.right.inset(10);
              }
            },
            {
              type: "text",
              props: {
                id: "book_short_intro",
                editable: false,
                selectable: false,
                textColor: $color("gray"),
                font: $font(15),
                scrollEnabled: false
              },
              layout: function(make, view) {
                make.top.equalTo($("book_title").bottom).inset(10);
                make.left.equalTo($("book_cover").right).inset(0);
                make.right.inset(10);
                make.height.equalTo(80);
              }
            },
            {
              type: "label",
              props: {
                id: "author",
                textColor: utils.COLOR_PRESETS.blue
              },
              layout: function(make, view) {
                make.bottom.inset(10);
                make.left.equalTo($("book_cover").right).inset(10);
              }
            },
            {
              type: "label",
              props: {
                id: "category",
                borderColor: utils.COLOR_PRESETS.red,
                borderWidth: 2,
                smoothRadius: 2
              },
              layout: function(make, view) {
                make.centerY.equalTo($("author"));
                make.right.inset(20);
              }
            }
          ]
        },
        data: []
      },

      layout: function(make, view) {
        make.top.bottom.equalTo(view.super).offset(5);
        make.left.right.inset(5);
      },

      events: {
        didSelect: (sender, indexPath, data) => {
          const selectedBook = this.searchResults.get(data.id);
          this.handleSelect(selectedBook);
        }
      }
    };
  }

  getHistoryView() {}

  getDataSource(results) {
    let data = [];
    results.forEach(book => {
      data.push({
        id: book.id,
        book_cover: {
          src: book.coverURL
        },
        book_title: {
          text: book.title
        },
        book_short_intro: {
          text: book.description
        },
        author: {
          text: book.author
        },
        category: {
          text: book.type
        }
      });
    });
    return data;
  }
}

module.exports = BookStore;
