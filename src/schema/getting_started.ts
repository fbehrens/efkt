import { Schema } from "effect";

const Person = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
});

type Person = Schema.Schema.Type<typeof Person>;
// type Person = typeof Person.Type;
// interface Person extends Schema.Schema.Type<typeof Person> {}
