/* Take an array of keywords and their translations 
example of a keyword object:
    class paper {
        title: string;
        keywords: keyword[];
        authors: string[];
    }

    class keyword {
        author: string[];
        paper: paper[];
        original: string;
        english: string;
        cleaned: string;
        sorted: string[];
        related : relation[];
    } 

    class relation {
        keyword2: keyword[2];
        commonWords: string[];
        strength: number;
    }
    
    keyword1 ={
        author: "dimitri-masson",
        paper: "Conception d’Interfaces Homme-Machine",
        original: "Conception d’Interfaces Homme-Machine",
        english: "Human-Computer Interface Design",
        //to lower case, remove extra spaces, remove special characters
        cleaned: 'human computer interface design',
        //split the string into an array of words sorted alphabetically
        sorted: [ 'computer', 'design', 'human', 'interface' ],
        related : []
    };

Create a graph of keywords and their relations. Two keywords are related if they share at least one word. 
The strength of the relation is the number of words they share.

iterate over the keywords array and for each keyword, iterate over the keywords array again and compare the sorted arrays.
If they share at least one word, create a relation object and add it to the related array of both keywords.

*/

class keyword {
  constructor(author, paper, original, english, cleaned, sorted) {
    //Hash the sorted array of words to create a unique id
    this.id = sorted.reduce((a, b) => a + b, 0);
    this.author = author;
    this.paper = paper;
    this.original = original;
    this.english = english;
    this.cleaned = cleaned;
    this.sorted = sorted;
    this.related = [];
  }
}

function createGraph(keywords) {
  keywords.forEach((keyword1) => {
    keywords.forEach((keyword2) => {
      if (keyword1 !== keyword2) {
        const commonWords = keyword1.sorted.filter((word) =>
          keyword2.sorted.includes(word)
        );
        if (commonWords.length > 0) {
          const relation = {
            keyword2: keyword2,
            commonWords: commonWords,
            strength: commonWords.length,
          };
          keyword1.related.push(relation);
          keyword2.related.push(relation);
        }
      }
    });
  });
}

// Use d3 to create a svg graph of the keywords
function createGraphSvg(keywords) {
  const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

  const simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3.forceLink().id(function (d) {
        return d.id;
      })
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));
}
