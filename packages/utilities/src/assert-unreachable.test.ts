import { describe, expect, it } from "vitest";

import { assertUnreachable } from "./assert-unreachable";

describe("assertUnreachable", () => {
  it("should throw an error when called with any value", () => {
    // Test with different types of values
    expect(() => assertUnreachable(1 as never)).toThrow(
      "Didn't expect to get here",
    );
    expect(() => assertUnreachable("string" as never)).toThrow(
      "Didn't expect to get here",
    );
    expect(() => assertUnreachable({} as never)).toThrow(
      "Didn't expect to get here",
    );
    expect(() => assertUnreachable(null as never)).toThrow(
      "Didn't expect to get here",
    );
    expect(() => assertUnreachable(undefined as never)).toThrow(
      "Didn't expect to get here",
    );
  });

  it("should be used in exhaustive switch statements", () => {
    type Direction = "north" | "south" | "east" | "west";

    const getDirection = (direction: Direction): string => {
      switch (direction) {
        case "north":
          return "up";
        case "south":
          return "down";
        case "east":
          return "right";
        case "west":
          return "left";
        default:
          // This will cause a type error if Direction type is extended without updating the switch
          return assertUnreachable(direction);
      }
    };

    // This should compile and work correctly
    expect(getDirection("north")).toBe("up");
    expect(getDirection("south")).toBe("down");
    expect(getDirection("east")).toBe("right");
    expect(getDirection("west")).toBe("left");
  });
});
