import { Schema, Effect } from "effect";
import { assertEquals } from "@std/assert";

const MetaData = Schema.Struct({
  MMSI: Schema.Number,
  time_utc: Schema.String,
});
const MetaDataValue = Schema.parseJson(MetaData);

Deno.test("schema", () => {
  const json = `{"MMSI": 123456789, "time_utc": "2025-07-30 20:47:10.738288734 +0000 UTC"}`;
  const md = Schema.decode(MetaDataValue)(json);
  assertEquals(Effect.runSync(md), {
    MMSI: 123456789,
    time_utc: "2025-07-30 20:47:10.738288734 +0000 UTC",
  });
});
