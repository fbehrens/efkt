import { Socket } from "@effect/platform";
import { Effect, Queue, Console } from "effect";
import { NodeRuntime } from "@effect/platform-node";
import WebSocket from "ws";
import { pipe } from "effect/Function";

const url = "wss://stream.aisstream.io/v0/stream";
let subscriptionMessage = pipe(
  {
    Apikey: "795e0f0b4c7c96849efc40c41e8db3ca57916972",
    BoundingBoxes: [
      [
        [-180, -90],
        [180, 90],
      ],
    ],
  },
  JSON.stringify
);

const main = Effect.gen(function* (_) {
  const socket = yield* Socket.makeWebSocket(Effect.succeed(url));
  const messages = yield* Queue.unbounded<Uint8Array>();
  const fiber = yield* Effect.fork(socket.run((_) => messages.offer(_)));
  yield* Effect.gen(function* () {
    const write = yield* socket.writer;
    yield* write(subscriptionMessage);
  }).pipe(Effect.scoped);
  let message = yield* messages.take;
  yield* Console.log(message.toString());
  return yield* fiber.await;
});

const runnable = main.pipe(
  Effect.provideService(
    Socket.WebSocketConstructor,
    (url) => new WebSocket(url)
  )
);

NodeRuntime.runMain(runnable);
