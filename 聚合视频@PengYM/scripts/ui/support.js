class SupportDeveloper {
  render() {
    return {
      props: {
        navBarHidden: true,
        statusBarHidden: true,
        homeIndicatorHidden: true
      },
      views: [
        {
          type: "image",
          props: {
            id: "QRCode",
            src: "assets/wechat.JPG"
          },
          layout: (make, view) => {
            make.centerX.centerY.equalTo(view.super);
            make.size.equalTo($size(300, 400));
          }
        }
      ]
    };
  }
}

module.exports = SupportDeveloper;
