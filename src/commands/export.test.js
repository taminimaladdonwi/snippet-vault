import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import { cmdExport } from './export.js';
import * as storage from '../storage.js';
import * as exportMod from '../export.js';

const SNIPPETS = [
  { id: '1', title: 'Alpha', code: 'let a = 1;', tags: ['js'], language: 'javascript', createdAt: Date.now() },
  { id: '2', title: 'Beta',  code: 'print(1)',   tags: ['py'], language: 'python',     createdAt: Date.now() },
];

beforeEach(() => {
  vi.spyOn(storage, 'loadSnippets').mockReturnValue(SNIPPETS);
  vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe('cmdExport', () => {
  it('writes JSON by default', async () => {
    await cmdExport([], {});
    const [, content] = fs.writeFileSync.mock.calls[0];
    const parsed = JSON.parse(content);
    expect(parsed).toHaveLength(2);
  });

  it('writes Markdown when --format markdown', async () => {
    await cmdExport([], { format: 'markdown', output: 'out.md' });
    const [filePath, content] = fs.writeFileSync.mock.calls[0];
    expect(filePath).toMatch(/out\.md$/);
    expect(content).toContain('# Snippet Vault Export');
  });

  it('uses custom output path', async () => {
    await cmdExport([], { output: '/tmp/my-snippets.json' });
    expect(fs.writeFileSync.mock.calls[0][0]).toMatch(/my-snippets\.json$/);
  });

  it('filters by tags before exporting', async () => {
    await cmdExport([], { tags: 'py', format: 'json' });
    const parsed = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe('Beta');
  });

  it('exits with error on unsupported format', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(cmdExport([], { format: 'csv' })).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('logs count and path after export', async () => {
    await cmdExport([], {});
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('2 snippet(s)'));
  });
});
