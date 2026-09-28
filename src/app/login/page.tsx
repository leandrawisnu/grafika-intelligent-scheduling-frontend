"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { LoginFrame, LoginHeading } from "@/components/login-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tampil, setTampil] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Email atau kata sandi salah.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Tidak terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginFrame>
      <LoginHeading title="Masuk ke GIS">
        Gunakan akun Admin atau Koor Jurusan. Hubungi admin bila belum punya akses.
      </LoginHeading>
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-[#1a2332]">
            Alamat email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@sekolah.sch.id"
            className="h-12 rounded-xl border-[#c5d3e2] bg-white px-4 text-[15px] font-normal shadow-none placeholder:text-[#8b97a6]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-[#1a2332]">
            Kata sandi
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={tampil ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan kata sandi"
              className="h-12 rounded-xl border-[#c5d3e2] bg-white px-4 pr-12 text-[15px] font-normal shadow-none placeholder:text-[#8b97a6]"
            />
            <button
              type="button"
              className="absolute top-1/2 right-4 -translate-y-1/2 text-[#8b97a6] outline-none hover:text-[#1a2332] focus-visible:ring-1 focus-visible:ring-ring/40"
              onClick={() => setTampil((nilai) => !nilai)}
              aria-label={tampil ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {tampil ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <Link href="/login/lupa-sandi" className="text-sm font-semibold text-primary hover:underline">
            Lupa kata sandi
          </Link>
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          className="h-12 w-full rounded-xl border-transparent bg-primary text-[15px] font-medium text-primary-foreground shadow-none hover:border-transparent hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? "Memeriksa…" : "Masuk"}
          {loading ? null : <ArrowRight className="size-4" />}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Kendala masuk? Hubungi{" "}
          <Link href="/login/lupa-sandi" className="font-semibold text-primary hover:underline">
            admin sekolah
          </Link>
          .
        </p>
      </form>
    </LoginFrame>
  );
}
