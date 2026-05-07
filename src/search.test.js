const { fuzzyScore, scoreSnippet, searchSnippets } = require('./search');

const sampleSnippets = [
  {
    id: '1',
    title: 'Debounce function',
    description: 'Delays invoking a function until after wait ms',
    language: 'javascript',
    tags: ['utility', 'performance'],
  },
  {
    id: '2',
    title: 'Flatten array',
    description: 'Recursively flatten a nested array',
    language: 'javascript',
    tags: ['array', 'utility'],
  },
  {
    id: '3',
    title: 'Python HTTP request',
    description: 'Simple GET request using requests library',
    language: 'python',
    tags: ['http', 'network'],
  },
];

describe('fuzzyScore', () => {
  test('returns high score for exact substring match', () => {
    expect(fuzzyScore('flat', 'flatten')).toBeGreaterThan(50);
  });

  test('returns positive score for fuzzy match', () => {
    expect(fuzzyScore('dbnce', 'debounce')).toBeGreaterThan(0);
  });

  test('returns -1 when characters cannot be matched in order', () => {
    expect(fuzzyScore('xyz', 'debounce')).toBe(-1);
  });

  test('returns -1 for empty query', () => {
    expect(fuzzyScore('', 'debounce')).toBe(-1);
  });

  test('is case-insensitive', () => {
    expect(fuzzyScore('FLAT', 'flatten')).toBeGreaterThan(0);
  });
});

describe('scoreSnippet', () => {
  test('scores higher when query matches title', () => {
    const titleScore = scoreSnippet(sampleSnippets[0], 'debounce');
    expect(titleScore).toBeGreaterThan(0);
  });

  test('returns -1 when query matches nothing', () => {
    expect(scoreSnippet(sampleSnippets[0], 'zzzzzz')).toBe(-1);
  });

  test('matches against tags', () => {
    expect(scoreSnippet(sampleSnippets[2], 'http')).toBeGreaterThan(0);
  });

  test('matches against language', () => {
    expect(scoreSnippet(sampleSnippets[2], 'python')).toBeGreaterThan(0);
  });
});

describe('searchSnippets', () => {
  test('returns relevant snippets sorted by score', () => {
    const results = searchSnippets(sampleSnippets, 'flatten');
    expect(results[0].id).toBe('2');
  });

  test('returns all snippets for empty query (up to limit)', () => {
    const results = searchSnippets(sampleSnippets, '');
    expect(results).toHaveLength(3);
  });

  test('respects the limit option', () => {
    const results = searchSnippets(sampleSnippets, 'util', { limit: 1 });
    expect(results).toHaveLength(1);
  });

  test('returns empty array when nothing matches', () => {
    const results = searchSnippets(sampleSnippets, 'zzzzzzz');
    expect(results).toHaveLength(0);
  });

  test('finds python snippet by language', () => {
    const results = searchSnippets(sampleSnippets, 'python');
    expect(results[0].id).toBe('3');
  });
});
