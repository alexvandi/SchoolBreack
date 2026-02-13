"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { X } from "lucide-react";

export default function QRScanner({ onScan }: { onScan: (decodedText: string) => void }) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Determine strict mode safety
        if (!scannerRef.current) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
            /* verbose= */ false
            );

            scanner.render(
                (decodedText) => {
                    scanner.clear();
                    onScan(decodedText);
                },
                (errorMessage) => {
                    // ignore errors for better UX
                }
            );
            scannerRef.current = scanner;
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
                scannerRef.current = null;
            }
        };
    }, [onScan]);

    return (
        <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-black border border-white/10 relative">
            <div id="reader" className="w-full h-full"></div>
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-[2px] border-primary/50 animate-pulse rounded-2xl" />
        </div>
    );
}
