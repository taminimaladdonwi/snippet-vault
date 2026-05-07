/**
 * Stats module — compute usage statistics over the snippet vault.
 */

/**
 * @param {Array} snippets
 * @returns {{ total: number, byTag: Object, avgTagsPerSnippet: number, topTags: Array }}
 */
function computeStats(snippets) {
  const total = snippets.length;

  const byTag = {};
  let totalTagCount = 0;

  for (const snippet of snippets) {
    const tags = snippet.tags || [];
    totalTagCount += tags.length;
    for (const tag of tags) {
      byTag[tag] = (byTag[tag] || 0) + 1;
    }
  }

  const avgTagsPerSnippet = total === 0 ? 0 : parseFloat((totalTagCount / total).toFixed(2));

  const topTags = Object.entries(byTag)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  return { total, byTag, avgTagsPerSnippet, topTags };
}

/**
 * @param {{ total: number, avgTagsPerSnippet: number, topTags: Array }} stats
 * @returns {string}
 */
function formatStats(stats) {
  const lines = [
    `Total snippets : ${stats.total}`,
    `Avg tags/snippet: ${stats.avgTagsPerSnippet}`,
  ];

  if (stats.topTags.length > 0) {
    lines.push('');
    lines.push('Top tags:');
    for (const { tag, count } of stats.topTags) {
      lines.push(`  ${tag.padEnd(20)} ${count}`);
    }
  } else {
    lines.push('No tags found.');
  }

  return lines.join('\n');
}

module.exports = { computeStats, formatStats };
