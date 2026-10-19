import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { signTableContext, verifyTableContext } from "@/lib/auth/table-cookie";

describe("Table Context Cookie Signer & Verifier", () => {
  const validContext = {
    tableId: "d0000000-0000-0000-0000-000000000002",
    tableLabel: "Table 2",
  };

  it("signs and verifies a valid table context cookie", () => {
    const cookieValue = signTableContext(validContext);
    expect(cookieValue).toContain(".");

    const verified = verifyTableContext(cookieValue);
    expect(verified).not.toBeNull();
    expect(verified?.tableId).toBe(validContext.tableId);
    expect(verified?.tableLabel).toBe(validContext.tableLabel);
    expect(typeof verified?.issuedAt).toBe("number");
  });

  it("rejects tampered table payload with valid signature", () => {
    const cookieValue = signTableContext(validContext);
    const [, signature] = cookieValue.split(".");

    // Alter table ID in payload
    const tamperedPayload = Buffer.from(
      JSON.stringify({
        tableId: "d0000000-0000-0000-0000-000000000099",
        tableLabel: "Table 99",
        issuedAt: Date.now(),
      })
    ).toString("base64url");

    const tamperedCookie = `${tamperedPayload}.${signature}`;
    const verified = verifyTableContext(tamperedCookie);
    expect(verified).toBeNull();
  });

  it("rejects tampered signature with valid payload", () => {
    const cookieValue = signTableContext(validContext);
    const [encoded] = cookieValue.split(".");
    const invalidSignature = "0000000000000000000000000000000000000000000000000000000000000000";

    const tamperedCookie = `${encoded}.${invalidSignature}`;
    const verified = verifyTableContext(tamperedCookie);
    expect(verified).toBeNull();
  });

  it("rejects malformed cookies", () => {
    expect(verifyTableContext("")).toBeNull();
    expect(verifyTableContext("no-period-here")).toBeNull();
    expect(verifyTableContext("foo.bar.baz")).toBeNull();
    expect(verifyTableContext("badjson.abcdef")).toBeNull();
  });

  it("rejects expired table cookies (older than 6 hours)", () => {
    // Generate context with issuedAt 7 hours ago
    const expiredData = {
      ...validContext,
      issuedAt: Date.now() - 7 * 60 * 60 * 1000,
    };
    // Sign manually with SECRET
    const jsonStr = JSON.stringify(expiredData);
    const secret =
      process.env.TABLE_COOKIE_SECRET ||
      "cheezy_dip_default_cookie_secret_32_bytes_minimum_length";
    const signature = crypto.createHmac("sha256", secret).update(jsonStr).digest("hex");
    const encoded = Buffer.from(jsonStr).toString("base64url");
    const expiredCookie = `${encoded}.${signature}`;

    const verified = verifyTableContext(expiredCookie);
    expect(verified).toBeNull();
  });
});
