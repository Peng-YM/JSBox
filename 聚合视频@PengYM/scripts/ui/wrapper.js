const utils = require("../utils");

class ListWrapper {
  constructor(id, title, listClass) {
    this.list = new listClass();
    this.id = id;
    this.title = title;

    // components id
    this.listHeaderId = utils.uuidv4();

    // bind scroll event
    this.list.onScroll = sender => {
      this.onScroll(sender.contentOffset.y);
    };
  }

  show() {
    $(this.id).hidden = false;
  }

  hide() {
    $(this.id).hidden = true;
  }

  onScroll(y) {
    if (y > 65) {
      $(this.listHeaderId).hidden = false;
    } else {
      $(this.listHeaderId).hidden = true;
    }
  }

  render() {
    const view = {
      type: "view",
      props: {
        id: this.id
      },
      layout: $layout.fill,
      views: [
        // inner list view
        {
          type: "view",
          // list should fill parent
          layout: function(make, view) {
            make.width.equalTo(view.super);
            make.top.inset(0);
            make.bottom.inset(0);
            make.centerX.equalTo(view.super);
          },
          views: [this.list.render()]
        },
        // list header view
        {
          type: "view",
          props: {
            id: this.listHeaderId,
            hidden: true,
            alpha: 1
          },
          // header should stick in the top of the parent, height = 65
          layout: function(make, view) {
            make.left.top.right.inset(0);
            if ($device.info.version >= "11") {
              make.bottom.equalTo(view.super.topMargin).offset(40);
            } else {
              make.height.equalTo(65);
            }
          },
          views: [
            {
              type: "view",
              props: {
                bgcolor: $color("white")
              },
              layout: $layout.fill
            },
            {
              type: "view",
              layout: function(make, view) {
                make.left.bottom.right.inset(0);
                make.height.equalTo(45);
              },
              views: [
                {
                  type: "label",
                  props: {
                    text: this.title,
                    font: $font("bold", 17),
                    align: $align.center,
                    bgcolor: $color("clear")
                  },
                  layout: $layout.fill
                }
              ]
            }
          ]
        }
      ]
    };
    return view;
  }
}

module.exports = ListWrapper;
