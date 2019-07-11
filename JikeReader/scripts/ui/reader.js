class Reader {
  constructor(title, content) {
    this.title = title;
    this.content = content;
    this.contentColor = $rgb(229, 193, 155);
  }

  render() {
    return {
      props: {
        title: this.title,
        navBarHidden: true,
        statusBarHidden: true,
        bgcolor: this.contentColor
      },
      views: [
        {
          type: "text",
          props: {
            html: this.renderHTML(),
            selectable: true,
            editable: false,
            bgcolor: $color("clear")
          },
          layout: $layout.fillSafeArea
        }
      ]
    };
  }

  //  将小说章节转成HTML
  renderHTML() {
    const body = this.content;
//      .split("<br>")
//      .map(text => `<p>${text}</p>`)
//      .reduce((nodes, node) => nodes.concat(node));
    const HTML = `
  <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body>
      <h2 style="width: 100%; text-align:center">${this.title}</h2>
      <div style="text-indent: 30px; font-size: 1.2em; line-height:150%;">
        ${body}
      </div>
    </body>
  </html>
    `;
    return HTML;
  }
}

module.exports = Reader;
