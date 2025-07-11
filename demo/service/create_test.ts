import { assert, assertEquals, assertThrows } from "@std/assert";
import { Effect, Exit, pipe } from "effect";
// create
// succeed / fail for values
const suc = Effect.succeed(42);
const f = Effect.fail(Error("hell yeah"));
// sync / try for sync functions
const syn = Effect.sync(() => 42);
const tr = Effect.try(() => {
  return 42;
});
const tre: Effect.Effect<never, Error> = Effect.try(() => {
  throw Error("hell yeah");
});

// promise / tryPromise  handling of these possible cases that are kind of more advanced than justfor async functions
const pr = Effect.promise(() => Promise.resolve(42));
const prf = Effect.tryPromise(() => Promise.reject(Error("hell yeah")));

// async for async callbacks

Deno.test("sync", () => {
  let r = Effect.runSync(suc);
  assertEquals(r, 42);
  r = suc.pipe(Effect.runSync);
  assertEquals(r, 42);
});

Deno.test("failing", () => {
  assertThrows(() => Effect.runSync(f), Error, "hell yeah");
});

Deno.test("try", () => {
  const p = Effect.try({
    try: () => {
      throw "yeah";
    },
    catch: (e) => Error(`hell ${e}`),
  });
  const e = Effect.runSyncExit(p);
  assert(Exit.isFailure(e));
  //   console.log(Exit.causeOption(e));
});

Deno.test("promise", async () => {
  const r = await Effect.runPromise(pr);
  assertEquals(r, 42);
});

Deno.test("promisefaiiing", async () => {
  const r = await Effect.runPromiseExit(prf);
  //console.log(r._tag );
});

// chaining
const double = (x: number) => x * 2;
const toStr = (x: number) => x.toString();
const bold = (s: string) => `*${s}*`;
const multiply = (n: number, m: number) => n * m;
const multiplyBy = (n: number) => {
  return (m: number) => multiply(n, m);
};

Deno.test("pipe", () => {
  assertEquals(pipe(42, double, toStr), "84");
  assertEquals(pipe(2, multiplyBy(3)), 6);
});

Deno.test("map", () => {
  assertEquals(
    pipe(suc, Effect.map(double), Effect.map(toStr), Effect.runSync),
    "84"
  );
});
Deno.test("flatmap", () => {
  const p = pipe(suc, Effect.flatMap(Effect.succeed), Effect.runSync);
  assertEquals(p, 42);
});
