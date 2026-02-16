"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ShopLogin() {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Check if shop exists with this PIN
        const { data, error } = await supabase
            .from('shops')
            .select('*')
            .eq('pin', pin)
            .single();

        setLoading(false);

        if (data) {
            // Success
            // In a real app we'd set a cookie/session here
            router.push("/shop/scanner");
        } else {
            setError("PIN non valido");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-sm md:max-w-md animate-scale-in">
                <div className="flex flex-col items-center mb-10 md:mb-16">
                    <div className="p-4 md:p-6 rounded-full border-2 border-foreground mb-6 md:mb-8">
                        <Store size={36} className="text-foreground md:hidden" />
                        <Store size={48} className="text-foreground hidden md:block" />
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2 md:mb-3">Area Negozio</h1>
                    <p className="text-muted-foreground text-center text-sm md:text-base">Inserisci il PIN per accedere</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 md:space-y-8">
                    <div>
                        <input
                            type="password"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            className="w-full bg-transparent border-2 border-foreground rounded-lg px-4 py-3 md:px-6 md:py-4 text-foreground text-center text-xl md:text-2xl tracking-widest placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-foreground/10 transition-all"
                            placeholder="PIN"
                            maxLength={4}
                            value={pin}
                            onChange={e => { setPin(e.target.value); setError(""); }}
                            autoFocus
                        />
                        {error && <p className="text-destructive text-sm mt-3 md:mt-4 text-center font-medium">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 md:py-4 rounded-lg font-bold text-sm md:text-base transition-all hover:translate-y-[-1px] flex items-center justify-center gap-2 md:gap-3 shadow-[0_2px_8px_rgba(234,234,234,0.1)] hover:shadow-[0_4px_12px_rgba(234,234,234,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Accesso..." : <>Accedi <ArrowRight size={20} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}
