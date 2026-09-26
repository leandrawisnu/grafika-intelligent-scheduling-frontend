import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${inter.className} h-full antialiased`}>{children}</div>;
}
