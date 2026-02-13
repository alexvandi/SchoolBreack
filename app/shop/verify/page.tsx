"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db, type User, type Promotion } from "@/lib/mockDb";
import { CheckCircle, XCircle, Gift, User as UserIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
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
        return <div className="min-h-screen flex items-center justify-center bg-black text-white">Verifica in corso...</div>;
    }

    if (!cardId) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-white">ID Tessera mancante</div>;
    }

    // Card not found
    if (!user) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="mb-6 p-6 border-2 border-red-500 text-red-500 rounded-full">
                    <XCircle size={64} />
                </div>
                <h1 className="text-3xl font-heading font-bold mb-2 text-white">Tessera Non Attiva</h1>
                <p className="text-white/70 mb-8 text-lg">
                    Questa tessera non è associata a nessun utente
                </p>

                <div className="flex flex-col gap-3 w-full max-w-md">
                    <Link
                        href={`/activate/${cardId}`}
                        className="bg-white hover:bg-white/90 text-black px-8 py-4 rounded-3xl font-bold transition-all hover:scale-[1.02] w-full text-center"
                    >
                        Attiva Ora
                    </Link>
                    <Link
                        href="/shop/scanner"
                        className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white px-8 py-4 rounded-3xl font-bold transition-all hover:scale-[1.02] w-full text-center"
                    >
                        Nuova Scansione
                    </Link>
                </div>
            </div>
        );
    }

    // User found
    return (
        <div className="min-h-screen bg-black p-6 flex flex-col items-center animate-slide-up">
            {/* Status Header */}
            <div className="w-full max-w-md bg-black border-2 border-green-500 text-green-500 p-6 rounded-3xl flex flex-col items-center mb-8">
                <CheckCircle size={48} className="mb-4" />
                <h1 className="text-2xl font-bold font-heading">Tessera Attiva</h1>
                <p className="text-sm opacity-80">Verificata con successo</p>
            </div>

            {/* User Info Card */}
            <div className="w-full max-w-md bg-black border-2 border-white p-6 rounded-3xl mb-8 flex items-center gap-4">
                <div className="p-3 border-2 border-white rounded-full text-white">
                    <UserIcon size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{user.name} {user.surname}</h2>
                    <div className="flex gap-2 text-sm text-white/70">
                        <span>Età: {user.age}</span>
                        <span>•</span>
                        <span>{user.gender === 'Male' ? 'Uomo' : user.gender === 'Female' ? 'Donna' : 'Altro'}</span>
                    </div>
                </div>
            </div>

            {/* Promotions List */}
            <div className="w-full max-w-md">
                <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2 text-white">
                    <Gift size={20} />
                    Promozioni Disponibili
                </h3>

                {eligiblePromos.length > 0 ? (
                    <div className="space-y-4">
                        {eligiblePromos.map(promo => (
                            <div key={promo.id} className="p-4 bg-black border-2 border-white rounded-2xl flex justify-between items-center hover:bg-white hover:text-black transition-all group">
                                <div>
                                    <h4 className="font-bold text-white group-hover:text-black">{promo.title}</h4>
                                    <p className="text-sm text-white/70 group-hover:text-black/70">{promo.description}</p>
                                </div>
                                <button className="px-3 py-1 bg-white text-black group-hover:bg-black group-hover:text-white text-xs font-bold rounded-md border-2 border-transparent group-hover:border-white transition-all">
                                    APPLICA
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-6 bg-black border-2 border-dashed border-white/30 rounded-2xl text-white/70">
                        Nessuna promozione disponibile
                    </div>
                )}
            </div>

            <div className="mt-auto py-8">
                <Link
                    href="/shop/scanner"
                    className="text-white/70 hover:text-white text-sm flex items-center gap-2"
                >
                    <ArrowLeft size={16} /> Torna allo scanner
                </Link>
            </div>
        </div>
    );
}
