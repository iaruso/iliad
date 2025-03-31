/* eslint-disable @typescript-eslint/no-explicit-any */
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export function serializeOilSpill(oilSpill: any) {
  return {
    ...oilSpill,
    _id: oilSpill._id.toString(),
  };
}

export async function fetchOilSpills(page: number, size: number) {
  const skip = (page - 1) * size;

  const client = await clientPromise;
  const db = client.db("oilspills");
  const collection = db.collection("oilspills-min");

  const data = await collection.find({})
    .skip(skip)
    .limit(size)
    .toArray();

  const items = await collection.countDocuments();

  const serialized = data.map(serializeOilSpill);

  return {
    page,
    size,
    items,
    totalPages: Math.ceil(items / size),
    data: serialized,
  };
}

export async function fetchOilSpillById(id: string) {
  const client = await clientPromise;
  const db = client.db("oilspills");
  const collection = db.collection("oilspills-min");

  const data = await collection.findOne({ _id: new ObjectId(id) });

  if (!data) throw new Error("Not found");

  return serializeOilSpill(data);
}
