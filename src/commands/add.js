const { addSnippet } = require('../storage');
const { parseTags } = require('../tags');
const readline = require('readline');

function prompt(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function cmdAdd(args, options = {}) {
  const { input = process.stdin, output = process.stdout } = options;

  const rl = readline.createInterface({ input, output, terminal: false });

  try {
    const title = (await prompt(rl, 'Title: ')).trim();
    if (!title) {
      console.error('Error: title is required.');
      rl.close();
      return null;
    }

    const language = (await prompt(rl, 'Language (e.g. js, python): ')).trim();

    const tagsRaw = (await prompt(rl, 'Tags (comma-separated, optional): ')).trim();
    const tags = tagsRaw ? parseTags(tagsRaw) : [];

    const description = (await prompt(rl, 'Description (optional): ')).trim();

    console.log('Paste your code snippet below. Enter a line with only END to finish:');

    const codeLines = [];
    for await (const line of rl) {
      if (line.trim() === 'END') break;
      codeLines.push(line);
    }

    const code = codeLines.join('\n');
    if (!code.trim()) {
      console.error('Error: code snippet cannot be empty.');
      rl.close();
      return null;
    }

    const snippet = addSnippet({ title, language, tags, description, code });
    console.log(`\nSnippet "${snippet.title}" saved with id: ${snippet.id}`);
    rl.close();
    return snippet;
  } catch (err) {
    rl.close();
    throw err;
  }
}

module.exports = { cmdAdd };
