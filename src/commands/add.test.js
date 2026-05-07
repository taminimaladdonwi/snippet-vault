const { cmdAdd } = require('./add');
const storage = require('../storage');
const { Readable } = require('stream');

jest.mock('../storage');

function makeInput(lines) {
  return Readable.from(lines.join('\n') + '\n');
}

const NULL_OUTPUT = { write: () => {} };

describe('cmdAdd', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.addSnippet.mockImplementation((data) => ({ id: 'abc123', ...data }));
  });

  it('creates a snippet from interactive prompts', async () => {
    const input = makeInput([
      'My Snippet',
      'js',
      'utils, helpers',
      'A handy helper',
      'console.log("hello");',
      'END',
    ]);

    const snippet = await cmdAdd([], { input, output: NULL_OUTPUT });

    expect(storage.addSnippet).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'My Snippet',
        language: 'js',
        tags: expect.arrayContaining(['utils', 'helpers']),
        description: 'A handy helper',
        code: 'console.log("hello");',
      })
    );
    expect(snippet).toMatchObject({ id: 'abc123', title: 'My Snippet' });
  });

  it('returns null and does not save when title is empty', async () => {
    const input = makeInput(['', 'js', '', '', 'some code', 'END']);
    const snippet = await cmdAdd([], { input, output: NULL_OUTPUT });
    expect(snippet).toBeNull();
    expect(storage.addSnippet).not.toHaveBeenCalled();
  });

  it('returns null and does not save when code is empty', async () => {
    const input = makeInput(['My Snippet', 'js', '', '', 'END']);
    const snippet = await cmdAdd([], { input, output: NULL_OUTPUT });
    expect(snippet).toBeNull();
    expect(storage.addSnippet).not.toHaveBeenCalled();
  });

  it('handles snippets with no tags or description', async () => {
    const input = makeInput(['Bare Snippet', 'python', '', '', 'print(42)', 'END']);
    const snippet = await cmdAdd([], { input, output: NULL_OUTPUT });
    expect(snippet).toMatchObject({ title: 'Bare Snippet', language: 'python' });
    expect(storage.addSnippet).toHaveBeenCalledWith(
      expect.objectContaining({ tags: [], description: '' })
    );
  });
});
