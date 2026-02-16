import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top Navbar */}
            <header className="border-b border-foreground/20 px-4 py-4 md:px-8 md:py-5 flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                    <Link href="/" className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg md:text-xl font-heading font-bold text-foreground tracking-tight">
                        SCHOOLBREAK ADMIN
                    </h1>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full animate-slide-up">
                {children}
            </main>
        </div>
    );
}
