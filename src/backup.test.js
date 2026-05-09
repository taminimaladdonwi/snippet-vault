const fs = require('fs');
const path = require('path');
const os = require('os');
const { createBackup, listBackups, restoreBackup, pruneBackups, generateBackupFilename } = require('./backup');

jest.mock('./storage');
const { loadSnippets } = require('./storage');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sv-backup-test-'));
  loadSnippets.mockReturnValue([
    { id: '1', title: 'Snippet A', code: 'console.log(1)', language: 'js', tags: [], note: '' },
    { id: '2', title: 'Snippet B', code: 'print(2)', language: 'python', tags: [], note: '' },
  ]);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('generateBackupFilename returns a timestamped filename', () => {
  const name = generateBackupFilename();
  expect(name).toMatch(/^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/);
});

test('createBackup writes snippets to a file', () => {
  const { filepath, count } = createBackup(tmpDir);
  expect(count).toBe(2);
  expect(fs.existsSync(filepath)).toBe(true);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  expect(data).toHaveLength(2);
});

test('listBackups returns sorted backups newest first', () => {
  createBackup(tmpDir);
  createBackup(tmpDir);
  const backups = listBackups(tmpDir);
  expect(backups.length).toBeGreaterThanOrEqual(2);
  expect(backups[0].filename >= backups[1].filename).toBe(true);
});

test('listBackups returns empty array when dir does not exist', () => {
  const result = listBackups(path.join(tmpDir, 'nonexistent'));
  expect(result).toEqual([]);
});

test('restoreBackup returns snippets from file', () => {
  const { filepath } = createBackup(tmpDir);
  const snippets = restoreBackup(filepath);
  expect(snippets).toHaveLength(2);
  expect(snippets[0].title).toBe('Snippet A');
});

test('restoreBackup throws if file not found', () => {
  expect(() => restoreBackup('/no/such/file.json')).toThrow('Backup file not found');
});

test('pruneBackups removes old backups beyond keep limit', () => {
  for (let i = 0; i < 5; i++) createBackup(tmpDir);
  const removed = pruneBackups(tmpDir, 3);
  expect(removed).toBe(2);
  expect(listBackups(tmpDir)).toHaveLength(3);
});
