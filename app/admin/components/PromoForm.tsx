"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Save, Store } from "lucide-react";

type Shop = {
    id: string;
    name: string;
};

export default function PromoForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [shops, setShops] = useState<Shop[]>([]);
    const [selectedShopIds, setSelectedShopIds] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        target_gender: "All",
        target_age_min: 0,
        target_age_max: 99,
        usage_limit: "Unlimited",
        active: true,
    });

    // Fetch shops on mount
    useEffect(() => {
        const fetchShops = async () => {
            const { data } = await supabase.from('shops').select('id, name').order('name');
            if (data) setShops(data);
        };
        fetchShops();
    }, []);

    const toggleShop = (shopId: string) => {
        setSelectedShopIds(prev =>
            prev.includes(shopId)
                ? prev.filter(id => id !== shopId)
                : [...prev, shopId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description) return;
        if (selectedShopIds.length === 0) {
            alert('Seleziona almeno un negozio');
            return;
        }

        setLoading(true);

        const { error } = await supabase
            .from('promotions')
            .insert([
                {
                    title: formData.title,
                    description: formData.description,
                    target_gender: formData.target_gender,
                    target_age_min: Number(formData.target_age_min),
                    target_age_max: Number(formData.target_age_max),
                    usage_limit: formData.usage_limit,
                    active: true,
                    shops: selectedShopIds,
                }
            ]);

        setLoading(false);

        if (error) {
            console.error('Error creating promotion:', error);
            alert('Errore durante la creazione della promozione');
        } else {
            onSuccess();
        }
    };

    return (
        <div className="bg-background border-2 border-foreground p-5 md:p-8 lg:p-10 rounded-lg mb-6 md:mb-10">
            <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-6 md:mb-8">Nuova Promozione</h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="md:col-span-2">
                    <label className="block text-xs md:text-sm font-semibold mb-2 md:mb-3 text-muted-foreground">Titolo</label>
                    <input
                        type="text"
                        className="w-full bg-transparent border-2 border-foreground rounded-lg px-4 py-2.5 md:px-5 md:py-3 text-foreground text-sm md:text-base placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-foreground/10 transition-all"
                        placeholder="Es. Sconto Studenti"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs md:text-sm font-semibold mb-2 md:mb-3 text-muted-foreground">Descrizione</label>
                    <textarea
                        className="w-full bg-transparent border-2 border-foreground rounded-lg px-4 py-2.5 md:px-5 md:py-3 text-foreground text-sm md:text-base placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-foreground/10 min-h-[80px] md:min-h-[100px] transition-all"
                        placeholder="Dettagli dell'offerta..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                </div>

                {/* Shop Selection */}
                <div className="md:col-span-2">
                    <label className="block text-xs md:text-sm font-semibold mb-2 md:mb-3 text-muted-foreground flex items-center gap-2">
                        <Store size={16} />
                        Negozi Associati
                    </label>
                    {shops.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Nessun negozio disponibile. Creane uno prima.</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {shops.map(shop => (
                                <button
                                    key={shop.id}
                                    type="button"
                                    onClick={() => toggleShop(shop.id)}
                                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${selectedShopIds.includes(shop.id)
                                            ? 'border-foreground bg-foreground text-background'
                                            : 'border-foreground/40 text-foreground/70 hover:border-foreground'
                                        }`}
                                >
                                    {shop.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-xs md:text-sm font-semibold mb-2 md:mb-3 text-muted-foreground">Target Genere</label>
                    <select
                        className="w-full bg-background border-2 border-foreground rounded-lg px-4 py-2.5 md:px-5 md:py-3 text-foreground text-sm md:text-base focus:outline-none focus:ring-4 focus:ring-foreground/10 transition-all"
                        value={formData.target_gender}
                        onChange={e => setFormData({ ...formData, target_gender: e.target.value })}
                    >
                        <option value="All">Tutti</option>
                        <option value="Male">Uomo</option>
                        <option value="Female">Donna</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs md:text-sm font-semibold mb-2 md:mb-3 text-muted-foreground">Utilizzo</label>
                    <select
                        className="w-full bg-background border-2 border-foreground rounded-lg px-4 py-2.5 md:px-5 md:py-3 text-foreground text-sm md:text-base focus:outline-none focus:ring-4 focus:ring-foreground/10 transition-all"
                        value={formData.usage_limit}
                        onChange={e => setFormData({ ...formData, usage_limit: e.target.value })}
                    >
                        <option value="Unlimited">Infinito</option>
                        <option value="Single">Singolo</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs md:text-sm font-semibold mb-2 md:mb-3 text-muted-foreground">Età Minima</label>
                    <input
                        type="number"
                        className="w-full bg-transparent border-2 border-foreground rounded-lg px-4 py-2.5 md:px-5 md:py-3 text-foreground text-sm md:text-base focus:outline-none focus:ring-4 focus:ring-foreground/10 transition-all"
                        value={formData.target_age_min}
                        onChange={e => setFormData({ ...formData, target_age_min: Number(e.target.value) })}
                    />
                </div>

                <div>
                    <label className="block text-xs md:text-sm font-semibold mb-2 md:mb-3 text-muted-foreground">Età Massima</label>
                    <input
                        type="number"
                        className="w-full bg-transparent border-2 border-foreground rounded-lg px-4 py-2.5 md:px-5 md:py-3 text-foreground text-sm md:text-base focus:outline-none focus:ring-4 focus:ring-foreground/10 transition-all"
                        value={formData.target_age_max}
                        onChange={e => setFormData({ ...formData, target_age_max: Number(e.target.value) })}
                    />
                </div>

                <div className="md:col-span-2 mt-2 md:mt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 md:py-4 rounded-lg font-bold text-sm md:text-base transition-all hover:translate-y-[-1px] flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(234,234,234,0.1)] hover:shadow-[0_4px_12px_rgba(234,234,234,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} />
                        {loading ? "Salvataggio..." : "Salva Promozione"}
                    </button>
                </div>
            </form>
        </div>
    );
}
