const API = require("../domain/service/api");
const utils = require("../utils");

const Reader = require("./reader");

const Storage = require("../domain/data/storage");

class ChapterList {
  constructor(book) {
    this.book = book;
    this.chapters = [];
  }

  handleChapterListUpdate() {
    API.getChapters(this.book.id)
      .then(chapters => chapters.reverse())
      .then(chapters => {
        this.chapters = chapters;
        $("chapter_list").data = this.chapters.map(c => c.title);
      })
      .catch(err => $ui.error("无法加载章节列表！"));
  }

  handleChapterSelect(row) {
    const { title, url } = this.chapters[row];
    // add reading record
    Storage.getInstance().addReadingRecords({
      id: this.book.id,
      readingChapter: this.chapters.length - row,
      readTime: new Date()
    });
    console.log(`Reading chapter ${this.chapters.length - row}`);
    $app.notify({
      name: "bookshelfNeedUpdate"
    });
    // resolve chapter
    API.resolveChapter(url).then(content => {
      $ui.push(new Reader(title, content).render());
    });
  }

  render() {
    const rowHeight = 50;
    return {
      props: {
        title: this.book.title,
        statusBarStyle: 0,
        navBarHidden: true
      },
      views: [
        {
          type: "list",
          layout: $layout.fillSafeArea,
          props: {
            id: "chapter_list",
            data: this.chapters.map(c => c.title),
            rowHeight: rowHeight,
            showsVerticalIndicator: false,
            header: {
              type: "label",
              props: {
                id: "book_name",
                align: $align.center,
                font: $font("Avenir-Black", 20),
                text: this.book.title
              }
            }
          },
          events: {
            ready: () => this.handleChapterListUpdate(),
            didSelect: (sender, indexPath, data) =>
              this.handleChapterSelect(indexPath.row),
            didScroll: sender => {
              let currentRow = (sender.contentOffset.y / rowHeight).toFixed(0);
              $("goto").value = currentRow / this.chapters.length;
            }
          }
        },
        {
          type: "slider",
          props: {
            id: "goto",
            min: 0,
            max: 1,
            minColor: utils.COLOR_PRESETS.light_gray,
            maxColor: utils.COLOR_PRESETS.light_gray
          },
          layout: function(make, view) {
            make.width.equalTo(view.super.height).offset(-150);
            make.height.equalTo(50);
            make.centerY.equalTo(view.super);
          },
          events: {
            ready: () => {
              $("goto").rotate(Math.PI / 2);
              $("goto").updateLayout(function(make, view) {
                make.centerX.equalTo(view.super.right).offset(-20);
              });
            },
            changed: sender => {
              let rowToScrolled = (this.chapters.length * sender.value).toFixed(
                0
              );
              $("chapter_list").scrollTo({
                indexPath: $indexPath(0, rowToScrolled),
                animated: false // 默认为 true
              });
            }
          }
        }
      ]
    };
  }
}

module.exports = ChapterList;
