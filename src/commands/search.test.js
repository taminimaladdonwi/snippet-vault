const { cmdSearch, formatSnippet } = require('./search');
const storage = require('../storage');
const search = require('../search');

jest.mock('../storage');
jest.mock('../search');

const MOCK_SNIPPETS = [
  {
    id: 'abc123',
    title: 'Debounce function',
    description: 'Limits how often a function fires',
    code: 'function debounce(fn, ms) {\n  let t;\n  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };\n}',
    language: 'javascript',
    tags: ['js', 'utils'],
  },
  {
    id: 'def456',
    title: 'Flatten array',
    description: null,
    code: 'const flatten = arr => arr.flat(Infinity);',
    language: 'javascript',
    tags: [],
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  storage.loadSnippets.mockReturnValue(MOCK_SNIPPETS);
  search.searchSnippets.mockImplementation((snips) => snips);
});

describe('formatSnippet', () => {
  test('includes title, id, and code', () => {
    const out = formatSnippet(MOCK_SNIPPETS[0], 0);
    expect(out).toContain('Debounce function');
    expect(out).toContain('abc123');
    expect(out).toContain('debounce');
  });

  test('shows tags when present', () => {
    const out = formatSnippet(MOCK_SNIPPETS[0], 0);
    expect(out).toContain('[js, utils]');
  });

  test('shows [no tags] when empty', () => {
    const out = formatSnippet(MOCK_SNIPPETS[1], 1);
    expect(out).toContain('[no tags]');
  });

  test('shows description when present', () => {
    const out = formatSnippet(MOCK_SNIPPETS[0], 0);
    expect(out).toContain('Limits how often');
  });

  test('omits description line when null', () => {
    const out = formatSnippet(MOCK_SNIPPETS[1], 1);
    expect(out).not.toContain('Desc:');
  });
});

describe('cmdSearch', () => {
  test('calls searchSnippets with loaded snippets and query', () => {
    cmdSearch(['debounce'], {});
    expect(storage.loadSnippets).toHaveBeenCalled();
    expect(search.searchSnippets).toHaveBeenCalledWith(MOCK_SNIPPETS, 'debounce');
  });

  test('prints results to stdout', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    cmdSearch(['debounce'], {});
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Found'));
    spy.mockRestore();
  });

  test('exits with error when no query and no tag', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => cmdSearch([], {})).toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  test('prints no snippets found when results empty', () => {
    search.searchSnippets.mockReturnValue([]);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    cmdSearch(['xyz'], {});
    expect(spy).toHaveBeenCalledWith('No snippets found.');
    spy.mockRestore();
  });

  test('respects --limit option', () => {
    search.searchSnippets.mockReturnValue(MOCK_SNIPPETS);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    cmdSearch(['fn'], { limit: '1' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Found 1'));
    spy.mockRestore();
  });
});
