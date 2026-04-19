import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; vaccId: string }> }) {
  try {
    const { vaccId } = await params;
    const body = await request.json();
    const { name, date, nextDate, veterinarian, clinic } = body;

    const data: Record<string, string | null> = {};
    if (name) data.name = name;
    if (date) data.date = date;
    if (nextDate !== undefined) data.nextDate = nextDate || null;
    if (veterinarian !== undefined) data.veterinarian = veterinarian || null;
    if (clinic !== undefined) data.clinic = clinic || null;

    const vaccination = await db.vaccination.update({
      where: { id: vaccId },
      data,
    });

    return NextResponse.json(vaccination);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar vacinação" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; vaccId: string }> }) {
  try {
    const { vaccId } = await params;
    await db.vaccination.delete({ where: { id: vaccId } });
    return NextResponse.json({ message: "Vacinação excluída" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir vacinação" }, { status: 500 });
  }
}