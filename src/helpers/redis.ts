const upstashRedisURL = process.env.UPSTASH_REDIS_REST_URL;
const upstashRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

type Command = "zrange" | "sismember" | "get" | "smembers";

export async function fetchRedis(
  command: Command,
  ...args: (string | number)[]
) {
  const commandURL = `${upstashRedisURL}/${command}/${args.join("/")}`;
  const response = await fetch(commandURL, {
    headers: {
      Authorization: `Bearer ${upstashRedisToken}`,
    },
    cache: "no-store",
  });

  // TO DO: CHANGE THIS LATER TO SMTH GENERAL - UNSAFE DB PROVIDER LEAK
  if (!response.ok)
    throw new Error(`Error executing Redis command: ${response.statusText}`);

  const data = (await response.json()) as { result: string | null };
  return data.result;
}
