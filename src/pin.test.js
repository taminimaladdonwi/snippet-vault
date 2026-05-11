const { pinSnippet, unpinSnippet, getPinned, sortWithPinnedFirst } = require('./pin');

const makeSnippets = () => [
  { id: 'a1', title: 'Alpha', code: 'const a = 1;', pinned: false },
  { id: 'b2', title: 'Beta',  code: 'const b = 2;', pinned: false },
  { id: 'c3', title: 'Gamma', code: 'const c = 3;', pinned: true  },
];

describe('pinSnippet', () => {
  it('marks an unpinned snippet as pinned', () => {
    const result = pinSnippet(makeSnippets(), 'a1');
    expect(result.find((s) => s.id === 'a1').pinned).toBe(true);
  });

  it('does not mutate original array', () => {
    const original = makeSnippets();
    pinSnippet(original, 'a1');
    expect(original.find((s) => s.id === 'a1').pinned).toBe(false);
  });

  it('is a no-op if snippet is already pinned', () => {
    const snippets = makeSnippets();
    const result = pinSnippet(snippets, 'c3');
    expect(result).toBe(snippets); // same reference
  });

  it('throws when id does not exist', () => {
    expect(() => pinSnippet(makeSnippets(), 'zzz')).toThrow('Snippet not found: zzz');
  });
});

describe('unpinSnippet', () => {
  it('marks a pinned snippet as unpinned', () => {
    const result = unpinSnippet(makeSnippets(), 'c3');
    expect(result.find((s) => s.id === 'c3').pinned).toBe(false);
  });

  it('is a no-op if snippet is already unpinned', () => {
    const snippets = makeSnippets();
    const result = unpinSnippet(snippets, 'a1');
    expect(result).toBe(snippets);
  });

  it('throws when id does not exist', () => {
    expect(() => unpinSnippet(makeSnippets(), 'zzz')).toThrow('Snippet not found: zzz');
  });
});

describe('getPinned', () => {
  it('returns only pinned snippets', () => {
    const pinned = getPinned(makeSnippets());
    expect(pinned).toHaveLength(1);
    expect(pinned[0].id).toBe('c3');
  });

  it('returns empty array when none are pinned', () => {
    const snippets = makeSnippets().map((s) => ({ ...s, pinned: false }));
    expect(getPinned(snippets)).toEqual([]);
  });
});

describe('sortWithPinnedFirst', () => {
  it('moves pinned snippets to the front', () => {
    const sorted = sortWithPinnedFirst(makeSnippets());
    expect(sorted[0].id).toBe('c3');
  });

  it('preserves relative order within each group', () => {
    const snippets = [
      { id: '1', pinned: false },
      { id: '2', pinned: true  },
      { id: '3', pinned: false },
      { id: '4', pinned: true  },
    ];
    const sorted = sortWithPinnedFirst(snippets);
    expect(sorted.map((s) => s.id)).toEqual(['2', '4', '1', '3']);
  });

  it('returns same order when nothing is pinned', () => {
    const snippets = makeSnippets().map((s) => ({ ...s, pinned: false }));
    const sorted = sortWithPinnedFirst(snippets);
    expect(sorted.map((s) => s.id)).toEqual(['a1', 'b2', 'c3']);
  });
});
