import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pet = await db.pet.findUnique({
      where: { id },
      include: { user: { select: { name: true, role: true } } },
    });
    if (!pet) {
      return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 });
    }
    return NextResponse.json(pet);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar pet" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, species, breed, color, birthDate, gender } = body;

    const data: Record<string, string | null> = {};
    if (name) data.name = name;
    if (species) data.species = species;
    if (breed) data.breed = breed;
    if (color !== undefined) data.color = color || null;
    if (birthDate !== undefined) data.birthDate = birthDate || null;
    if (gender) data.gender = gender;

    const pet = await db.pet.update({
      where: { id },
      data,
      include: { user: { select: { name: true, role: true } } },
    });

    return NextResponse.json(pet);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar pet" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.pet.delete({ where: { id } });
    return NextResponse.json({ message: "Pet excluído" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir pet" }, { status: 500 });
  }
}