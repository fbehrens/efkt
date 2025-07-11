import { assertEquals, assertAlmostEquals } from "@std/assert";
import { Effect, Context, Layer, Config } from "effect";

class Random extends Context.Tag("MyRandomService")<
  Random,
  { readonly next: Effect.Effect<number> }
>() {
  static Default = {
    next: Effect.sync(() => Math.random()),
  };
}

class MyTag extends Context.Tag("MyTag")<MyTag, { readonly myNum: number }>() {
  static Default = Layer.succeed(this, { myNum: 42 });
}

const program = Effect.gen(function* (_) {
  const myTag = yield* _(MyTag);
  const random = yield* Random;
  const rftEnv = yield* Config.string("RFT_ENV");
  const randomNumber = yield* random.next;
  const myNum = myTag.myNum;
  return { randomNumber, myNum, rftEnv };
});

const runnable = program.pipe(
  Effect.provideService(Random, Random.Default),
  Effect.provide(MyTag.Default)
);

Deno.test("Service", async () => {
  const { randomNumber, myNum, rftEnv } = await Effect.runPromise(runnable);
  assertAlmostEquals(randomNumber, 0.5, 0.5);
  assertEquals(myNum, 42);
  assertEquals(rftEnv, "DEV");
});
