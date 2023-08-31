Write me a nodejs app, that is capable of storing objects ( papers, keywords, authors... ) between execution.  
Papers have a title, a list of keywords (see after), a list of authors.
Authors have an id-hal, an list of aliases or names it use to sign its paper, a list of papers, a list of associated keywords, a list of associated authors
Keywords for a paper are a string of possibily multiple words  (english or french) an english version (translated), a cleaned version (from the english, without dash or other symbols without excess space, in lower case), a list of sorted individual word ( from the cleaned version ). for ex : 
        original: "Conception d’Interfaces Homme-Machine",
        english: "Human-Computer Interface Design",
        cleaned: 'human computer interface design',
        sorted: [ 'computer', 'design', 'human', 'interface' ],

The app can update the list of paper from hal, given an id-hal using Web API at this end point :
`https://api.archives-ouvertes.fr/search/?q=authIdHal_s:dimitri-masson&fl=title_s,keyword_s,authIdHal_s,authFullName_s,authFullNameIdHal_fs&wt=json`
fl can be set to use ( title : title_s , authors' ids : authIdHal_s, authors' names : authIdHal_s, name and idhal : authFullNameIdHal_fs

results are as follow : 
{
  "response":{"numFound":32,"start":0,"maxScore":6.3392377,"numFoundExact":true,"docs":[
      {
           "title_s":["TRACEABILITY INFORMATION TO COMMUNICATE TO CONSUMER IN TOTAL TRANSPARENCY"],
        "keyword_s":["Traceability",
          "Transparency",
          "Fashion industry",
          "Supply chain",
          "Product transparency"],
        "authFullName_s":["Dimitri H. Masson",
          "Cédrick Beler",
          "Jérémy Legardeur",
          "Pantxika Ospital"],
        "authIdHal_s":["dimitri-masson",
          "jlegarde"],
        "authFullNameIdHal_fs":["Dimitri Masson_FacetSep_dimitri-masson",
          "Cédrick Béler_FacetSep_",
          "Jérémy Legardeur_FacetSep_jlegarde",
          "Pantxika Ospital_FacetSep_"]},
      {
          ....

For each doc in the response create or update paper from the store. 
For each of the author create an author in the store or update an existing one. Id_hal is the unique identifier, but not always correctly filled, authFullNameIdHal_fs contains Name_FacetSep_IdHal use idhal first or the name to check if the author exist in the store. if a match is found consolidate with alternate aliases or idhal. Add the paper to the author, add the author to the paper and conversly

For each of the keyword strings, create a keyword, with the orignal string, translated using deepl, cleaned and splited. Check if it exist in the store, use the sorted array as the key to match. if it exist retrieve it. Add the keyword to the paper, authors, and conversly add the paper and authors to the keywords. Create or update the keyword in the store. 

for each of the added keywords, check all the keywords in the store (including itself) to create relations. 
Two keywords are related if they share at least one word. The strength of the relation is the number of words they share divided by the max number of word..
If they share at least one word, create a relation object (containing ref to both keywords, strength, common words ) and add it to the related array of both keywords
Create or update a relation between authors. All authors involved in the two keywords are in 1-1 relation. This relation contains the two authors (they must be different) and the keyword relations 
Special case : co-author of a paper are in 1-1 relation for all the keywords of all the paper they share, the strength of this relation is 1. 



*/