const port = 9000;
const options = {"port": port};
const baseURI = `http://localhost:${port}/`;
const server = $server.new();

function startServer(){
    server.addHandler({
        response: request => {
          let url = request.url;
          let name = url.substring(url.indexOf(baseURI) + baseURI.length);
          let path = `assets/www/${decodeURIComponent(name)}`;
          return {
            type: "file",
            props: {
              path: path
            }
          }
        }
      });
      
      server.start(options);
}

function stopServer(){
    server.stop();
}

function show(){
    startServer();
    $ui.render({
        props: {
            navBarHidden: true,
            statusBarHidden: true,
            homeIndicatorHidden: true,
            bgcolor: $rgba(237, 194, 46, 0.5)
        },
        views: [{
            type: "web",
            props: {
                id: "container",
                url: `http://localhost:${port}/index.html`,
                scrollEnabled: false,
                showsHorizontalIndicator: false,
                showsVerticalIndicator: false,
            },
            layout: $layout.fill
        }, {
            type: "button",
            props: {
                id: "exitBtn",
                title: "退出",
                bgcolor: $rgb(237, 194, 46)
            },
            layout: function(make, view){
                make.size.equalTo($size(60, 40));
                make.left.right.inset(0);
                make.bottom.equalTo(view.super).offset(0);
            },
            events: {
                tapped: () => {
                    // stop server
                    stopServer();
                    // exit app
                    $app.close();
                }
            }
        }],
        layout: $layout.fillSafeArea
    });
}

module.exports = {
    show
}