"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2, Camera } from "lucide-react";

export default function QRScanner({ onScan }: { onScan: (decodedText: string) => void }) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const onScanRef = useRef(onScan);
    const [starting, setStarting] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasScanned = useRef(false);
    const isMounted = useRef(true);

    // Keep callback ref up to date without triggering effect
    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        isMounted.current = true;
        hasScanned.current = false;

        const startScanner = async () => {
            // Don't start if already running
            if (scannerRef.current) return;

            try {
                const scanner = new Html5Qrcode("reader");
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        if (hasScanned.current) return;
                        hasScanned.current = true;

                        // Stop scanner before navigating
                        scanner.stop().then(() => {
                            scannerRef.current = null;
                            onScanRef.current(decodedText);
                        }).catch(() => {
                            scannerRef.current = null;
                            onScanRef.current(decodedText);
                        });
                    },
                    () => {
                        // scan frame error — ignore
                    }
                );

                if (isMounted.current) setStarting(false);
            } catch (err) {
                console.error("Camera error:", err);
                if (isMounted.current) {
                    setStarting(false);
                    setError("Impossibile accedere alla fotocamera. Controlla i permessi.");
                }
            }
        };

        startScanner();

        return () => {
            isMounted.current = false;
            const scanner = scannerRef.current;
            if (scanner) {
                scanner.stop().catch(() => { });
                scannerRef.current = null;
            }
        };
    }, []); // No dependencies — runs once on mount

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
