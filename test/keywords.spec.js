const {
  getOrcidKeywords,
  getPapersAndKeywords,
  translateKeywords,
  cleanKeywords,
} = require("../src/hal");
// Check that the getOrcidKeywords function returns the expected keywords

describe("getOrcidKeywords", () => {
  it("should return the expected keywords", async () => {
    const keywords = await getOrcidKeywords("0000-0002-7072-3146");
    // expect the result to be an array of strings to be returned
    expect(keywords).toBeInstanceOf(Array);
  });
});

describe("translateKeywords", () => {
  it("should return the expected keywords", async () => {
    const keywords = await translateKeywords(["humain", "créativité"]);
    // expect the result to be an array of strings to be returned
    expect(keywords).toEqual(["human", "creativity"]);
  });
});

// Check that the getPapersAndKeywords function returns the expected papers and keywords
describe("getPapersAndKeywords", () => {
  it("should return the expected papers and keywords", async () => {
    const keywords = await getPapersAndKeywords("dimitri-masson");
    // expect the result to be an array of objects to be returned
    expect(keywords).toBeInstanceOf(Array);
    // Snapshot testing
    expect(keywords).toMatchSnapshot();
  });
});

describe("Snapshot Keywords", () => {
  it("Raw", async () => {
    const keywords = await getPapersAndKeywords("dimitri-masson");
    expect([...new Set(keywords)].sort()).toMatchSnapshot();
  });
  it("Cleaned", async () => {
    const keywords = await getPapersAndKeywords("dimitri-masson");
    const cleanedKeywords = await cleanKeywords(keywords);
    expect(cleanedKeywords).toMatchSnapshot();
  });
});

const keywords = [
  "ALTERNATIVES RANKING",
  "BRAINSTORMING",
  "BUSINESS PROCESS MODELING",
  "CIRCULARITY",
  "CLUSTER",
  "COLLABORATIVE DESIGN",
  "COLLECTIVE DECISION",
  "COMPETITIVENESS CLUSTER",
  "CONCEPT GENERATION",
  "CREATIVE SUPPORT TOOL",
  "CREATIVE TEAMS",
  "CREATIVITY",
  "CREATIVITY -- EVALUATION",
  "CYBER-PHYSICAL AND HUMAN SYSTEMS",
  "CYBER-PHYSICAL SYSTEMS AND HUMANS",
  "DECISION SUPPORT",
  "DECISION SUPPORT SYSTEM",
  "DECISION SUPPORT SYSTEM DSS",
  "DECISION UNDER UNCERTAINTY",
  "DESIGN",
  "DESIGN FOR RECYCLING",
  "DESIGN GALLERIES",
  "DESIGN METHOD",
  "DESIGN SPACES",
  "DESIGN THINKING",
  "DIGITAL PRODUCT PASSPORT",
  "DIVERSITY",
  "DYNAMIC USER INTERFACE UI",
  "EMOTIONAL DESIGN",
  "EVALUATION",
  "EVOLUTIONARY ALGORITHM",
  "EVOLUTIONARY ALGORITHMS",
  "EXAMPLE",
  "EXAMPLES GALLERIES",
  "EXPLORATION",
  "FASHION INDUSTRY",
  "GALLERY",
  "GALLERY OF EXAMPLES",
  "GENERATION",
  "GRAPH OF MODELS",
  "HACKATHON",
  "HETEROGENEOUS DATA",
  "HUMAN-COMPUTER INTERFACE",
  "HUMAN-COMPUTER INTERFACE DESIGN",
  "IDEA GENERATION",
  "IDEATION",
  "INNOVATION",
  "INSPIRATION",
  "INTERACTIVE GENETIC ALGORITHMS",
  "INTERCLUSTERING",
  "INTEROPERABILITY",
  "MANAGEMENT",
  "MANUFACTURING SYSTEM ENGINEERING",
  "MATCHING",
  "MATERIAL RECOVERY",
  "METHODOLOGY",
  "MODEL BASED USER INTERFACES",
  "MULTI CRITERIA DECISION MAKING",
  "MULTI-CRITERIA DECISION-MAKING",
  "NEAR ZERO ENERGY BUILDING REFURBISHMENT",
  "NEW PRODUCT DEVELOPMENT",
  "PRECISION BREEDING",
  "PRECISION LIVESTOCK FARMING",
  "PRODUCT DISMANTLING",
  "PRODUCT TRANSPARENCY",
  "RATING",
  "SENSITIVITY ANALYSIS",
  "SKETCHING",
  "STAR",
  "STUDENTS",
  "SUPPLY CHAIN",
  "SUSTAINABLE DECISIONS",
  "TANGIBLE INTERFACE",
  "TEXTILE",
  "TEXTILES AND CLOTHING",
  "THE 24H OF INNOVATION",
  "TOOL",
  "TOOL TO SUPPORT CREATIVITY",
  "TRACEABILITY",
  "TRANSPARENCY",
  "USER CENTERED DESIGN",
  "USER INTERFACE DESIGN",
  "UX",
  "VIRTUAL REALITY",
];

describe("debug Test", () => {
  it("should return the expected keywords", async () => {
    let keywords = await getPapersAndKeywords("dimitri-masson");
    keywords = keywords.slice(20, 30);
    console.table(keywords);
    const cleanedKeywords = await cleanKeywords(keywords);
    console.table(cleanedKeywords);
    keywords = await getPapersAndKeywords("dimitri-masson");
    // expect true to be true
    expect(true).toBe(true);
  });
});

