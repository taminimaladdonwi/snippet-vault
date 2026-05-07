jest.mock('../storage');
const { loadSnippets, saveSnippets } = require('../storage');
const { listTags, addTags, removeTag, listByTags } = require('./tag');

const baseSnippets = [
  { id: 'abc1', title: 'fetch helper', tags: ['javascript', 'http'] },
  { id: 'abc2', title: 'debounce fn', tags: ['javascript', 'utility'] },
  { id: 'abc3', title: 'sql query', tags: ['sql'] },
];

beforeEach(() => {
  jest.clearAllMocks();
  loadSnippets.mockResolvedValue(JSON.parse(JSON.stringify(baseSnippets)));
  saveSnippets.mockResolvedValue(undefined);
});

describe('listTags', () => {
  test('prints all tags with counts', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await listTags();
    expect(spy).toHaveBeenCalledWith('Tags:');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('javascript (2)'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('sql (1)'));
    spy.mockRestore();
  });

  test('prints message when no tags exist', async () => {
    loadSnippets.mockResolvedValue([{ id: 'x', title: 'no tags' }]);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await listTags();
    expect(spy).toHaveBeenCalledWith('No tags found.');
    spy.mockRestore();
  });
});

describe('addTags', () => {
  test('adds tags to existing snippet', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await addTags('abc1', 'async, browser');
    const saved = saveSnippets.mock.calls[0][0];
    expect(saved[0].tags).toContain('async');
    expect(saved[0].tags).toContain('browser');
    spy.mockRestore();
  });

  test('exits with error for unknown snippet id', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(addTags('unknown', 'js')).rejects.toThrow('exit');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('not found'));
    spy.mockRestore();
    exitSpy.mockRestore();
  });
});

describe('removeTag', () => {
  test('removes tag from snippet', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await removeTag('abc1', 'http');
    const saved = saveSnippets.mock.calls[0][0];
    expect(saved[0].tags).not.toContain('http');
    expect(saved[0].tags).toContain('javascript');
    spy.mockRestore();
  });
});

describe('listByTags', () => {
  test('lists snippets matching tags', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await listByTags('javascript');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('fetch helper'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('debounce fn'));
    spy.mockRestore();
  });

  test('prints message when no snippets match', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await listByTags('python');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No snippets found'));
    spy.mockRestore();
  });
});
