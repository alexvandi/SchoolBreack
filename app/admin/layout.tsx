import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Top Navbar */}
            <header className="border-b border-white/20 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#bdbdbd] hover:text-white">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-heading font-bold text-white tracking-tight">
                        SCHOOLBREAK ADMIN
                    </h1>
                </div>
            </header>

            <main className="flex-1 p-8 md:p-12 max-w-7xl mx-auto w-full animate-slide-up">
                {children}
            </main>
        </div>
    );
}
