"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Send, Sparkles } from "lucide-react";

export default function AITanyaPage() {
  const [pertanyaan, setPertanyaan] = useState("");
  const [jadwalId, setJadwalId] = useState("");
  const [jawaban, setJawaban] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTanya = async () => {
    if (!pertanyaan.trim()) return;
    setLoading(true);
    setJawaban("");
    try {
      const hasil = await api.aiTanya(pertanyaan, jadwalId || "00000000-0000-0000-0000-000000000000");
      setJawaban(hasil.jawaban ?? "Tidak ada jawaban.");
    } catch (e: any) {
      setJawaban("Error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tanya AI tentang Jadwal</h1>
        <p className="text-muted-foreground">
          Ajukan pertanyaan dalam bahasa alami tentang jadwal pelajaran
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Pertanyaan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">ID Jadwal Semester (opsional)</label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Masukkan ID jadwal"
              value={jadwalId}
              onChange={(e) => setJadwalId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pertanyaan</label>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={"Contoh:\n- Guru siapa yang bentrok hari Senin?\n- Guru mana yang paling banyak mengajar minggu ini?\n- Cari slot kosong Pak Ahmad\n- Mengapa jadwal XI RPL belum dapat dipublikasikan?\n- Tampilkan seluruh konflik minggu ini"}
              value={pertanyaan}
              onChange={(e) => setPertanyaan(e.target.value)}
            />
          </div>
          <Button onClick={handleTanya} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Memproses..." : "Tanya"}
          </Button>

          {jawaban && (
            <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap">
              {jawaban}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
