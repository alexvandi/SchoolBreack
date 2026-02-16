"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { db, type User, type Promotion } from "@/lib/mockDb";
import { CheckCircle, XCircle, Gift, User as UserIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

function VerifyContent() {
    const searchParams = useSearchParams();
    const cardId = searchParams.get("cardId");
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [eligiblePromos, setEligiblePromos] = useState<Promotion[]>([]);

    useEffect(() => {
        if (cardId) {
            const foundUser = db.users.getByCardId(cardId);
            setUser(foundUser || null);

            if (foundUser) {
                const allPromos = db.promotions.getAll();
                const valid = allPromos.filter(p => {
                    if (!p.active) return false;
                    if (p.targetGender !== 'All' && p.targetGender !== foundUser.gender) return false;
                    if (foundUser.age < p.targetAgeMin || foundUser.age > p.targetAgeMax) return false;
                    return true;
                });
                setEligiblePromos(valid);
            }
        }
        setLoading(false);
    }, [cardId]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Verifica in corso...</div>;
    }

    if (!cardId) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">ID Tessera mancante</div>;
    }

    // Card not found
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

    // User found
    return (
        <div className="min-h-screen bg-background p-4 md:p-6 flex flex-col items-center animate-slide-up">
            {/* Status Header */}
            <div className="w-full max-w-sm md:max-w-md bg-background border-2 border-success text-success p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col items-center mb-6 md:mb-8">
                <CheckCircle size={36} className="mb-3 md:hidden" />
                <CheckCircle size={48} className="mb-4 hidden md:block" />
                <h1 className="text-xl md:text-2xl font-bold font-heading">Tessera Attiva</h1>
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

            {/* Promotions List */}
            <div className="w-full max-w-sm md:max-w-md">
                <h3 className="text-base md:text-lg font-heading font-bold mb-3 md:mb-4 flex items-center gap-2 text-foreground">
                    <Gift size={18} className="md:hidden" />
                    <Gift size={20} className="hidden md:block" />
                    Promozioni Disponibili
                </h3>

                {eligiblePromos.length > 0 ? (
                    <div className="space-y-3 md:space-y-4">
                        {eligiblePromos.map(promo => (
                            <div key={promo.id} className="p-3 md:p-4 bg-background border-2 border-foreground rounded-xl md:rounded-2xl flex justify-between items-center hover:bg-foreground hover:text-background transition-all group">
                                <div>
                                    <h4 className="font-bold text-sm md:text-base text-foreground group-hover:text-background">{promo.title}</h4>
                                    <p className="text-xs md:text-sm text-foreground/70 group-hover:text-background/70">{promo.description}</p>
                                </div>
                                <button className="px-2 py-1 md:px-3 md:py-1 bg-foreground text-background group-hover:bg-background group-hover:text-foreground text-xs font-bold rounded-md border-2 border-transparent group-hover:border-foreground transition-all">
                                    APPLICA
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-4 md:p-6 bg-background border-2 border-dashed border-foreground/30 rounded-xl md:rounded-2xl text-foreground/70 text-sm">
                        Nessuna promozione disponibile
                    </div>
                )}
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
