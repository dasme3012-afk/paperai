import Link from "next/link";
import { AppHeader } from "@/components/app-header";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <AppHeader />
      <div className="flex flex-col items-center justify-center py-32 px-5 text-center">
        <h1 className="text-9xl font-black text-brand mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">Page not found</h2>
        <p className="text-white/50 max-w-md mx-auto mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="rounded-md bg-brand px-6 py-3 font-bold text-white hover:brightness-110 transition-all">
          Go back home
        </Link>
      </div>
    </main>
  );
}
