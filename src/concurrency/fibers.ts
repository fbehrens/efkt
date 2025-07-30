import { Effect, Fiber } from "effect";

const program = Effect.gen(function* () {
  // Fork a fiber that runs indefinitely, printing "Hi!"
  const fiber = yield* Effect.fork(
    Effect.forever(Effect.log("Hi!").pipe(Effect.delay("1000 millis")))
  );
  //   yield* Effect.sleep("30 millis");
  // Interrupt the fiber and get an Exit value detailing how it finished
  //   const exit = yield* Fiber.interrupt(fiber);
  console.log("dd");
  const a = yield* Fiber.await(fiber);
});

Effect.runFork(program);
/*
Output:
timestamp=... level=INFO fiber=#1 message=Hi!
timestamp=... level=INFO fiber=#1 message=Hi!
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: {
    _id: 'Cause',
    _tag: 'Interrupt',
    fiberId: {
      _id: 'FiberId',
      _tag: 'Runtime',
      id: 0,
      startTimeMillis: ...
    }
  }
}
*/
