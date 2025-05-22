import { fetchOilSpillById } from '@/lib/db/oilspills';
import { NextResponse } from 'next/server';


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const oilspill = searchParams.get('oilspill') || 'undefined';
    const result = await fetchOilSpillById(oilspill);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
