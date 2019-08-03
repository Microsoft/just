import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import jju from 'jju';
import { logger } from './logger';
import { RushJson } from './interfaces/RushJson';

/**
 * Runs rush update.
 * @param cwd Working directory in which to run the command.
 */
export function rushUpdate(cwd: string): void {
  spawnSync(process.execPath, ['common/scripts/install-run-rush.js', 'update'], {
    cwd,
    stdio: 'inherit'
  });
}

/**
 * Reads the contents of rush.json (using a parser which handles comments).
 * @param rootPath Path to the folder containing rush.json.
 * @returns The parsed contents of rush.json or undefined if it's not found.
 */
export function readRushJson(rootPath: string): RushJson | undefined {
  const rushJsonPath = path.join(rootPath, 'rush.json');
  const contents = _justReadRushJson(rushJsonPath);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return _parseRushJson(contents!);
}

/**
 * Adds a package to the projects list in rush.json.
 * @param packageName Name of the new package. Assumed to be located under `packages/${packageName}`.
 * @param rootPath Path to the folder containing rush.json.
 */
export function rushAddPackage(packageName: string, rootPath: string): void {
  const rushJsonPath = path.join(rootPath, 'rush.json');
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const oldContents = _justReadRushJson(rushJsonPath)!;
  const rushJson = _parseRushJson(oldContents);
  if (!rushJson) {
    logger.error(`Couldn't read rush.json under ${rootPath}. Not adding package.`);
    return;
  }

  if (!rushJson.projects) {
    rushJson.projects = [];
  }
  rushJson.projects.push({
    packageName,
    projectFolder: `packages/${packageName}`
  });

  try {
    const newContents = jju.update(oldContents, rushJson, { mode: 'cjson', indent: 2 });
    fs.writeFileSync(rushJsonPath, newContents);
  } catch (ex) {
    logger.error(`Couldn't update rush.json under ${rootPath}. Not adding package.`);
    logger.error('Error:', ex);
  }
}

/** Read (but don't parse) rush.json. Exported for testing only. */
export function _justReadRushJson(rushJsonPath: string): string | undefined {
  try {
    return fs.readFileSync(rushJsonPath, 'utf8').toString();
  } catch {
    return undefined;
  }
}

/** Parse an already-read rush.json. Exported for testing only. */
export function _parseRushJson(rushJsonContents: string): RushJson | undefined {
  try {
    // rush.json can contain comments, so we have to use a json library which supports comments
    // (instead of JSON.parse/JSON.stringify)
    return jju.parse(rushJsonContents, { mode: 'cjson' });
  } catch {
    return undefined;
  }
}
