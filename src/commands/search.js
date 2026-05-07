const { loadSnippets } = require('../storage');
const { searchSnippets } = require('../search');
const { filterByTags, parseTags } = require('../tags');

function formatSnippet(snippet, index) {
  const tags = snippet.tags && snippet.tags.length > 0
    ? `[${snippet.tags.join(', ')}]`
    : '[no tags]';
  const lines = [
    `\n#${index + 1} — ${snippet.title} ${tags}`,
    `  ID: ${snippet.id}`,
  ];
  if (snippet.description) {
    lines.push(`  Desc: ${snippet.description}`);
  }
  lines.push(`  Lang: ${snippet.language || 'unknown'}`);
  lines.push(`  Code:\n${snippet.code.split('\n').map(l => '    ' + l).join('\n')}`);
  return lines.join('\n');
}

function cmdSearch(args, options = {}) {
  const query = args.join(' ').trim();
  const tagFilter = options.tag || options.t || null;
  const limitOpt = parseInt(options.limit || options.l || '10', 10);
  const limit = isNaN(limitOpt) ? 10 : limitOpt;

  if (!query && !tagFilter) {
    console.error('Usage: snippet-vault search <query> [--tag <tag>] [--limit <n>]');
    process.exit(1);
  }

  let snippets = loadSnippets();

  if (tagFilter) {
    const tags = parseTags(tagFilter);
    snippets = filterByTags(snippets, tags);
  }

  let results;
  if (query) {
    results = searchSnippets(snippets, query).slice(0, limit);
  } else {
    results = snippets.slice(0, limit);
  }

  if (results.length === 0) {
    console.log('No snippets found.');
    return;
  }

  console.log(`Found ${results.length} snippet(s):`);
  results.forEach((snippet, i) => {
    console.log(formatSnippet(snippet, i));
  });
}

module.exports = { cmdSearch, formatSnippet };
