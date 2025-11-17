import { createClient, RedisClientType } from "redis";

export const redis: RedisClientType = createClient({
  url: "redis://localhost:6379"
});

export const pub: RedisClientType = createClient({
  url: "redis://localhost:6379"
});

export const sub: RedisClientType = createClient({
  url: "redis://localhost:6379"
});
