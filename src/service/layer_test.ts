import { Effect, Context, Layer } from "effect";
import { assertEquals, assert, assertThrows } from "@std/assert";

// Declaring a tag for the Config service
class Config extends Context.Tag("Config")<
  Config,
  {
    readonly getConfig: Effect.Effect<{
      readonly logLevel: string;
      readonly connection: string;
    }>;
  }
>() {}

// Layer<Config, never, never>
const ConfigLive = Layer.succeed(Config, {
  getConfig: Effect.succeed({
    logLevel: "INFO",
    connection: "mysql://username:password@hostname:port/database_name",
  }),
});

// Declaring a tag for the Logger service
class Logger extends Context.Tag("Logger")<
  Logger,
  { readonly log: (message: string) => Effect.Effect<void> }
>() {}

// Layer<Logger, never, Config>
const LoggerLive = Layer.effect(
  Logger,
  Effect.gen(function* () {
    const config = yield* Config;
    return {
      log: (message) =>
        Effect.gen(function* () {
          const { logLevel } = yield* config.getConfig;
          console.log(`[${logLevel}] ${message}`);
        }),
    };
  })
);

// Declaring a tag for the Database service
class Database extends Context.Tag("Database")<
  Database,
  { readonly query: (sql: string) => Effect.Effect<unknown> }
>() {}

const DatabaseLive = Layer.effect(
  Database,
  Effect.gen(function* () {
    const config = yield* Config;
    const logger = yield* Logger;
    return {
      query: (sql: string) =>
        Effect.gen(function* () {
          yield* logger.log(`Executing query: ${sql}`);
          const { connection } = yield* config.getConfig;
          return { result: `Results from ${connection}` };
        }),
    };
  })
);
const AppConfigLive = Layer.merge(ConfigLive, LoggerLive);
// deno-lint-ignore no-unused-vars
const ConfigLoggerLive = Layer.provideMerge(LoggerLive, ConfigLive);
// deno-lint-ignore no-unused-vars
const ConfigLoggerLive2 = LoggerLive.pipe(Layer.provideMerge(ConfigLive));
// deno-lint-ignore no-unused-vars
const AllLive = DatabaseLive.pipe(
  Layer.provideMerge(LoggerLive),
  Layer.provideMerge(ConfigLive)
);

const MainLive = DatabaseLive.pipe(
  Layer.provide(AppConfigLive),
  Layer.provide(ConfigLive)
);
const program = Effect.gen(function* () {
  const db = yield* Database;
  const result = yield* db.query("SELECT * FROM users");
  return result;
});

const runnable = program.pipe(Effect.provide(MainLive));

Deno.test("layer", () => {
  const result = Effect.runSync(runnable);
  assertEquals(result, {
    result:
      "Results from mysql://username:password@hostname:port/database_name",
  });
});
