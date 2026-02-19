"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Gift, User as UserIcon, ArrowLeft, Loader2, Check, ShieldOff } from "lucide-react";
import Link from "next/link";

type User = {
    id: string;
    card_id: string;
    name: string;
    surname: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
};

type Promotion = {
    id: string;
    title: string;
    description: string;
    target_gender: string;
    target_age_min: number;
    target_age_max: number;
    active: boolean;
    shops: string[];
    usage_limit: string;
    target_mode: string;
    target_users: string[];
    requires_activation: boolean;
};

function VerifyContent() {
    const searchParams = useSearchParams();
    const cardId = searchParams.get("cardId");
    const shopId = searchParams.get("shopId");
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [eligiblePromos, setEligiblePromos] = useState<Promotion[]>([]);
    const [notActivatedPromoIds, setNotActivatedPromoIds] = useState<Set<string>>(new Set());
    const [shopName, setShopName] = useState<string>("");
    const [activatingId, setActivatingId] = useState<string | null>(null);
    const [activatedIds, setActivatedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const verifyCard = async () => {
            if (!cardId) {
                setLoading(false);
                return;
            }

            try {
                // Get shop name
                if (shopId) {
                    const sName = localStorage.getItem('shopName');
                    if (sName) setShopName(sName);
                }

                // Fetch User
                const { data: userData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('card_id', cardId)
                    .single();

                if (userData) {
                    setUser(userData);

                    // Fetch already used activations for this card (shop activations)
                    const { data: existingActivations } = await supabase
                        .from('promo_activations')
                        .select('promotion_id, activated_by')
                        .eq('card_id', cardId);

                    const shopUsedPromoIds = new Set(
                        (existingActivations || [])
                            .filter(a => a.activated_by === 'shop')
                            .map(a => a.promotion_id)
                    );

                    const userActivatedPromoIds = new Set(
                        (existingActivations || [])
                            .filter(a => a.activated_by === 'user')
                            .map(a => a.promotion_id)
                    );

                    // Fetch active promotions
                    const { data: promos } = await supabase
                        .from('promotions')
                        .select('*')
                        .eq('active', true);

                    if (promos) {
                        const notActivated = new Set<string>();

                        const valid = promos.filter(p => {
                            // Gender filter
                            if (p.target_gender !== 'All' && p.target_gender !== userData.gender) return false;
                            // Age filter
                            if (userData.age < p.target_age_min || userData.age > p.target_age_max) return false;
                            // Shop filter
                            if (shopId && p.shops && Array.isArray(p.shops)) {
                                if (!p.shops.includes(shopId)) return false;
                            }
                            // Ad Personam filter
                            if (p.target_mode === 'personam' && p.target_users && Array.isArray(p.target_users)) {
                                if (!p.target_users.includes(cardId)) return false;
                            }
                            // If Single use and already shop-activated, hide it
                            if (p.usage_limit === 'Single' && shopUsedPromoIds.has(p.id)) return false;

                            // If requires_activation and user hasn't self-activated yet, mark as not activated
                            if (p.requires_activation && !userActivatedPromoIds.has(p.id)) {
                                notActivated.add(p.id);
                            }

                            return true;
                        });

                        setNotActivatedPromoIds(notActivated);
                        setEligiblePromos(valid);
                    }
                }
            } catch (e) {
                console.error("Verification failed", e);
            } finally {
                setLoading(false);
            }
        };

        verifyCard();
    }, [cardId, shopId]);

    const handleActivate = async (promo: Promotion) => {
        if (!cardId || !shopId || activatingId) return;

        // Don't allow activating promos that require user activation first
        if (notActivatedPromoIds.has(promo.id)) return;

        setActivatingId(promo.id);

        try {
            const { error } = await supabase
                .from('promo_activations')
                .insert({
                    card_id: cardId,
                    promotion_id: promo.id,
                    shop_id: shopId,
                    activated_by: 'shop',
                });

            if (error) {
                console.error('Activation error:', error);
                alert('Errore durante l\'attivazione della promozione');
                setActivatingId(null);
                return;
            }

            setActivatedIds(prev => new Set([...prev, promo.id]));

            if (promo.usage_limit === 'Single') {
                setTimeout(() => {
                    setEligiblePromos(prev => prev.filter(p => p.id !== promo.id));
                }, 1500);
            }
        } catch (e) {
            console.error('Activation failed:', e);
            alert('Errore imprevisto');
        } finally {
            setActivatingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-3">
                <Loader2 size={32} className="animate-spin" />
                <span className="text-sm tracking-widest uppercase">Verifica in corso...</span>
            </div>
        );
    }

    if (!cardId) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">ID Tessera mancante</div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-6 text-center animate-fade-in">
                <div className="mb-4 md:mb-6 p-4 md:p-6 border-2 border-destructive text-destructive rounded-full">
                    <XCircle size={48} className="md:hidden" />
                    <XCircle size={64} className="hidden md:block" />
                </div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2 text-foreground">Tessera Non Attiva</h1>
                <p className="text-foreground/70 mb-6 md:mb-8 text-base md:text-lg">
                    Questa tessera non è associata a nessun utente
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs md:max-w-md">
                    <Link
                        href={`/activate/${cardId}`}
                        className="bg-foreground hover:bg-foreground/90 text-background px-6 py-3 md:px-8 md:py-4 rounded-2xl md:rounded-3xl font-bold transition-all hover:scale-[1.02] w-full text-center text-sm md:text-base"
                    >
                        Attiva Ora
                    </Link>
                    <Link
                        href="/shop/scanner"
                        className="bg-transparent border-2 border-foreground hover:bg-foreground hover:text-background text-foreground px-6 py-3 md:px-8 md:py-4 rounded-2xl md:rounded-3xl font-bold transition-all hover:scale-[1.02] w-full text-center text-sm md:text-base"
                    >
                        Nuova Scansione
                    </Link>
                </div>
            </div>
        );
    }

    // Separate promos: valid ones and not-yet-activated ones
    const activePromos = eligiblePromos.filter(p => !notActivatedPromoIds.has(p.id));
    const pendingPromos = eligiblePromos.filter(p => notActivatedPromoIds.has(p.id));

    return (
        <div className="min-h-screen bg-background p-4 md:p-6 flex flex-col items-center animate-slide-up">
            {/* Back arrow */}
            <div className="w-full max-w-sm md:max-w-md mb-4">
                <Link href="/shop/scanner" className="inline-flex p-2 border-2 border-foreground rounded-full hover:bg-foreground hover:text-background transition-all">
                    <ArrowLeft size={20} />
                </Link>
            </div>

            {/* Status Header */}
            <div className="w-full max-w-sm md:max-w-md bg-background border-2 border-success text-success p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col items-center mb-6 md:mb-8">
                <CheckCircle size={36} className="mb-3 md:hidden" />
                <CheckCircle size={48} className="mb-4 hidden md:block" />
                <h1 className="text-xl md:text-2xl font-bold font-heading">Tessera Valida</h1>
                <p className="text-xs md:text-sm opacity-80">Verificata con successo</p>
            </div>

            {/* User Info Card */}
            <div className="w-full max-w-sm md:max-w-md bg-background border-2 border-foreground p-4 md:p-6 rounded-2xl md:rounded-3xl mb-6 md:mb-8 flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 border-2 border-foreground rounded-full text-foreground">
                    <UserIcon size={24} className="md:hidden" />
                    <UserIcon size={32} className="hidden md:block" />
                </div>
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-foreground">{user.name} {user.surname}</h2>
                    <div className="flex gap-2 text-xs md:text-sm text-foreground/70">
                        <span>Età: {user.age}</span>
                        <span>•</span>
                        <span>{user.gender === 'Male' ? 'Uomo' : user.gender === 'Female' ? 'Donna' : 'Altro'}</span>
                    </div>
                </div>
            </div>

            {/* Shop-Specific Promotions */}
            <div className="w-full max-w-sm md:max-w-md">
                <h3 className="text-base md:text-lg font-heading font-bold mb-3 md:mb-4 flex items-center gap-2 text-foreground">
                    <Gift size={18} className="md:hidden" />
                    <Gift size={20} className="hidden md:block" />
                    {shopName ? `Promozioni - ${shopName}` : 'Promozioni Disponibili'}
                </h3>

                {/* Pending (requires activation) promos — shown as disabled */}
                {pendingPromos.length > 0 && (
                    <div className="space-y-3 mb-4">
                        {pendingPromos.map(promo => (
                            <div key={promo.id} className="p-3 md:p-4 bg-background border-2 border-foreground/20 rounded-xl md:rounded-2xl opacity-50 cursor-not-allowed">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-sm md:text-base text-foreground/50">{promo.title}</h4>
                                        <p className="text-xs md:text-sm text-foreground/30 mt-0.5">{promo.description}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-foreground/40 text-[10px] md:text-xs font-bold px-2 py-1 border border-foreground/20 rounded-md whitespace-nowrap">
                                        <ShieldOff size={12} />
                                        Non attivata
                                    </div>
                                </div>
                                <p className="text-[10px] text-foreground/30 mt-1">L'utente deve attivare questa promo dal proprio QR</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Active promos — can be used by shopkeeper */}
                {activePromos.length > 0 ? (
                    <div className="space-y-3 md:space-y-4">
                        <p className="text-foreground/60 text-sm mb-2">Vuoi validare la promozione?</p>
                        {activePromos.map(promo => {
                            const isActivated = activatedIds.has(promo.id);
                            const isActivating = activatingId === promo.id;

                            return (
                                <div key={promo.id} className={`p-3 md:p-4 bg-background border-2 rounded-xl md:rounded-2xl flex justify-between items-center transition-all group ${isActivated ? 'border-success' : 'border-foreground hover:bg-foreground hover:text-background'}`}>
                                    <div>
                                        <h4 className={`font-bold text-sm md:text-base ${isActivated ? 'text-success' : 'text-foreground group-hover:text-background'}`}>{promo.title}</h4>
                                        <p className={`text-xs md:text-sm mt-0.5 ${isActivated ? 'text-success/70' : 'text-foreground/70 group-hover:text-background/70'}`}>{promo.description}</p>
                                        <span className="text-[10px] text-foreground/40 mt-1 block">{promo.usage_limit === 'Single' ? 'Uso singolo' : 'Uso illimitato'}</span>
                                    </div>
                                    {isActivated ? (
                                        <div className="flex items-center gap-1 text-success text-xs font-bold px-2 py-1">
                                            <Check size={16} />
                                            VALIDATA
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleActivate(promo)}
                                            disabled={isActivating}
                                            className="px-2 py-1 md:px-3 md:py-1 bg-foreground text-background group-hover:bg-background group-hover:text-foreground text-xs font-bold rounded-md border-2 border-transparent group-hover:border-foreground transition-all whitespace-nowrap disabled:opacity-50"
                                        >
                                            {isActivating ? <Loader2 size={14} className="animate-spin" /> : 'VALIDA'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : pendingPromos.length === 0 ? (
                    <div className="text-center p-4 md:p-6 bg-background border-2 border-dashed border-foreground/30 rounded-xl md:rounded-2xl text-foreground/70 text-sm">
                        Nessuna promozione disponibile per questo negozio
                    </div>
                ) : null}
            </div>

            <div className="mt-auto py-6 md:py-8">
                <Link
                    href="/shop/scanner"
                    className="text-foreground/70 hover:text-foreground text-xs md:text-sm flex items-center gap-2"
                >
                    <ArrowLeft size={16} /> Torna allo scanner
                </Link>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground">Caricamento...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
