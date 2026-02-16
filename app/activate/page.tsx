"use client";

import { useState, useEffect, Suspense } from "react"; // Added Suspense
import { useRouter, useSearchParams, usePathname } from "next/navigation"; // Added hooks
import { supabase } from "@/lib/supabase";
import { ArrowRight, UserPlus, CheckCircle, Loader2 } from "lucide-react";

function ActivateContent() {
    const router = useRouter();
    const pathname = usePathname();
    // Logic to extract cardId from path (e.g. /activate/SB-xxxx)
    // Since we are now using a client-side rewrite, the browser URL is /activate/SB-xxxx
    // but the actual page served is /activate (index.html).
    // Use window.location or pathname.

    // However, if we use Next.js static export + Rewrite, the param isn't in "params" prop.
    // We need to parse it from the URL.

    const [cardId, setCardId] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        email: "",
        phone: "",
        gender: "Male",
        age: 18,
    });

    useEffect(() => {
        // Extract ID from URL: /activate/SB-1234
        if (typeof window !== 'undefined') {
            const pathParts = window.location.pathname.split('/');
            // Expecting ["", "activate", "SB-xxxx"]
            const id = pathParts[pathParts.length - 1]; // Last part is likely the ID

            if (id && id.startsWith('SB-')) {
                setCardId(id);
            } else if (id === 'activate') {
                // If visited /activate without ID
                setChecking(false);
            }
        }
    }, []);

    useEffect(() => {
        const checkCardStatus = async () => {
            if (!cardId) return;

            setChecking(true);

            // Check if card exists and if it's already active (has a name)
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('card_id', cardId)
                .single();

            if (data) {
                if (data.name && data.surname) {
                    // Card already fully registered -> Redirect to Verify
                    alert("Questa tessera è già attiva! Verrai reindirizzato.");
                    router.push(`/shop/verify?cardId=${cardId}`);
                } else {
                    // Card exists but empty (pre-registered) -> Allow activation
                    setChecking(false);
                }
            } else {
                // Card NOT found. Support creating new? Yes.
                setChecking(false);
            }
        };

        if (cardId) {
            checkCardStatus();
        }
    }, [cardId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.surname || !cardId) return;

        setLoading(true);

        const { error } = await supabase
            .from('users')
            .upsert({
                card_id: cardId,
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                phone: formData.phone,
                age: Number(formData.age),
                gender: formData.gender,
            }, { onConflict: 'card_id' });

        setLoading(false);

        if (error) {
            console.error('Error activating card:', error);
            alert('Errore durante l\'attivazione. Riprova.');
        } else {
            setSuccess(true);
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-pulse">
                <Loader2 size={48} className="text-foreground animate-spin mb-4" />
                <p className="text-foreground tracking-widest text-sm uppercase">Verifica stato tessera...</p>
            </div>
        );
    }

    if (!cardId) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">ID Tessera Mancante</h1>
                <p className="mb-4">Per favore scansiona un codice QR valido.</p>
                <button onClick={() => router.push('/')} className="underline">Torna alla Home</button>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-6 text-center animate-scale-in">
                <div className="mb-4 md:mb-6 p-4 md:p-6 border-2 border-foreground rounded-full text-foreground">
                    <CheckCircle size={48} className="md:hidden" />
                    <CheckCircle size={64} className="hidden md:block" />
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-2 text-foreground">Tessera Attivata!</h1>
                <p className="text-foreground/70 mb-6 md:mb-8 text-base md:text-lg">
                    La tua tessera è ora attiva
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-foreground hover:bg-foreground/90 text-background px-6 py-3 md:px-8 md:py-4 rounded-2xl md:rounded-3xl font-bold transition-all hover:scale-[1.02] text-sm md:text-base"
                >
                    Torna alla Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-6">
            <div className="w-full max-w-sm md:max-w-lg animate-slide-up mt-6 md:mt-10">
                <div className="text-center mb-6 md:mb-8">
                    <div className="inline-block p-3 md:p-4 rounded-full border-2 border-foreground text-foreground mb-3 md:mb-4">
                        <UserPlus size={32} className="md:hidden" />
                        <UserPlus size={40} className="hidden md:block" />
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-1 md:mb-2">Attiva Tessera</h1>
                    <p className="text-foreground/70 text-sm md:text-base">Compila il modulo per la tessera #{cardId}</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-background border-2 border-foreground p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div>
                            <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-foreground/90">Nome</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-transparent border-2 border-foreground rounded-xl md:rounded-2xl px-3 py-2.5 md:px-4 md:py-3 text-foreground text-sm md:text-base placeholder:text-foreground/50 focus:outline-none focus:ring-4 focus:ring-foreground/20"
                                placeholder="Mario"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-foreground/90">Cognome</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-transparent border-2 border-foreground rounded-xl md:rounded-2xl px-3 py-2.5 md:px-4 md:py-3 text-foreground text-sm md:text-base placeholder:text-foreground/50 focus:outline-none focus:ring-4 focus:ring-foreground/20"
                                placeholder="Rossi"
                                value={formData.surname}
                                onChange={e => setFormData({ ...formData, surname: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div>
                            <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-foreground/90">Età</label>
                            <input
                                type="number"
                                required
                                className="w-full bg-transparent border-2 border-foreground rounded-xl md:rounded-2xl px-3 py-2.5 md:px-4 md:py-3 text-foreground text-sm md:text-base focus:outline-none focus:ring-4 focus:ring-foreground/20"
                                placeholder="18"
                                min={1} max={120}
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-foreground/90">Genere</label>
                            <select
                                className="w-full bg-background border-2 border-foreground rounded-xl md:rounded-2xl px-3 py-2.5 md:px-4 md:py-3 text-foreground text-sm md:text-base focus:outline-none focus:ring-4 focus:ring-foreground/20"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="Male">Uomo</option>
                                <option value="Female">Donna</option>
                                <option value="Other">Altro</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-foreground/90">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-transparent border-2 border-foreground rounded-xl md:rounded-2xl px-3 py-2.5 md:px-4 md:py-3 text-foreground text-sm md:text-base placeholder:text-foreground/50 focus:outline-none focus:ring-4 focus:ring-foreground/20"
                            placeholder="mario.rossi@example.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-foreground/90">Telefono</label>
                        <input
                            type="tel"
                            required
                            className="w-full bg-transparent border-2 border-foreground rounded-xl md:rounded-2xl px-3 py-2.5 md:px-4 md:py-3 text-foreground text-sm md:text-base placeholder:text-foreground/50 focus:outline-none focus:ring-4 focus:ring-foreground/20"
                            placeholder="+39 333 1234567"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-foreground hover:bg-foreground/90 text-background py-3 md:py-4 rounded-xl md:rounded-2xl font-bold uppercase tracking-wider text-sm md:text-base transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mt-2 md:mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Attivazione..." : <>Attiva Tessera <ArrowRight size={18} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ActivatePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ActivateContent />
        </Suspense>
    );
}
