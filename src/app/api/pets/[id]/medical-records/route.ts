import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const records = await db.medicalRecord.findMany({
      where: { petId: id },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar prontuários" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { date, type, description, veterinarian, clinic, notes } = body;

    if (!date || !type || !description) {
      return NextResponse.json({ error: "Data, tipo e descrição são obrigatórios" }, { status: 400 });
    }

    const record = await db.medicalRecord.create({
      data: {
        petId: id,
        date,
        type,
        description,
        veterinarian: veterinarian || null,
        clinic: clinic || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar prontuário" }, { status: 500 });
  }
}