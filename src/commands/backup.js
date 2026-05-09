#!/usr/bin/env node
const path = require('path');
const { saveSnippets } = require('../storage');
const { createBackup, listBackups, restoreBackup, pruneBackups } = require('../backup');

const BACKUP_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.snippet-vault', 'backups');

function cmdBackup(args) {
  const sub = args[0];

  if (!sub || sub === 'create') {
    const { filepath, count } = createBackup(BACKUP_DIR);
    console.log(`✓ Backup created: ${filepath}`);
    console.log(`  Saved ${count} snippet(s).`);
    pruneBackups(BACKUP_DIR, 10);
    return;
  }

  if (sub === 'list') {
    const backups = listBackups(BACKUP_DIR);
    if (backups.length === 0) {
      console.log('No backups found.');
      return;
    }
    console.log(`Found ${backups.length} backup(s):\n`);
    backups.forEach((b, i) => {
      const date = b.created.toLocaleString();
      console.log(`  ${i + 1}. ${b.filename}  (${date})`);
    });
    return;
  }

  if (sub === 'restore') {
    const target = args[1];
    if (!target) {
      console.error('Usage: snippet-vault backup restore <filename|filepath>');
      process.exit(1);
    }
    const filepath = path.isAbsolute(target) ? target : path.join(BACKUP_DIR, target);
    let snippets;
    try {
      snippets = restoreBackup(filepath);
    } catch (err) {
      console.error(`✗ Restore failed: ${err.message}`);
      process.exit(1);
    }
    saveSnippets(snippets);
    console.log(`✓ Restored ${snippets.length} snippet(s) from ${path.basename(filepath)}.`);
    return;
  }

  if (sub === 'prune') {
    const keep = parseInt(args[1], 10) || 10;
    const removed = pruneBackups(BACKUP_DIR, keep);
    console.log(`✓ Pruned ${removed} old backup(s). Keeping latest ${keep}.`);
    return;
  }

  console.error(`Unknown backup subcommand: ${sub}`);
  console.error('Available: create, list, restore, prune');
  process.exit(1);
}

module.exports = { cmdBackup };
