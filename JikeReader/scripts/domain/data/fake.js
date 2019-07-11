const API = require("../service/api");
async function generateFakeUserBooks() {
  const results = await API.searchBooks("逆天");
  const calls = results.map(async book => {
    return API.getBookDetail(book.id);
  });
  const books = await Promise.all(calls);
  const booksMap = new Map();
  books.forEach(book => booksMap.set(book.id, book));
  return booksMap;
}

module.exports = generateFakeUserBooks;
