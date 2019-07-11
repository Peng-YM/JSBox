const base = "http://129.211.99.50:3000";
// const base = "http://192.168.1.137:3000";

async function getBookDetail(id) {
  const url = `${base}/books/${id}`;
  return new Promise(function(resolve, reject) {
    $http.get({
      url: encodeURI(url),
      handler: function(resp) {
        const data = resp.data;
        const book = {
          ...data,
          // updated: new Date(data.updated)
        };
        resolve(book);
      }
    });
  });
}

async function searchBooks(name) {
  console.log(name)
  const url = `${base}/books/search?name=${name}`;
  return new Promise(function(resolve, reject) {
    $http.get({
      url: encodeURI(url),
      timeout: 200,
      handler: function(resp) {
        console.log(resp.data)
        const resultSet = resp.data;
        resolve(resultSet);
      }
    });
  });
}

async function getChapters(id) {
  const url = `${base}/books/${id}`;
  return new Promise(function(resolve, reject) {
    $http.get({
      url: encodeURI(url),
      handler: function(resp) {
        const chapters = resp.data.chapters;
        resolve(chapters);
      }
    });
  });
}

async function resolveChapter(link) {
  const url = `${base}/chapters/${encodeURIComponent(link)}`;
  console.log(`Resolving chapter ${url}`)
  return new Promise(function(resolve, reject) {
    $http.get({
      url: url,
      handler: function(resp) {
        var data = resp.data;
        const text = data.content;
        resolve(text);
      }
    });
  });
}

module.exports = {
  getBookDetail,
  searchBooks,
  getChapters,
  resolveChapter
};
