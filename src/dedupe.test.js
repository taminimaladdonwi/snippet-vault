'use strict';

const { normalizeCode, codeSimilarity, findDuplicates, resolveDuplicates } = require('./dedupe');

const makeSnippet = (id, code, tags = [], description = '') => ({
  id,
  title: `Snippet ${id}`,
  code,
  tags,
  description,
  createdAt: new Date().toISOString(),
});

describe('normalizeCode', () => {
  test('collapses whitespace and lowercases', () => {
    expect(normalizeCode('  Hello   World  ')).toBe('hello world');
  });

  test('handles empty string', () => {
    expect(normalizeCode('')).toBe('');
  });
});

describe('codeSimilarity', () => {
  test('identical strings return 1', () => {
    const code = 'const x = 1;';
    expect(codeSimilarity(code, code)).toBe(1);
  });

  test('completely different strings return low score', () => {
    const sim = codeSimilarity('aaa bbb ccc', 'xyz xyz xyz');
    expect(sim).toBeLessThan(0.2);
  });

  test('similar strings return high score', () => {
    const a = 'function add(a, b) { return a + b; }';
    const b = 'function add(a, b) { return a + b; } // same';
    expect(codeSimilarity(a, b)).toBeGreaterThan(0.7);
  });

  test('empty strings return 0', () => {
    expect(codeSimilarity('', 'abc')).toBe(0);
    expect(codeSimilarity('', '')).toBe(0);
  });
});

describe('findDuplicates', () => {
  test('returns empty array when no duplicates', () => {
    const snippets = [
      makeSnippet('1', 'const a = 1;'),
      makeSnippet('2', 'function hello() { console.log("hello"); }'),
    ];
    expect(findDuplicates(snippets)).toHaveLength(0);
  });

  test('groups identical snippets', () => {
    const code = 'const x = () => x + 1;';
    const snippets = [
      makeSnippet('1', code),
      makeSnippet('2', code),
      makeSnippet('3', 'completely different code here'),
    ];
    const groups = findDuplicates(snippets, 1.0);
    expect(groups).toHaveLength(1);
    expect(groups[0].group).toHaveLength(2);
  });

  test('respects threshold parameter', () => {
    const snippets = [
      makeSnippet('1', 'const add = (a, b) => a + b;'),
      makeSnippet('2', 'const add = (a, b) => a + b; // util'),
    ];
    const strictGroups = findDuplicates(snippets, 0.99);
    const looseGroups = findDuplicates(snippets, 0.5);
    expect(looseGroups.length).toBeGreaterThanOrEqual(strictGroups.length);
  });
});

describe('resolveDuplicates', () => {
  test('keeps snippet with most tags', () => {
    const a = makeSnippet('1', 'const x = 1;', ['js'], '');
    const b = makeSnippet('2', 'const x = 1;', ['js', 'util', 'const'], '');
    const groups = [{ group: [a, b] }];
    const toRemove = resolveDuplicates(groups);
    expect(toRemove).toHaveLength(1);
    expect(toRemove[0].id).toBe('1');
  });

  test('breaks tag tie by description length', () => {
    const a = makeSnippet('1', 'const x = 1;', ['js'], 'short');
    const b = makeSnippet('2', 'const x = 1;', ['js'], 'a much longer description wins');
    const groups = [{ group: [a, b] }];
    const toRemove = resolveDuplicates(groups);
    expect(toRemove[0].id).toBe('1');
  });

  test('returns empty array for no groups', () => {
    expect(resolveDuplicates([])).toHaveLength(0);
  });
});
