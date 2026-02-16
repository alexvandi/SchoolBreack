"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowRight, UserPlus, CheckCircle, Loader2 } from "lucide-react";

export default function ActivatePage({ params }: { params: { cardId: string } }) {
    const router = useRouter();
    const cardId = params.cardId;
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
        const checkCardStatus = async () => {
            if (!cardId) return;

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
                // Card NOT found in DB at all
                // Strategy: We could allow creating it on the fly (old behavior) OR block it.
                // Given the new "pre-printed" flow, we should probably allow it for flexibility
                // or treat it as a new insert. Let's treat it as a new insert (flexible).
                setChecking(false);
            }
        };

        checkCardStatus();
    }, [cardId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.surname) return;

        setLoading(true);

        // We use UPSERT to handle both cases:
        // 1. Updating a pre-registered empty row (match on card_id)
        // 2. Inserting a brand new row if it didn't exist
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
