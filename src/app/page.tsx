"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─────────────────────────── INTERFACES ───────────────────────────
type Screen = "login" | "dashboard" | "pets" | "vaccinations" | "medical-records" | "reports" | "users" | "profile";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  crmv?: string;
  clinic?: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  color?: string;
  birthDate?: string;
  gender: string;
  userId: string;
  user?: { name: string; role: string };
}

interface Vaccination {
  id: string;
  petId: string;
  name: string;
  date: string;
  nextDate?: string;
  veterinarian?: string;
  clinic?: string;
  status: string;
}

interface MedicalRecord {
  id: string;
  petId: string;
  date: string;
  type: string;
  description: string;
  veterinarian?: string;
  clinic?: string;
  notes?: string;
}

interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  crmv?: string;
  clinic?: string;
  createdAt: string;
  _count?: { pets: number };
}

// ─────────────────────────── DATA CONSTANTS ───────────────────────────

const breedsBySpecies: Record<string, string[]> = {
  Cachorro: [
    "SRD (Sem Raca Definida)", "Labrador Retriever", "Golden Retriever", "Pastor Alemao", "Bulldog Frances",
    "Bulldog Ingles", "Poodle", "Yorkshire Terrier", "Shih Tzu", "Lhasa Apso", "Maltes", "Pinscher",
    "Dachshund", "Beagle", "Border Collie", "Rottweiler", "Pit Bull", "Husky Siberiano", "Akita",
    "Schnauzer", "Corgi", "Spitz Alemao", "Pug", "Shar-Pei", "Chihuahua",
  ],
  Gato: [
    "SRD (Sem Raca Definida)", "Persa", "Siames", "Maine Coon", "Ragdoll", "British Shorthair", "Bengal",
    "Abissinio", "Sphynx", "Russo Azul", "Scottish Fold", "Americano de Pelo Curto", "Exotico",
    "Noruegues da Floresta", "Birmanes", "Oriental", "Himalaio", "Devon Rex", "Savannah",
  ],
};

const breedColors: Record<string, string[]> = {
  "SRD (Sem Raca Definida)": ["Caramelo", "Preto", "Branco", "Cinza", "Marrom", "Malhado", "Tigrado", "Bicolor", "Tricolor"],
  "Labrador Retriever": ["Caramelo", "Preto", "Chocolate"],
  "Golden Retriever": ["Dourado", "Creme"],
  "Pastor Alemao": ["Preto", "Marrom", "Fulvo", "Bicolor Preto e Marrom"],
  "Bulldog Frances": ["Branco com Manchas", "Tigrado", "Fulvo", "Preto e Branco"],
  "Bulldog Ingles": ["Branco", "Branco com Manchas", "Vermelho", "Fulvo"],
  "Poodle": ["Branco", "Preto", "Marrom", "Caramelo", "Cinza", "Apricot", "Vermelho"],
  "Yorkshire Terrier": ["Dourado e Preto", "Azul e Dourado", "Preto e Castanho"],
  "Shih Tzu": ["Branco", "Branco e Caramelo", "Preto e Branco", "Dourado", "Marrom", "Tricolor"],
  "Lhasa Apso": ["Dourado", "Caramelo", "Branco", "Preto", "Particolor", "Malhado"],
  "Maltes": ["Branco", "Branco Levemente Creme"],
  "Pinscher": ["Preto", "Marrom", "Chocolate", "Vermelho", "Cervo"],
  "Dachshund": ["Caramelo", "Preto e Castanho", "Chocolate", "Dourado", "Ruivo", "Arlequim"],
  "Beagle": ["Tricolor", "Bicolor Limao e Branco", "Bicolor Laranja e Branco"],
  "Border Collie": ["Preto e Branco", "Tricolor", "Azul Merle", "Vermelho e Branco", "Marrom e Branco"],
  "Rottweiler": ["Preto e Marrom"],
  "Pit Bull": ["Preto", "Branco", "Caramelo", "Tigrado", "Cinza", "Malhado", "Chocolate", "Vermelho", "Azul"],
  "Husky Siberiano": ["Cinza e Branco", "Preto e Branco", "Ruivo e Branco", "Agouti", "Puro Branco"],
  "Akita": ["Ruivo", "Branco", "Tigrado", "Branco e Preto"],
  "Schnauzer": ["Preto", "Sal e Pimenta", "Branco", "Preto e Prata"],
  "Corgi": ["Tricolor", "Ruivo e Branco", "Sable", "Preto e Branco", "Fulvo"],
  "Spitz Alemao": ["Laranja", "Creme", "Branco", "Marrom", "Preto", "Sable"],
  "Pug": ["Fulvo", "Preto", "Prata", "Avela"],
  "Shar-Pei": ["Preto", "Vermelho", "Creme", "Azul", "Isabella", "Chocolate"],
  "Chihuahua": ["Caramelo", "Preto", "Branco", "Chocolate", "Creme", "Tricolor"],
  "Persa": ["Branco", "Cinza", "Caramelo", "Preto", "Azul", "Vermelho", "Creme", "Tabby"],
  "Siames": ["Fulvo e Marrom", "Seal Point", "Blue Point", "Chocolate Point", "Lilac Point"],
  "Maine Coon": ["Tabby Marrom", "Preto", "Branco", "Azul", "Vermelho", "Creme", "Silver Tabby"],
  "Ragdoll": ["Bicolor", "Seal Point", "Blue Point", "Lilac Point", "Chocolate Point", "Cream Point"],
  "British Shorthair": ["Azul", "Preto", "Cinza", "Branco", "Caramelo", "Lilas", "Chocolate"],
  "Bengal": ["Marrom Tabby", "Snow", "Silver", "Preto", "Blue", "Charcoal"],
  "Abissinio": ["Ruivo", "Azul", "Sorrel", "Fawn", "Prata"],
  "Sphynx": ["Branco", "Preto", "Caramelo", "Rosa", "Azul", "Chocolate", "Tabby"],
  "Russo Azul": ["Azul Cinza"],
  "Scottish Fold": ["Azul", "Cinza", "Preto", "Branco", "Caramelo", "Tabby", "Bicolor"],
  "Americano de Pelo Curto": ["Prata Tabby", "Preto", "Branco", "Caramelo", "Azul", "Tigrado", "Malhado", "Bicolor"],
  "Exotico": ["Preto", "Branco", "Caramelo", "Azul", "Chocolate", "Tabby", "Vermelho", "Creme", "Lilas"],
  "Noruegues da Floresta": ["Tabby Marrom", "Preto", "Branco", "Azul", "Vermelho", "Silver Tabby"],
  "Birmanes": ["Seal Point", "Blue Point", "Chocolate Point", "Lilac Point", "Vermelho Point"],
  "Oriental": ["Preto", "Branco", "Caramelo", "Azul", "Chocolate", "Lilas", "Ebony"],
  "Himalaio": ["Seal Point", "Blue Point", "Chocolate Point", "Lilac Point", "Flame Point", "Cream Point"],
  "Devon Rex": ["Preto", "Branco", "Caramelo", "Azul", "Chocolate", "Tabby", "Ruivo", "Tortoiseshell"],
  "Savannah": ["Dourado Tabby", "Silver Tabby", "Fumo", "Preto", "Marrom", "Snow"],
};

const vaccineList: Record<string, { name: string; description: string }[]> = {
  Cachorro: [
    { name: "V8 (Polivalente)", description: "Protege contra cinomose, parvovirose, coronavirose, hepatite infecciosa, adenovirose e parainfluenza" },
    { name: "V10 (Polivalente)", description: "Protege contra as mesmas doencas da V8 mais leptospirose" },
    { name: "Antirrabica", description: "Obrigatoria por lei no Brasil. Previne a raiva, zoonose fatal" },
    { name: "Gripe Canina (Tosse dos Canis)", description: "Recomendada para caes que frequentam creches, parques ou hoteis" },
    { name: "Giardiase", description: "Previne infeccao pelo protozoario Giardia, comum em ambientes com muitos animais" },
    { name: "Leishmaniose", description: "Importante em regioes endemicas. Prevencao contra leishmaniose visceral" },
  ],
  Gato: [
    { name: "V3 (Triplice Felina)", description: "Protege contra Panleucopenia, Calicivirose e Rinotraqueite" },
    { name: "V4 (Quadrupla Felina)", description: "Inclui V3 mais protecao contra Clamidiose" },
    { name: "V5 (Quintupla Felina)", description: "Inclui V4 mais protecao contra Leucemia Felina (FeLV)" },
    { name: "Antirrabica Felina", description: "Essencial e obrigatoria. Previne a raiva em gatos" },
  ],
};

// ─────────────────────────── HELPER FUNCTIONS ───────────────────────────

function phoneMask(value: string): string {
  const v = value.replace(/\D/g, "").slice(0, 11);
  if (v.length <= 2) return v.length ? `(${v}` : "";
  if (v.length <= 7) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
}

function getVaccStatus(vacc: Vaccination): string {
  if (!vacc.nextDate) return "Em dia";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(vacc.nextDate + "T12:00:00");
  next.setHours(0, 0, 0, 0);
  const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Atrasada";
  if (diff <= 30) return "Pendente";
  return "Em dia";
}

function statusBadge(status: string) {
  switch (status) {
    case "Em dia": return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Em dia</Badge>;
    case "Pendente": return <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white">Pendente</Badge>;
    case "Atrasada": return <Badge className="bg-red-600 hover:bg-red-700 text-white">Atrasada</Badge>;
    default: return <Badge className="bg-slate-600 text-white">{status}</Badge>;
  }
}

function recordTypeBadge(type: string) {
  switch (type) {
    case "Consulta": return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Consulta</Badge>;
    case "Exame": return <Badge className="bg-purple-600 hover:bg-purple-700 text-white">Exame</Badge>;
    case "Cirurgia": return <Badge className="bg-red-600 hover:bg-red-700 text-white">Cirurgia</Badge>;
    case "Vacina": return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Vacina</Badge>;
    default: return <Badge className="bg-slate-600 text-white">Outro</Badge>;
  }
}

function roleBadge(role: string) {
  switch (role) {
    case "TUTOR": return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">TUTOR</Badge>;
    case "VETERINARIO": return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">VETERINARIO</Badge>;
    case "ADMIN": return <Badge className="bg-red-600 hover:bg-red-700 text-white">ADMIN</Badge>;
    default: return <Badge className="bg-slate-600 text-white">{role}</Badge>;
  }
}

function speciesIcon(species: string) {
  if (species === "Cachorro") return "🐕";
  if (species === "Gato") return "🐈";
  return "🐾";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR");
}

// ─────────────────────────── MAIN COMPONENT ───────────────────────────

export default function CarteiraPetPage() {
  // ── Auth State ──
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>("login");
  const [showRegister, setShowRegister] = useState(false);

  // ── Login Form ──
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // ── Register Form ──
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regRole, setRegRole] = useState("TUTOR");
  const [regCrmv, setRegCrmv] = useState("");
  const [regClinic, setRegClinic] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // ── Pets State ──
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [petDialogOpen, setPetDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [petForm, setPetForm] = useState({ name: "", species: "", breed: "", color: "", gender: "", birthDate: "" });
  const [deletePetDialogOpen, setDeletePetDialogOpen] = useState(false);
  const [deletingPetId, setDeletingPetId] = useState<string>("");

  // ── Vaccinations State ──
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [vaccPetId, setVaccPetId] = useState<string>("");
  const [vaccDialogOpen, setVaccDialogOpen] = useState(false);
  const [editingVacc, setEditingVacc] = useState<Vaccination | null>(null);
  const [vaccForm, setVaccForm] = useState({ name: "", date: "", nextDate: "", veterinarian: "", clinic: "" });
  const [vaccDesc, setVaccDesc] = useState("");
  const [deleteVaccDialogOpen, setDeleteVaccDialogOpen] = useState(false);
  const [deletingVaccId, setDeletingVaccId] = useState<string>("");

  // ── Medical Records State ──
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [recordPetId, setRecordPetId] = useState<string>("");
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [recordForm, setRecordForm] = useState({ date: "", type: "", description: "", veterinarian: "", clinic: "", notes: "" });
  const [deleteRecordDialogOpen, setDeleteRecordDialogOpen] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string>("");

  // ── Users State (Admin) ──
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [userForm, setUserForm] = useState({ name: "", role: "", crmv: "", clinic: "" });
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string>("");

  // ── Profile State ──
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });

  // ── Reports State ──
  const [reportType, setReportType] = useState("Todos");
  const [reportPetId, setReportPetId] = useState("Todos");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportVaccinations, setReportVaccinations] = useState<Vaccination[]>([]);
  const [reportRecords, setReportRecords] = useState<MedicalRecord[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("carteiraPetUser");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUser(u);
        setScreen("dashboard");
      } catch {
        localStorage.removeItem("carteiraPetUser");
      }
    }
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
  }

  // ── API HELPERS ──
  const API_BASE = "/api";

  async function apiFetch(url: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Erro na requisicao" }));
      throw new Error(err.error || "Erro na requisicao");
    }
    return res.json();
  }

  // ── AUTH ──
  async function handleLogin() {
    setLoginError("");
    setLoginLoading(true);
    try {
      const data = await apiFetch("/users", {
        headers: { "x-email": loginEmail, "x-password": loginPassword, "Content-Type": "application/json" },
      });
      if (Array.isArray(data) && data.length > 0) {
        const u = data[0];
        const userData: User = { id: u.id, name: u.name, email: u.email, phone: u.phone || "", role: u.role, crmv: u.crmv || "", clinic: u.clinic || "" };
        setUser(userData);
        localStorage.setItem("carteiraPetUser", JSON.stringify(userData));
        setScreen("dashboard");
        showToast("Login realizado com sucesso!");
      } else {
        setLoginError("Email ou senha invalidos");
      }
    } catch (e: any) {
      setLoginError(e.message || "Erro ao fazer login");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister() {
    setRegError("");
    if (!regName || !regEmail || !regPassword) { setRegError("Preencha todos os campos obrigatorios"); return; }
    if (regPassword !== regConfirm) { setRegError("As senhas nao conferem"); return; }
    if (regPassword.length < 6) { setRegError("A senha deve ter pelo menos 6 caracteres"); return; }
    if (regRole === "VETERINARIO" && !regCrmv) { setRegError("CRMV e obrigatorio para veterinarios"); return; }
    setRegLoading(true);
    try {
      const body: any = { name: regName, email: regEmail, phone: regPhone, password: regPassword, role: regRole };
      if (regRole === "VETERINARIO") { body.crmv = regCrmv; body.clinic = regClinic; }
      await apiFetch("/users", { method: "POST", body: JSON.stringify(body) });
      showToast("Registro realizado com sucesso! Faca login.");
      setShowRegister(false);
      setRegName(""); setRegEmail(""); setRegPhone(""); setRegPassword(""); setRegConfirm(""); setRegRole("TUTOR"); setRegCrmv(""); setRegClinic("");
    } catch (e: any) {
      setRegError(e.message || "Erro ao registrar");
    } finally {
      setRegLoading(false);
    }
  }

  function handleLogout() {
    setUser(null);
    setScreen("login");
    localStorage.removeItem("carteiraPetUser");
    setPets([]); setVaccinations([]); setMedicalRecords([]); setAppUsers([]);
    setSelectedPetId(""); setVaccPetId(""); setRecordPetId("");
  }

  // ── FETCH PETS ──
  async function fetchPets() {
    if (!user) return;
    try {
      const data = await apiFetch("/pets", {
        headers: { "x-user-id": user.id, "x-user-role": user.role, "Content-Type": "application/json" },
      });
      setPets(Array.isArray(data) ? data : []);
    } catch {
      showToast("Erro ao buscar pets", "error");
    }
  }

  // ── FETCH VACCINATIONS ──
  async function fetchVaccinations(petId: string) {
    try {
      const data = await apiFetch(`/pets/${petId}/vaccinations`);
      const items = Array.isArray(data) ? data : [];
      const withStatus = items.map((v: any) => ({ ...v, status: v.nextDate ? getVaccStatus(v) : "Em dia" }));
      setVaccinations(withStatus);
    } catch {
      setVaccinations([]);
      showToast("Erro ao buscar vacinacoes", "error");
    }
  }

  // ── FETCH MEDICAL RECORDS ──
  async function fetchMedicalRecords(petId: string) {
    try {
      const data = await apiFetch(`/pets/${petId}/medical-records`);
      setMedicalRecords(Array.isArray(data) ? data : []);
    } catch {
      setMedicalRecords([]);
      showToast("Erro ao buscar prontuarios", "error");
    }
  }

  // ── FETCH USERS (Admin) ──
  async function fetchUsers() {
    if (!user) return;
    try {
      const data = await apiFetch("/users", {
        headers: { "x-user-id": user.id, "Content-Type": "application/json" },
      });
      setAppUsers(Array.isArray(data) ? data : []);
    } catch {
      showToast("Erro ao buscar usuarios", "error");
    }
  }

  // ── FETCH ALL REPORT DATA ──
  async function fetchReportData() {
    setReportLoading(true);
    try {
      const allPets = user ? await apiFetch("/pets", {
        headers: { "x-user-id": user.id, "x-user-role": user.role, "Content-Type": "application/json" },
      }).then(d => Array.isArray(d) ? d : []) : [];

      const petsToFetch = reportPetId === "Todos" ? allPets : allPets.filter((p: Pet) => p.id === reportPetId);
      const allVaccs: Vaccination[] = [];
      const allRecords: MedicalRecord[] = [];

      await Promise.all(petsToFetch.map(async (p: Pet) => {
        try {
          const [vData, rData] = await Promise.all([
            apiFetch(`/pets/${p.id}/vaccinations`).then(d => Array.isArray(d) ? d : []).catch(() => []),
            apiFetch(`/pets/${p.id}/medical-records`).then(d => Array.isArray(d) ? d : []).catch(() => []),
          ]);
          vData.forEach((v: any) => allVaccs.push({ ...v, status: v.nextDate ? getVaccStatus(v) : "Em dia" }));
          rData.forEach((r: any) => allRecords.push(r));
        } catch { /* skip */ }
      }));

      // Filter by date
      const start = reportStartDate ? new Date(reportStartDate + "T12:00:00") : null;
      const end = reportEndDate ? new Date(reportEndDate + "T23:59:59") : null;

      const filterByDate = (dateStr: string) => {
        if (!dateStr) return true;
        const d = new Date(dateStr + "T12:00:00");
        if (start && d < start) return false;
        if (end && d > end) return false;
        return true;
      };

      // Filter by type
      let filteredVaccs = allVaccs.filter(v => filterByDate(v.date));
      let filteredRecords = allRecords.filter(r => filterByDate(r.date));

      if (reportType === "Vacinacoes") filteredRecords = [];
      if (reportType === "Prontuarios") filteredVaccs = [];

      setReportVaccinations(filteredVaccs);
      setReportRecords(filteredRecords);
    } catch {
      showToast("Erro ao gerar relatorio", "error");
    } finally {
      setReportLoading(false);
    }
  }

  // ── NAVIGATION ──
  function navigateTo(s: Screen) {
    setScreen(s);
  }

  const navItems: { label: string; screen: Screen; icon: string }[] = [
    { label: "Inicio", screen: "dashboard", icon: "🏠" },
    { label: "Pets", screen: "pets", icon: "🐾" },
    { label: "Vacinacoes", screen: "vaccinations", icon: "💉" },
    { label: "Prontuario", screen: "medical-records", icon: "📋" },
    { label: "Relatorios", screen: "reports", icon: "📊" },
    ...(user?.role === "ADMIN" ? [{ label: "Usuarios", screen: "users" as Screen, icon: "👥" }] : []),
    { label: "Perfil", screen: "profile", icon: "👤" },
  ];

  // ── EFFECTS FOR DATA FETCHING ──
  useEffect(() => {
    if (!user) return;
    fetchPets();
  }, [user]);

  useEffect(() => {
    if (screen === "pets" && user) fetchPets();
  }, [screen]);

  useEffect(() => {
    if (screen === "vaccinations" && user) {
      fetchPets().then(() => {
        if (vaccPetId) fetchVaccinations(vaccPetId);
      });
    }
  }, [screen]);

  useEffect(() => {
    if (screen === "medical-records" && user) {
      fetchPets().then(() => {
        if (recordPetId) fetchMedicalRecords(recordPetId);
      });
    }
  }, [screen]);

  useEffect(() => {
    if (screen === "users" && user?.role === "ADMIN") fetchUsers();
  }, [screen, user]);

  useEffect(() => {
    if (screen === "profile" && user) {
      setProfileForm({ name: user.name, email: user.email, phone: user.phone || "", password: "", confirmPassword: "" });
    }
  }, [screen, user]);

  // ── PET CRUD ──
  function openAddPet() {
    setEditingPet(null);
    setPetForm({ name: "", species: "", breed: "", color: "", gender: "", birthDate: "" });
    setPetDialogOpen(true);
  }

  function openEditPet(pet: Pet) {
    setEditingPet(pet);
    setPetForm({ name: pet.name, species: pet.species, breed: pet.breed, color: pet.color || "", gender: pet.gender, birthDate: pet.birthDate || "" });
    setPetDialogOpen(true);
  }

  async function savePet() {
    if (!user) return;
    if (!petForm.name || !petForm.species || !petForm.breed || !petForm.gender) {
      showToast("Preencha todos os campos obrigatorios", "error");
      return;
    }
    try {
      const body = { ...petForm, userId: user.role === "TUTOR" ? user.id : petForm.breed ? undefined : undefined, gender: petForm.gender };
      if (editingPet) {
        await apiFetch(`/pets/${editingPet.id}`, { method: "PUT", body: JSON.stringify(body) });
        showToast("Pet atualizado com sucesso!");
      } else {
        await apiFetch("/pets", { method: "POST", body: JSON.stringify({ ...body, userId: user.id }) });
        showToast("Pet cadastrado com sucesso!");
      }
      setPetDialogOpen(false);
      fetchPets();
    } catch (e: any) {
      showToast(e.message || "Erro ao salvar pet", "error");
    }
  }

  function confirmDeletePet(id: string) {
    setDeletingPetId(id);
    setDeletePetDialogOpen(true);
  }

  async function deletePet() {
    try {
      await apiFetch(`/pets/${deletingPetId}`, { method: "DELETE" });
      showToast("Pet removido com sucesso!");
      setDeletePetDialogOpen(false);
      fetchPets();
    } catch (e: any) {
      showToast(e.message || "Erro ao remover pet", "error");
    }
  }

  // ── VACCINATION CRUD ──
  function openAddVacc() {
    if (!vaccPetId) { showToast("Selecione um pet primeiro", "error"); return; }
    setEditingVacc(null);
    setVaccForm({ name: "", date: "", nextDate: "", veterinarian: "", clinic: "" });
    setVaccDesc("");
    setVaccDialogOpen(true);
  }

  function openEditVacc(vacc: Vaccination) {
    setEditingVacc(vacc);
    setVaccForm({ name: vacc.name, date: vacc.date, nextDate: vacc.nextDate || "", veterinarian: vacc.veterinarian || "", clinic: vacc.clinic || "" });
    // Find description
    const pet = pets.find(p => p.id === vaccPetId);
    if (pet) {
      const vList = vaccineList[pet.species] || [];
      const found = vList.find(v => v.name === vacc.name);
      setVaccDesc(found?.description || "");
    } else {
      setVaccDesc("");
    }
    setVaccDialogOpen(true);
  }

  async function saveVacc() {
    if (!vaccPetId || !vaccForm.name || !vaccForm.date) {
      showToast("Preencha todos os campos obrigatorios", "error");
      return;
    }
    try {
      if (editingVacc) {
        await apiFetch(`/pets/${vaccPetId}/vaccinations/${editingVacc.id}`, { method: "PUT", body: JSON.stringify(vaccForm) });
        showToast("Vacinacao atualizada com sucesso!");
      } else {
        await apiFetch(`/pets/${vaccPetId}/vaccinations`, { method: "POST", body: JSON.stringify(vaccForm) });
        showToast("Vacinacao cadastrada com sucesso!");
      }
      setVaccDialogOpen(false);
      fetchVaccinations(vaccPetId);
    } catch (e: any) {
      showToast(e.message || "Erro ao salvar vacinacao", "error");
    }
  }

  function confirmDeleteVacc(id: string) {
    setDeletingVaccId(id);
    setDeleteVaccDialogOpen(true);
  }

  async function deleteVacc() {
    try {
      await apiFetch(`/pets/${vaccPetId}/vaccinations/${deletingVaccId}`, { method: "DELETE" });
      showToast("Vacinacao removida com sucesso!");
      setDeleteVaccDialogOpen(false);
      fetchVaccinations(vaccPetId);
    } catch (e: any) {
      showToast(e.message || "Erro ao remover vacinacao", "error");
    }
  }

  // ── MEDICAL RECORD CRUD ──
  function openAddRecord() {
    if (!recordPetId) { showToast("Selecione um pet primeiro", "error"); return; }
    setEditingRecord(null);
    setRecordForm({ date: "", type: "", description: "", veterinarian: "", clinic: "", notes: "" });
    setRecordDialogOpen(true);
  }

  function openEditRecord(record: MedicalRecord) {
    setEditingRecord(record);
    setRecordForm({ date: record.date, type: record.type, description: record.description, veterinarian: record.veterinarian || "", clinic: record.clinic || "", notes: record.notes || "" });
    setRecordDialogOpen(true);
  }

  async function saveRecord() {
    if (!recordPetId || !recordForm.date || !recordForm.type || !recordForm.description) {
      showToast("Preencha todos os campos obrigatorios", "error");
      return;
    }
    try {
      if (editingRecord) {
        await apiFetch(`/pets/${recordPetId}/medical-records/${editingRecord.id}`, { method: "PUT", body: JSON.stringify(recordForm) });
        showToast("Prontuario atualizado com sucesso!");
      } else {
        await apiFetch(`/pets/${recordPetId}/medical-records`, { method: "POST", body: JSON.stringify(recordForm) });
        showToast("Prontuario cadastrado com sucesso!");
      }
      setRecordDialogOpen(false);
      fetchMedicalRecords(recordPetId);
    } catch (e: any) {
      showToast(e.message || "Erro ao salvar prontuario", "error");
    }
  }

  function confirmDeleteRecord(id: string) {
    setDeletingRecordId(id);
    setDeleteRecordDialogOpen(true);
  }

  async function deleteRecord() {
    try {
      await apiFetch(`/pets/${recordPetId}/medical-records/${deletingRecordId}`, { method: "DELETE" });
      showToast("Prontuario removido com sucesso!");
      setDeleteRecordDialogOpen(false);
      fetchMedicalRecords(recordPetId);
    } catch (e: any) {
      showToast(e.message || "Erro ao remover prontuario", "error");
    }
  }

  // ── USER CRUD (Admin) ──
  function openEditUser(u: AppUser) {
    setEditingUser(u);
    setUserForm({ name: u.name, role: u.role, crmv: u.crmv || "", clinic: u.clinic || "" });
    setUserDialogOpen(true);
  }

  async function saveUserEdit() {
    if (!user || !editingUser) return;
    try {
      await apiFetch(`/users/${editingUser.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...userForm, adminId: user.id }),
      });
      showToast("Usuario atualizado com sucesso!");
      setUserDialogOpen(false);
      fetchUsers();
    } catch (e: any) {
      showToast(e.message || "Erro ao atualizar usuario", "error");
    }
  }

  function confirmDeleteUser(id: string) {
    if (id === user?.id) { showToast("Voce nao pode excluir seu proprio usuario", "error"); return; }
    setDeletingUserId(id);
    setDeleteUserDialogOpen(true);
  }

  async function deleteUser() {
    if (!user) return;
    try {
      await apiFetch(`/users/${deletingUserId}`, {
        method: "DELETE",
        headers: { "x-user-id": user.id, "Content-Type": "application/json" },
      });
      showToast("Usuario removido com sucesso!");
      setDeleteUserDialogOpen(false);
      fetchUsers();
    } catch (e: any) {
      showToast(e.message || "Erro ao remover usuario", "error");
    }
  }

  // ── PROFILE SAVE ──
  async function saveProfile() {
    if (!user) return;
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      showToast("As senhas nao conferem", "error");
      return;
    }
    try {
      const body: any = { userId: user.id, name: profileForm.name, email: profileForm.email, phone: profileForm.phone };
      if (profileForm.password) body.password = profileForm.password;
      await apiFetch("/users", { method: "PUT", body: JSON.stringify(body) });
      const updated: User = { ...user, name: profileForm.name, email: profileForm.email, phone: profileForm.phone };
      setUser(updated);
      localStorage.setItem("carteiraPetUser", JSON.stringify(updated));
      showToast("Perfil atualizado com sucesso!");
      setProfileForm(prev => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (e: any) {
      showToast(e.message || "Erro ao atualizar perfil", "error");
    }
  }

  // ── EXPORT REPORT ──
  function exportReport() {
    const selectedPet = pets.find(p => p.id === reportPetId);
    const petLabel = reportPetId === "Todos" ? "Todos os Pets" : selectedPet?.name || "";

    const typeLabel = reportType === "Todos" ? "Geral" : reportType === "Vacinacoes" ? "Vacinacoes" : "Prontuarios";
    const dateRange = (reportStartDate || reportEndDate)
      ? `${reportStartDate ? formatDate(reportStartDate) : "Inicio"} - ${reportEndDate ? formatDate(reportEndDate) : "Atual"}`
      : "Sem filtro de data";

    const vaccRows = reportVaccinations.map(v => {
      const pet = pets.find(p => p.id === v.petId);
      return `<tr>
        <td>${pet?.name || "-"}</td>
        <td>${v.name}</td>
        <td>${formatDate(v.date)}</td>
        <td>${v.nextDate ? formatDate(v.nextDate) : "-"}</td>
        <td>${v.veterinarian || "-"}</td>
        <td>${v.clinic || "-"}</td>
        <td>${v.status}</td>
      </tr>`;
    }).join("");

    const recRows = reportRecords.map(r => {
      const pet = pets.find(p => p.id === r.petId);
      return `<tr>
        <td>${pet?.name || "-"}</td>
        <td>${formatDate(r.date)}</td>
        <td>${r.type}</td>
        <td>${r.description}</td>
        <td>${r.veterinarian || "-"}</td>
        <td>${r.clinic || "-"}</td>
      </tr>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatorio Carteira PET - ${typeLabel}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #1e293b; }
  h1 { color: #059669; border-bottom: 3px solid #059669; padding-bottom: 10px; }
  h2 { color: #334155; margin-top: 30px; }
  .header-info { background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
  .summary { display: flex; gap: 20px; margin: 20px 0; flex-wrap: wrap; }
  .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; min-width: 140px; text-align: center; }
  .summary-card .value { font-size: 28px; font-weight: bold; color: #059669; }
  .summary-card .label { font-size: 12px; color: #64748b; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
  th { background: #059669; color: white; padding: 10px 8px; text-align: left; font-size: 13px; }
  td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
  tr:nth-child(even) { background: #f8fafc; }
  .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; text-align: center; }
  .status-emdia { color: #059669; font-weight: bold; }
  .status-pendente { color: #ca8a04; font-weight: bold; }
  .status-atrasada { color: #dc2626; font-weight: bold; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
  <h1>Carteira PET - Relatorio ${typeLabel}</h1>
  <div class="header-info">
    <strong>Periodo:</strong> ${dateRange} &nbsp;|&nbsp; <strong>Pet:</strong> ${petLabel} &nbsp;|&nbsp; <strong>Tipo:</strong> ${typeLabel} &nbsp;|&nbsp; <strong>Gerado em:</strong> ${new Date().toLocaleString("pt-BR")}
  </div>
  <div class="summary">
    <div class="summary-card"><div class="value">${reportVaccinations.length + reportRecords.length}</div><div class="label">Total de Registros</div></div>
    <div class="summary-card"><div class="value">${reportVaccinations.length}</div><div class="label">Vacinacoes</div></div>
    <div class="summary-card"><div class="value">${reportRecords.length}</div><div class="label">Prontuarios</div></div>
    <div class="summary-card"><div class="value">${reportVaccinations.filter(v => v.status === "Atrasada").length}</div><div class="label">Vacinacoes Atrasadas</div></div>
  </div>
  ${reportVaccinations.length > 0 ? `<h2>Vacinacoes</h2><table><thead><tr><th>Pet</th><th>Vacina</th><th>Data</th><th>Proxima Dose</th><th>Veterinario</th><th>Clinica</th><th>Status</th></tr></thead><tbody>${vaccRows}</tbody></table>` : ""}
  ${reportRecords.length > 0 ? `<h2>Prontuarios</h2><table><thead><tr><th>Pet</th><th>Data</th><th>Tipo</th><th>Descricao</th><th>Veterinario</th><th>Clinica</th></tr></thead><tbody>${recRows}</tbody></table>` : ""}
  ${reportVaccinations.length === 0 && reportRecords.length === 0 ? "<p>Nenhum registro encontrado para os filtros selecionados.</p>" : ""}
  <div class="footer">Carteira PET - Sistema de Gestao de Saude Animal &nbsp;|&nbsp; Relatorio gerado em ${new Date().toLocaleString("pt-BR")}</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  }

  // ─────────────────────────── RENDER: NAVBAR ───────────────────────────

  function renderNavbar() {
    return (
      <>
        {/* Desktop Nav */}
        <div className="hidden md:flex bg-slate-900 border-b border-slate-700 px-6 py-2">
          <div className="flex items-center gap-2 mr-8">
            <span className="text-2xl">🐾</span>
            <span className="text-emerald-400 font-bold text-lg">Carteira PET</span>
          </div>
          <div className="flex items-center gap-1 flex-1">
            {navItems.map(item => (
              <button
                key={item.screen}
                onClick={() => navigateTo(item.screen)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  screen === item.screen
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm">{user?.name}</span>
            {roleBadge(user?.role || "")}
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Sair
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden bg-slate-900 border-b border-slate-700 px-2 py-2">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐾</span>
              <span className="text-emerald-400 font-bold">Carteira PET</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-slate-600 text-slate-300 hover:bg-slate-800 text-xs">
              Sair
            </Button>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-1 pb-1">
              {navItems.map(item => (
                <button
                  key={item.screen}
                  onClick={() => navigateTo(item.screen)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    screen === item.screen
                      ? "bg-emerald-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </>
    );
  }

  // ─────────────────────────── RENDER: LOGIN / REGISTER ───────────────────────────

  function renderLogin() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="text-5xl mb-3">🐾</div>
            <CardTitle className="text-3xl font-bold text-emerald-400">Carteira PET</CardTitle>
            <CardDescription className="text-slate-400">Sistema de Gestao de Saude Animal</CardDescription>
          </CardHeader>
          <CardContent>
            {!showRegister ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Senha</Label>
                  <Input
                    type="password"
                    placeholder="Sua senha"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
                <Button
                  onClick={handleLogin}
                  disabled={loginLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {loginLoading ? "Entrando..." : "Entrar"}
                </Button>
                <Separator className="bg-slate-700" />
                <p className="text-center text-slate-400 text-sm">
                  Nao tem uma conta?{" "}
                  <button onClick={() => { setShowRegister(true); setLoginError(""); }} className="text-emerald-400 hover:underline font-medium">
                    Cadastre-se
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Nome Completo</Label>
                  <Input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Seu nome" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Email</Label>
                  <Input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="seu@email.com" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Telefone</Label>
                  <Input value={regPhone} onChange={e => setRegPhone(phoneMask(e.target.value))} placeholder="(00) 00000-0000" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Tipo de Conta</Label>
                  <Select value={regRole} onValueChange={v => setRegRole(v)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="TUTOR" className="text-white">Tutor</SelectItem>
                      <SelectItem value="VETERINARIO" className="text-white">Veterinario</SelectItem>
                      <SelectItem value="ADMIN" className="text-white">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {regRole === "VETERINARIO" && (
                  <>
                    <div>
                      <Label className="text-slate-300">CRMV</Label>
                      <Input value={regCrmv} onChange={e => setRegCrmv(e.target.value)} placeholder="Numero do CRMV" className="bg-slate-700 border-slate-600 text-white" />
                    </div>
                    <div>
                      <Label className="text-slate-300">Clinica</Label>
                      <Input value={regClinic} onChange={e => setRegClinic(e.target.value)} placeholder="Nome da clinica" className="bg-slate-700 border-slate-600 text-white" />
                    </div>
                  </>
                )}
                <div>
                  <Label className="text-slate-300">Senha</Label>
                  <Input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Minimo 6 caracteres" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Confirmar Senha</Label>
                  <Input type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="Repita a senha" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                {regError && <p className="text-red-400 text-sm">{regError}</p>}
                <Button onClick={handleRegister} disabled={regLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  {regLoading ? "Cadastrando..." : "Cadastrar"}
                </Button>
                <Separator className="bg-slate-700" />
                <p className="text-center text-slate-400 text-sm">
                  Ja tem uma conta?{" "}
                  <button onClick={() => { setShowRegister(false); setRegError(""); }} className="text-emerald-400 hover:underline font-medium">
                    Faca login
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─────────────────────────── RENDER: DASHBOARD ───────────────────────────

  async function renderDashboardData() {
    if (!user) return { totalPets: 0, totalVaccs: 0, emDia: 0, pendente: 0, atrasada: 0, totalRecords: 0, overdueItems: [] as Vaccination[] };
    const p = await apiFetch("/pets", {
      headers: { "x-user-id": user.id, "x-user-role": user.role, "Content-Type": "application/json" },
    }).then(d => Array.isArray(d) ? d : []).catch(() => []);

    let allVaccs: Vaccination[] = [];
    let allRecords: MedicalRecord[] = [];
    const overdueItems: Vaccination[] = [];

    await Promise.all(p.map(async (pet: Pet) => {
      try {
        const [vData, rData] = await Promise.all([
          apiFetch(`/pets/${pet.id}/vaccinations`).then(d => Array.isArray(d) ? d : []).catch(() => []),
          apiFetch(`/pets/${pet.id}/medical-records`).then(d => Array.isArray(d) ? d : []).catch(() => []),
        ]);
        vData.forEach((v: any) => {
          const status = getVaccStatus(v);
          allVaccs.push({ ...v, status });
          if (status === "Atrasada") overdueItems.push({ ...v, status });
        });
        rData.forEach((r: any) => allRecords.push(r));
      } catch { /* skip */ }
    }));

    return {
      totalPets: p.length,
      totalVaccs: allVaccs.length,
      emDia: allVaccs.filter(v => v.status === "Em dia").length,
      pendente: allVaccs.filter(v => v.status === "Pendente").length,
      atrasada: allVaccs.filter(v => v.status === "Atrasada").length,
      totalRecords: allRecords.length,
      overdueItems,
    };
  }

  function DashboardContent() {
    const [data, setData] = useState<any>({ totalPets: 0, totalVaccs: 0, emDia: 0, pendente: 0, atrasada: 0, totalRecords: 0, overdueItems: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      setLoading(true);
      renderDashboardData().then(d => { setData(d); setLoading(false); });
    }, []);

    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-400 text-lg">Carregando dados...</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Ola, {user?.name}!</h1>
          <p className="text-slate-400 mt-1">Aqui esta o resumo da saude dos seus pets.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-emerald-400">{data.totalPets}</div><div className="text-slate-400 text-sm mt-1">Pets</div></CardContent></Card>
          <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-blue-400">{data.totalVaccs}</div><div className="text-slate-400 text-sm mt-1">Vacinacoes</div></CardContent></Card>
          <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-emerald-400">{data.emDia}</div><div className="text-slate-400 text-sm mt-1">Em dia</div></CardContent></Card>
          <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-yellow-400">{data.pendente}</div><div className="text-slate-400 text-sm mt-1">Pendentes</div></CardContent></Card>
          <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-red-400">{data.atrasada}</div><div className="text-slate-400 text-sm mt-1">Atrasadas</div></CardContent></Card>
          <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-purple-400">{data.totalRecords}</div><div className="text-slate-400 text-sm mt-1">Prontuarios</div></CardContent></Card>
        </div>

        {data.overdueItems.length > 0 && (
          <Card className="bg-red-900/30 border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-400 text-lg">Alerta de Vacinacoes Atrasadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.overdueItems.slice(0, 5).map(v => {
                  const pet = pets.find(p => p.id === v.petId);
                  return (
                    <div key={v.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-2">
                      <div>
                        <span className="text-white font-medium">{pet?.name || "Pet desconhecido"}</span>
                        <span className="text-slate-400 ml-2">- {v.name}</span>
                      </div>
                      <span className="text-red-400 text-sm">Proxima: {v.nextDate ? formatDate(v.nextDate) : "-"}</span>
                    </div>
                  );
                })}
                {data.overdueItems.length > 5 && (
                  <p className="text-red-400 text-sm text-center">...e mais {data.overdueItems.length - 5} vacinacao(oes) atrasada(s)</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Seus Pets</CardTitle>
            <CardDescription className="text-slate-400">Clique em um pet para ver suas vacinacoes</CardDescription>
          </CardHeader>
          <CardContent>
            {pets.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Nenhum pet cadastrado.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pets.slice(0, 6).map(pet => (
                  <button
                    key={pet.id}
                    onClick={() => { setVaccPetId(pet.id); navigateTo("vaccinations"); }}
                    className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-left"
                  >
                    <span className="text-3xl">{speciesIcon(pet.species)}</span>
                    <div>
                      <div className="text-white font-medium">{pet.name}</div>
                      <div className="text-slate-400 text-sm">{pet.breed} - {pet.gender}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─────────────────────────── RENDER: PETS ───────────────────────────

  function renderPets() {
    const canAdd = user?.role === "TUTOR" || user?.role === "ADMIN";

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Pets</h1>
            <p className="text-slate-400 mt-1">{pets.length} pet(s) encontrado(s)</p>
          </div>
          {canAdd && (
            <Button onClick={openAddPet} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              + Adicionar Pet
            </Button>
          )}
        </div>

        {pets.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="text-center py-16">
              <div className="text-5xl mb-4">🐾</div>
              <p className="text-slate-400 text-lg">Nenhum pet cadastrado</p>
              {canAdd && <p className="text-slate-500 text-sm mt-2">Clique no botao acima para adicionar seu primeiro pet.</p>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map(pet => (
              <Card key={pet.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{speciesIcon(pet.species)}</span>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{pet.name}</h3>
                        <p className="text-slate-400 text-sm">{pet.breed}</p>
                      </div>
                    </div>
                    {(user?.role === "TUTOR" || user?.role === "ADMIN") && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditPet(pet)} className="text-slate-400 hover:text-white h-8 w-8 p-0">
                          ✏️
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => confirmDeletePet(pet.id)} className="text-slate-400 hover:text-red-400 h-8 w-8 p-0">
                          🗑️
                        </Button>
                      </div>
                    )}
                  </div>
                  <Separator className="bg-slate-700 my-3" />
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Especie:</span><span className="text-slate-300">{pet.species}</span></div>
                    {pet.color && <div className="flex justify-between"><span className="text-slate-500">Cor:</span><span className="text-slate-300">{pet.color}</span></div>}
                    <div className="flex justify-between"><span className="text-slate-500">Sexo:</span><span className="text-slate-300">{pet.gender}</span></div>
                    {pet.birthDate && <div className="flex justify-between"><span className="text-slate-500">Nascimento:</span><span className="text-slate-300">{formatDate(pet.birthDate)}</span></div>}
                    {pet.user && (user?.role === "VETERINARIO" || user?.role === "ADMIN") && (
                      <div className="flex justify-between"><span className="text-slate-500">Tutor:</span><span className="text-slate-300">{pet.user.name}</span></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pet Dialog */}
        <Dialog open={petDialogOpen} onOpenChange={setPetDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingPet ? "Editar Pet" : "Adicionar Pet"}</DialogTitle>
              <DialogDescription className="text-slate-400">Preencha os dados do pet</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Nome *</Label>
                <Input value={petForm.name} onChange={e => setPetForm(p => ({ ...p, name: e.target.value }))} placeholder="Nome do pet" className="bg-slate-700 border-slate-600 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Especie *</Label>
                <Select value={petForm.species} onValueChange={v => setPetForm(p => ({ ...p, species: v, breed: "", color: "" }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="Cachorro" className="text-white">Cachorro</SelectItem>
                    <SelectItem value="Gato" className="text-white">Gato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {petForm.species && (
                <div>
                  <Label className="text-slate-300">Raca *</Label>
                  <Select value={petForm.breed} onValueChange={v => setPetForm(p => ({ ...p, breed: v, color: "" }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 max-h-60">
                      {(breedsBySpecies[petForm.species] || []).map(breed => (
                        <SelectItem key={breed} value={breed} className="text-white">{breed}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {petForm.breed && breedColors[petForm.breed] && (
                <div>
                  <Label className="text-slate-300">Cor</Label>
                  <Select value={petForm.color} onValueChange={v => setPetForm(p => ({ ...p, color: v }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 max-h-60">
                      {breedColors[petForm.breed].map(c => (
                        <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="text-slate-300">Sexo *</Label>
                <Select value={petForm.gender} onValueChange={v => setPetForm(p => ({ ...p, gender: v }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="Macho" className="text-white">Macho</SelectItem>
                    <SelectItem value="Femea" className="text-white">Femea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Data de Nascimento</Label>
                <Input type="date" value={petForm.birthDate} onChange={e => setPetForm(p => ({ ...p, birthDate: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setPetDialogOpen(false)} className="text-slate-300">Cancelar</Button>
              <Button onClick={savePet} className="bg-emerald-600 hover:bg-emerald-700 text-white">{editingPet ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Pet Dialog */}
        <AlertDialog open={deletePetDialogOpen} onOpenChange={setDeletePetDialogOpen}>
          <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusao</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">Tem certeza que deseja excluir este pet? Esta acao nao pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-slate-300">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={deletePet} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // ─────────────────────────── RENDER: VACCINATIONS ───────────────────────────

  function renderVaccinations() {
    const availableBreeds = breedsBySpecies[petForm.species] || [];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Vacinacoes</h1>
            <p className="text-slate-400 mt-1">Gerencie as vacinas dos pets</p>
          </div>
          <Button onClick={openAddVacc} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            + Adicionar Vacinacao
          </Button>
        </div>

        <div className="max-w-sm">
          <Label className="text-slate-300">Selecione um Pet</Label>
          <Select value={vaccPetId} onValueChange={v => { setVaccPetId(v); if (v) fetchVaccinations(v); }}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Selecione um pet" /></SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {pets.map(p => (
                <SelectItem key={p.id} value={p.id} className="text-white">{speciesIcon(p.species)} {p.name} ({p.breed})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {vaccPetId && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-0">
              {vaccinations.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Nenhuma vacinacao registrada para este pet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="text-slate-300">Vacina</TableHead>
                      <TableHead className="text-slate-300">Data</TableHead>
                      <TableHead className="text-slate-300">Proxima Dose</TableHead>
                      <TableHead className="text-slate-300 hidden md:table-cell">Veterinario</TableHead>
                      <TableHead className="text-slate-300 hidden md:table-cell">Clinica</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vaccinations.map(v => (
                      <TableRow key={v.id} className="border-slate-700">
                        <TableCell className="text-white font-medium">{v.name}</TableCell>
                        <TableCell className="text-slate-300">{formatDate(v.date)}</TableCell>
                        <TableCell className="text-slate-300">{v.nextDate ? formatDate(v.nextDate) : "-"}</TableCell>
                        <TableCell className="text-slate-300 hidden md:table-cell">{v.veterinarian || "-"}</TableCell>
                        <TableCell className="text-slate-300 hidden md:table-cell">{v.clinic || "-"}</TableCell>
                        <TableCell>{statusBadge(v.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEditVacc(v)} className="text-slate-400 hover:text-white h-7 w-7 p-0">✏️</Button>
                            <Button variant="ghost" size="sm" onClick={() => confirmDeleteVacc(v.id)} className="text-slate-400 hover:text-red-400 h-7 w-7 p-0">🗑️</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Vaccination Dialog */}
        <Dialog open={vaccDialogOpen} onOpenChange={setVaccDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingVacc ? "Editar Vacinacao" : "Adicionar Vacinacao"}</DialogTitle>
              <DialogDescription className="text-slate-400">Registre uma vacina para o pet</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Vacina *</Label>
                <Select value={vaccForm.name} onValueChange={v => {
                  setVaccForm(p => ({ ...p, name: v }));
                  const pet = pets.find(p => p.id === vaccPetId);
                  if (pet) {
                    const vList = vaccineList[pet.species] || [];
                    const found = vList.find(item => item.name === v);
                    setVaccDesc(found?.description || "");
                  }
                }}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Selecione a vacina" /></SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {(() => {
                      const pet = pets.find(p => p.id === vaccPetId);
                      const species = pet?.species || "Cachorro";
                      return (vaccineList[species] || []).map(v => (
                        <SelectItem key={v.name} value={v.name} className="text-white">{v.name}</SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
                {vaccDesc && <p className="text-slate-400 text-xs mt-1">{vaccDesc}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Data da Vacinacao *</Label>
                  <Input type="date" value={vaccForm.date} onChange={e => setVaccForm(p => ({ ...p, date: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Proxima Dose</Label>
                  <Input type="date" value={vaccForm.nextDate} onChange={e => setVaccForm(p => ({ ...p, nextDate: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" />
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Veterinario</Label>
                <Input value={vaccForm.veterinarian} onChange={e => setVaccForm(p => ({ ...p, veterinarian: e.target.value }))} placeholder="Nome do veterinario" className="bg-slate-700 border-slate-600 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Clinica</Label>
                <Input value={vaccForm.clinic} onChange={e => setVaccForm(p => ({ ...p, clinic: e.target.value }))} placeholder="Nome da clinica" className="bg-slate-700 border-slate-600 text-white" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setVaccDialogOpen(false)} className="text-slate-300">Cancelar</Button>
              <Button onClick={saveVacc} className="bg-emerald-600 hover:bg-emerald-700 text-white">{editingVacc ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Vacc Dialog */}
        <AlertDialog open={deleteVaccDialogOpen} onOpenChange={setDeleteVaccDialogOpen}>
          <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusao</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">Tem certeza que deseja excluir esta vacinacao?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-slate-300">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={deleteVacc} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // ─────────────────────────── RENDER: MEDICAL RECORDS ───────────────────────────

  function renderMedicalRecords() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Prontuario Medico</h1>
            <p className="text-slate-400 mt-1">Registros medicos dos pets</p>
          </div>
          <Button onClick={openAddRecord} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            + Adicionar Registro
          </Button>
        </div>

        <div className="max-w-sm">
          <Label className="text-slate-300">Selecione um Pet</Label>
          <Select value={recordPetId} onValueChange={v => { setRecordPetId(v); if (v) fetchMedicalRecords(v); }}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Selecione um pet" /></SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {pets.map(p => (
                <SelectItem key={p.id} value={p.id} className="text-white">{speciesIcon(p.species)} {p.name} ({p.breed})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {recordPetId && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-0">
              {medicalRecords.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Nenhum registro medico para este pet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="text-slate-300">Data</TableHead>
                      <TableHead className="text-slate-300">Tipo</TableHead>
                      <TableHead className="text-slate-300">Descricao</TableHead>
                      <TableHead className="text-slate-300 hidden md:table-cell">Veterinario</TableHead>
                      <TableHead className="text-slate-300 hidden md:table-cell">Clinica</TableHead>
                      <TableHead className="text-slate-300">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicalRecords.map(r => (
                      <TableRow key={r.id} className="border-slate-700">
                        <TableCell className="text-slate-300">{formatDate(r.date)}</TableCell>
                        <TableCell>{recordTypeBadge(r.type)}</TableCell>
                        <TableCell className="text-white max-w-xs truncate">{r.description}</TableCell>
                        <TableCell className="text-slate-300 hidden md:table-cell">{r.veterinarian || "-"}</TableCell>
                        <TableCell className="text-slate-300 hidden md:table-cell">{r.clinic || "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEditRecord(r)} className="text-slate-400 hover:text-white h-7 w-7 p-0">✏️</Button>
                            <Button variant="ghost" size="sm" onClick={() => confirmDeleteRecord(r.id)} className="text-slate-400 hover:text-red-400 h-7 w-7 p-0">🗑️</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Record Dialog */}
        <Dialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Editar Prontuario" : "Adicionar Prontuario"}</DialogTitle>
              <DialogDescription className="text-slate-400">Registre um procedimento ou consulta</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Data *</Label>
                  <Input type="date" value={recordForm.date} onChange={e => setRecordForm(p => ({ ...p, date: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Tipo *</Label>
                  <Select value={recordForm.type} onValueChange={v => setRecordForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="Consulta" className="text-white">Consulta</SelectItem>
                      <SelectItem value="Exame" className="text-white">Exame</SelectItem>
                      <SelectItem value="Cirurgia" className="text-white">Cirurgia</SelectItem>
                      <SelectItem value="Vacina" className="text-white">Vacina</SelectItem>
                      <SelectItem value="Outro" className="text-white">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Descricao *</Label>
                <Textarea
                  value={recordForm.description}
                  onChange={e => setRecordForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Descreva o procedimento ou consulta"
                  rows={3}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Veterinario</Label>
                <Input value={recordForm.veterinarian} onChange={e => setRecordForm(p => ({ ...p, veterinarian: e.target.value }))} placeholder="Nome do veterinario" className="bg-slate-700 border-slate-600 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Clinica</Label>
                <Input value={recordForm.clinic} onChange={e => setRecordForm(p => ({ ...p, clinic: e.target.value }))} placeholder="Nome da clinica" className="bg-slate-700 border-slate-600 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Observacoes</Label>
                <Textarea
                  value={recordForm.notes}
                  onChange={e => setRecordForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Observacoes adicionais"
                  rows={2}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setRecordDialogOpen(false)} className="text-slate-300">Cancelar</Button>
              <Button onClick={saveRecord} className="bg-emerald-600 hover:bg-emerald-700 text-white">{editingRecord ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Record Dialog */}
        <AlertDialog open={deleteRecordDialogOpen} onOpenChange={setDeleteRecordDialogOpen}>
          <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusao</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">Tem certeza que deseja excluir este registro medico?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-slate-300">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={deleteRecord} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // ─────────────────────────── RENDER: REPORTS ───────────────────────────

  function renderReports() {
    const totalRecords = reportVaccinations.length + reportRecords.length;
    const overdueCount = reportVaccinations.filter(v => v.status === "Atrasada").length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Relatorios</h1>
            <p className="text-slate-400 mt-1">Gere relatorios de vacinacoes e prontuarios</p>
          </div>
          <Button onClick={exportReport} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={reportLoading}>
            {reportLoading ? "Gerando..." : "Exportar / Imprimir"}
          </Button>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-slate-300">Tipo</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="Todos" className="text-white">Todos</SelectItem>
                    <SelectItem value="Vacinacoes" className="text-white">Vacinacoes</SelectItem>
                    <SelectItem value="Prontuarios" className="text-white">Prontuarios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Pet</Label>
                <Select value={reportPetId} onValueChange={setReportPetId}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="Todos" className="text-white">Todos</SelectItem>
                    {pets.map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-white">{speciesIcon(p.species)} {p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Data Inicio</Label>
                <Input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Data Fim</Label>
                <Input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
              </div>
            </div>
            <Button onClick={fetchReportData} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={reportLoading}>
              {reportLoading ? "Buscando..." : "Gerar Relatorio"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-emerald-400">{totalRecords}</div><div className="text-slate-400 text-sm mt-1">Total de Registros</div></CardContent></Card>
          <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-blue-400">{reportVaccinations.length}</div><div className="text-slate-400 text-sm mt-1">Vacinacoes</div></CardContent></Card>
          <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-purple-400">{reportRecords.length}</div><div className="text-slate-400 text-sm mt-1">Prontuarios</div></CardContent></Card>
          <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-red-400">{overdueCount}</div><div className="text-slate-400 text-sm mt-1">Vacinacoes Atrasadas</div></CardContent></Card>
        </div>

        {reportVaccinations.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader><CardTitle className="text-white">Vacinacoes Encontradas</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-300">Pet</TableHead>
                    <TableHead className="text-slate-300">Vacina</TableHead>
                    <TableHead className="text-slate-300">Data</TableHead>
                    <TableHead className="text-slate-300 hidden md:table-cell">Proxima Dose</TableHead>
                    <TableHead className="text-slate-300 hidden md:table-cell">Veterinario</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportVaccinations.map(v => {
                    const pet = pets.find(p => p.id === v.petId);
                    return (
                      <TableRow key={v.id} className="border-slate-700">
                        <TableCell className="text-white">{pet?.name || "-"}</TableCell>
                        <TableCell className="text-slate-300">{v.name}</TableCell>
                        <TableCell className="text-slate-300">{formatDate(v.date)}</TableCell>
                        <TableCell className="text-slate-300 hidden md:table-cell">{v.nextDate ? formatDate(v.nextDate) : "-"}</TableCell>
                        <TableCell className="text-slate-300 hidden md:table-cell">{v.veterinarian || "-"}</TableCell>
                        <TableCell>{statusBadge(v.status)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {reportRecords.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader><CardTitle className="text-white">Prontuarios Encontrados</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-300">Pet</TableHead>
                    <TableHead className="text-slate-300">Data</TableHead>
                    <TableHead className="text-slate-300">Tipo</TableHead>
                    <TableHead className="text-slate-300">Descricao</TableHead>
                    <TableHead className="text-slate-300 hidden md:table-cell">Veterinario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportRecords.map(r => {
                    const pet = pets.find(p => p.id === r.petId);
                    return (
                      <TableRow key={r.id} className="border-slate-700">
                        <TableCell className="text-white">{pet?.name || "-"}</TableCell>
                        <TableCell className="text-slate-300">{formatDate(r.date)}</TableCell>
                        <TableCell>{recordTypeBadge(r.type)}</TableCell>
                        <TableCell className="text-slate-300 max-w-xs truncate">{r.description}</TableCell>
                        <TableCell className="text-slate-300 hidden md:table-cell">{r.veterinarian || "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {totalRecords === 0 && !reportLoading && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="text-center py-12">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-slate-400">Nenhum registro encontrado. Aplique os filtros e clique em &quot;Gerar Relatorio&quot;.</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ─────────────────────────── RENDER: USERS (ADMIN) ───────────────────────────

  function renderUsers() {
    if (user?.role !== "ADMIN") return null;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gerenciamento de Usuarios</h1>
          <p className="text-slate-400 mt-1">{appUsers.length} usuario(s) cadastrado(s)</p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-0">
            {appUsers.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Nenhum usuario encontrado.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-300">Nome</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Perfil</TableHead>
                    <TableHead className="text-slate-300 hidden md:table-cell">CRMV</TableHead>
                    <TableHead className="text-slate-300 hidden md:table-cell">Clinica</TableHead>
                    <TableHead className="text-slate-300 hidden lg:table-cell">Pets</TableHead>
                    <TableHead className="text-slate-300">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appUsers.map(u => (
                    <TableRow key={u.id} className="border-slate-700">
                      <TableCell className="text-white font-medium">{u.name}</TableCell>
                      <TableCell className="text-slate-300">{u.email}</TableCell>
                      <TableCell>{roleBadge(u.role)}</TableCell>
                      <TableCell className="text-slate-300 hidden md:table-cell">{u.crmv || "-"}</TableCell>
                      <TableCell className="text-slate-300 hidden md:table-cell">{u.clinic || "-"}</TableCell>
                      <TableCell className="text-slate-300 hidden lg:table-cell">{u._count?.pets || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditUser(u)} className="text-slate-400 hover:text-white h-7 w-7 p-0">✏️</Button>
                          {u.id !== user.id && (
                            <Button variant="ghost" size="sm" onClick={() => confirmDeleteUser(u.id)} className="text-slate-400 hover:text-red-400 h-7 w-7 p-0">🗑️</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription className="text-slate-400">Altere os dados do usuario</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Nome</Label>
                <Input value={userForm.name} onChange={e => setUserForm(p => ({ ...p, name: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Perfil</Label>
                <Select value={userForm.role} onValueChange={v => setUserForm(p => ({ ...p, role: v }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="TUTOR" className="text-white">Tutor</SelectItem>
                    <SelectItem value="VETERINARIO" className="text-white">Veterinario</SelectItem>
                    <SelectItem value="ADMIN" className="text-white">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(userForm.role === "VETERINARIO" || editingUser?.role === "VETERINARIO") && (
                <>
                  <div>
                    <Label className="text-slate-300">CRMV</Label>
                    <Input value={userForm.crmv} onChange={e => setUserForm(p => ({ ...p, crmv: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Clinica</Label>
                    <Input value={userForm.clinic} onChange={e => setUserForm(p => ({ ...p, clinic: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setUserDialogOpen(false)} className="text-slate-300">Cancelar</Button>
              <Button onClick={saveUserEdit} className="bg-emerald-600 hover:bg-emerald-700 text-white">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <AlertDialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
          <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusao</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">Tem certeza que deseja excluir este usuario? Todos os dados associados serao perdidos.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-slate-300">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={deleteUser} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // ─────────────────────────── RENDER: PROFILE ───────────────────────────

  function ProfileContent() {
    const [stats, setStats] = useState({ pets: 0, vaccinations: 0, medicalRecords: 0 });

    useEffect(() => {
      async function loadStats() {
        if (!user) return;
        try {
          const p = await apiFetch("/pets", {
            headers: { "x-user-id": user.id, "x-user-role": user.role, "Content-Type": "application/json" },
          }).then(d => Array.isArray(d) ? d : []).catch(() => []);

          let totalVacc = 0;
          let totalRecords = 0;
          await Promise.all(p.map(async (pet: Pet) => {
            try {
              const [vData, rData] = await Promise.all([
                apiFetch(`/pets/${pet.id}/vaccinations`).then(d => Array.isArray(d) ? d : []).catch(() => []),
                apiFetch(`/pets/${pet.id}/medical-records`).then(d => Array.isArray(d) ? d : []).catch(() => []),
              ]);
              totalVacc += vData.length;
              totalRecords += rData.length;
            } catch { /* skip */ }
          }));

          setStats({ pets: p.length, vaccinations: totalVacc, medicalRecords: totalRecords });
        } catch { /* skip */ }
      }
      loadStats();
    }, []);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
          <p className="text-slate-400 mt-1">Gerencie suas informacoes pessoais</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Informacoes Pessoais</CardTitle>
                <CardDescription className="text-slate-400">Atualize seus dados abaixo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{user?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {roleBadge(user?.role || "")}
                      {user?.role === "VETERINARIO" && user?.crmv && (
                        <span className="text-slate-400 text-sm">CRMV: {user.crmv}</span>
                      )}
                    </div>
                    {user?.role === "VETERINARIO" && user?.clinic && (
                      <p className="text-slate-400 text-sm mt-1">{user.clinic}</p>
                    )}
                  </div>
                </div>
                <Separator className="bg-slate-700" />
                <div>
                  <Label className="text-slate-300">Nome</Label>
                  <Input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Email</Label>
                  <Input type="email" value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Telefone</Label>
                  <Input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: phoneMask(e.target.value) }))} placeholder="(00) 00000-0000" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <Separator className="bg-slate-700" />
                <p className="text-slate-400 text-sm">Para alterar a senha, preencha os campos abaixo:</p>
                <div>
                  <Label className="text-slate-300">Nova Senha</Label>
                  <Input type="password" value={profileForm.password} onChange={e => setProfileForm(p => ({ ...p, password: e.target.value }))} placeholder="Deixe em branco para manter" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Confirmar Nova Senha</Label>
                  <Input type="password" value={profileForm.confirmPassword} onChange={e => setProfileForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Confirme a nova senha" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <Button onClick={saveProfile} className="bg-emerald-600 hover:bg-emerald-700 text-white">Salvar Alteracoes</Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Estatisticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🐾</span>
                    <span className="text-slate-300">Pets</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-xl">{stats.pets}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💉</span>
                    <span className="text-slate-300">Vacinacoes</span>
                  </div>
                  <span className="text-blue-400 font-bold text-xl">{stats.vaccinations}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    <span className="text-slate-300">Prontuarios</span>
                  </div>
                  <span className="text-purple-400 font-bold text-xl">{stats.medicalRecords}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────── MAIN RENDER ───────────────────────────

  if (!user) return renderLogin();

  return (
    <div className="min-h-screen bg-slate-950">
      {renderNavbar()}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
          toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>
      )}

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {screen === "dashboard" && <DashboardContent />}
        {screen === "pets" && renderPets()}
        {screen === "vaccinations" && renderVaccinations()}
        {screen === "medical-records" && renderMedicalRecords()}
        {screen === "reports" && renderReports()}
        {screen === "users" && renderUsers()}
        {screen === "profile" && <ProfileContent />}
      </main>
    </div>
  );
}