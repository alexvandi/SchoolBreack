"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Store, Tag, TrendingUp, Calendar, Gift, Loader2, BarChart3, CheckCircle } from "lucide-react";
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
    requires_activation: boolean;
};

type Activation = {
    id: string;
    card_id: string;
    promotion_id: string;
    activated_at: string;
    activated_by: string;
    shop_id: string;
};

type UserInfo = {
    card_id: string;
    name: string;
    surname: string;
};

type PromoStat = {
    promo: Promotion;
    totalValidations: number;
    userActivations: number;
};

type RecentEntry = {
    id: string;
    userName: string;
    promoTitle: string;
    date: string;
};

function ShopDetailContent() {
    const searchParams = useSearchParams();
    const shopId = searchParams.get("id");
    const [shop, setShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(true);
    const [promoStats, setPromoStats] = useState<PromoStat[]>([]);
    const [totalValidations, setTotalValidations] = useState(0);
    const [totalUserActivations, setTotalUserActivations] = useState(0);
    const [hasActivationPromos, setHasActivationPromos] = useState(false);
    const [recentValidations, setRecentValidations] = useState<RecentEntry[]>([]);
    const [recentActivations, setRecentActivations] = useState<RecentEntry[]>([]);

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

                const shopPromos = (allPromos || []).filter((p: any) =>
                    p.shops && Array.isArray(p.shops) && p.shops.includes(shopId)
                );

                const shopPromoIds = shopPromos.map((p: any) => p.id);
                const shopHasActivationPromos = shopPromos.some((p: any) => p.requires_activation);
                setHasActivationPromos(shopHasActivationPromos);

                if (shopPromoIds.length === 0) {
                    setLoading(false);
                    return;
                }

                // Fetch ALL activations for these promotions
                const { data: activations } = await supabase
                    .from('promo_activations')
                    .select('*')
                    .in('promotion_id', shopPromoIds)
                    .order('activated_at', { ascending: false });

                const acts = activations || [];

                // Separate shop validations and user activations
                const shopValidations = acts.filter((a: any) => a.shop_id === shopId && a.activated_by === 'shop');
                const userActivations = acts.filter((a: any) => a.activated_by === 'user');

                setTotalValidations(shopValidations.length);
                setTotalUserActivations(userActivations.length);

                // Collect all unique card_ids for name lookup
                const allCardIds = [...new Set(acts.map((a: any) => a.card_id))];

                // Fetch user names
                let userMap: Record<string, UserInfo> = {};
                if (allCardIds.length > 0) {
                    const { data: usersData } = await supabase
                        .from('users')
                        .select('card_id, name, surname')
                        .in('card_id', allCardIds);

                    if (usersData) {
                        usersData.forEach((u: any) => {
                            userMap[u.card_id] = u;
                        });
                    }
                }

                // Per-promo stats
                const stats: PromoStat[] = shopPromos.map((promo: any) => {
                    const promoValidations = shopValidations.filter((a: any) => a.promotion_id === promo.id);
                    const promoUserActivations = userActivations.filter((a: any) => a.promotion_id === promo.id);

                    return {
                        promo,
                        totalValidations: promoValidations.length,
                        userActivations: promoUserActivations.length,
                    };
                });

                stats.sort((a, b) => b.totalValidations - a.totalValidations);
                setPromoStats(stats);

                // Helper to build recent entries with user names
                const buildRecentEntries = (items: any[]): RecentEntry[] => {
                    return items.slice(0, 10).map(a => {
                        const promo = shopPromos.find((p: any) => p.id === a.promotion_id);
                        const user = userMap[a.card_id];
                        return {
                            id: a.id,
                            userName: user ? `${user.name} ${user.surname}` : a.card_id,
                            promoTitle: promo?.title || 'Promozione sconosciuta',
                            date: a.activated_at,
                        };
                    });
                };

                setRecentValidations(buildRecentEntries(shopValidations));
                setRecentActivations(buildRecentEntries(userActivations));

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

    const RecentTable = ({ entries, emptyMessage }: { entries: RecentEntry[], emptyMessage: string }) => {
        if (entries.length === 0) {
            return (
                <div className="text-center p-6 bg-background border-2 border-dashed border-foreground/30 rounded-xl text-foreground/70 text-sm">
                    {emptyMessage}
                </div>
            );
        }

        return (
            <div className="bg-background border-2 border-foreground/30 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-foreground/20">
                            <th className="px-3 md:px-4 py-2 md:py-3 text-[10px] md:text-xs uppercase tracking-wider text-foreground/60 font-semibold">Utente</th>
                            <th className="px-3 md:px-4 py-2 md:py-3 text-[10px] md:text-xs uppercase tracking-wider text-foreground/60 font-semibold">Promozione</th>
                            <th className="px-3 md:px-4 py-2 md:py-3 text-[10px] md:text-xs uppercase tracking-wider text-foreground/60 font-semibold hidden md:table-cell">Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(entry => (
                            <tr key={entry.id} className="border-b border-foreground/10 last:border-0 hover:bg-foreground/5 transition-colors">
                                <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-foreground font-medium">{entry.userName}</td>
                                <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-foreground">{entry.promoTitle}</td>
                                <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-foreground/60 hidden md:table-cell">{formatDate(entry.date)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
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
                <div className={`grid ${hasActivationPromos ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'} gap-3 md:gap-4 mb-6 md:mb-8`}>
                    <div className="bg-background border-2 border-foreground p-4 md:p-6 rounded-xl flex flex-col items-center text-center">
                        <TrendingUp size={24} className="text-foreground mb-2 md:hidden" />
                        <TrendingUp size={28} className="text-foreground mb-3 hidden md:block" />
                        <span className="text-2xl md:text-3xl font-bold text-foreground">{totalValidations}</span>
                        <span className="text-[10px] md:text-xs text-foreground/60 uppercase tracking-wider mt-1">Validazioni Totali</span>
                    </div>
                    {hasActivationPromos && (
                        <div className="bg-background border-2 border-foreground p-4 md:p-6 rounded-xl flex flex-col items-center text-center">
                            <CheckCircle size={24} className="text-foreground mb-2 md:hidden" />
                            <CheckCircle size={28} className="text-foreground mb-3 hidden md:block" />
                            <span className="text-2xl md:text-3xl font-bold text-foreground">{totalUserActivations}</span>
                            <span className="text-[10px] md:text-xs text-foreground/60 uppercase tracking-wider mt-1">Attivazioni Totali</span>
                        </div>
                    )}
                    <div className={`bg-background border-2 border-foreground p-4 md:p-6 rounded-xl flex flex-col items-center text-center ${hasActivationPromos ? 'col-span-2 md:col-span-1' : ''}`}>
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
                                const maxActs = Math.max(...promoStats.map(s => s.totalValidations), 1);
                                const barWidth = (stat.totalValidations / maxActs) * 100;

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
                                        <div className="flex flex-col gap-1 text-xs text-foreground/60">
                                            <div className="flex justify-between">
                                                <span>{stat.totalValidations} validazioni</span>
                                            </div>
                                            {stat.promo.requires_activation && (
                                                <div className="pt-1 border-t border-foreground/10 flex justify-between text-foreground/80 font-medium">
                                                    <span>Attivazioni Utente: {stat.userActivations}</span>
                                                </div>
                                            )}
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

                {/* Recent Validations */}
                <div className="mb-6 md:mb-8">
                    <h2 className="text-base md:text-lg font-heading font-bold mb-3 md:mb-4 flex items-center gap-2 text-foreground">
                        <Calendar size={18} />
                        Validazioni Recenti
                    </h2>
                    <RecentTable entries={recentValidations} emptyMessage="Nessuna validazione registrata" />
                </div>

                {/* Recent User Activations — only show if shop has promos that require activation */}
                {hasActivationPromos && (
                    <div>
                        <h2 className="text-base md:text-lg font-heading font-bold mb-3 md:mb-4 flex items-center gap-2 text-foreground">
                            <Gift size={18} />
                            Attivazioni Recenti
                        </h2>
                        <RecentTable entries={recentActivations} emptyMessage="Nessuna attivazione utente registrata" />
                    </div>
                )}
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
