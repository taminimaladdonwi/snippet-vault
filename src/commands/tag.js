/**
 * CLI command handlers for tag management
 */
const { loadSnippets, saveSnippets } = require('../storage');
const {
  parseTags,
  getAllTags,
  filterByTags,
  addTagsToSnippet,
  removeTagFromSnippet,
} = require('../tags');

/**
 * List all tags used across snippets, with usage counts
 */
async function listTags() {
  const snippets = await loadSnippets();
  const tags = getAllTags(snippets);

  if (tags.length === 0) {
    console.log('No tags found.');
    return;
  }

  const counts = {};
  for (const snippet of snippets) {
    if (Array.isArray(snippet.tags)) {
      snippet.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
    }
  }

  console.log('Tags:');
  tags.forEach(tag => {
    console.log(`  ${tag} (${counts[tag] || 0})`);
  });
}

/**
 * Add tags to an existing snippet by ID
 * @param {string} id
 * @param {string} tagString - comma-separated tags
 */
async function addTags(id, tagString) {
  const snippets = await loadSnippets();
  const index = snippets.findIndex(s => s.id === id);

  if (index === -1) {
    console.error(`Snippet with id "${id}" not found.`);
    process.exit(1);
  }

  const newTags = parseTags(tagString);
  if (newTags.length === 0) {
    console.error('No valid tags provided.');
    process.exit(1);
  }

  snippets[index] = addTagsToSnippet(snippets[index], newTags);
  await saveSnippets(snippets);
  console.log(`Added tags [${newTags.join(', ')}] to snippet "${snippets[index].title}".`);
}

/**
 * Remove a tag from an existing snippet by ID
 * @param {string} id
 * @param {string} tag
 */
async function removeTag(id, tag) {
  const snippets = await loadSnippets();
  const index = snippets.findIndex(s => s.id === id);

  if (index === -1) {
    console.error(`Snippet with id "${id}" not found.`);
    process.exit(1);
  }

  snippets[index] = removeTagFromSnippet(snippets[index], tag);
  await saveSnippets(snippets);
  console.log(`Removed tag "${tag}" from snippet "${snippets[index].title}".`);
}

/**
 * List snippets filtered by tags
 * @param {string} tagString - comma-separated tags
 */
async function listByTags(tagString) {
  const snippets = await loadSnippets();
  const tags = parseTags(tagString);
  const results = filterByTags(snippets, tags);

  if (results.length === 0) {
    console.log(`No snippets found with tags: ${tags.join(', ')}`);
    return;
  }

  console.log(`Snippets tagged [${tags.join(', ')}]:`);
  results.forEach(s => {
    const tagList = (s.tags || []).join(', ');
    console.log(`  [${s.id}] ${s.title}  — ${tagList}`);
  });
}

module.exports = { listTags, addTags, removeTag, listByTags };
