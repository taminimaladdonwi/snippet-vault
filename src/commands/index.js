/**
 * Central command registry — maps CLI command names to handler functions.
 * Extend this file when adding new commands.
 */
const { listTags, addTags, removeTag, listByTags } = require('./tag');

/** @type {Record<string, { handler: Function, usage: string, description: string }>} */
const commands = {
  'tag:list': {
    handler: () => listTags(),
    usage: 'tag:list',
    description: 'List all tags with usage counts',
  },
  'tag:add': {
    handler: (args) => addTags(args[0], args[1]),
    usage: 'tag:add <id> <tags>',
    description: 'Add comma-separated tags to a snippet by ID',
  },
  'tag:remove': {
    handler: (args) => removeTag(args[0], args[1]),
    usage: 'tag:remove <id> <tag>',
    description: 'Remove a tag from a snippet by ID',
  },
  'tag:filter': {
    handler: (args) => listByTags(args[0]),
    usage: 'tag:filter <tags>',
    description: 'List snippets matching all provided tags',
  },
};

/**
 * Dispatch a CLI command by name
 * @param {string} name
 * @param {string[]} args
 */
async function dispatch(name, args = []) {
  const cmd = commands[name];
  if (!cmd) {
    console.error(`Unknown command: "${name}"`);
    printHelp();
    process.exit(1);
  }
  await cmd.handler(args);
}

function printHelp() {
  console.log('\nAvailable commands:');
  for (const [name, { usage, description }] of Object.entries(commands)) {
    console.log(`  ${usage.padEnd(32)} ${description}`);
  }
  console.log();
}

module.exports = { dispatch, printHelp, commands };
