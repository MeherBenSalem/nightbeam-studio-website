import { describe, expect, it } from "vitest";
import { parseFilterParams, serializeFilterParams } from "@/lib/utils/url-filters";

describe("URL filter (de)serialization", () => {
  it("parses a full filter query", () => {
    const filters = parseFilterParams(
      new URLSearchParams(
        "type=MOD&versions=26.2&versions=26.1.2&loaders=NEOFORGE&loaders=FABRIC&categories=horror&sort=downloads&page=2&view=list&search=steve",
      ),
    );
    expect(filters.type).toBe("MOD");
    expect(filters.versions).toEqual(["26.2", "26.1.2"]);
    expect(filters.loaders).toEqual(["NEOFORGE", "FABRIC"]);
    expect(filters.categories).toEqual(["horror"]);
    expect(filters.sort).toBe("downloads");
    expect(filters.page).toBe(2);
    expect(filters.view).toBe("list");
    expect(filters.search).toBe("steve");
  });

  it("ignores invalid values", () => {
    const filters = parseFilterParams(new URLSearchParams("type=NOT_A_TYPE&loaders=hax&versions=26.2&sort=bogus&page=-3&perPage=9999"));
    expect(filters.type).toBeUndefined();
    expect(filters.loaders).toBeUndefined();
    expect(filters.versions).toEqual(["26.2"]);
    expect(filters.sort).toBeUndefined();
    expect(filters.page).toBe(1);
    expect(filters.perPage).toBe(48);
  });

  it("round-trips through serialization", () => {
    const original = parseFilterParams(
      new URLSearchParams("type=MOD&loaders=FABRIC&loaders=NEOFORGE&versions=26.1.2&categories=magic&sort=followers&page=3"),
    );
    const serialized = serializeFilterParams(original);
    const reparsed = parseFilterParams(new URLSearchParams(serialized.replace(/^\?/, "")));
    expect(reparsed).toEqual(original);
  });

  it("accepts legacy singular keys as arrays", () => {
    const filters = parseFilterParams(new URLSearchParams("version=26.2&loader=NEOFORGE&category=horror"));
    expect(filters.versions).toEqual(["26.2"]);
    expect(filters.loaders).toEqual(["NEOFORGE"]);
    expect(filters.categories).toEqual(["horror"]);
  });

  it("serializes defaults compactly", () => {
    expect(serializeFilterParams({ page: 1, perPage: 12 })).toBe("");
  });
});
