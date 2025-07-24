#!/usr/bin/env node
import { cpSync, watch as fsWatch, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

/** Deletes dist/ and copies static resources */
export function cleanAndCopyStaticFiles(src, dist) {
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  cpSync(src, dist, {
    recursive: true,
    filter: (source) => {
      return !source.endsWith('.ts') &&
             !source.endsWith('.tsx') &&
             !source.endsWith('.js') &&
             !source.endsWith('.jsx') &&
             !source.endsWith('.css') ||
             source === src;
    }
  });
}

/** Watch static files and copy on change */
export function watchStaticFiles(src, dist, callback) {
  console.log('Watching static files...');
  
  const watcher = fsWatch(src, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    
    // Check if it's a static file (not ts/tsx/js/jsx/css)
    if (!filename.endsWith('.ts') && 
        !filename.endsWith('.tsx') && 
        !filename.endsWith('.js') && 
        !filename.endsWith('.jsx') && 
        !filename.endsWith('.css')) {
      
      const srcPath = join(src, filename);
      const destPath = join(dist, filename);
      
      if (eventType === 'rename') {
        // Check if file exists (was added) or was removed
        if (existsSync(srcPath)) {
          console.log(`Copying: ${filename}`);
          const destDir = dirname(destPath);
          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
          }
          try {
            cpSync(srcPath, destPath);
            if (callback) callback('add', filename);
          } catch (err) {
            console.error(`Failed to copy ${filename}:`, err);
          }
        } else {
          console.log(`Removing: ${filename}`);
          if (existsSync(destPath)) {
            try {
              rmSync(destPath, { force: true });
              if (callback) callback('remove', filename);
            } catch (err) {
              console.error(`Failed to remove ${filename}:`, err);
            }
          }
        }
      } else if (eventType === 'change') {
        console.log(`Updating: ${filename}`);
        try {
          cpSync(srcPath, destPath);
          if (callback) callback('change', filename);
        } catch (err) {
          console.error(`Failed to update ${filename}:`, err);
        }
      }
    }
  });
  
  return watcher;
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , src, dist, watchFlag] = process.argv;
  
  if (!src || !dist) {
    console.error('Usage: node static-files.js <src> <dist> [--watch]');
    process.exit(1);
  }
  
  if (watchFlag === '--watch') {
    cleanAndCopyStaticFiles(src, dist);
    watchStaticFiles(src, dist);
  } else {
    cleanAndCopyStaticFiles(src, dist);
  }
}