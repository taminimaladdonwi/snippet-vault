const { computeStats, formatStats } = require('./stats');

const SNIPPETS = [
  { id: '1', title: 'Alpha', code: 'a', tags: ['js', 'util'] },
  { id: '2', title: 'Beta',  code: 'b', tags: ['js', 'async'] },
  { id: '3', title: 'Gamma', code: 'c', tags: ['python'] },
  { id: '4', title: 'Delta', code: 'd', tags: [] },
];

describe('computeStats', () => {
  test('counts total snippets', () => {
    const stats = computeStats(SNIPPETS);
    expect(stats.total).toBe(4);
  });

  test('counts occurrences per tag', () => {
    const stats = computeStats(SNIPPETS);
    expect(stats.byTag['js']).toBe(2);
    expect(stats.byTag['util']).toBe(1);
    expect(stats.byTag['async']).toBe(1);
    expect(stats.byTag['python']).toBe(1);
  });

  test('computes average tags per snippet', () => {
    // total tags = 2+2+1+0 = 5, snippets = 4 => 1.25
    const stats = computeStats(SNIPPETS);
    expect(stats.avgTagsPerSnippet).toBe(1.25);
  });

  test('returns topTags sorted by count descending', () => {
    const stats = computeStats(SNIPPETS);
    expect(stats.topTags[0].tag).toBe('js');
    expect(stats.topTags[0].count).toBe(2);
  });

  test('handles empty snippet list', () => {
    const stats = computeStats([]);
    expect(stats.total).toBe(0);
    expect(stats.avgTagsPerSnippet).toBe(0);
    expect(stats.topTags).toEqual([]);
  });

  test('handles snippets with no tags field', () => {
    const stats = computeStats([{ id: '1', title: 'X', code: 'x' }]);
    expect(stats.total).toBe(1);
    expect(stats.avgTagsPerSnippet).toBe(0);
  });
});

describe('formatStats', () => {
  test('includes total and avg in output', () => {
    const stats = computeStats(SNIPPETS);
    const out = formatStats(stats);
    expect(out).toContain('Total snippets : 4');
    expect(out).toContain('Avg tags/snippet: 1.25');
  });

  test('lists top tags', () => {
    const stats = computeStats(SNIPPETS);
    const out = formatStats(stats);
    expect(out).toContain('js');
    expect(out).toContain('2');
  });

  test('shows no-tags message when vault is empty', () => {
    const stats = computeStats([]);
    const out = formatStats(stats);
    expect(out).toContain('No tags found.');
  });
});
