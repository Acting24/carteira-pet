import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vaccinations = await db.vaccination.findMany({
      where: { petId: id },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(vaccinations);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar vacinações" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, date, nextDate, veterinarian, clinic } = body;

    if (!name || !date) {
      return NextResponse.json({ error: "Nome e data são obrigatórios" }, { status: 400 });
    }

    const vaccination = await db.vaccination.create({
      data: {
        petId: id,
        name,
        date,
        nextDate: nextDate || null,
        veterinarian: veterinarian || null,
        clinic: clinic || null,
      },
    });

    return NextResponse.json(vaccination, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar vacinação" }, { status: 500 });
  }
}