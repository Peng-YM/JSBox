const Tab = require("./ui/tabs");
const Shelf = require("./ui/shelf");
const BookStore = require("./ui/store");
const Settings = require("./ui/setting");

const items = [
  {
    icon: "057",
    text: "书架"
  },
  {
    icon: "023",
    text: "书城"
  },
  {
    icon: "002",
    text: "设置"
  }
];

const contentViews = [new Shelf({}), new BookStore({}), new Settings({})];

let currentTab = 0;

function changeView(selectedTab) {
  if (currentTab === selectedTab) {
    return;
  }

  //if (selectedTab === 0) {
  //   contentViews[0].refresh();
  //}

  $(contentViews[currentTab].id).hidden = true;
  $(contentViews[selectedTab].id).hidden = false;
  currentTab = selectedTab;
}

function show() {
  let myTab = new Tab(items, changeView);
  $ui.render({
    props: {
      id: "mainView",
      navBarHidden: true,
      statusBarStyle: 0
    },
    views: [
      {
        type: "blur",
        props: {
          style: 5
        },
        layout: function(make, view) {
          make.left.bottom.right.inset(0);
          make.top.equalTo(view.super.safeAreaBottom).offset(-50);
        }
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
          layout: function(make, view) {
            make.width.equalTo(view.super);
            make.left.right.top.inset(0);
            make.height.equalTo(20);
          }
        }
      },
      myTab.render(),
      {
        type: "canvas",
        layout: function(make, view) {
          var preView = view.prev;
          make.top.equalTo(preView.top);
          make.height.equalTo(1);
          make.left.right.inset(0);
        },
        events: {
          draw: function(view, ctx) {
            var width = view.frame.width;
            var scale = $device.info.screen.scale;
            ctx.strokeColor = $color("gray");
            ctx.setLineWidth(1 / scale);
            ctx.moveToPoint(0, 0);
            ctx.addLineToPoint(width, 0);
            ctx.strokePath();
          }
        }
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white")
        },
        layout: function(make, view) {
          make.width.equalTo(view.super);
          make.left.right.top.inset(0);
          make.height.equalTo(20);
        }
      },
      {
        type: "view",
        props: {
          id: "content",
          bgcolor: $color("clear"),
          clipsToBounds: true
        },
        layout: function(make, view) {
          make.width.equalTo(view.super);
          make.left.right.inset(0);
          make.bottom.equalTo($(myTab.id).top);
          make.top.equalTo(view.super.safeAreaTop);
        },
        views: contentViews.map(v => v.render())
      }
    ]
  });
}

module.exports = {
  show: show
};
