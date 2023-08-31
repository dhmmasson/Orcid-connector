const axios = require("axios");
const deepl = require("deepl-node");
const dotenv = require("dotenv");
dotenv.config();
const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

async function getOrcidKeywords(orcidId) {
  const response = await axios.get(
    `https://pub.orcid.org/v3.0/${orcidId}/keywords`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  let keywords = [];
  if (response.data.keyword) {
    keywords = response.data.keyword.map((keyword) => keyword.content);
  } else {
    console.log("No keywords found for the given ORCID ID");
  }
  return keywords;
}

async function getPapersAndKeywords(idhal) {
  const response = await axios.get(
    `https://api.archives-ouvertes.fr/search/?q=authIdHal_s:${idhal}&fl=title_s,keyword_s&wt=json`
  );
  let keywords = [];
  const papers = response.data.response.docs;
  papers.forEach((paper) => {
    if (paper.keyword_s) {
      keywords = keywords.concat(paper.keyword_s);
    }
  });
  return keywords;
}

// Post the keywords to the deepl REST API to translate them to English
async function translateKeywords(keywords) {
  const translations = await translator.translateText(keywords, "fr", "en-US");
  // Match the translations to the original keywords
  const translationsMap = translations.map((translation, index) => {
    const cleaned = translation.text.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " "),
    return {
        original: keywords[index],
        english: translation.text,
        //to lower case, remove extra spaces, remove special characters
        cleaned: cleaned,
        //split the string into an array of words sorted alphabetically
        sorted: [...new Set(cleaned.split(" ").sort())],
    };
    });
  return translationsMap; 
}

module.exports = {
  getOrcidKeywords,
  getPapersAndKeywords,
  translateKeywords,
  cleanKeywords,
};
