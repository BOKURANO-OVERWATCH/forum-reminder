import { watch } from "node:fs";
import { dirname, join } from "node:path";
import { logger } from "@/logger";

function checkSkipImport(filePath: string) {
    const cwd = dirname(Bun.main);
    if (!filePath.startsWith(cwd)) {
        return true;
    }

    return false;
}

export const deleteCache = () => {
    let clearedCount = 0;
    for (const file of Object.keys(require.cache)) {
        if (checkSkipImport(file)) {
            continue;
        }
        delete require.cache[file];
        clearedCount++;
    }
    logger.debug("Core", `Import cache cleared: ${clearedCount} module(s) removed`);
};

export const watchFile = (path: string, callback: (filename: string) => void | Promise<void>) => {
    let debounceTimeout: NodeJS.Timeout | null = null;
    const watchDir = join(dirname(Bun.main), path);
    logger.debug("Core", `watchdog start: ${watchDir}`);
    watch(watchDir, { recursive: true }, (_, filename) => {
        if (!filename) {
            return;
        }
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(() => {
            callback(join(dirname(Bun.main), path, filename));
            debounceTimeout = null;
        }, 100);
    });
};
