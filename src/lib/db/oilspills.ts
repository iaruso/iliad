/* eslint-disable @typescript-eslint/no-explicit-any */
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { notFound } from 'next/navigation';

export function serializeOilSpill(oilSpill: any) {
  return {
    ...oilSpill,
    _id: oilSpill._id.toString(),
  };
}

export async function fetchOilSpills(
  page: number,
  size: number,
  id?: string,
  areaRange?: string,
  durationRange?: string,
  frequencyRange?: string,
  sortField?: 'latitude' | 'longitude' | 'area' | 'points' | 'duration' | 'frequency',
  sortDirection?: 'asc' | 'desc',
  startDate?: string,
  endDate?: string
) {
  const skip = (page - 1) * size;

  const client = await clientPromise;
  const db = client.db('oilspills');
  const collection = db.collection('oilspills-min');

  const tailExpr = {
    $toLower: {
      $substrCP: [
        { $toString: '$_id' },
        { $subtract: [{ $strLenCP: { $toString: '$_id' } }, 9] },
        9,
      ],
    },
  };

  const match: any = {};

  if (id) {
    match.$expr = {
      $regexMatch: {
        input: tailExpr,
        regex: id,
      },
    };
  }

  if (areaRange) {
    const [minStr, maxStr] = areaRange.split('_');
    const parsedMin = minStr ? parseFloat(minStr) : undefined;
    const parsedMax = maxStr ? parseFloat(maxStr) : undefined;
    if (!isNaN(parsedMin!) || !isNaN(parsedMax!)) {
      match.area = {};
      if (!isNaN(parsedMin!)) match.area.$gte = parsedMin;
      if (!isNaN(parsedMax!)) match.area.$lte = parsedMax;
    }
  }

  if (durationRange) {
    const [minStr, maxStr] = durationRange.split('_');
    const parsedMin = minStr ? parseFloat(minStr) : undefined;
    const parsedMax = maxStr ? parseFloat(maxStr) : undefined;
    if (!isNaN(parsedMin!) || !isNaN(parsedMax!)) {
      match.duration = {};
      if (!isNaN(parsedMin!)) match.duration.$gte = parsedMin;
      if (!isNaN(parsedMax!)) match.duration.$lte = parsedMax;
    }
  }

  if (frequencyRange) {
    const [minStr, maxStr] = frequencyRange.split('_');
    const parsedMin = minStr ? parseFloat(minStr) : undefined;
    const parsedMax = maxStr ? parseFloat(maxStr) : undefined;
    if (!isNaN(parsedMin!) || !isNaN(parsedMax!)) {
      match.frequency = {};
      if (!isNaN(parsedMin!)) match.frequency.$gte = parsedMin;
      if (!isNaN(parsedMax!)) match.frequency.$lte = parsedMax;
    }
  }

  const pipeline: any[] = [];

  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  if (startDate || endDate) {
    const timestampFilter: any = {};

    if (startDate) timestampFilter.$gte = startDate;
    if (endDate) timestampFilter.$lte = endDate;

    pipeline.push({
      $match: {
        data: {
          $elemMatch: {
            timestamp: timestampFilter,
          },
        },
      },
    });
  }

  if (sortField && ['latitude', 'longitude', 'area', 'points', 'duration', 'frequency'].includes(sortField)) {
    const direction = sortDirection === 'desc' ? -1 : 1;
    const sortKey = sortField === 'latitude' ? 'coordinates.1' : sortField === 'longitude' ? 'coordinates.0' : sortField;
    pipeline.push({ $sort: { [sortKey]: direction } });
  }

  pipeline.push({ $skip: skip }, { $limit: size });

  const data = await collection.aggregate(pipeline).toArray();
  const serialized = data.map(serializeOilSpill);

  const totalItemsPipeline = [...pipeline];
  totalItemsPipeline.splice(totalItemsPipeline.findIndex((s) => '$skip' in s), 2);

  const totalItems = await collection.aggregate([
    ...totalItemsPipeline,
    { $count: 'count' },
  ]).toArray().then(res => res[0]?.count ?? 0);

  return {
    page,
    size,
    items: totalItems,
    totalPages: Math.ceil(totalItems / size),
    data: serialized,
  };
}

export async function fetchOilSpillById(oilspill: string) {
  const client = await clientPromise;
  const db = client.db('oilspills');
  const collection = db.collection('oilspills');

  const data = await collection.findOne({ _id: new ObjectId(oilspill) });

  if (!data) throw notFound();

  return serializeOilSpill(data);
}

export async function addOilSpill(data: any) {
  if (!data || !data.data || !Array.isArray(data.data)) {
    return { data: [] };
  }

  const client = await clientPromise;
  const db = client.db('oilspills');
  const collection = db.collection('oilspills');

  const result = await collection.insertOne({
    data: data.data,
  });

  return {
    data: [serializeOilSpill({ _id: result.insertedId, ...data })],
  };
}