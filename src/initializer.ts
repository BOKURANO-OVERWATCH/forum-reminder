import { Events } from "discord.js";
import { client } from "@/client";
import { logger } from "@/logger";
import { deleteCache, watchFile } from "@/utils/importUtils";
import { isProduction } from "@/utils/isProduction";

export async function initialize() {
    const { readyEvent } = await import("@/events/ClientReady/readyEvent");
    client.on(Events.GuildCreate, () => {});
    client.on(Events.GuildDelete, () => {});

    client.on(Events.ClientReady, readyEvent);
}

function setupHotReloading(terminateTime: number) {
    const setupAutoExit = (timeout: number) => {
        const exit = () => {
            logger.info("Core", "Auto close because there was no operation for a certain period of time");
            process.exit(0);
        };
        return setTimeout(exit, timeout);
    };

    let exitTimer = setupAutoExit(terminateTime);

    watchFile("./", async (filename) => {
        clearTimeout(exitTimer);
        exitTimer = setupAutoExit(terminateTime);

        if (!client.isReady()) {
            logger.warn("Core", "hot reloading is not possible before initializing the client");
            logger.warn("Core", `filename: ${filename}`);
            return;
        }
        deleteCache();
        client.removeAllListeners(Events.ClientReady);
        client.removeAllListeners(Events.GuildCreate);
        client.removeAllListeners(Events.GuildDelete);
        await initialize();
    });
}

if (!isProduction) {
    setupHotReloading(1000 * 60 * 15); // 15 minutes
}
