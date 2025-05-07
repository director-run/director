import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../src/db";
import { entriesTable } from "../../../../src/db/schema";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(entriesTable);

    // Get paginated entries
    const entries = await db
      .select()
      .from(entriesTable)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      entries,
      pagination: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 },
    );
  }
}
