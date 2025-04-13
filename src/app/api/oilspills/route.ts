import { fetchOilSpills } from "@/lib/db/oilspills";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const id = searchParams.get("id") || undefined;
    const minArea = searchParams.get("minArea") || undefined;
    const maxArea = searchParams.get("maxArea") || undefined;

    const result = await fetchOilSpills(
      page,
      size,
      id,
      minArea,
      maxArea
    );

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : err }, { status: 500 });
  }
}