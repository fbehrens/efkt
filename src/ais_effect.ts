import { Socket } from "@effect/platform";
import { Effect, Queue, Console, Config, Redacted } from "effect";
import { NodeRuntime } from "@effect/platform-node";
import WebSocket from "ws";

const main = Effect.gen(function* (_) {
  const socket = yield* Socket.makeWebSocket(
    Effect.succeed("wss://stream.aisstream.io/v0/stream")
  );
  const messages = yield* Queue.unbounded<Uint8Array>();
  const fiber = yield* Effect.fork(socket.run((_) => messages.offer(_)));
  const write = yield* socket.writer;
  const Apikey = yield* Config.redacted(Config.string("AISSTREAM_API_KEY"));
  yield* write(
    JSON.stringify({
      Apikey: Redacted.value(Apikey),
      BoundingBoxes: [
        [
          [-180, -90],
          [180, 90],
        ],
      ],
    })
  );
  yield* Effect.gen(function* () {
    const message = yield* messages.take;
    yield* Console.log(message.toString());
  }).pipe(Effect.forever);
  //   return yield* fiber.await;
});

const runnable = main.pipe(
  Effect.provideService(
    Socket.WebSocketConstructor,
    (url) => new WebSocket(url)
  ),
  Effect.scoped
);

NodeRuntime.runMain(runnable);
