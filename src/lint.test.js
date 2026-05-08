const { lintSnippet, lintAll } = require('./lint');

const validSnippet = {
  title: 'Debounce function',
  code: 'function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }',
  tags: ['js', 'utility'],
  language: 'javascript',
};

describe('lintSnippet', () => {
  test('returns no issues for a valid snippet', () => {
    expect(lintSnippet(validSnippet)).toEqual([]);
  });

  test('returns issue for missing title', () => {
    const issues = lintSnippet({ ...validSnippet, title: undefined });
    expect(issues).toContain('Missing or invalid title');
  });

  test('returns issue for too-short title', () => {
    const issues = lintSnippet({ ...validSnippet, title: 'ab' });
    expect(issues.some(i => i.includes('too short'))).toBe(true);
  });

  test('returns issue for too-long title', () => {
    const issues = lintSnippet({ ...validSnippet, title: 'a'.repeat(121) });
    expect(issues.some(i => i.includes('too long'))).toBe(true);
  });

  test('returns issue for missing code', () => {
    const issues = lintSnippet({ ...validSnippet, code: undefined });
    expect(issues).toContain('Missing or invalid code');
  });

  test('returns issue for empty code', () => {
    const issues = lintSnippet({ ...validSnippet, code: '   ' });
    expect(issues).toContain('Code must not be empty');
  });

  test('returns issue for code exceeding max length', () => {
    const issues = lintSnippet({ ...validSnippet, code: 'x'.repeat(50001) });
    expect(issues.some(i => i.includes('maximum length'))).toBe(true);
  });

  test('returns issue when tags is not an array', () => {
    const issues = lintSnippet({ ...validSnippet, tags: 'js' });
    expect(issues).toContain('Tags must be an array');
  });

  test('returns issue for too many tags', () => {
    const issues = lintSnippet({ ...validSnippet, tags: Array(21).fill('tag') });
    expect(issues.some(i => i.includes('Too many tags'))).toBe(true);
  });

  test('returns issue for invalid tag entry', () => {
    const issues = lintSnippet({ ...validSnippet, tags: ['good', ''] });
    expect(issues.some(i => i.includes('Tag at index'))).toBe(true);
  });

  test('returns issue for non-string language', () => {
    const issues = lintSnippet({ ...validSnippet, language: 42 });
    expect(issues).toContain('Language must be a string');
  });

  test('handles null snippet', () => {
    const issues = lintSnippet(null);
    expect(issues.length).toBeGreaterThan(0);
  });
});

describe('lintAll', () => {
  test('returns empty map for all valid snippets', () => {
    const result = lintAll([validSnippet, validSnippet]);
    expect(result.size).toBe(0);
  });

  test('reports only invalid snippets', () => {
    const bad = { title: 'x', code: '' };
    const result = lintAll([validSnippet, bad, validSnippet]);
    expect(result.has(1)).toBe(true);
    expect(result.has(0)).toBe(false);
  });

  test('returns empty map for non-array input', () => {
    expect(lintAll(null).size).toBe(0);
  });
});
