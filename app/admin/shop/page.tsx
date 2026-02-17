"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Store, Tag, TrendingUp, Users, Calendar, Gift, Loader2, BarChart3 } from "lucide-react";
import Link from "next/link";

type Shop = {
    id: string;
    name: string;
    pin: string;
};

type Promotion = {
    id: string;
    title: string;
    description: string;
    usage_limit: string;
    active: boolean;
};

type Activation = {
    id: string;
    card_id: string;
    promotion_id: string;
    activated_at: string;
};

type PromoStat = {
    promo: Promotion;
    totalActivations: number;
    uniqueUsers: number;
};

function ShopDetailContent() {
    const searchParams = useSearchParams();
    const shopId = searchParams.get("id");
    const [shop, setShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(true);
    const [promoStats, setPromoStats] = useState<PromoStat[]>([]);
    const [totalActivations, setTotalActivations] = useState(0);
    const [totalUniqueUsers, setTotalUniqueUsers] = useState(0);
    const [recentActivations, setRecentActivations] = useState<(Activation & { promoTitle: string })[]>([]);

    useEffect(() => {
        if (!shopId) return;

        const loadData = async () => {
            setLoading(true);

            try {
                // Fetch shop info
                const { data: shopData } = await supabase
                    .from('shops')
                    .select('*')
                    .eq('id', shopId)
                    .single();

                if (!shopData) {
                    setLoading(false);
                    return;
                }
                setShop(shopData);

                // Fetch promotions linked to this shop
                const { data: allPromos } = await supabase
                    .from('promotions')
                    .select('*');

                const shopPromos = (allPromos || []).filter(p =>
                    p.shops && Array.isArray(p.shops) && p.shops.includes(shopId)
                );

                // Fetch all activations for this shop
                const { data: activations } = await supabase
                    .from('promo_activations')
                    .select('*')
                    .eq('shop_id', shopId)
                    .order('activated_at', { ascending: false });

                const acts = activations || [];

                // Calculate stats
                const allUniqueCards = new Set(acts.map(a => a.card_id));
                setTotalActivations(acts.length);
                setTotalUniqueUsers(allUniqueCards.size);

                // Per-promo stats
                const stats: PromoStat[] = shopPromos.map(promo => {
                    const promoActs = acts.filter(a => a.promotion_id === promo.id);
                    const uniqueCards = new Set(promoActs.map(a => a.card_id));
                    return {
                        promo,
                        totalActivations: promoActs.length,
                        uniqueUsers: uniqueCards.size,
                    };
                });

                stats.sort((a, b) => b.totalActivations - a.totalActivations);
                setPromoStats(stats);

                // Recent activations (last 10)
                const recent = acts.slice(0, 10).map(a => {
                    const promo = shopPromos.find(p => p.id === a.promotion_id);
                    return {
                        ...a,
                        promoTitle: promo?.title || 'Promozione sconosciuta',
                    };
                });
                setRecentActivations(recent);

            } catch (e) {
                console.error("Error loading shop data:", e);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [shopId]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-3">
                <Loader2 size={32} className="animate-spin" />
                <span className="text-sm tracking-widest uppercase">Caricamento dati...</span>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
                <p className="text-foreground/70">Negozio non trovato</p>
                <Link href="/admin" className="text-foreground underline text-sm">Torna alla dashboard</Link>
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                    <Link
                        href="/admin"
                        className="p-2 border-2 border-foreground rounded-full hover:bg-foreground hover:text-background transition-all"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 md:p-3 border-2 border-foreground rounded-full">
                            <Store size={24} className="text-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground">{shop.name}</h1>
                            <p className="text-foreground/50 text-xs md:text-sm font-mono">PIN: {shop.pin}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="bg-background border-2 border-foreground p-4 md:p-6 rounded-xl flex flex-col items-center text-center">
                        <TrendingUp size={24} className="text-foreground mb-2 md:hidden" />
                        <TrendingUp size={28} className="text-foreground mb-3 hidden md:block" />
                        <span className="text-2xl md:text-3xl font-bold text-foreground">{totalActivations}</span>
                        <span className="text-[10px] md:text-xs text-foreground/60 uppercase tracking-wider mt-1">Attivazioni Totali</span>
                    </div>
                    <div className="bg-background border-2 border-foreground p-4 md:p-6 rounded-xl flex flex-col items-center text-center">
                        <Users size={24} className="text-foreground mb-2 md:hidden" />
                        <Users size={28} className="text-foreground mb-3 hidden md:block" />
                        <span className="text-2xl md:text-3xl font-bold text-foreground">{totalUniqueUsers}</span>
                        <span className="text-[10px] md:text-xs text-foreground/60 uppercase tracking-wider mt-1">Utenti Unici</span>
                    </div>
                    <div className="bg-background border-2 border-foreground p-4 md:p-6 rounded-xl flex flex-col items-center text-center col-span-2 md:col-span-1">
                        <Tag size={24} className="text-foreground mb-2 md:hidden" />
                        <Tag size={28} className="text-foreground mb-3 hidden md:block" />
                        <span className="text-2xl md:text-3xl font-bold text-foreground">{promoStats.length}</span>
                        <span className="text-[10px] md:text-xs text-foreground/60 uppercase tracking-wider mt-1">Promozioni</span>
                    </div>
                </div>

                {/* Promo Stats */}
                <div className="mb-6 md:mb-8">
                    <h2 className="text-base md:text-lg font-heading font-bold mb-3 md:mb-4 flex items-center gap-2 text-foreground">
                        <BarChart3 size={18} />
                        Statistiche per Promozione
                    </h2>

                    {promoStats.length > 0 ? (
                        <div className="space-y-3">
                            {promoStats.map(stat => {
                                const maxActs = Math.max(...promoStats.map(s => s.totalActivations), 1);
                                const barWidth = (stat.totalActivations / maxActs) * 100;

                                return (
                                    <div key={stat.promo.id} className="bg-background border-2 border-foreground/30 rounded-xl p-3 md:p-4 hover:border-foreground transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-sm md:text-base text-foreground">{stat.promo.title}</h4>
                                                <p className="text-xs text-foreground/50">{stat.promo.description}</p>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-foreground/30 text-foreground/60 whitespace-nowrap ml-2">
                                                {stat.promo.usage_limit === 'Single' ? 'Singolo' : 'Illimitato'}
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full bg-foreground/10 rounded-full h-2 mb-2">
                                            <div
                                                className="bg-foreground h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${barWidth}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-foreground/60">
                                            <span>{stat.totalActivations} attivazioni</span>
                                            <span>{stat.uniqueUsers} utenti</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center p-6 bg-background border-2 border-dashed border-foreground/30 rounded-xl text-foreground/70 text-sm">
                            Nessuna promozione associata a questo negozio
                        </div>
                    )}
                </div>

                {/* Recent Activations */}
                <div>
                    <h2 className="text-base md:text-lg font-heading font-bold mb-3 md:mb-4 flex items-center gap-2 text-foreground">
                        <Calendar size={18} />
                        Attivazioni Recenti
                    </h2>

                    {recentActivations.length > 0 ? (
                        <div className="bg-background border-2 border-foreground/30 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-foreground/20">
                                        <th className="px-3 md:px-4 py-2 md:py-3 text-[10px] md:text-xs uppercase tracking-wider text-foreground/60 font-semibold">Tessera</th>
                                        <th className="px-3 md:px-4 py-2 md:py-3 text-[10px] md:text-xs uppercase tracking-wider text-foreground/60 font-semibold">Promozione</th>
                                        <th className="px-3 md:px-4 py-2 md:py-3 text-[10px] md:text-xs uppercase tracking-wider text-foreground/60 font-semibold hidden md:table-cell">Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentActivations.map(act => (
                                        <tr key={act.id} className="border-b border-foreground/10 last:border-0 hover:bg-foreground/5 transition-colors">
                                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-foreground font-mono">{act.card_id}</td>
                                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-foreground">{act.promoTitle}</td>
                                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-foreground/60 hidden md:table-cell">{formatDate(act.activated_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center p-6 bg-background border-2 border-dashed border-foreground/30 rounded-xl text-foreground/70 text-sm">
                            Nessuna attivazione registrata
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ShopDetailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-3">
                <Loader2 size={32} className="animate-spin" />
                <span className="text-sm tracking-widest uppercase">Caricamento...</span>
            </div>
        }>
            <ShopDetailContent />
        </Suspense>
    );
}
