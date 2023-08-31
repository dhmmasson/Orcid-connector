const fetch = require("node-fetch");
const DeepL = require("deepl-translator");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Initialize in-memory data store
const dataStore = {
  papers: [],
  keywords: [],
  authors: [],
};

// Fetch data from HAL API and add/update data in the store
const updateData = async (idHal) => {
  const endpoint = `https://api.archives-ouvertes.fr/search/?q=authIdHal_s:${idHal}&fl=title_s,keyword_s,authIdHal_s,authFullName_s,authFullNameIdHal_fs&wt=json`;
  const response = await fetch(endpoint);
  const {
    response: { docs },
  } = await response.json();

  docs.forEach((doc) => {
    const {
      title_s,
      keyword_s,
      authIdHal_s,
      authFullName_s,
      authFullNameIdHal_fs,
    } = doc;

    // Add/update paper
    const paper = dataStore.papers.find((p) => p.title === title_s[0]);
    if (paper) {
      paper.authors = [...new Set([...paper.authors, ...authIdHal_s])];
      paper.keywords = [...new Set([...paper.keywords, ...keyword_s])];
    } else {
      const newPaper = {
        title: title_s[0],
        keywords: keyword_s,
        authors: authIdHal_s,
      };
      dataStore.papers.push(newPaper);
    }

    // Add/update authors
    authFullName_s.forEach((fullName, index) => {
      const idHal =
        authIdHal_s[index] || authFullNameIdHal_fs[index].split("_")[1];
      const author = dataStore.authors.find((a) => a.idHal === idHal);
      if (author) {
        author.papers = [...new Set([...author.papers, title_s[0]])];
        author.keywords = [...new Set([...author.keywords, ...keyword_s])];
        author.alternateNames = [
          ...new Set([...author.alternateNames, fullName]),
        ];
      } else {
        const newAuthor = {
          idHal,
          papers: [title_s[0]],
          keywords: keyword_s,
          alternateNames: [fullName],
        };
        dataStore.authors.push(newAuthor);
      }
    });

    // Add/update keywords
    keyword_s.forEach(async (keywordString) => {
      const cleanedKeyword = keywordString
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .trim();
      const sortedKeyword = cleanedKeyword.split(" ").sort();
      const existingKeyword = dataStore.keywords.find(
        (k) => k.sorted.join(",") === sortedKeyword.join(",")
      );

      if (existingKeyword) {
        existingKeyword.papers = [
          ...new Set([...existingKeyword.papers, title_s[0]]),
        ];
        existingKeyword.authors = [
          ...new Set([...existingKeyword.authors, ...authIdHal_s]),
        ];
      } else {
        const englishKeyword = await DeepL.translate(keywordString, {
          to: "en",
        });
        const newKeyword = {
          original: keywordString,
          english: englishKeyword,
          cleaned: cleanedKeyword,
          sorted: sortedKeyword,
          papers: [title_s[0]],
          authors: authIdHal_s,
        };
        dataStore.keywords.push(newKeyword);
      }
    });
  });

  // Create/update keyword relations
  dataStore.keywords.forEach((keyword1) => {
    dataStore.keywords.forEach((keyword2) => {
      if (keyword1 !== keyword2) {
        const commonWords = keyword1.sorted.filter((word) =>
          keyword2.sorted.includes(word)
        );
        const strength =
          commonWords.length /
          Math.max(keyword1.sorted.length, keyword2.sorted.length);
        if (strength > 0) {
          const relation = {
            keyword1: keyword1,
            keyword2: keyword2,
            strength: strength,
            commonWords: commonWords,
          };
          keyword1.related.push(relation);
          keyword2.related.push(relation);
        }
      }
    });
  });

  // Create/update author relations
  dataStore.authors.forEach((author1) => {
    dataStore.authors.forEach((author2) => {
      if (author1 !== author2) {
        // Check if the two authors are co-authors in any paper
        const papers = author1.papers.filter((paper) =>
          author2.papers.includes(paper)
        );
        if (papers.length > 0) {
          // Create 1-1 relation between authors for each shared paper
          papers.forEach((paper) => {
            const relations = paper.keywords
              .map((keyword) => {
                return keyword.related.filter((relation) => {
                  return (
                    relation.keyword1.papers.includes(paper) &&
                    relation.keyword2.papers.includes(paper)
                  );
                });
              })
              .flat();
            const relation = {
              author1: author1,
              author2: author2,
              paper: paper,
              keywordRelations: relations,
              strength: 1,
            };
            author1.related.push(relation);
            author2.related.push(relation);
          });
        } else {
          // Check if the two authors are related through a keyword relation
          const relations = author1.keywords.flatMap((keyword) => {
            return keyword.related.filter((relation) => {
              return (
                (relation.keyword1.authors.includes(author1) &&
                  relation.keyword2.authors.includes(author2)) ||
                (relation.keyword2.authors.includes(author1) &&
                  relation.keyword1.authors.includes(author2))
              );
            });
          });
          if (relations.length > 0) {
            // Create 1-1 relation between authors for each keyword relation
            relations.forEach((relation) => {
              const paper = relation.keyword1.papers.filter((paper) =>
                relation.keyword2.papers.includes(paper)
              )[0];
              const strength = relation.strength;
              const authorRelation = {
                author1: author1,
                author2: author2,
                paper: paper,
                keywordRelations: [relation],
                strength: strength,
              };
              author1.related.push(authorRelation);
              author2.related.push(authorRelation);
            });
          }
        }
      }
    });
  });

  console.log("Data store updated successfully.");
};

// Run the app
app.run();
