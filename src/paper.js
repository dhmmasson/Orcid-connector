/**
 * @class Paper
 * @property {string} title
 * @property {string[]} authors
 * @property {Keyword[]} keywords
 */
class Paper {
  /**
   * @param {string} title
   * @param {string[]} authors
   * @param {string[]} keywords
   */

  constructor(title, authors, keywords) {
    this.title = title;
    this.authors = authors;
    this.keywords = keywords;
  }
}
