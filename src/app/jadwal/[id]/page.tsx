"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table";
import { api } from "@/lib/api";
import { JadwalSemester, Konflik } from "@/lib/types";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Send,
} from "lucide-react";

const labelTipeKonflik: Record<string, string> = {
  guru_bentrok: "Guru Bentrok",
  ruangan_bentrok: "Ruangan Bentrok",
  kelas_bentrok: "Kelas Bentrok",
  guru_kelebihan_jam: "Guru Kelebihan Jam",
  guru_hari_libur: "Guru Hari Libur",
  guru_tidak_berkualifikasi: "Guru Tidak Berkualifikasi",
  kapasitas_ruangan_melebihi: "Kapasitas Ruangan Melebihi",
};

const warnaStatus: Record<string, string> = {
  draf: "bg-gray-100 text-gray-700",
  penempatan: "bg-blue-100 text-blue-700",
  tinjauan: "bg-yellow-100 text-yellow-700",
  dipublikasikan: "bg-green-100 text-green-700",
};

const labelStatus: Record<string, string> = {
  draf: "Draf",
  penempatan: "Penempatan",
  tinjauan: "Tinjauan",
  dipublikasikan: "Dipublikasikan",
};

export default function DetailJadwalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [js, setJS] = useState<JadwalSemester | null>(null);
  const [konflik, setKonflik] = useState<Konflik[]>([]);
  const [tanyaAI, setTanyaAI] = useState("");
  const [jawabanAI, setJawabanAI] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.getJadwalSemesterById(id);
      setJS(data);
      try { const ks = await api.getKonflik(id); setKonflik(ks); } catch {}
    } catch { router.push("/jadwal"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleValidasi = async () => {
    const hasil = await api.validasiJadwal(id);
    setKonflik(hasil.konflik ?? []);
    load();
  };

  const handlePrediksi = async () => {
    try {
      const hasil = await api.prediksiKonflik(id);
      alert(`ML mendeteksi ${hasil.konflik?.length ?? 0} potensi konflik`);
    } catch (e: any) {
      alert("Layanan ML tidak tersedia: " + e.message);
    }
  };

  const handleSelesaikan = async (konflikId: string) => {
    try {
      const hasil = await api.selesaikanKonflik(konflikId);
    } catch (e: any) {
      alert("Layanan ML tidak tersedia: " + e.message);
    }
  };

  const handlePublikasi = async () => {
    try {
      await api.publikasi(id);
      load();
    } catch (e: any) { alert("Error: " + e.message); }
  };

  const handleAITanya = async () => {
    if (!tanyaAI.trim()) return;
    try {
      const hasil = await api.aiTanya(tanyaAI, id);
      setJawabanAI(hasil.jawaban ?? "Tidak ada jawaban");
    } catch (e: any) { setJawabanAI("Error: " + e.message); }
  };

  if (loading) return <p>Memuat...</p>;
  if (!js) return <p>Jadwal semester tidak ditemukan</p>;

  // Kumpulkan semua slot dari semua jadwal_kelas aktif
  const semuaSlot = js.jadwal_kelas?.filter(jk => jk.is_active)?.flatMap(jk => jk.slot_jadwal ?? []) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detail Jadwal Semester</h1>
          <div className="flex gap-2 items-center mt-1">
            <Badge variant={js.bebas_konflik ? "default" : "destructive"}>
              {js.bebas_konflik ? "Bebas Konflik" : "Ada Konflik"}
            </Badge>
            <Badge className={warnaStatus[js.status] ?? ""}>{labelStatus[js.status] ?? js.status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleValidasi}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Validasi
          </Button>
          <Button variant="outline" onClick={handlePrediksi}>
            <Sparkles className="h-4 w-4 mr-2" />
            Prediksi AI
          </Button>
          {js.bebas_konflik && (
            <Button onClick={handlePublikasi}>
              <Send className="h-4 w-4 mr-2" />
              Publikasi
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Jurusan Terdaftar</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {js.jurusan?.map((j: any) => (
              <Badge key={j.id} variant="secondary">{j.jurusan?.nama ?? j.jurusan_id}</Badge>
            )) ?? <span className="text-muted-foreground">Belum ada jurusan</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Jadwal Kelas Aktif</CardTitle></CardHeader>
        <CardContent>
          {(!js.jadwal_kelas || js.jadwal_kelas.length === 0) ? (
            <p className="text-muted-foreground">Belum ada jadwal kelas</p>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {js.jadwal_kelas.filter(jk => jk.is_active).map(jk => (
                <Badge key={jk.id}>{jk.kelas?.nama ?? jk.kelas_id} (v{jk.versi})</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="konflik">
        <TabsList>
          <TabsTrigger value="konflik">Konflik {konflik.length > 0 && `(${konflik.length})`}</TabsTrigger>
          <TabsTrigger value="slot">Semua Slot</TabsTrigger>
          <TabsTrigger value="ai">Tanya AI</TabsTrigger>
        </TabsList>

        <TabsContent value="konflik" className="space-y-4">
          {konflik.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <p>Tidak ada konflik</p>
              </CardContent>
            </Card>
          ) : (
            konflik.map((k) => (
              <Card key={k.id} className={k.tingkat_keparahan === "kesalahan" ? "border-red-200" : "border-yellow-200"}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {k.tingkat_keparahan === "kesalahan" ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                      <CardTitle className="text-sm font-medium">
                        {labelTipeKonflik[k.tipe_konflik] ?? k.tipe_konflik}
                      </CardTitle>
                    </div>
                    <Badge variant={k.tingkat_keparahan === "kesalahan" ? "destructive" : "secondary"}>
                      {k.tingkat_keparahan === "kesalahan" ? "Kesalahan" : "Peringatan"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{k.deskripsi}</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => handleSelesaikan(k.id)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Minta Solusi AI
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="slot">
          <DataTable
            columns={[
              { key: "nama_kelas", label: "Kelas", render: (_, row) => row.kelas?.nama ?? "—" },
              { key: "nama_mapel", label: "Mapel", render: (_, row) => row.mata_pelajaran?.nama ?? "—" },
              { key: "nama_hari", label: "Hari", render: (_, row) => row.hari?.nama ?? "—" },
              { key: "jam", label: "Jam", render: (_, row) => row.jam_pelajaran?.waktu_mulai ?? "—" },
              { key: "nama_guru", label: "Guru", render: (_, row) => row.guru?.nama_lengkap ?? "—" },
              { key: "nama_ruangan", label: "Ruangan", render: (_, row) => row.ruangan?.nama ?? "—" },
            ]}
            data={semuaSlot}
          />
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Tanya AI tentang Jadwal</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Contoh: Guru siapa yang bentrok hari Senin?"
                  value={tanyaAI}
                  onChange={(e) => setTanyaAI(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAITanya()}
                />
                <Button onClick={handleAITanya}>
                  <Send className="h-4 w-4 mr-2" /> Tanya
                </Button>
              </div>
              {jawabanAI && (
                <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap">{jawabanAI}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
