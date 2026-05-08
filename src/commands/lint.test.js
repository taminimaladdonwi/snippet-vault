const { cmdLint, formatLintResult } = require('./lint');
const { loadSnippets } = require('../storage');

jest.mock('../storage');

const validSnippet = {
  title: 'Array flatten',
  code: '[1,[2,3]].flat()',
  tags: ['js'],
  language: 'javascript',
};

const invalidSnippet = {
  title: 'x',
  code: '',
};

describe('formatLintResult', () => {
  test('includes snippet title in output', () => {
    const out = formatLintResult(0, validSnippet, ['Code must not be empty']);
    expect(out).toContain('Array flatten');
    expect(out).toContain('Code must not be empty');
  });

  test('uses fallback title for unnamed snippet', () => {
    const out = formatLintResult(3, {}, ['Missing or invalid title']);
    expect(out).toContain('<snippet #3>');
  });
});

describe('cmdLint', () => {
  let logs;
  const log = (msg) => logs.push(msg);

  beforeEach(() => {
    logs = [];
    jest.clearAllMocks();
  });

  test('reports no snippets when vault is empty', async () => {
    loadSnippets.mockResolvedValue([]);
    const result = await cmdLint([], { log });
    expect(result).toEqual({ valid: 0, invalid: 0 });
    expect(logs.join(' ')).toContain('No snippets');
  });

  test('reports all passing when snippets are valid', async () => {
    loadSnippets.mockResolvedValue([validSnippet, validSnippet]);
    const result = await cmdLint([], { log });
    expect(result).toEqual({ valid: 2, invalid: 0 });
    expect(logs.join(' ')).toContain('passed validation');
  });

  test('reports issues for invalid snippets', async () => {
    loadSnippets.mockResolvedValue([validSnippet, invalidSnippet]);
    const result = await cmdLint([], { log });
    expect(result.invalid).toBe(1);
    expect(result.valid).toBe(1);
    const output = logs.join('\n');
    expect(output).toContain('issues in 1 of 2');
  });

  test('passes custom vaultPath to loadSnippets', async () => {
    loadSnippets.mockResolvedValue([validSnippet]);
    await cmdLint([], { log, vaultPath: '/custom/path' });
    expect(loadSnippets).toHaveBeenCalledWith('/custom/path');
  });
});
