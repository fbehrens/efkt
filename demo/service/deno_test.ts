import { assertThrows } from "@std/assert";
class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomError";
  }
}

function riskyFunction() {
  throw new CustomError("Value cannot be negative");
}

Deno.test("should throw CustomError for negative values", () => {
  assertThrows(() => riskyFunction(), CustomError, "Value cannot be negative");
});
