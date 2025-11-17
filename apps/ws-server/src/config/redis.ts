import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.REDIS_URL;

export const redis: RedisClientType = createClient({ url });
export const pub: RedisClientType = createClient({ url });
export const subPattern: RedisClientType = createClient({ url });
export const subGlobal: RedisClientType = createClient({ url });
