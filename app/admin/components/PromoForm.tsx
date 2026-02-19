"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Save, Store, Search, X, Users, ShieldCheck } from "lucide-react";

type Shop = {
    id: string;
    name: string;
};

type UserRecord = {
    id: string;
    card_id: string;
    name: string;
    surname: string;
};

export default function PromoForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [shops, setShops] = useState<Shop[]>([]);
    const [selectedShopIds, setSelectedShopIds] = useState<string[]>([]);

    // Target mode
    const [targetMode, setTargetMode] = useState<'all' | 'personam'>('all');
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState<UserRecord[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<UserRecord[]>([]);
    const [searching, setSearching] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        target_gender: "All",
        target_age_min: 0,
        target_age_max: 99,
        usage_limit: "Unlimited",
        requires_activation: false,
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

    // Search users when typing
    useEffect(() => {
        if (targetMode !== 'personam' || userSearch.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            const searchTerm = `%${userSearch}%`;
            const { data } = await supabase
                .from('users')
                .select('id, card_id, name, surname')
                .or(`name.ilike.${searchTerm},surname.ilike.${searchTerm},card_id.ilike.${searchTerm}`)
                .limit(10);

            if (data) {
                // Exclude already selected
                const selectedIds = selectedUsers.map(u => u.card_id);
                setSearchResults(data.filter(u => !selectedIds.includes(u.card_id)));
            }
            setSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [userSearch, targetMode, selectedUsers]);

    const toggleShop = (shopId: string) => {
        setSelectedShopIds(prev =>
            prev.includes(shopId)
                ? prev.filter(id => id !== shopId)
                : [...prev, shopId]
        );
    };

    const addUser = (user: UserRecord) => {
        setSelectedUsers(prev => [...prev, user]);
        setUserSearch('');
        setSearchResults([]);
    };

    const removeUser = (cardId: string) => {
        setSelectedUsers(prev => prev.filter(u => u.card_id !== cardId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description) return;
        if (selectedShopIds.length === 0) {
            alert('Seleziona almeno un negozio');
            return;
        }
        if (targetMode === 'personam' && selectedUsers.length === 0) {
            alert('Seleziona almeno un utente per la modalità Ad Personam');
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
                    requires_activation: formData.requires_activation,
                    active: true,
                    shops: selectedShopIds,
                    target_mode: targetMode,
                    target_users: targetMode === 'personam' ? selectedUsers.map(u => u.card_id) : [],
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

                {/* Target Mode */}
                <div className="md:col-span-2">
                    <label className="block text-xs md:text-sm font-semibold mb-2 md:mb-3 text-muted-foreground flex items-center gap-2">
                        <Users size={16} />
                        Destinatari
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setTargetMode('all')}
                            className={`flex-1 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${targetMode === 'all'
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-foreground/40 text-foreground/70 hover:border-foreground'
                                }`}
                        >
                            Tutti
                        </button>
                        <button
                            type="button"
                            onClick={() => setTargetMode('personam')}
                            className={`flex-1 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${targetMode === 'personam'
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-foreground/40 text-foreground/70 hover:border-foreground'
                                }`}
                        >
                            Ad Personam
                        </button>
                    </div>
                </div>

                {/* User Search — only visible when Ad Personam */}
                {targetMode === 'personam' && (
                    <div className="md:col-span-2">
                        <label className="block text-xs md:text-sm font-semibold mb-2 md:mb-3 text-muted-foreground flex items-center gap-2">
                            <Search size={16} />
                            Cerca Utenti
                        </label>

                        {/* Selected users chips */}
                        {selectedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedUsers.map(user => (
                                    <span key={user.card_id} className="inline-flex items-center gap-1 px-3 py-1 bg-foreground text-background rounded-full text-xs font-medium">
                                        {user.name} {user.surname}
                                        <button type="button" onClick={() => removeUser(user.card_id)} className="hover:bg-background/20 rounded-full p-0.5">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Search input */}
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full bg-transparent border-2 border-foreground rounded-lg px-4 py-2.5 md:px-5 md:py-3 text-foreground text-sm md:text-base placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-foreground/10 transition-all"
                                placeholder="Cerca per nome, cognome o ID tessera..."
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                            />
                            {searching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-foreground/40 border-t-foreground rounded-full animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Search results dropdown */}
                        {searchResults.length > 0 && (
                            <div className="mt-2 border-2 border-foreground/30 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                                {searchResults.map(user => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => addUser(user)}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-foreground hover:text-background transition-colors flex justify-between items-center border-b border-foreground/10 last:border-0"
                                    >
                                        <span className="font-medium">{user.name} {user.surname}</span>
                                        <span className="text-xs text-foreground/50 font-mono">{user.card_id}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {userSearch.length >= 2 && searchResults.length === 0 && !searching && (
                            <p className="text-xs text-foreground/50 mt-2">Nessun utente trovato</p>
                        )}
                    </div>
                )}

                {/* Requires Activation Toggle */}
                <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.requires_activation}
                                onChange={e => setFormData({ ...formData, requires_activation: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-foreground/20 rounded-full peer-checked:bg-foreground transition-colors" />
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-background rounded-full shadow transition-transform peer-checked:translate-x-5 border border-foreground/30" />
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-muted-foreground" />
                            <span className="text-xs md:text-sm font-semibold text-muted-foreground">Richiede Attivazione Utente</span>
                        </div>
                    </label>
                    <p className="text-[10px] md:text-xs text-foreground/40 mt-1 ml-14">Se attivo, l'utente deve attivare la promo dal suo QR prima che il negoziante possa usarla</p>
                </div>

                {targetMode !== 'personam' && (
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
                )}

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

                {targetMode !== 'personam' && (
                    <>
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
                    </>
                )}

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
