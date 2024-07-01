import axios from "axios";
import queryString from "query-string";
import fs from "fs";
import * as deepl from "deepl-node";
import dotenv from "dotenv";
import { join } from "path";
dotenv.config();
const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

// if argument is update then update the json file from the web else load the json file

if (process.argv[2] === "update") {
  console.log("update");
  await storePublicationJson(await getAllPublicationFromWeb(), "./");
}
let { publications: publicationsRaw, keywordsMap } =
  await loadPublicationFromJSON("./");
let { members, publications, keywords } = await transform(
  publicationsRaw,
  keywordsMap
);

generateMD(
  "/Users/dimitri/Documents/workspace2/recherche/Admin/THS/hal-estia-2024/",
  members,
  publications,
  keywords
);

async function getAllPublicationFromWeb() {
  let fields = [
    "authFirstName_s",
    "authFullName_s",
    "authIdHal_i",
    "authIdHal_s",
    "authId_i",
    "authLastName_s",
    "authMiddleName_s",
    "docType_s",
    "halId_s",
    "keyword_s",
    "label_bibtex",
    "title_s",
    "type_s",
    "uri_s",
  ];
  let filter = {
    producedDateY_i: "[2016 TO 2026}",
  };
  let query = {
    structure_t: '(39415 OR 300425 OR "ESTIA Recherche" OR "ESTIA")',
  };
  let params = {
    fl: fields.join(","), // fields to return
    fq: queryString.stringify(filter, { encode: false }), // filter query
    q: queryString.stringify(query, { encode: false }), // query
    rows: "10000", // number of rows
    wt: "json", // return format
  };
  let str = queryString.stringify(params, { encode: true });
  // let url = "https://api.archives-ouvertes.fr/search/";
  let url =
    "https://api.archives-ouvertes.fr/search/?q=structure_t:%2839415%20OR%20300425%20OR%20%22ESTIA%20Recherche%22%20OR%20%22ESTIA%22%29&fq=producedDateY_i:%5b2016%20TO%202025%7d&rows=10000&wt=json&fl=authFirstName_s,authFullName_s,authIdHal_i,authIdHal_s,authId_i,authLastName_s,authMiddleName_s,docType_s,halId_s,keyword_s,label_bibtex,title_s,type_s,uri_s,abstract_s,producedDateY_i,docType_s,title_autocomplete,journalTitle_s,conferenceTitle_s";
  let response = await axios.get(url);

  let data = response.data.response.docs;

  return data;
}

/**
 * Store the publication from the web into a json file for caching
 * @param {Array} data
 */
async function storePublicationJson(publications, path) {
  // extract all keywords from the publications and store them in an array
  let allKeywords = publications
    .flatMap((publication) => publication.keyword_s)
    .filter((keyword) => keyword !== undefined);
  console.log(allKeywords);
  // translate the keywords
  let keywordsMap = {};

  let translatedKeywords = await translator.translateText(
    allKeywords,
    null,
    "en-GB"
  );
  translatedKeywords.forEach((keyword, index) => {
    keywordsMap[allKeywords[index]] = keyword;
  });

  //translate titles

  fs.writeFileSync(
    join(path, "publications.json"),
    JSON.stringify(publications),
    "utf8"
  );
  console.log(keywordsMap);
  // save the keywords map to a file
  fs.writeFileSync(
    join(path, "keywordsMap.json"),
    JSON.stringify(keywordsMap),
    "utf8"
  );
}

async function loadPublicationFromJSON(path) {
  let file = fs.readFileSync(join(path, "publications.json"), "utf8");
  let publications = JSON.parse(file);
  file = fs.readFileSync(join(path, "keywordsMap.json"), "utf8");
  let keywordsMap = JSON.parse(file);
  return { publications, keywordsMap };
}

/* example of one publication
 {
    "label_bibtex": "@inproceedings{lagunasalvado:hal-02362849,\n  TITLE = {{Decision Making in Near Zero Energy Building Refurbishment: A Technology Alternatives Ranking Tool}},\n  AUTHOR = {Laguna Salvado, Laura and Villeneuve, Eric and Masson, Dimitri H.},\n  URL = {https://hal.science/hal-02362849},\n  BOOKTITLE = {{9th IFAC Conference on Manufacturing Modelling, Management and Control MIM 2019}},\n  ADDRESS = {Berlin, Germany},\n  ORGANIZATION = {{IFAC}},\n  SERIES = {IFAC-PapersOnLine, Proceedings of the 9th IFAC Conference on Manufacturing Modelling, Management and Control MIM 2019 - Berlin, Germany, 28--30 August 2019},\n  VOLUME = {52},\n  NUMBER = {13},\n  PAGES = {313-318},\n  YEAR = {2019},\n  MONTH = Aug,\n  DOI = {10.1016/j.ifacol.2019.11.196},\n  KEYWORDS = {Near Zero Energy Building Refurbishment ; multi criteria decision making ; alternatives ranking ; Sustainable Decisions ; Decision Support System},\n  PDF = {https://hal.science/hal-02362849v2/file/1-s2.0-S2405896319311462-main.pdf},\n  HAL_ID = {hal-02362849},\n  HAL_VERSION = {v2},\n}\n",
    "title_s": [
      "Decision Making in Near Zero Energy Building Refurbishment: A Technology Alternatives Ranking Tool"
    ],
    "keyword_s": [
      "Near Zero Energy Building Refurbishment",
      "Multi criteria decision making",
      "Alternatives ranking",
      "Sustainable Decisions",
      "Decision Support System"
    ],
    "abstract_s": [
      "Decision making in the context of Near Zero Energy Building refurbishment is subjected to heterogeneous stakeholders, tools and objectives. This paper presents a methodology to facilitate stakeholders collaboration in the refurbishment processes and identifies decision support approaches to help on the main decision milestones. This methodology is supported by a prototype (user interface and algorithm) of a decision support system (DSS) that allows ranking different refurbishment technologies. The proposed DSS uses a multi criteria decision method that combines weighting and fuzzy dominances approach. The approach is illustrated with a real data set to rank insulation materials."
    ],
    "authLastName_s": ["Laguna Salvado", "Villeneuve", "Masson"],
    "authFirstName_s": ["Laura", "Eric", "Dimitri"],
    "authFullName_s": [
      "Laura Laguna Salvado",
      "Eric Villeneuve",
      "Dimitri H. Masson"
    ],
    "authIdHal_i": [746817, 16388, 15885],
    "authIdHal_s": [
      "laura-laguna-salvado",
      "eric-villeneuve",
      "dimitri-masson"
    ],
    "authMiddleName_s": ["H."],
    "halId_s": "hal-02362849",
    "uri_s": "https://hal.science/hal-02362849v2",
    "docType_s": "COMM"
  }
*/

async function transform(rawPublications, keywordsMap) {
  let members = {};
  let publications = {};
  let keywords = {};
  const whiteListIdHAL = [
    "alvaro-llaria",
    "eric-villeneuve",
    "dimitri-masson",
    "laura-laguna-salvado",
    "guillaume-terrasson",
    "audrey-abi-akle",
    "julie-lartigau",
    "patrick-badets",
    "veronique-pilniere",
    "octavian-curea",
    "christophe-merlo-64",
    "zina-boussaada",
    "antoine-millet",
  ];
  rawPublications = rawPublications.filter((publication) => {
    if (publication.authIdHal_s === undefined) {
      return false;
    }

    return publication.authIdHal_s.some((authId) => {
      return whiteListIdHAL.includes(authId);
    });
  });

  // For each publication
  for (let publication of rawPublications) {
    // Store the publication itself in the publications object using the halId_s as key
    let halId = publication.halId_s;
    publications[halId] = publication;
    let safeTitle = publication.title_s[0]
      .replace(/[^a-zA-Z0-9]/g, "_")
      .slice(0, 32);
    publication.safeTitle = `${halId} - ${safeTitle}`;

    // Extract the keywords from the publication, store the keywords in the keywords object key : EnglishVersion uppercase without space,  value : { alternatives [], publications [] }
    let publicationKeywords = publication.keyword_s ?? [];
    let publicationKeywordsObjects = [];
    for (let keyword of publicationKeywords) {
      let translatedKeyword = keywordsMap[keyword].text; // TODO translate the keyword
      let keywordUpperCase = translatedKeyword.toUpperCase();

      // make a hash of the keyword to use as key keep the 4 letter of each word of the keyword
      let keywordHash = keywordUpperCase
        .replace(/[^a-zA-Z0-9]/g, " ")
        .split(" ")
        .filter((word) => word.length > 2)
        .map((word) => word.slice(0, 3))
        .sort()
        .join(".");
      if (!keywords[keywordHash]) {
        keywords[keywordHash] = {
          key: keywordHash,
          map: {},
          alternatives: [],
          publications: [],
        };
      }
      keywords[keywordHash].map[halId] = keyword;
      // check if this version of the keyword is already in the alternatives array
      if (!keywords[keywordHash].alternatives.includes(keywordUpperCase)) {
        keywords[keywordHash].alternatives.push(keywordUpperCase);
      }
      keywords[keywordHash].publications.push(halId);
      publicationKeywordsObjects.push(keywords[keywordHash]);
    }
    // Extract the authors, store the authors in the members object key : authIdHal_s, value : { firstName, lastName, alternatives[], publications [] }
    let publicationAuthors = publication.authIdHal_s ?? [];
    let publicationAuthorsObjects = [];
    for (let index in publicationAuthors) {
      let author = publicationAuthors[index];

      if (!members[author]) {
        members[author] = {
          authIdHal_s: author,
          firstName: publication.authFirstName_s[index],
          lastName: publication.authLastName_s[index],
          authFullName_s: publication.authFullName_s[index],
          alternatives: [publication.authFullName_s[index]],
          publications: [],
          ths: whiteListIdHAL.includes(author),
        };
      }
      // check if this version of the author is already in the alternatives array
      if (
        !members[author].alternatives.includes(
          publication.authFullName_s[index]
        )
      ) {
        members[author].alternatives.push(publication.authFullName_s[index]);
        //update firstName and lastName if they are not already set
        if (!members[author].firstName) {
          members[author].firstName = publication.authFirstName_s[index];
        }
        if (!members[author].lastName) {
          members[author].lastName = publication.authLastName_s[index];
        }
      }
      members[author].publications.push(halId);
      publicationAuthorsObjects.push(members[author]);
    }
    // update the publications object with the keywords and the authors
    publications[halId].keywords = publicationKeywordsObjects;
    publications[halId].authors = publicationAuthorsObjects;
  }

  Object.values(keywords).forEach((keyword) => {
    keyword.alternatives.sort();
    keyword.safe = keyword.alternatives[0].replace(/[^a-zA-Z0-9]/g, "_");
  });

  return { members, publications, keywords };
}

function generateMD(destinationPath, members, publications, keywords) {
  // members
  fs.mkdirSync(destinationPath + "members", { recursive: true });
  fs.mkdirSync(destinationPath + "others", { recursive: true });
  // publications
  fs.mkdirSync(destinationPath + "publications", { recursive: true });
  //publication year
  Array(2024 - 2016 + 1)
    .fill(2016)
    .map((year, index) => {
      fs.mkdirSync(destinationPath + "publications/" + (year + index), {
        recursive: true,
      });
    });
  // keywords
  fs.mkdirSync(destinationPath + "keywords", { recursive: true });

  fs.mkdirSync(destinationPath + "journals", { recursive: true });
  fs.mkdirSync(destinationPath + "conferences", { recursive: true });
  Object.values(publications).forEach((publication) => {
    if (publication.journalTitle_s) {
      let journalTitle = publication.journalTitle_s.replace("/", "-");
      publication.journalTitle_s = journalTitle;
      fs.writeFileSync(
        join(destinationPath, "journals", publication.journalTitle_s + ".md"),
        `---\naliases: [${publication.journalTitle_s}]\ntype: journal\n---\n`,
        "utf8"
      );
    }
    if (publication.conferenceTitle_s) {
      let conferenceTitle = publication.conferenceTitle_s.replace("/", "-");
      publication.conferenceTitle_s = conferenceTitle;
      fs.writeFileSync(
        join(
          destinationPath,
          "conferences",
          publication.conferenceTitle_s + ".md"
        ),
        `---\naliases: [${publication.conferenceTitle_s}]\ntype: conference\n---\n`,
        "utf8"
      );
    }
  });

  // For each member create a markdown file
  // filename : authIdHal_s.md
  // content : firstName lastName
  // list of publications
  // list of keywords
  for (let member in members) {
    let filename = member + ".md";
    let content = "";
    content = "---\n";
    content += `aliases: [${members[member].alternatives.join(", ")}]\n`;
    content += `type: member\n`;
    content += "---\n";

    content = members[member].firstName + " " + members[member].lastName + "\n";
    content += "## Publications\n";
    content += "```dataview\n";
    content += `table without id document, publication-date, link(file.path,title_s) from "publications" and [[#]]
    sort document, publication-date desc\n`;
    content += "```";
    // for (let publication of members[member].publications) {
    //   content += `  - [[${publications[publication].safeTitle}|${publications[publication].title_s[0]}]]\n`;
    // }

    // write the file to the members folder
    let folder = members[member].ths ? "members/" : "others/";
    fs.writeFileSync(destinationPath + folder + filename, content, "utf8");
  }

  // for each publication create a markdown file
  // filename : title_s.md
  // content :
  // # title_s
  // ## Authors
  // list of authors in [[authIdHal_s|authFullName_s]] format
  // ## Keywords
  // list of keywords in [[keyword]] format
  // ## Abstract
  // abstract_s
  for (let index in publications) {
    let publication = publications[index];
    let halId = publication.halId_s;
    let filename = `${publication.safeTitle} ` + ".md";
    let content = "";
    content = "---\n";
    content += `type: publication\n`;
    content += `title_s: "${publication.title_s[0]}"\n`;
    content += `document: ${publication.docType_s}\n`;
    content += `publication-date: ${publication.producedDateY_i}\n`;
    content += `journal: [[${
      publication.journalTitle_s || publication.conferenceTitle_s
    }]]\n`;
    content += "---\n";
    content += "# " + publication.title_s[0] + "\n";
    if (publication.journalTitle_s || publication.conferenceTitle_s)
      content += `document: #${publication.docType_s}\n`;
    content += `[[${
      publication.journalTitle_s || publication.conferenceTitle_s
    }]]\n`;
    content += "## Authors\n";
    for (let author of publication.authors) {
      content += `- authors::[[${author.authIdHal_s}|${author.firstName} ${author.lastName}]]\n`;
    }
    content += "## Keywords\n";
    for (let keyword of publication.keywords) {
      content += `- keywords::[[${keyword.safe}|${keyword.map[halId]}]]\n`;
    }

    content += "## Abstract\n";
    content += publication.abstract_s ? publication.abstract_s[0] : "";
    // write the file to the publications folder
    fs.writeFileSync(
      join(
        destinationPath,
        "publications/" + publication.producedDateY_i,
        filename
      ),
      content,
      "utf8"
    );
  }

  // for each keyword create a markdown file
  // filename : keyword.md
  // content :
  // ---
  // aliases: [alternative1, alternative2, ...]
  // # keyword
  // ## alternatives

  for (let keyword in keywords) {
    let safeKeyword = keywords[keyword].safe;
    let filename = safeKeyword + ".md";
    let content = "---\n";
    content += `aliases: [${keywords[keyword].alternatives.join(", ")}]\n`;
    content += `type: keyword\n`;
    content += `# ${keywords[keyword].key}\n`;
    content = "---\n";
    fs.writeFileSync(destinationPath + "keywords/" + filename, content, "utf8");
  }
}
