const {
  normalizeTag,
  parseTags,
  getAllTags,
  filterByTags,
  addTagsToSnippet,
  removeTagFromSnippet,
} = require('./tags');

const sampleSnippets = [
  { id: '1', title: 'fetch wrapper', tags: ['javascript', 'async', 'http'] },
  { id: '2', title: 'debounce', tags: ['javascript', 'utility'] },
  { id: '3', title: 'sql select', tags: ['sql', 'database'] },
];

describe('normalizeTag', () => {
  test('lowercases tag', () => {
    expect(normalizeTag('JavaScript')).toBe('javascript');
  });
  test('trims whitespace', () => {
    expect(normalizeTag('  async  ')).toBe('async');
  });
  test('replaces spaces with hyphens', () => {
    expect(normalizeTag('my tag')).toBe('my-tag');
  });
});

describe('parseTags', () => {
  test('splits comma-separated tags', () => {
    expect(parseTags('js, async, http')).toEqual(['js', 'async', 'http']);
  });
  test('returns empty array for empty string', () => {
    expect(parseTags('')).toEqual([]);
  });
  test('returns empty array for null', () => {
    expect(parseTags(null)).toEqual([]);
  });
  test('filters out empty entries', () => {
    expect(parseTags('js,,async')).toEqual(['js', 'async']);
  });
});

describe('getAllTags', () => {
  test('returns sorted unique tags', () => {
    const tags = getAllTags(sampleSnippets);
    expect(tags).toEqual(['async', 'database', 'http', 'javascript', 'sql', 'utility']);
  });
  test('returns empty array for no snippets', () => {
    expect(getAllTags([])).toEqual([]);
  });
});

describe('filterByTags', () => {
  test('filters snippets matching a single tag', () => {
    const result = filterByTags(sampleSnippets, ['javascript']);
    expect(result).toHaveLength(2);
  });
  test('filters snippets matching multiple tags (AND logic)', () => {
    const result = filterByTags(sampleSnippets, ['javascript', 'async']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
  test('returns all snippets when no tags provided', () => {
    expect(filterByTags(sampleSnippets, [])).toHaveLength(3);
  });
  test('returns empty when no match', () => {
    expect(filterByTags(sampleSnippets, ['python'])).toHaveLength(0);
  });
});

describe('addTagsToSnippet', () => {
  test('adds new tags without duplicates', () => {
    const snippet = { id: '1', tags: ['javascript'] };
    const updated = addTagsToSnippet(snippet, ['javascript', 'async']);
    expect(updated.tags).toEqual(['javascript', 'async']);
  });
  test('handles snippet with no tags', () => {
    const snippet = { id: '2' };
    const updated = addTagsToSnippet(snippet, ['sql']);
    expect(updated.tags).toEqual(['sql']);
  });
});

describe('removeTagFromSnippet', () => {
  test('removes a tag from snippet', () => {
    const snippet = { id: '1', tags: ['javascript', 'async'] };
    const updated = removeTagFromSnippet(snippet, 'async');
    expect(updated.tags).toEqual(['javascript']);
  });
  test('does nothing if tag not present', () => {
    const snippet = { id: '1', tags: ['javascript'] };
    const updated = removeTagFromSnippet(snippet, 'python');
    expect(updated.tags).toEqual(['javascript']);
  });
});
