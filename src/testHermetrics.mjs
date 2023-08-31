import {
  Levenshtein,
  Hamming,
  Jaccard,
  Jaro,
  JaroWinkler,
  OSA,
  Dice,
  DamerauLevenshtein,
} from "hermetrics";
import { stemmer } from "stemmer";
import { readFile } from "fs/promises";
// Open keywordsMap.json
let json = await readFile("keywordsMap.json", "utf8");
let keywordsMap = JSON.parse(json);

let keys = Object.values(keywordsMap)
  .map((e) => e.text.replace(/\W/g, " ").toLowerCase().trim())
  .flatMap((key) => key.split(" "))
  .map((key) => ({ key, root: stemmer(key) }))
  .sort((a, b) => a.root.localeCompare(b.root))
  .filter((e, i, a) => i === a.findIndex((x) => x.root === e.root));
// Create a new instance of each metric
let levenshtein = new Levenshtein();
let hamming = new Hamming();
let jaccard = new Jaccard();
let jaro = new Jaro();
let jaroWinkler = new JaroWinkler();
let osa = new OSA();
let dice = new Dice();
let damerauLevenshtein = new DamerauLevenshtein();
// Create a new array to store the results
let results = [];
// Loop through the keywords
for (let i = 0; i < keys.length; i++) {
  for (let j = i + 1; j < keys.length; j++) {
    if (keys[i].root === keys[j].root) continue;
    // Calculate the distance between the two keywords
    let similarity = jaroWinkler.similarity(keys[i].root, keys[j].root);
    let distance = jaroWinkler.normalizedDistance(keys[i].root, keys[j].root);
    // Push the result to the results array
    results.push({
      keyword1: keys[i].key,
      keyword2: keys[j].key,
      distance: distance,
      similarity: similarity,
    });
  }
}
// Sort the results array by distance
results.sort((a, b) => b.similarity - a.similarity);
// Print the results
console.table(results.slice(0, 100));
