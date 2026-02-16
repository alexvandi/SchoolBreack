"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowRight, UserPlus, CheckCircle, Loader2, AlertTriangle } from "lucide-react";

function ActivateContent() {
    const router = useRouter();

    const [cardId, setCardId] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'form' | 'active' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        email: "",
        phone: "",
        gender: "Male",
        age: 18,
    });

    // Step 1: Extract card ID from URL
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // URL: /activate/SB-1234 or /activate/any-id
        const path = window.location.pathname;
        const parts = path.split('/').filter(Boolean); // ["activate", "SB-1234"]

        if (parts.length >= 2 && parts[0] === 'activate') {
            const id = parts[1];
            setCardId(id);
        } else {
            // No card ID in URL
            setStatus('error');
            setErrorMsg('Nessun ID tessera trovato nell\'URL. Scansiona un QR code valido.');
        }
    }, []);

    // Step 2: Check card status in DB
    useEffect(() => {
        if (!cardId) return;

        const checkCard = async () => {
            setStatus('loading');

            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('card_id', cardId)
                    .maybeSingle(); // maybeSingle returns null instead of error if not found

                if (error) {
                    console.error('Supabase error:', error);
                    setStatus('error');
                    setErrorMsg('Errore di connessione al database. Riprova.');
                    return;
                }

                if (data && data.name && data.name.trim() !== '') {
                    // Card has user info → already active
                    setStatus('active');
                } else {
                    // Card exists but empty OR card not found → show form
                    setStatus('form');
                }
            } catch (err) {
                console.error('Check error:', err);
                setStatus('error');
                setErrorMsg('Errore imprevisto. Riprova.');
            }
        };

        checkCard();
    }, [cardId]);

    // Step 3: Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.surname || !cardId) return;

        setSubmitting(true);

        try {
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

            if (error) {
                console.error('Activation error:', error);
                alert('Errore durante l\'attivazione: ' + error.message);
            } else {
                setStatus('success');
            }
        } catch (err) {
            console.error('Submit error:', err);
            alert('Errore imprevisto. Riprova.');
        } finally {
            setSubmitting(false);
        }
    };

    // --- RENDER ---

    // Loading state
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <Loader2 size={48} className="text-foreground animate-spin mb-4" />
                <p className="text-foreground tracking-widest text-sm uppercase">Verifica stato tessera...</p>
            </div>
        );
    }

    // Error state
    if (status === 'error') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle size={48} className="text-red-400 mb-4" />
                <h1 className="text-2xl font-bold mb-4 text-foreground">Errore</h1>
                <p className="text-foreground/70 mb-6">{errorMsg}</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-foreground hover:bg-foreground/90 text-background px-6 py-3 rounded-2xl font-bold transition-all"
                >
                    Torna alla Home
                </button>
            </div>
        );
    }

    // Card already active
    if (status === 'active') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-6 text-center">
                <div className="mb-4 md:mb-6 p-4 md:p-6 border-2 border-green-400 rounded-full text-green-400">
                    <CheckCircle size={48} className="md:hidden" />
                    <CheckCircle size={64} className="hidden md:block" />
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-2 text-foreground">Tessera Già Attiva</h1>
                <p className="text-foreground/70 mb-2 text-base md:text-lg">
                    Questa tessera è già associata a un utente.
                </p>
                <p className="text-foreground/50 mb-6 md:mb-8 text-sm">
                    ID: {cardId}
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

    // Success after activation
    if (status === 'success') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-6 text-center">
                <div className="mb-4 md:mb-6 p-4 md:p-6 border-2 border-foreground rounded-full text-foreground">
                    <CheckCircle size={48} className="md:hidden" />
                    <CheckCircle size={64} className="hidden md:block" />
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-2 text-foreground">Tessera Attivata!</h1>
                <p className="text-foreground/70 mb-6 md:mb-8 text-base md:text-lg">
                    La tua tessera è ora attiva e collegata ai tuoi dati.
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

    // Activation form
    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-6">
            <div className="w-full max-w-sm md:max-w-lg mt-6 md:mt-10">
                <div className="text-center mb-6 md:mb-8">
                    <div className="inline-block p-3 md:p-4 rounded-full border-2 border-foreground text-foreground mb-3 md:mb-4">
                        <UserPlus size={32} className="md:hidden" />
                        <UserPlus size={40} className="hidden md:block" />
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-1 md:mb-2">Attiva Tessera</h1>
                    <p className="text-foreground/70 text-sm md:text-base">Compila il modulo per attivare la tessera <strong>{cardId}</strong></p>
                </div>

                <form onSubmit={handleSubmit} className="bg-background border-2 border-foreground p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div>
                            <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-foreground/90">Nome *</label>
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
                            <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-foreground/90">Cognome *</label>
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
                            <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-foreground/90">Età *</label>
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
                            <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-foreground/90">Genere *</label>
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
                        <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-foreground/90">Email *</label>
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
                        <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-foreground/90">Telefono *</label>
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
                        disabled={submitting}
                        className="w-full bg-foreground hover:bg-foreground/90 text-background py-3 md:py-4 rounded-xl md:rounded-2xl font-bold uppercase tracking-wider text-sm md:text-base transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mt-2 md:mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <><Loader2 size={18} className="animate-spin" /> Attivazione...</>
                        ) : (
                            <>Attiva Tessera <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ActivatePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <Loader2 size={48} className="text-foreground animate-spin mb-4" />
            </div>
        }>
            <ActivateContent />
        </Suspense>
    );
}
