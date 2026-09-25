import { describe, expect, it } from "vitest";
import { auditSource } from "./audit-localization.mjs";

describe("localization audit", () => {
  it("reports raw user-facing JSX copy", () => {
    expect(auditSource("return <Button>Save changes</Button>", "fixture.tsx")).toEqual([
      expect.objectContaining({ text: "Save changes" }),
    ]);
  });

  it("allows documented technical literals", () => {
    expect(auditSource("return <code>MASTER_KEY</code>", "fixture.tsx")).toEqual([]);
  });

  it("allows the Nexoplane product name", () => {
    expect(auditSource('return <img alt="Nexoplane" />', "fixture.tsx")).toEqual([]);
  });

  it("reports raw copy in configuration objects and toasts", () => {
    expect(auditSource('const column = { title: "Lifetime Spend" }; toast.error("Save failed")', "fixture.tsx")).toEqual([
      expect.objectContaining({ kind: "property-title", text: "Lifetime Spend" }),
      expect.objectContaining({ kind: "toast", text: "Save failed" }),
    ]);
  });
});
