import { RedisClientType, createClient } from "redis";

export class RedisInstance {
    private static redis: RedisClientType;

    static instance(): RedisClientType {
        if (!RedisInstance.redis) {
            const url = process.env.REDIS_URL ?? "redis://localhost:6379"
            console.log("Connecting to Redis at " + url)
            RedisInstance.redis = createClient({
                url,
            });
        }

        return RedisInstance.redis;
    }
}