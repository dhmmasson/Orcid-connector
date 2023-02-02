const { getOrcidKeywords, getPapersAndKeywords } = require('../src/keywords');
// Check that the getOrcidKeywords function returns the expected keywords

describe('getOrcidKeywords', () => {
    it('should return the expected keywords', async () => {
        const keywords = await getOrcidKeywords('0000-0002-7072-3146');
        // expect the result to be an array of strings to be returned
        expect(keywords).toEqual([]);
    });
});


// Check that the getPapersAndKeywords function returns the expected papers and keywords
describe('getPapersAndKeywords', () => {
    it('should return the expected papers and keywords', async () => {
        const papers = await getPapersAndKeywords('dimitri-masson');
        // expect the result to be an array of objects to be returned
        expect(papers).toEqual([]);
    });
});