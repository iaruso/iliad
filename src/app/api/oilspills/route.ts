import { fetchOilSpills } from '@/lib/db/oilspills';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const size = parseInt(searchParams.get('size') || '10', 10);
    const id = searchParams.get('id') || undefined;
    const areaRange = searchParams.get('areaRange') || undefined;
    const durationRange = searchParams.get('durationRange') || undefined;
    const frequencyRange = searchParams.get('frequencyRange') || undefined;

    const result = await fetchOilSpills(
      page,
      size,
      id,
      areaRange,
      durationRange,
      frequencyRange
    );

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : err }, { status: 500 });
  }
}