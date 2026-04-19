import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; recordId: string }> }) {
  try {
    const { recordId } = await params;
    const body = await request.json();
    const { date, type, description, veterinarian, clinic, notes } = body;

    const data: Record<string, string | null> = {};
    if (date) data.date = date;
    if (type) data.type = type;
    if (description) data.description = description;
    if (veterinarian !== undefined) data.veterinarian = veterinarian || null;
    if (clinic !== undefined) data.clinic = clinic || null;
    if (notes !== undefined) data.notes = notes || null;

    const record = await db.medicalRecord.update({
      where: { id: recordId },
      data,
    });

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar prontuário" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; recordId: string }> }) {
  try {
    const { recordId } = await params;
    await db.medicalRecord.delete({ where: { id: recordId } });
    return NextResponse.json({ message: "Prontuário excluído" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir prontuário" }, { status: 500 });
  }
}