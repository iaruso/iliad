import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("oilspills");
    const collection = db.collection("oilspills");

    const dados = await collection.find({}).toArray();

    return NextResponse.json(dados);
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
