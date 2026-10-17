import crypto from "crypto";
import { cookies } from "next/headers";

export const TABLE_COOKIE_NAME = "table_ctx";
const SECRET =
  process.env.TABLE_COOKIE_SECRET ||
  "cheezy_dip_default_cookie_secret_32_bytes_minimum_length";

export interface TableContext {
  tableId: string;
  tableLabel: string;
  issuedAt: number;
}

/**
 * Creates an HMAC-SHA256 signature for a string payload
 */
function signPayload(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

/**
 * Serializes and signs table context into a cookie string
 */
export function signTableContext(data: Omit<TableContext, "issuedAt">): string {
  const context: TableContext = {
    ...data,
    issuedAt: Date.now(),
  };
  const jsonStr = JSON.stringify(context);
  const signature = signPayload(jsonStr);
  const encoded = Buffer.from(jsonStr).toString("base64url");
  return `${encoded}.${signature}`;
}

/**
 * Verifies and decodes a signed table context cookie
 */
export function verifyTableContext(cookieValue: string): TableContext | null {
  if (!cookieValue || !cookieValue.includes(".")) {
    return null;
  }

  const [encoded, signature] = cookieValue.split(".");
  if (!encoded || !signature) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(encoded, "base64url").toString("utf-8");
    const expectedSignature = signPayload(jsonStr);

    // Timing-safe signature check
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expectedSignature, "hex");
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const context = JSON.parse(jsonStr) as TableContext;
    // Expire after 6 hours
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    if (Date.now() - context.issuedAt > SIX_HOURS) {
      return null;
    }

    return context;
  } catch {
    return null;
  }
}

/**
 * Reads and verifies the current table context from server cookies
 */
export async function getTableContext(): Promise<TableContext | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(TABLE_COOKIE_NAME);
  if (!cookie?.value) {
    return null;
  }
  return verifyTableContext(cookie.value);
}
