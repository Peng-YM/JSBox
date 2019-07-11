/**
 * tabs = {
 *  icon: string,
 *  text: string
 * }
 */

let utils = require("../utils");

class Tab {
  constructor(items, handleSelect, selectedId) {
    this.id = utils.uuidv4();
    this.items = items;
    this.handleSelect = handleSelect;
    this.selectedId = selectedId;
  }

  render() {
    return {
      type: "matrix",
      props: {
        id: this.id,
        columns: this.items.length,
        itemHeight: 50,
        spacing: 0,
        scrollEnabled: false,
        bgcolor: $color("clear"),
        template: [
          {
            type: "image",
            props: {
              id: "menu_image",
              bgcolor: $color("clear")
            },
            layout: function(make, view) {
              make.centerX.equalTo(view.super);
              make.width.height.equalTo(25);
              make.top.inset(7);
            }
          },
          {
            type: "label",
            props: {
              id: "menu_label",
              font: $font(10)
            },
            layout: function(make, view) {
              var preView = view.prev;
              make.centerX.equalTo(preView);
              make.bottom.inset(5);
            }
          }
        ],
        data: this.dataSource()
      },
      layout: function(make, view) {
        make.height.equalTo(50);
        make.left.right.equalTo(0);
        make.bottom.equalTo(view.super.safeAreaBottom);
      },
      events: {
        didSelect: (sender, indexPath, data) => {
          this.selectedId = indexPath.row;
          sender.data = this.dataSource();
          this.handleSelect(indexPath.row);
        }
      }
    };
  }

  dataSource() {
    return this.items.map((tab, index) => {
      let color = this.selectedId == index ? $color("blue") : $color("black");
      return {
        menu_image: {
          icon: $icon(tab.icon, color, $size(25, 25))
        },
        menu_label: {
          text: tab.text,
          textColor: color
        }
      };
    });
  }
}

module.exports = Tab;
