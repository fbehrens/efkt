import { Socket, FileSystem } from "@effect/platform";
import {
  Effect,
  Queue,
  Console,
  Config,
  Redacted,
  Schema,
  Schedule,
} from "effect";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import WebSocket from "ws";

const MetaData = Schema.Struct({
  MMSI: Schema.Number,
  MMSI_String: Schema.Number,
  ShipName: Schema.String,
  latitude: Schema.Number,
  longitude: Schema.Number,
  time_utc: Schema.String,
});

const Message = Schema.Struct({
  MessageType: Schema.String,
  MetaData,
});
type Message = Schema.Schema.Type<typeof Message>;
const MessageData = Schema.parseJson(Message);

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
  const counter = new Map<string, number>();
  const fs = yield* FileSystem.FileSystem;
  const f = yield* Effect.fork(
    Effect.gen(function* () {
      const ms = yield* messages.take;
      const json_message = ms.toString();
      const m = yield* Schema.decode(MessageData)(json_message);
      const mt = m.MessageType;
      if (!counter.get(mt)) {
        counter.set(mt, 0);
        // yield* fs.writeFile(`ais/${mt}.json`, ms);
      }
      counter.set(mt, counter.get(mt)! + 1);
    }).pipe(Effect.repeat(Schedule.recurs(1000)))
  );
  yield* f.await;
  yield* Console.log({ counter });
});

const runnable = main.pipe(
  Effect.provideService(
    Socket.WebSocketConstructor,
    (url) => new WebSocket(url)
  ),
  Effect.provide(NodeContext.layer),
  Effect.scoped
);

NodeRuntime.runMain(runnable);
