/**
 * userBook is a map, id as key, book object as value
 */

/**
 * Book example
 * {
   -------------------------------
    id: 0,
    name: "逆天邪神",
    cover: "http://www.nitianxieshen.com/css/images/xiaoshuo.jpg",
    author: "火星引力",
    lastChapter: "第一章",
    updated: "2019-05-29T12:01:45.762Z",
    wordCount: 5117735,
    shortIntro: "掌天毒之珠，承邪神之血，修逆天之力，一代邪神，君临天下！",
    longIntro: "掌天毒之珠，承邪神之血，修逆天之力，一代邪神，君临天下！",
    isSerial: true
    -------------------------------
  }
 */

/**
 * reading record example
 * {
 *   id: book_id,
 *   readTime: Date,
 *   unreadChapter: 1000
 * }
 */

const API = require("../service/api");
const utils = require("../../utils");

const KEY = {
  USER_BOOKS: "user_books",
  READING_RECORDS: "reading_records"
};

class Storage {
  constructor() {
    this.userBooks = new Map();
    this.readingRecords = new Map();
  }

  static getInstance() {
    if (Storage.instance) {
      return Storage.instance;
    } else {
      console.log("Creating instance...");
      Storage.instance = new Storage();
      return Storage.instance;
    }
  }

  async getUserBooks(ids) {
    this.userBooks = await this.loadCache(KEY.USER_BOOKS);
    this.readingRecords = await this.loadCache(KEY.READING_RECORDS);

    if (ids) {
      let resultSet = new Map();
      let networkIds = [];
      ids.forEach(id => {
        if (this.userBooks.has(id)) {
          // fetch book from cache
          resultSet.set(id, this.userBooks.get(id));
        } else {
          networkIds.push(id);
        }
      });
      // fetch non-local books from API
      const calls = networkIds.map(async id => {
        const book = await API.getBookDetail(id);
        resultSet.set(id, book);
      });
      return Promise.all(calls).then(() => {
        return resultSet;
      });
    } else {
      return this.userBooks;
    }
  }

  async removeUserBooks(ids) {
    for (let id of ids) {
      this.userBooks.delete(id);
    }
    return this.persist(KEY.USER_BOOKS, this.userBooks);
  }

  async addUserBooks(ids) {
    return this.getUserBooks(ids)
      .then(resultSet => {
        for (let [key, value] of resultSet) {
          this.userBooks.set(key, value);
        }
      })
      .then(() => this.persist(KEY.USER_BOOKS, this.userBooks));
  }

  async addReadingRecords(record) {
    console.log(`Adding record ${JSON.stringify(record)}`);
    this.readingRecords.set(record.id, record);
    return this.persist(KEY.READING_RECORDS, this.readingRecords);
  }

  async checkUpdate(id) {
    console.log(`Check update for book ${id}`);
    const record = this.readingRecords.get(id);
    let readingChapter = 0;
    if (record !== undefined) {
      readingChapter = record.readingChapter;
    }
    return API.getChapters(id).then(chapters => {
      return chapters.length - readingChapter;
    });
  }

  loadCache(key) {
    const obj = $cache.get(key);
    if (obj) {
      return utils.obj2Map(obj);
    }
    return new Map();
  }

  async persist(key, data) {
    return new Promise((resolve, reject) => {
      $cache.setAsync({
        key: key,
        value: utils.map2Obj(data),
        handler: () => resolve()
      });
    });
  }
}

module.exports = Storage;
