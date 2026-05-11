import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPackageVersion, getVaultInfo, formatVersionInfo } from './version.js';

vi.mock('./storage.js', () => ({
  loadSnippets: vi.fn(),
}));

import { loadSnippets } from './storage.js';

describe('getPackageVersion', () => {
  it('returns a semver-like string', () => {
    const v = getPackageVersion();
    expect(typeof v).toBe('string');
    expect(v).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe('getVaultInfo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns correct counts when snippets exist', async () => {
    loadSnippets.mockResolvedValue([
      { id: '1', tags: ['js', 'async'] },
      { id: '2', tags: ['js', 'node'] },
      { id: '3', tags: [] },
    ]);
    const info = await getVaultInfo('/fake/vault.json');
    expect(info.snippetCount).toBe(3);
    expect(info.tagCount).toBe(3); // js, async, node
    expect(info.vaultPath).toBe('/fake/vault.json');
  });

  it('returns zeros when loadSnippets throws', async () => {
    loadSnippets.mockRejectedValue(new Error('no file'));
    const info = await getVaultInfo('/missing/vault.json');
    expect(info.snippetCount).toBe(0);
    expect(info.tagCount).toBe(0);
  });

  it('handles snippets with no tags field', async () => {
    loadSnippets.mockResolvedValue([{ id: '1' }, { id: '2' }]);
    const info = await getVaultInfo('/fake/vault.json');
    expect(info.snippetCount).toBe(2);
    expect(info.tagCount).toBe(0);
  });
});

describe('formatVersionInfo', () => {
  it('includes version and vault stats', () => {
    const output = formatVersionInfo('1.2.3', {
      vaultPath: '/home/user/.vault.json',
      snippetCount: 42,
      tagCount: 7,
    });
    expect(output).toContain('v1.2.3');
    expect(output).toContain('/home/user/.vault.json');
    expect(output).toContain('42');
    expect(output).toContain('7');
  });

  it('returns a multi-line string', () => {
    const output = formatVersionInfo('0.1.0', {
      vaultPath: '/tmp/v.json',
      snippetCount: 0,
      tagCount: 0,
    });
    expect(output.split('\n').length).toBeGreaterThanOrEqual(3);
  });
});
