"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

const warnaStatus: Record<string, string> = {
  draf: "bg-gray-100 text-gray-700",
  penempatan: "bg-blue-100 text-blue-700",
  tinjauan: "bg-yellow-100 text-yellow-700",
  dipublikasikan: "bg-green-100 text-green-700",
  diarsipkan: "bg-gray-100 text-gray-500",
};

const labelStatus: Record<string, string> = {
  draf: "Draf",
  penempatan: "Penempatan",
  tinjauan: "Tinjauan",
  dipublikasikan: "Dipublikasikan",
};

export default function JadwalPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getJadwalSemester();
      setList(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleBuat = async () => {
    try {
      const sems = await api.getSemester();
      if (sems.length === 0) { alert("Buat data semester terlebih dahulu"); return; }
      const js = await api.createJadwalSemester({ semester_id: sems[0].id });
      router.push(`/jadwal/${js.id}`);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jadwal Semester</h1>
          <p className="text-muted-foreground">Kelola jadwal pelajaran per semester</p>
        </div>
        <Button onClick={handleBuat}>Buat Jadwal Semester Baru</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Memuat...</p>
      ) : list.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            Belum ada jadwal semester. Klik &ldquo;Buat Jadwal Semester Baru&rdquo; untuk memulai.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((js) => (
            <Card key={js.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/jadwal/${js.id}`)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {js.semester?.nama ?? "Semester " + js.semester_id?.slice(0, 8)}
                  </CardTitle>
                  <Badge className={warnaStatus[js.status] ?? ""}>{labelStatus[js.status] ?? js.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>Jurusan: {js.jurusan?.map((j: any) => j.jurusan?.nama).join(", ") || "—"}</p>
                {js.bebas_konflik && <p className="text-green-600 font-medium">Bebas konflik</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
