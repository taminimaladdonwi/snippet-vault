# snippet-vault

> Lightweight CLI for storing and retrieving annotated code snippets with fuzzy search

---

## Installation

```bash
npm install -g snippet-vault
```

---

## Usage

**Save a snippet**
```bash
snip save --tag "js/array" --note "Flatten nested arrays" flatten.js
```

**Search snippets**
```bash
snip search "flatten array"
```

**List all snippets**
```bash
snip list
```

**Retrieve a snippet**
```bash
snip get js/array
```

Snippets are stored locally in `~/.snippet-vault/` as plain files with a JSON index for fast lookup.

---

## Features

- 📦 Save snippets from files or stdin
- 🔍 Fuzzy search across tags, notes, and content
- 🏷️ Annotate snippets with tags and descriptions
- ⚡ Zero config — works out of the box

---

## Requirements

- Node.js >= 14

---

## License

[MIT](LICENSE)