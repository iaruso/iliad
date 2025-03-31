import { fetchOilSpillById } from "@/lib/db/oilspills";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || "";

    const result = await fetchOilSpillById(id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
