import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "ID do usuário obrigatório" }, { status: 400 });
    }

    const admin = await db.user.findUnique({ where: { id: userId } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        crmv: true,
        clinic: true,
        createdAt: true,
        _count: { select: { pets: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { adminId, name, email, phone, role, crmv, clinic } = body;

    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const data: Record<string, string | null> = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (phone !== undefined) data.phone = phone || null;
    if (role) data.role = role;
    if (crmv !== undefined) data.crmv = crmv || null;
    if (clinic !== undefined) data.clinic = clinic || null;

    const user = await db.user.update({ where: { id }, data });

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
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const adminId = request.headers.get("x-user-id");

    const admin = await db.user.findUnique({ where: { id: adminId || "" } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (admin.id === id) {
      return NextResponse.json({ error: "Você não pode excluir seu próprio usuário" }, { status: 400 });
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ message: "Usuário excluído" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 });
  }
}