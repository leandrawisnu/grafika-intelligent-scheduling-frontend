import { LoginBackLink, LoginFrame, LoginHeading } from "@/components/login-frame";

export default function LupaSandiPage() {
  return (
    <LoginFrame>
      <LoginHeading title="Lupa kata sandi">
        Reset lewat email belum tersedia. Hubungi admin sekolah untuk mengatur ulang kata sandi akun Admin atau Koor Jurusan.
      </LoginHeading>
      <LoginBackLink />
    </LoginFrame>
  );
}
