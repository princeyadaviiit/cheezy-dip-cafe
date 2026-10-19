import { NextRequest, NextResponse } from "next/server";
import { signTableContext, TABLE_COOKIE_NAME } from "@/lib/auth/table-cookie";

// Simulated/Database active tables map (matches seed.sql)
const ACTIVE_TABLES: Record<string, { id: string; label: string }> = {
  cd_tbl_tok_01x9a: { id: "d0000000-0000-0000-0000-000000000001", label: "Table 1" },
  cd_tbl_tok_02y8b: { id: "d0000000-0000-0000-0000-000000000002", label: "Table 2" },
  cd_tbl_tok_03z7c: { id: "d0000000-0000-0000-0000-000000000003", label: "Table 3" },
  cd_tbl_tok_04w6d: { id: "d0000000-0000-0000-0000-000000000004", label: "Table 4" },
  cd_tbl_tok_05v5e: { id: "d0000000-0000-0000-0000-000000000005", label: "Table 5" },
  cd_tbl_tok_06u4f: { id: "d0000000-0000-0000-0000-000000000006", label: "Table 6" },
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const table = ACTIVE_TABLES[token];

  if (!table) {
    const errorUrl = new URL("/menu", request.url);
    errorUrl.searchParams.set("table_error", "invalid_or_expired_token");
    return NextResponse.redirect(errorUrl);
  }

  // Sign table context
  const signedCookieValue = signTableContext({
    tableId: table.id,
    tableLabel: table.label,
  });

  // Redirect to order menu with table banner
  const redirectUrl = new URL("/order", request.url);
  redirectUrl.searchParams.set("table", encodeURIComponent(table.label));

  const response = NextResponse.redirect(redirectUrl);

  // Set httpOnly, secure signed cookie (valid 6 hours)
  response.cookies.set({
    name: TABLE_COOKIE_NAME,
    value: signedCookieValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 6 * 60 * 60,
  });

  // Also set client-readable table label cookie for persistent client UI state
  response.cookies.set({
    name: "cd_table_label",
    value: table.label,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 6 * 60 * 60,
  });

  return response;
}
