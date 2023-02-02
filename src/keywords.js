const axios = require('axios');

async function getOrcidKeywords(orcidId) {
    const response = await axios.get(`https://pub.orcid.org/v3.0/${orcidId}/keywords`, {
        headers: {
            Accept: 'application/json',
        },
    });
    let keywords = [];
    if (response.data.keyword) {
        keywords = response.data.keyword.map((keyword) => keyword.content);
        console.log(keywords);
    } else {
        console.log('No keywords found for the given ORCID ID');
    }
    return keywords;
}


async function getPapersAndKeywords(idhal) {
    const response = await axios.get(`https://api.archives-ouvertes.fr/search/?q=authIdHal_s:${idhal}&fl=title_s,keyword_s&wt=json`);
    let keywords = [];
    const papers = response.data.response.docs;
    papers.forEach((paper) => {
        if (paper.keyword_s) {
            keywords = keywords.concat(paper.keyword_s);
        }
    });

    // Upper case all keywords
    keywords = keywords.map((keyword) => keyword.toUpperCase());
    //Reduce the array to unique values
    keywords = [...new Set(keywords)];
    //Sort the array alphabetically
    keywords.sort();

    console.log(keywords.map(e => `"${e}"`).join(','))
    return keywords;
}





module.exports = {
    getOrcidKeywords,
    getPapersAndKeywords
};