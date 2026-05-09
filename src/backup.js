const fs = require('fs');
const path = require('path');
const { loadSnippets } = require('./storage');

const DEFAULT_BACKUP_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.snippet-vault', 'backups');

function ensureBackupDir(backupDir = DEFAULT_BACKUP_DIR) {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}

function generateBackupFilename() {
  const now = new Date();
  const ts = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  return `backup_${ts}.json`;
}

function createBackup(backupDir = DEFAULT_BACKUP_DIR) {
  ensureBackupDir(backupDir);
  const snippets = loadSnippets();
  const filename = generateBackupFilename();
  const filepath = path.join(backupDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(snippets, null, 2), 'utf-8');
  return { filepath, count: snippets.length };
}

function listBackups(backupDir = DEFAULT_BACKUP_DIR) {
  if (!fs.existsSync(backupDir)) return [];
  return fs
    .readdirSync(backupDir)
    .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
    .sort()
    .reverse()
    .map(f => ({
      filename: f,
      filepath: path.join(backupDir, f),
      created: fs.statSync(path.join(backupDir, f)).mtime,
    }));
}

function restoreBackup(filepath) {
  if (!fs.existsSync(filepath)) {
    throw new Error(`Backup file not found: ${filepath}`);
  }
  const raw = fs.readFileSync(filepath, 'utf-8');
  const snippets = JSON.parse(raw);
  if (!Array.isArray(snippets)) {
    throw new Error('Invalid backup format: expected an array of snippets');
  }
  return snippets;
}

function pruneBackups(backupDir = DEFAULT_BACKUP_DIR, keep = 10) {
  const backups = listBackups(backupDir);
  const toDelete = backups.slice(keep);
  toDelete.forEach(b => fs.unlinkSync(b.filepath));
  return toDelete.length;
}

module.exports = { createBackup, listBackups, restoreBackup, pruneBackups, generateBackupFilename };
