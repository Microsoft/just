import fs from 'fs';
import path from 'path';
import { resolveCwd } from '../resolve';
import { findPackageRoot } from './findPackageRoot';
import { logger } from 'just-task-logger';

interface DepInfo {
  name: string;
  path: string;
}

export function findDependents() {
  return collectAllDependentPaths(findPackageRoot());
}

function getDepsPaths(pkgPath: string): DepInfo[] {
  const packageJsonFile = path.join(pkgPath, 'package.json');

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonFile).toString());

    let deps: string[] = [];
    deps = [
      ...deps,
      ...(packageJson.dependencies ? Object.keys(packageJson.dependencies) : []),
      ...(packageJson.devDependencies ? Object.keys(packageJson.devDependencies) : [])
    ];

    return deps
      .map(dep => {
        const depPackageJson = resolveCwd(path.join(dep, 'package.json'))!;

        if (!depPackageJson) {
          return null;
        }

        return { name: dep, path: path.dirname(fs.realpathSync(depPackageJson)) };
      })
      .filter(p => p && p.path.indexOf('node_modules') === -1) as DepInfo[];
  } catch (e) {
    logger.error(`Invalid package.json detected at ${packageJsonFile} `, e);
    return [];
  }
}

function collectAllDependentPaths(pkgPath: string, collected: Set<DepInfo> = new Set<DepInfo>()) {
  let depPaths = getDepsPaths(pkgPath);

  for (let depPath of depPaths) {
    collectAllDependentPaths(depPath.path, collected);
  }

  collected = new Set([...depPaths, ...collected]);

  return collected;
}
