"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    async function load() {
      const [guru, mapel, jurusan, kelas, ruangan, jadwal] = await Promise.all([
        api.getGuru().catch(() => []),
        api.getMataPelajaran().catch(() => []),
        api.getJurusan().catch(() => []),
        api.getKelas().catch(() => []),
        api.getRuangan().catch(() => []),
        api.getJadwalSemester().catch(() => []),
      ]);
      setStats({
        guru: guru.length,
        mapel: mapel.length,
        jurusan: jurusan.length,
        kelas: kelas.length,
        ruangan: ruangan.length,
        jadwal: jadwal.length,
      });
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang di Grafika Intelligent Scheduling</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.guru ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mata Pelajaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mapel ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jurusan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.jurusan ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kelas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kelas ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ruangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ruangan ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jadwal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.jadwal ?? "—"}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alur Kerja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">Data Master</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="secondary">Draf Jadwal</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="secondary">Penempatan Guru</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="secondary">Deteksi Konflik</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="secondary">AI Selesaikan</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge>Publikasi</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
