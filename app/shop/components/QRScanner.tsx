"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2, Camera } from "lucide-react";

export default function QRScanner({ onScan }: { onScan: (decodedText: string) => void }) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [starting, setStarting] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasScanned = useRef(false);

    useEffect(() => {
        let mounted = true;

        const startScanner = async () => {
            try {
                const scanner = new Html5Qrcode("reader");
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: "environment" }, // rear camera
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        if (hasScanned.current) return;
                        hasScanned.current = true;
                        scanner.stop().catch(() => { });
                        onScan(decodedText);
                    },
                    () => {
                        // scan error — ignore for UX
                    }
                );

                if (mounted) setStarting(false);
            } catch (err) {
                console.error("Camera error:", err);
                if (mounted) {
                    setStarting(false);
                    setError("Impossibile accedere alla fotocamera. Controlla i permessi.");
                }
            }
        };

        startScanner();

        return () => {
            mounted = false;
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
                scannerRef.current = null;
            }
        };
    }, [onScan]);

    return (
        <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-black border border-white/10 relative">
            {starting && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black text-white gap-3">
                    <Loader2 size={28} className="animate-spin" />
                    <span className="text-xs tracking-widest uppercase">Avvio fotocamera...</span>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black text-white gap-3 p-4 text-center">
                    <Camera size={28} className="text-red-400" />
                    <span className="text-sm text-red-400">{error}</span>
                </div>
            )}
            <div id="reader" className="w-full" style={{ minHeight: 300 }}></div>
            {!starting && !error && (
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-[2px] border-primary/50 animate-pulse rounded-2xl" />
            )}
        </div>
    );
}
