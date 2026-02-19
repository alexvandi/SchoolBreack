"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowRight, UserPlus, CheckCircle, Loader2, AlertTriangle, Gift, ArrowLeft, Sparkles, Check } from "lucide-react";
import Link from "next/link";

type Promotion = {
    id: string;
    title: string;
    description: string;
    target_gender: string;
    target_age_min: number;
    target_age_max: number;
    active: boolean;
    requires_activation: boolean;
    target_mode: string;
    target_users: string[];
};

type UserData = {
    name: string;
    surname: string;
    age: number;
    gender: string;
};

function ActivateContent() {
    const router = useRouter();

    const [cardId, setCardId] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'form' | 'active' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [pendingPromos, setPendingPromos] = useState<Promotion[]>([]);
    const [activatingPromoId, setActivatingPromoId] = useState<string | null>(null);
    const [justActivatedIds, setJustActivatedIds] = useState<Set<string>>(new Set());
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

        const path = window.location.pathname;
        const parts = path.split('/').filter(Boolean);

        if (parts.length >= 2 && parts[0] === 'activate') {
            const id = parts[1];
            setCardId(id);
        } else {
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
                    .maybeSingle();

                if (error) {
                    console.error('Supabase error:', error);
                    setStatus('error');
                    setErrorMsg('Errore di connessione al database. Riprova.');
                    return;
                }

                if (data && data.name && data.name.trim() !== '') {
                    setUserData({ name: data.name, surname: data.surname, age: data.age, gender: data.gender });

                    // Fetch promotions
                    const { data: promos } = await supabase
                        .from('promotions')
                        .select('*')
                        .eq('active', true);

                    // Fetch user's existing self-activations
                    const { data: userActivations } = await supabase
                        .from('promo_activations')
                        .select('promotion_id')
                        .eq('card_id', cardId)
                        .eq('activated_by', 'user');

                    const alreadyActivatedIds = new Set((userActivations || []).map(a => a.promotion_id));

                    if (promos) {
                        const eligible = promos.filter(p => {
                            if (p.target_gender !== 'All' && p.target_gender !== data.gender) return false;
                            if (data.age < p.target_age_min || data.age > p.target_age_max) return false;
                            // Ad personam: only show if this user is targeted
                            if (p.target_mode === 'personam' && p.target_users && Array.isArray(p.target_users)) {
                                if (!p.target_users.includes(cardId)) return false;
                            }
                            return true;
                        });

                        // Separate: promos that require activation and haven't been activated yet
                        const pending = eligible.filter(p => p.requires_activation && !alreadyActivatedIds.has(p.id));
                        // Regular promos (already activated or don't require activation)
                        const regular = eligible.filter(p => !p.requires_activation || alreadyActivatedIds.has(p.id));

                        setPendingPromos(pending);
                        setPromotions(regular);
                    }

                    setStatus('active');
                } else {
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

    // Handle user self-activation of a promo
    const handleUserActivate = async (promoId: string) => {
        if (!cardId || activatingPromoId) return;
        setActivatingPromoId(promoId);

        try {
            const { error } = await supabase
                .from('promo_activations')
                .insert({
                    card_id: cardId,
                    promotion_id: promoId,
                    activated_by: 'user',
                });

            if (error) {
                console.error('User activation error:', error);
                alert('Errore durante l\'attivazione');
                setActivatingPromoId(null);
                return;
            }

            // Show success state
            setJustActivatedIds(prev => new Set([...prev, promoId]));

            // Move from pending to regular after a delay
            setTimeout(() => {
                const promo = pendingPromos.find(p => p.id === promoId);
                if (promo) {
                    setPendingPromos(prev => prev.filter(p => p.id !== promoId));
                    setPromotions(prev => [...prev, promo]);
                }
            }, 2000);
        } catch (e) {
            console.error('Activation failed:', e);
            alert('Errore imprevisto');
        } finally {
            setActivatingPromoId(null);
        }
    };

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

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <Loader2 size={48} className="text-foreground animate-spin mb-4" />
                <p className="text-foreground tracking-widest text-sm uppercase">Verifica stato tessera...</p>
            </div>
        );
    }

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

    // Card already active — show greeting + promos
    if (status === 'active' && userData) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-6">
                {/* Header */}
                <div className="w-full max-w-sm md:max-w-md mt-6 md:mt-10">
                    <div className="bg-background border-2 border-success text-success p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col items-center mb-6 md:mb-8">
                        <CheckCircle size={36} className="mb-3 md:hidden" />
                        <CheckCircle size={48} className="mb-4 hidden md:block" />
                        <h1 className="text-xl md:text-2xl font-bold font-heading">Tessera Attiva</h1>
                        <p className="text-xs md:text-sm opacity-80">ID: {cardId}</p>
                    </div>

                    {/* Greeting */}
                    <div className="text-center mb-6 md:mb-8">
                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                            Ciao {userData.name} {userData.surname}
                        </h2>
                        <p className="text-foreground/60 text-sm mt-2">Ecco le tue promozioni</p>
                    </div>

                    {/* Promos requiring user activation — PROMINENT at top */}
                    {pendingPromos.length > 0 && (
                        <div className="w-full mb-6 md:mb-8">
                            <h3 className="text-base md:text-lg font-heading font-bold mb-3 md:mb-4 flex items-center gap-2 text-foreground">
                                <Sparkles size={18} className="md:hidden" />
                                <Sparkles size={20} className="hidden md:block" />
                                Promozioni da Attivare
                            </h3>
                            <div className="space-y-3 md:space-y-4">
                                {pendingPromos.map(promo => {
                                    const justActivated = justActivatedIds.has(promo.id);
                                    const isActivating = activatingPromoId === promo.id;

                                    return (
                                        <div
                                            key={promo.id}
                                            className={`p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all ${justActivated
                                                    ? 'border-success bg-success/10'
                                                    : 'border-foreground bg-foreground/5 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1">
                                                    <h4 className={`font-bold text-sm md:text-base ${justActivated ? 'text-success' : 'text-foreground'}`}>
                                                        {promo.title}
                                                    </h4>
                                                    <p className={`text-xs md:text-sm mt-1 ${justActivated ? 'text-success/70' : 'text-foreground/70'}`}>
                                                        {promo.description}
                                                    </p>
                                                </div>
                                                {justActivated ? (
                                                    <div className="flex items-center gap-1 text-success text-xs font-bold px-3 py-2 border-2 border-success rounded-lg">
                                                        <Check size={14} />
                                                        ATTIVATA
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUserActivate(promo.id)}
                                                        disabled={isActivating}
                                                        className="px-4 py-2 md:px-5 md:py-2.5 bg-foreground text-background font-bold text-xs md:text-sm rounded-lg hover:bg-foreground/90 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.15)] whitespace-nowrap disabled:opacity-50"
                                                    >
                                                        {isActivating ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            'ATTIVA'
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Regular Promotions List */}
                    <div className="w-full">
                        <h3 className="text-base md:text-lg font-heading font-bold mb-3 md:mb-4 flex items-center gap-2 text-foreground">
                            <Gift size={18} className="md:hidden" />
                            <Gift size={20} className="hidden md:block" />
                            Le Tue Promozioni
                        </h3>

                        {promotions.length > 0 ? (
                            <div className="space-y-3 md:space-y-4">
                                {promotions.map(promo => (
                                    <div key={promo.id} className="p-3 md:p-4 bg-background border-2 border-foreground rounded-xl md:rounded-2xl hover:bg-foreground hover:text-background transition-all group">
                                        <h4 className="font-bold text-sm md:text-base text-foreground group-hover:text-background">{promo.title}</h4>
                                        <p className="text-xs md:text-sm text-foreground/70 group-hover:text-background/70 mt-1">{promo.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : pendingPromos.length === 0 ? (
                            <div className="text-center p-4 md:p-6 bg-background border-2 border-dashed border-foreground/30 rounded-xl md:rounded-2xl text-foreground/70 text-sm">
                                Nessuna promozione disponibile al momento
                            </div>
                        ) : null}
                    </div>

                    {/* Back button */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => router.push('/')}
                            className="text-foreground/50 hover:text-foreground text-xs uppercase tracking-widest transition-colors"
                        >
                            Torna alla Home
                        </button>
                    </div>
                </div>
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
            <div className="w-full max-w-sm md:max-w-lg mt-4">
                <Link href="/" className="inline-flex p-2 border-2 border-foreground rounded-full hover:bg-foreground hover:text-background transition-all mb-4">
                    <ArrowLeft size={20} />
                </Link>
            </div>
            <div className="w-full max-w-sm md:max-w-lg">
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
