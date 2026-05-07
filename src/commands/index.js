import { cmdAdd } from './add.js';
import { cmdSearch } from './search.js';
import { cmdTag } from './tag.js';
import { cmdRemove } from './remove.js';

export function printHelp() {
  console.log(`
snippet-vault — store and retrieve annotated code snippets

Usage:
  snippet-vault add                  Interactively add a new snippet
  snippet-vault search <query>       Fuzzy-search snippets by title/code/tags
  snippet-vault tag <id> [tags...]   Add tags to an existing snippet
  snippet-vault remove [id]          Remove a snippet (interactive if omitted)

Options:
  --yes, -y    Skip confirmation prompts
  --help, -h   Show this help message
`.trim());
}

export async function runCommand(argv) {
  const [, , cmd, ...rest] = argv;
  const flags = { yes: rest.includes('--yes') || rest.includes('-y') };
  const args = rest.filter((a) => !a.startsWith('-'));

  switch (cmd) {
    case 'add':
      return cmdAdd(args, flags);
    case 'search':
      return cmdSearch(args, flags);
    case 'tag':
      return cmdTag(args, flags);
    case 'remove':
    case 'rm':
      return cmdRemove(args, flags);
    default:
      printHelp();
  }
}
