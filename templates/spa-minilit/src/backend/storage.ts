import * as fs from "node:fs";
import * as path from "node:path";

/**
 * FileStore - Single JSON file key/value store (like localStorage)
 * Loads entire file on init, updates in-memory, writes on modification
 */
export class FileStore<T = unknown> {
  private filePath: string;
  private data: Map<string, T>;
  private writeScheduled = false;
  private isWriting = false;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.data = new Map();

    // Load from file if exists
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const obj = JSON.parse(content);
        this.data = new Map(Object.entries(obj));
      } catch (err) {
        console.error(`Failed to load ${filePath}:`, err);
      }
    }
  }

  getItem(key: string): T | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: T): void {
    this.data.set(key, value);
    this.scheduleSave();
  }

  removeItem(key: string): void {
    this.data.delete(key);
    this.scheduleSave();
  }

  clear(): void {
    this.data.clear();
    this.scheduleSave();
  }

  keys(): string[] {
    return Array.from(this.data.keys());
  }

  values(): T[] {
    return Array.from(this.data.values());
  }

  get length(): number {
    return this.data.size;
  }

  private scheduleSave(): void {
    if (this.writeScheduled) return;
    this.writeScheduled = true;
    this.processWrites();
  }

  private async processWrites(): Promise<void> {
    if (this.isWriting) return;
    this.isWriting = true;

    while (this.writeScheduled) {
      this.writeScheduled = false;
      const obj = Object.fromEntries(this.data);
      await fs.promises.writeFile(this.filePath, JSON.stringify(obj, null, 2), "utf-8");
    }

    this.isWriting = false;
  }
}

/**
 * DirectoryStore - Each key is a separate file (like localStorage but distributed)
 * File name = key + .json
 */
export class DirectoryStore<T = unknown> {
  private dirPath: string;
  private cache: Map<string, T>;
  private writeQueue: Array<{ key: string; value: T }> = [];
  private isWriting = false;

  constructor(dirPath: string) {
    this.dirPath = dirPath;
    this.cache = new Map();

    // Create directory if needed
    fs.mkdirSync(dirPath, { recursive: true });

    // Load all files into cache
    this.loadAll();
  }

  private loadAll(): void {
    const files = fs.readdirSync(this.dirPath).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const key = file.slice(0, -5); // Remove .json
      try {
        const content = fs.readFileSync(path.join(this.dirPath, file), "utf-8");
        const value = JSON.parse(content);
        this.cache.set(key, value);
      } catch (err) {
        console.error(`Failed to load ${file}:`, err);
      }
    }
  }

  getItem(key: string): T | null {
    return this.cache.get(key) ?? null;
  }

  setItem(key: string, value: T): void {
    this.cache.set(key, value);
    this.writeQueue.push({ key, value });
    this.processQueue();
  }

  removeItem(key: string): void {
    this.cache.delete(key);
    const filePath = path.join(this.dirPath, `${key}.json`);
    // Sync delete for now (rarely called)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  clear(): void {
    // Delete all files
    for (const key of this.cache.keys()) {
      this.removeItem(key);
    }
    this.cache.clear();
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values(): T[] {
    return Array.from(this.cache.values());
  }

  get length(): number {
    return this.cache.size;
  }

  private async processQueue(): Promise<void> {
    if (this.isWriting) return;
    this.isWriting = true;

    while (this.writeQueue.length > 0) {
      const item = this.writeQueue.shift();
      if (item) {
        const filePath = path.join(this.dirPath, `${item.key}.json`);
        await fs.promises.writeFile(filePath, JSON.stringify(item.value, null, 2), "utf-8");
      }
    }

    this.isWriting = false;
  }
}
