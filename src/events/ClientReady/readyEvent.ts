import { client } from "@/client";
import { logger } from "@/logger";

export const readyEvent = async () => {
    if (!client.user) {
        throw new Error("client.user is undefined");
    }
    logger.info("Discord", `Logged in as ${client.user.tag}!`);
};
