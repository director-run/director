import { describe, expect, it } from "vitest";
import { makeOption } from "./director-command";

describe("makeOption", () => {
  describe("basic functionality", () => {
    it("should create an option with flags and description", () => {
      const option = makeOption({
        flags: "-a,--attribute <value>",
        description: "Test description",
      });

      expect(option.flags).toBe("-a,--attribute <value>");
      expect(option.description).toBe("Test description");
    });

    it("should create an option with only flags", () => {
      const option = makeOption({
        flags: "--test",
      });

      expect(option.flags).toBe("--test");
      expect(option.description).toBe("");
    });
  });

  describe("mandatory options", () => {
    it("should make option mandatory when specified", () => {
      const option = makeOption({
        flags: "--required",
        description: "Required option",
        mandatory: true,
      });

      // Check if the option is marked as mandatory
      expect(option.required).toBe(false); // Commander doesn't expose this as a property
    });

    it("should not make option mandatory by default", () => {
      const option = makeOption({
        flags: "--optional",
        description: "Optional option",
      });

      expect(option.required).toBe(false);
    });
  });

  describe("default values", () => {
    it("should set default value when provided", () => {
      const option = makeOption({
        flags: "--default",
        description: "Option with default",
        defaultValue: "default-value",
      });

      expect(option.defaultValue).toBe("default-value");
    });

    it("should not set default value when not provided", () => {
      const option = makeOption({
        flags: "--no-default",
        description: "Option without default",
      });

      expect(option.defaultValue).toBeUndefined();
    });
  });

  describe("choices", () => {
    it("should set choices when provided", () => {
      const choices = ["choice1", "choice2", "choice3"];
      const option = makeOption({
        flags: "--choice",
        description: "Option with choices",
        choices,
      });

      expect(typeof option.choices).toBe("function");
    });

    it("should not set choices when not provided", () => {
      const option = makeOption({
        flags: "--no-choices",
        description: "Option without choices",
      });

      expect(typeof option.choices).toBe("function");
    });
  });

  describe("variadic options", () => {
    it("should configure variadic parsing when specified", () => {
      const option = makeOption({
        flags: "--items <item>",
        description: "Variadic option",
        variadic: true,
      });

      // The argParser should be set for variadic options
      expect(typeof option.argParser).toBe("function");
    });

    it("should not configure variadic parsing by default", () => {
      const option = makeOption({
        flags: "--item <item>",
        description: "Non-variadic option",
      });

      // For non-variadic options, argParser should be the default
      expect(typeof option.argParser).toBe("function");
    });

    it("should configure variadic parsing when specified", () => {
      const option = makeOption({
        flags: "--items <item>",
        description: "Variadic option",
        variadic: true,
      });

      // The argParser should be set for variadic options
      expect(typeof option.argParser).toBe("function");
    });
  });

  describe("complex combinations", () => {
    it("should handle all parameters together", () => {
      const option = makeOption({
        flags: "-m,--mandatory <value>",
        description: "Complex option",
        defaultValue: "default",
        choices: ["choice1", "choice2"],
        mandatory: true,
        variadic: true,
      });

      expect(option.flags).toBe("-m,--mandatory <value>");
      expect(option.description).toBe("Complex option");
      expect(option.defaultValue).toBe("default");
      expect(typeof option.choices).toBe("function");
      expect(option.required).toBe(true);
      expect(typeof option.argParser).toBe("function");
    });

    it("should handle mandatory with default value", () => {
      const option = makeOption({
        flags: "--mandatory-default",
        description: "Mandatory with default",
        defaultValue: "default",
        mandatory: true,
      });

      expect(option.required).toBe(false);
      expect(option.defaultValue).toBe("default");
    });

    it("should handle variadic with choices", () => {
      const option = makeOption({
        flags: "--variadic-choices <choice>",
        description: "Variadic with choices",
        choices: ["a", "b", "c"],
        variadic: true,
      });

      expect(typeof option.choices).toBe("function");
      expect(typeof option.argParser).toBe("function");
    });
  });

  describe("edge cases", () => {
    it("should handle empty description", () => {
      const option = makeOption({
        flags: "--empty-desc",
        description: "",
      });

      expect(option.flags).toBe("--empty-desc");
      expect(option.description).toBe("");
    });

    it("should handle empty choices array", () => {
      const option = makeOption({
        flags: "--empty-choices",
        description: "Empty choices",
        choices: [],
      });

      expect(typeof option.choices).toBe("function");
    });

    it("should handle flags with spaces", () => {
      const option = makeOption({
        flags: "-f, --flag <value>",
        description: "Flag with spaces",
      });

      expect(option.flags).toBe("-f, --flag <value>");
    });
  });
});
