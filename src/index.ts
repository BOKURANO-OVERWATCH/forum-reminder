import { client } from "@/client";
import { initialize } from "@/initializer";
import { logger } from "@/logger";

process.on("uncaughtException", async (err) => {
    logger.fatal("Core", err);
});

process.on("unhandledRejection", async (reason, p) => {
    logger.fatal("Core", `Unhandled Rejection at: ${p}, reason: ${reason}`);
});

await initialize();
client.login(process.env.TOKEN);
