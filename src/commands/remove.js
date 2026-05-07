import inquirer from 'inquirer';
import { loadSnippets, removeSnippet } from '../storage.js';

/**
 * Find snippets matching a given id prefix or title substring.
 */
function findCandidates(snippets, query) {
  const q = query.toLowerCase();
  return snippets.filter(
    (s) =>
      s.id.startsWith(query) ||
      (s.title && s.title.toLowerCase().includes(q))
  );
}

/**
 * Format a snippet for display in the selection list.
 */
function formatChoice(snippet) {
  const tags = snippet.tags && snippet.tags.length ? ` [${snippet.tags.join(', ')}]` : '';
  return {
    name: `${snippet.id.slice(0, 8)}  ${snippet.title || '(untitled)'}${tags}`,
    value: snippet.id,
  };
}

export async function cmdRemove(args, options = {}) {
  const snippets = await loadSnippets();

  if (snippets.length === 0) {
    console.log('No snippets stored yet.');
    return;
  }

  let targetId = args[0] || null;
  let candidates = targetId ? findCandidates(snippets, targetId) : snippets;

  if (candidates.length === 0) {
    console.error(`No snippet found matching "${targetId}".`);
    process.exitCode = 1;
    return;
  }

  let idToRemove;

  if (candidates.length === 1) {
    idToRemove = candidates[0].id;
  } else {
    const { chosen } = await inquirer.prompt([
      {
        type: 'list',
        name: 'chosen',
        message: 'Multiple snippets found. Which one do you want to remove?',
        choices: candidates.map(formatChoice),
      },
    ]);
    idToRemove = chosen;
  }

  if (!options.yes) {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Remove snippet ${idToRemove.slice(0, 8)}?`,
        default: false,
      },
    ]);
    if (!confirmed) {
      console.log('Aborted.');
      return;
    }
  }

  await removeSnippet(idToRemove);
  console.log(`Snippet ${idToRemove.slice(0, 8)} removed.`);
}
