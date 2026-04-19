import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ error: "ID do usuário obrigatório" }, { status: 400 });
    }

    const where = (userRole === "VETERINARIO" || userRole === "ADMIN")
      ? {}
      : { userId };

    const pets = await db.pet.findMany({
      where,
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pets);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar pets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, species, breed, color, birthDate, gender, userId } = body;

    if (!name || !species || !breed || !gender || !userId) {
      return NextResponse.json({ error: "Nome, espécie, raça, sexo e dono são obrigatórios" }, { status: 400 });
    }

    const pet = await db.pet.create({
      data: {
        name,
        species,
        breed,
        color: color || null,
        birthDate: birthDate || null,
        gender,
        userId,
      },
      include: { user: { select: { name: true, role: true } } },
    });

    return NextResponse.json(pet, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar pet" }, { status: 500 });
  }
}