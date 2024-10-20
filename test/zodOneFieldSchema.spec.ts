import { describe, expect, it } from "vitest";
import { z } from "zod";
import { Logger } from "winston";
import { mock } from "vitest-mock-extended";
import { zodOneFieldSchema } from "../src/zodOneFieldSchema";

const mockLogger = mock<Logger>();
const mockOpts = { logger: mockLogger };

describe("zodOneFieldSchema", () => {
  enum TestEnum {
    VALID = "VALID",
  }
  const validTypes = [
    z.string().optional(),
    z.string().nullable(),
    z.string(),
    z.number(),
    z.boolean(),
    z.object({}),
    z.record(z.string(), z.unknown()),
    z.tuple([z.string()]),
    z.date(),
    z.array(z.unknown()),
    z.enum(["hello", "world"]),
    z.nativeEnum(TestEnum),
    z.set(z.unknown()),
    z.string().default("test-default"),
    z.literal("test-literal"),
  ] as const;
  it.each(validTypes)(
    "should return a schema for valid $_def.typeName type",
    (schema) => {
      // Assemble
      const onefield = zodOneFieldSchema(schema, undefined, mockOpts);

      // Act
      expect(onefield).toBeDefined();
    },
  );

  const invalidTypes = [
    z.null(),
    z.nan(),
    z.bigint(),
    z.symbol(),
    z.undefined(),
    z.any(),
    z.never(),
    z.void(),
    z.union([z.string(), z.number()]),
    z.discriminatedUnion("test", [
      z.object({ test: z.literal("hello") }),
      z.object({ test: z.literal("world") }),
    ]),
    z.intersection(
      z.object({ hello: z.literal("world") }),
      z.object({ foo: z.literal("bar") }),
    ),
    z.function(),
    z.unknown(),
    z.lazy(() => z.string()),
    z.promise(z.string()),
    z.string().brand(),
    z.string().readonly(),
  ] as const;
  it.each(invalidTypes)(
    "should throw an error if invalid $_def.typeName types are used",
    (schema) => {
      // Act
      const managedEffect = () =>
        zodOneFieldSchema(schema, undefined, mockOpts);

      // Assert
      expect(managedEffect).toThrowError(
        `${schema._def.typeName as string} type is not supported by \`dynamodb-onetable\``,
      );
    },
  );
});
