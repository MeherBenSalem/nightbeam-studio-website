import { describe, expect, it } from "vitest";
import { parseFilterParams, serializeFilterParams } from "@/lib/utils/url-filters";

describe("URL filter (de)serialization", () => {
  it("parses a full filter query", () => {
    const filters = parseFilterParams(
      new URLSearchParams("type=MOD&version=26.2&loader=NEOFORGE&category=adventure&sort=downloads&page=2&view=list&search=steve"),
    );
    expect(filters.type).toBe("MOD");
    expect(filters.version).toBe("26.2");
    expect(filters.loader).toBe("NEOFORGE");
    expect(filters.category).toBe("adventure");
    expect(filters.sort).toBe("downloads");
    expect(filters.page).toBe(2);
    expect(filters.view).toBe("list");
    expect(filters.search).toBe("steve");
  });

  it("ignores invalid values", () => {
    const filters = parseFilterParams(new URLSearchParams("type=NOT_A_TYPE&loader=hax&sort=bogus&page=-3&perPage=9999"));
    expect(filters.type).toBeUndefined();
    expect(filters.loader).toBeUndefined();
    expect(filters.sort).toBeUndefined();
    expect(filters.page).toBe(1);
    expect(filters.perPage).toBe(48);
  });

  it("round-trips through serialization", () => {
    const original = parseFilterParams(new URLSearchParams("type=MOD&loader=FABRIC&version=26.1.2&sort=followers&page=3"));
    const serialized = serializeFilterParams(original);
    const reparsed = parseFilterParams(new URLSearchParams(serialized.replace(/^\?/, "")));
    expect(reparsed).toEqual(original);
  });

  it("serializes defaults compactly", () => {
    expect(serializeFilterParams({ page: 1, perPage: 12 })).toBe("");
  });
});
