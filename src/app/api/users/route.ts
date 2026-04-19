import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get("x-email");
    const password = request.headers.get("x-password");

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatórios" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      crmv: user.crmv,
      clinic: user.clinic,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, role, crmv, clinic } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        password,
        phone: phone || null,
        role: role || "TUTOR",
        crmv: crmv || null,
        clinic: clinic || null,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      crmv: user.crmv,
      clinic: user.clinic,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao cadastrar usuário" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, email, phone, password, crmv, clinic } = body;

    if (!userId) {
      return NextResponse.json({ error: "ID do usuário obrigatório" }, { status: 400 });
    }

    const data: Record<string, string | null> = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (phone !== undefined) data.phone = phone || null;
    if (password) data.password = password;
    if (crmv !== undefined) data.crmv = crmv || null;
    if (clinic !== undefined) data.clinic = clinic || null;

    const user = await db.user.update({
      where: { id: userId },
      data,
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      crmv: user.crmv,
      clinic: user.clinic,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}