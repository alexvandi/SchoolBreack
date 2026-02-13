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
        <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
            <div className="w-full max-w-md flex items-center justify-between mb-8 pt-4">
                <Link href="/shop" className="p-2 border-2 border-white rounded-full hover:bg-white hover:text-black transition-all">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-xl font-bold uppercase tracking-wider">Scansione QR</h1>
                <div className="w-10" />
            </div>

            <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center gap-8">
                <div className="text-center space-y-3">
                    <div className="inline-block p-4 border-2 border-white rounded-full mb-2">
                        <QrCode size={40} />
                    </div>
                    <p className="text-white/70">Inquadra il codice QR sulla tessera</p>
                </div>

                <QRScanner onScan={handleScan} />

                <div className="p-4 bg-white/5 border border-white/20 rounded-2xl text-sm text-white/50 w-full text-center">
                    Assicurati che il codice sia ben illuminato
                </div>
            </div>
        </div>
    );
}
