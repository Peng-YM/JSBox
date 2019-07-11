/**erots
id: 5ceca4327b968a007671ff1d
build: 2
*/
/// 下载助手v1.0
/// 可以自动下载剪贴板的链接，或者手动输入
/// 注意输入文件名的时候需要加上拓展名
var link = $clipboard.link;
var name;

$ui.render({
  views: [
    {
      type: "input",
      props: {
        id: "inputLink",
        placeholder: "下载链接",
        text: link,
        clearOnBeginEditing: true
      },
      layout: function(make, view) {
        make.height.equalTo(40);
        make.left.right.top.inset(10);
      },
      events: {
        returned: function(sender) {
          link = sender.text;
          sender.blur();
        }
      }
    },
    {
      type: "input",
      props: {
        id: "inputName",
        placeholder: "文件名(不填写则使用服务器提供的文件名)"
      },
      layout: function(make, view) {
        make.height.equalTo(40);
        make.left.right.inset(10);
        make.top.equalTo($("inputLink").bottom).offset(10);
      },
      events: {
        returned: function(sender) {
          name = sender.text;
          sender.blur();
        }
      }
    },

    {
      type: "button",
      props: {
        id: "downloadBtn",
        title: "下载"
      },
      layout: function(make, view) {
        make.top.equalTo($("inputName").bottom).offset(10);
        make.height.equalTo(50);
        make.left.inset(10);
      },
      events: {
        tapped: function(sender) {
          download(link, name);
        }
      }
    },
    {
      type: "button",
      props: {
        id: "cancelBtn",
        title: "取消"
      },
      layout: function(make, view) {
        make.top.equalTo($("inputName").bottom).offset(10);
        make.height.equalTo(50);
        make.left.equalTo($("downloadBtn").right).offset(10);
        make.right.inset(10);
        make.width.equalTo($("downloadBtn"));
      },
      events: {
        tapped: function(sender) {
          $app.close();
        }
      }
    }
  ]
});

function download(link, name) {
  if (link) {
    $http.download({
      url: link,
      showsProgress: true, // Optional, default is true
      progress: function(bytesWritten, totalBytes) {
        var percentage = (bytesWritten * 1.0) / totalBytes;
        $ui.progress(percentage, `下载中(${parseInt(percentage * 100)}%)`);
      },
      handler: function(resp) {
        if (resp.error) {
          $ui.alert("下载失败！");
        } else {
          if (name) {
            $share.sheet([name, resp.data]);
          } else {
            $share.sheet(resp.data);
          }
        }
      }
    });
  } else {
    $ui.alert("没有链接！");
  }
}
