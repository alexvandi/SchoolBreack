"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, ArrowRight } from "lucide-react";
import { db } from "@/lib/mockDb";

export default function ShopLogin() {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const shop = db.shops.verifyPin(pin);

        if (shop) {
            router.push("/shop/scanner");
        } else {
            setError("PIN non valido");
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-md animate-scale-in">
                <div className="flex flex-col items-center mb-16">
                    <div className="p-6 rounded-full border-2 border-white mb-8">
                        <Store size={48} className="text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">Area Negozio</h1>
                    <p className="text-[#bdbdbd] text-center text-base">Inserisci il PIN per accedere</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-8">
                    <div>
                        <input
                            type="password"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            className="w-full bg-transparent border-2 border-white rounded-[12px] px-6 py-4 text-white text-center text-2xl tracking-widest placeholder:text-[#bdbdbd] focus:outline-none focus:ring-4 focus:ring-white/10 transition-all"
                            placeholder="PIN"
                            maxLength={4}
                            value={pin}
                            onChange={e => { setPin(e.target.value); setError(""); }}
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-sm mt-4 text-center font-medium">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#eaeaea] hover:bg-[#f5f5f5] text-black py-4 rounded-[12px] font-bold text-base transition-all hover:translate-y-[-1px] flex items-center justify-center gap-3 shadow-[0_2px_8px_rgba(234,234,234,0.1)] hover:shadow-[0_4px_12px_rgba(234,234,234,0.2)]"
                    >
                        Accedi <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
