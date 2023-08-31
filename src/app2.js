const fetch = require("node-fetch");
const DeepL = require("@vitalets/deepl-api");
const deepL = new DeepL(process.env.DEEPL_API_KEY);

// Data store
class DataStore {
  constructor() {
    this.papers = [];
    this.keywords = [];
    this.authors = [];
  }

  getPaper(doi) {
    return this.papers.find((paper) => paper.doi === doi);
  }
  /**
   *
   * @param author(Author object, or idHal, or name)
   * @returns
   */
  getPaperByAuthor(author) {
    author = this.getAuthor(author);
    return this.papers.filter((paper) => paper.authors.includes(author));
  }

  /**
   *
   * @param author (Author object, or idHal, or name)
   * @returns
   */
  getAuthor(author) {
    if (author instanceof Author) {
      return author;
    } else if (typeof author === "string") {
      return this.authors.find(
        (author) => author.idHal === idHal || author.names.includes(names)
      );
    }
  }

  /**
   *
   * @param {string} keyword
   * @returns
   */
  getKeyword(keyword) {
    return this.keywords.find((keyword) => keyword.original === original);
  }

  /** Create or Get Keywoord
   *
   * @param {string} keyword
   * @returns Keyword object
   */
  getOrCreateKeyword(keyword) {
    let keywordObject = this.getKeyword(keyword);
    if (!keywordObject) {
      keywordObject = new Keyword(keyword);
      this.keywords.push(keywordObject);
    }
    return keywordObject;
  }
}

/**
 * @class Paper
 * @property {string} doi
 * @property {string} title
 * @property {Author[]} authors
 * @property {Keyword[]} keywords
 */
class Paper {
  /**
   * @param {string} doi
   * @param {string} title
   * @param {Author[]} authors
   * @param {Keyword[]} Keywords
   * */
  constructor(doi, title, keywords, authors) {
    this.doi = doi;
    this.title = title;
    this.keywords = keywords;
    this.authors = authors;
  }
}

/**
 * @class Author
 * @property {string} idHal
 *  @property {string} name
 */
class Author {
  constructor(idHal, name) {
    this.idHal = idHal;
    this.names = [name];
    this.papers = [];
    this.keywords = [];
    this.associatedAuthors = [];
  }

  addName(name) {
    if (!this.names.includes(name)) {
      this.names.push(name);
    }
  }

  addPaper(paper) {
    if (!this.papers.includes(paper)) {
      this.papers.push(paper);
    }
  }

  addKeyword(keyword) {
    if (!this.keywords.includes(keyword)) {
      this.keywords.push(keyword);
    }
  }
}

class Keyword {
  constructor(original, paper) {
    this.original = original;
    this.english = "";
    this.cleaned = "";
    this.sorted = [];
    this.papers = [paper];
    this.authors = [];
    this.related = [];
  }

  translate() {
    this.english = deepL.translate({
      text: this.original,
      targetLang: "en-US",
    });
    return this;
  }

  clean() {
    this.cleaned = this.original
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    this.sorted = this.cleaned.split(" ").sort();
  }

  addPaper(paper) {
    if (!this.papers.includes(paper)) {
      this.papers.push(paper);
    }
  }
}

class KeywordRelation {
  constructor(keyword1, keyword2) {
    this.keyword1 = keyword1;
    this.keyword2 = keyword2;
    this.commonWords = keyword1.sorted.filter((word) => {
      keyword2.sorted.includes(word);
    });
    this.strength =
      this.commonWords.length /
      Math.max(keyword1.sorted.length, keyword2.sorted.length);
    this.commonWords = commonWords;
  }
}

// class AuthorRelation {
//   constructor(author1, author2, keywordRelations) {
//     this.author1 = author1;
//     this.author2 = author2;
//     this.keywordRelations = keywordRelations;
//   }
// }

// // Functions
// const getOrCreateAuthor = (idHal, names) => {
//   let author = dataStore.authors.find(
//     (author) => author.idHal === idHal || author.names.includes(names)
//   );

//   if (!author) {
//     author = new Author(idHal, names);
//     dataStore.authors.push(author);
//   }

//   return author;
// };

// const createOrUpdateKeyword = async (keywordStr) => {
//   const cleanedKeyword = keywordStr
//     .replace(/[^\w\s]/gi, '')
//     .trim()
//     .toLowerCase();
//   const sortedWords = cleanedKeyword.split(' ').sort();

//   // Check if keyword already exists
//   let keyword = dataStore.keywords.find(
//     (keyword) => keyword.sorted.join() === sortedWords.join()
//   );

//   if (!keyword) {
//     // If not, translate the keyword to English using Deepl API
//     const translationResult = await deepL.translate({
//       text: cleanedKeyword,
//       targetLang: 'EN',
//     });
//     const englishKeyword = translationResult.translations[0].text;

//     keyword = new Keyword(
//       keywordStr,
//       englishKeyword,
//       cleanedKeyword,
//       sortedWords
//     );
//     dataStore.keywords.push(keyword);
//   }

//   return keyword;
// };

// const createOrUpdatePaper = async (title, keywordStrs, authorIds, authorNames) => {
//   const keywords = [];
//   const authors = [];

//   // Get or create author objects and add papers to author object
//   for (let i = 0; i < authorIds.length; i++) {
//     const authorIdHal = authorIds[i];
//     const authorNamesStr = authorNames[i];
//     const author = getOrCreateAuthor(authorIdHal, authorNamesStr);
//     authors.push(author);
//     author.papers.push(title);
//   }

//   // Create or update keyword objects and add papers and authors to keyword objects
//   for (let i = 0; i < keywordStrs.length; i++) {
//     const keywordStr = keywordStrs[i];
//     const keyword = await createOrUpdateKeyword(keywordStr);
//     keywords.push(keyword);
//     keyword.papers.push(title);
//     keyword.authors

// // Add authors to paper
// doc.authFullNameIdHal_fs.forEach(nameId => {
// const [name, idHal] = nameId.split('FacetSep');
// const author = getOrCreateAuthor(dataStore, idHal, name);
// author.aliases.push(name);
// author.papers.push(paper);
// paper.authors.push(author);
// });

// // Add paper to keyword
// doc.keyword_s.forEach(keywordString => {
// const keyword = getOrCreateKeyword(dataStore, keywordString);
// keyword.papers.push(paper);
// paper.keywords.push(keyword);
// });

// // Create/update keyword relations
// dataStore.keywords.forEach((keyword1, index1) => {
// const keyword1Words = new Set(keyword1.sorted);
// keyword1.related = keyword1.related || [];
// dataStore.keywords.slice(index1).forEach((keyword2, index2) => {
// if (keyword1 === keyword2) return;
// const keyword2Words = new Set(keyword2.sorted);
// const commonWords = new Set([...keyword1Words].filter(word => keyword2Words.has(word)));
// if (commonWords.size > 0) {
// const strength = commonWords.size / Math.max(keyword1Words.size, keyword2Words.size);
// const relation = { keyword1, keyword2, strength, commonWords: [...commonWords] };
// keyword1.related.push(relation);
// keyword2.related.push(relation);
// }
// });
// });

// // Create/update author relations
// const authorIds = new Set(paper.authors.map(author => author.idHal));
// paper.authors.forEach((author1, index1) => {
// author1.related = author1.related || [];
// paper.authors.slice(index1 + 1).forEach(author2 => {
// const author2Ids = new Set(author2.idHal.split(','));
// if (author1Ids.has(author2.idHal) || author2Ids.has(author1.idHal)) return; // Skip self and co-authors
// const commonKeywords = author1.keywords.filter(keyword => author2.keywords.includes(keyword));
// const strength = commonKeywords.length / Math.max(author1.keywords.length, author2.keywords.length);
// const relation = { author1, author2, strength, commonKeywords };
// author1.related.push(relation);
// author2.related.push(relation);
// });
// });

// // Create/update co-author relations
// paper.authors.forEach((author1, index1) => {
// paper.authors.slice(index1 + 1).forEach(author2 => {
// const commonKeywords = paper.keywords.filter(keyword => author1.keywords.includes(keyword) && author2.keywords.includes(keyword));
// if (commonKeywords.length === 0) return; // Skip if authors don't have any common keywords
// const relation = { author1, author2, strength: 1, commonKeywords };
// author1.related.push(relation);
// author2.related.push(relation);
// });
// });

// // Print paper info
// console.log(Added/updated paper "${paper.title}" with id "${paper.id}");

// // Save data store to file
// fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(dataStore));

// // Functions for getting or creating objects in data store

// function getOrCreateAuthor(dataStore, idHal, name) {
// let author = dataStore.authors.find(author => author.idHal === idHal);
// if (!author) {
// author = { idHal, name, aliases: [], papers: [], keywords: [], related: [] };
// dataStore.authors.push(author);
// } else if (!author.name) {
// author.name = name; // Update name if not set
// }
// return author;
// }
