"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, QrCode } from "lucide-react";
import Link from "next/link";
import QRScanner from "../components/QRScanner";

export default function ScannerPage() {
    const router = useRouter();

    const handleScan = (decodedText: string) => {
        let cardId = decodedText;

        try {
            if (decodedText.startsWith("http")) {
                const url = new URL(decodedText);
                const pathParts = url.pathname.split('/');
                if (pathParts.length > 0) {
                    cardId = pathParts[pathParts.length - 1];
                }
            }
        } catch (e) {
            console.error("Error parsing QR URL", e);
        }

        router.push(`/shop/verify?cardId=${cardId}`);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-3 md:p-4">
            <div className="w-full max-w-sm md:max-w-md flex items-center justify-between mb-6 md:mb-8 pt-3 md:pt-4">
                <Link href="/shop" className="p-2 border-2 border-foreground rounded-full hover:bg-foreground hover:text-background transition-all">
                    <ArrowLeft size={20} className="md:hidden" />
                    <ArrowLeft size={24} className="hidden md:block" />
                </Link>
                <h1 className="text-lg md:text-xl font-bold uppercase tracking-wider">Scansione QR</h1>
                <div className="w-10" />
            </div>

            <div className="w-full max-w-sm md:max-w-md flex-1 flex flex-col items-center justify-center gap-6 md:gap-8">
                <div className="text-center space-y-2 md:space-y-3">
                    <div className="inline-block p-3 md:p-4 border-2 border-foreground rounded-full mb-2">
                        <QrCode size={32} className="md:hidden" />
                        <QrCode size={40} className="hidden md:block" />
                    </div>
                    <p className="text-foreground/70 text-sm md:text-base">Inquadra il codice QR sulla tessera</p>
                </div>

                <QRScanner onScan={handleScan} />

                <div className="p-3 md:p-4 bg-foreground/5 border border-foreground/20 rounded-2xl text-xs md:text-sm text-foreground/50 w-full text-center">
                    Assicurati che il codice sia ben illuminato
                </div>
            </div>
        </div>
    );
}
