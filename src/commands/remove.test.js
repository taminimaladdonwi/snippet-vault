import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cmdRemove } from './remove.js';

vi.mock('../storage.js', () => ({
  loadSnippets: vi.fn(),
  removeSnippet: vi.fn(),
}));

vi.mock('inquirer', () => ({
  default: { prompt: vi.fn() },
}));

import { loadSnippets, removeSnippet } from '../storage.js';
import inquirer from 'inquirer';

const SNIPPET_A = { id: 'aaaa1111-0000-0000-0000-000000000000', title: 'Alpha snippet', tags: ['js'] };
const SNIPPET_B = { id: 'bbbb2222-0000-0000-0000-000000000000', title: 'Beta snippet', tags: [] };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('cmdRemove', () => {
  it('prints message when vault is empty', async () => {
    loadSnippets.mockResolvedValue([]);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await cmdRemove([]);
    expect(log).toHaveBeenCalledWith('No snippets stored yet.');
    expect(removeSnippet).not.toHaveBeenCalled();
  });

  it('removes directly when id prefix matches exactly one snippet (with --yes)', async () => {
    loadSnippets.mockResolvedValue([SNIPPET_A, SNIPPET_B]);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await cmdRemove(['aaaa1111'], { yes: true });
    expect(removeSnippet).toHaveBeenCalledWith(SNIPPET_A.id);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('removed'));
  });

  it('errors when no snippet matches the query', async () => {
    loadSnippets.mockResolvedValue([SNIPPET_A, SNIPPET_B]);
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    await cmdRemove(['zzzz']);
    expect(err).toHaveBeenCalledWith(expect.stringContaining('No snippet found'));
    expect(removeSnippet).not.toHaveBeenCalled();
  });

  it('prompts for selection when multiple candidates match', async () => {
    loadSnippets.mockResolvedValue([SNIPPET_A, SNIPPET_B]);
    inquirer.prompt
      .mockResolvedValueOnce({ chosen: SNIPPET_A.id })
      .mockResolvedValueOnce({ confirmed: true });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await cmdRemove(['snippet']);
    expect(inquirer.prompt).toHaveBeenCalledTimes(2);
    expect(removeSnippet).toHaveBeenCalledWith(SNIPPET_A.id);
  });

  it('aborts when user declines confirmation', async () => {
    loadSnippets.mockResolvedValue([SNIPPET_A]);
    inquirer.prompt.mockResolvedValueOnce({ confirmed: false });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await cmdRemove(['aaaa1111']);
    expect(removeSnippet).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('Aborted.');
  });
});
