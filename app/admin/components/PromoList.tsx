"use client";

import { useState, useEffect } from "react";
import { Trash2, Users, Calendar, ChevronRight, X, Save, Loader2, ShieldCheck, UserCheck, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Promotion = {
    id: string;
    title: string;
    description: string;
    target_gender: 'Male' | 'Female' | 'All';
    target_age_min: number;
    target_age_max: number;
    usage_limit: 'Unlimited' | 'Single';
    active: boolean;
    shops: string[];
    target_mode: string;
    target_users: string[];
    requires_activation: boolean;
};

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

export default function PromoList() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
    const [saving, setSaving] = useState(false);
    const [shops, setShops] = useState<Shop[]>([]);

    // User selection state for editing
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState<UserRecord[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<UserRecord[]>([]);
    const [searching, setSearching] = useState(false);

    const fetchPromotions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching promotions:', error);
        } else {
            setPromotions(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPromotions();

        const fetchShops = async () => {
            const { data } = await supabase.from('shops').select('id, name').order('name');
            if (data) setShops(data);
        };
        fetchShops();

        const subscription = supabase
            .channel('promotions_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, fetchPromotions)
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Load full user details when editing a promo with target_users
    useEffect(() => {
        if (!editingPromo || editingPromo.target_mode !== 'personam' || !editingPromo.target_users || editingPromo.target_users.length === 0) {
            setSelectedUsers([]);
            return;
        }

        const fetchSelectedUsers = async () => {
            const { data } = await supabase
                .from('users')
                .select('id, card_id, name, surname')
                .in('card_id', editingPromo.target_users);

            if (data) {
                setSelectedUsers(data);
            }
        };

        fetchSelectedUsers();
    }, [editingPromo?.id]); // Re-run only when switching promos

    // Search users effect
    useEffect(() => {
        if (!editingPromo || editingPromo.target_mode !== 'personam' || userSearch.length < 2) {
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
                const selectedIds = selectedUsers.map(u => u.card_id);
                setSearchResults(data.filter(u => !selectedIds.includes(u.card_id)));
            }
            setSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [userSearch, editingPromo?.target_mode, selectedUsers]);

    const handleDelete = async (id: string) => {
        if (confirm("Sei sicuro di voler eliminare questa promozione?")) {
            const { error } = await supabase.from('promotions').delete().eq('id', id);
            if (error) {
                console.error('Error deleting promotion:', error);
                alert('Errore durante l\'eliminazione');
            } else {
                fetchPromotions();
            }
        }
    };

    const handleSave = async () => {
        if (!editingPromo) return;
        setSaving(true);

        const { error } = await supabase
            .from('promotions')
            .update({
                title: editingPromo.title,
                description: editingPromo.description,
                target_gender: editingPromo.target_gender,
                target_age_min: editingPromo.target_age_min,
                target_age_max: editingPromo.target_age_max,
                usage_limit: editingPromo.usage_limit,
                active: editingPromo.active,
                shops: editingPromo.shops,
                target_mode: editingPromo.target_mode,
                target_users: editingPromo.target_mode === 'personam' ? selectedUsers.map(u => u.card_id) : [],
                requires_activation: editingPromo.requires_activation,
            })
            .eq('id', editingPromo.id);

        setSaving(false);

        if (error) {
            console.error('Error updating promotion:', error);
            alert('Errore durante il salvataggio');
        } else {
            setEditingPromo(null);
            fetchPromotions();
        }
    };

    const toggleEditShop = (shopId: string) => {
        if (!editingPromo) return;
        const current = editingPromo.shops || [];
        setEditingPromo({
            ...editingPromo,
            shops: current.includes(shopId) ? current.filter(id => id !== shopId) : [...current, shopId]
        });
    };

    const addUser = (user: UserRecord) => {
        setSelectedUsers(prev => [...prev, user]);
        setUserSearch('');
        setSearchResults([]);
    };

    const removeUser = (cardId: string) => {
        setSelectedUsers(prev => prev.filter(u => u.card_id !== cardId));
    };

    if (loading) {
        return <div className="text-center text-muted-foreground p-10">Caricamento promozioni...</div>;
    }

    if (promotions.length === 0) {
        return (
            <div className="p-6 md:p-10 text-center text-muted-foreground bg-background border-2 border-dashed border-foreground/30 rounded-lg text-sm md:text-base">
                Nessuna promozione attiva. Creane una nuova!
            </div>
        );
    }

    // Edit panel
    if (editingPromo) {
        return (
            <div className="bg-background border-2 border-foreground p-5 md:p-8 rounded-lg animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground">Modifica Promozione</h3>
                    <button onClick={() => setEditingPromo(null)} className="p-2 hover:bg-foreground/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs md:text-sm font-semibold mb-2 text-muted-foreground">Titolo</label>
                        <input
                            type="text"
                            className="w-full bg-transparent border-2 border-foreground rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-foreground/10 transition-all"
                            value={editingPromo.title}
                            onChange={e => setEditingPromo({ ...editingPromo, title: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs md:text-sm font-semibold mb-2 text-muted-foreground">Descrizione</label>
                        <textarea
                            className="w-full bg-transparent border-2 border-foreground rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-foreground/10 min-h-[80px] transition-all"
                            value={editingPromo.description}
                            onChange={e => setEditingPromo({ ...editingPromo, description: e.target.value })}
                        />
                    </div>

                    {/* Shops */}
                    <div className="md:col-span-2">
                        <label className="block text-xs md:text-sm font-semibold mb-2 text-muted-foreground">Negozi Associati</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {shops.map(shop => (
                                <button
                                    key={shop.id}
                                    type="button"
                                    onClick={() => toggleEditShop(shop.id)}
                                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${(editingPromo.shops || []).includes(shop.id)
                                        ? 'border-foreground bg-foreground text-background'
                                        : 'border-foreground/40 text-foreground/70 hover:border-foreground'
                                        }`}
                                >
                                    {shop.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Target Mode Selection */}
                    <div className="md:col-span-2">
                        <label className="block text-xs md:text-sm font-semibold mb-2 text-muted-foreground">Destinatari</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setEditingPromo({ ...editingPromo, target_mode: 'all' })}
                                className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${editingPromo.target_mode === 'all'
                                    ? 'border-foreground bg-foreground text-background'
                                    : 'border-foreground/40 text-foreground/70 hover:border-foreground'
                                    }`}
                            >
                                Tutti
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingPromo({ ...editingPromo, target_mode: 'personam' })}
                                className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${editingPromo.target_mode === 'personam'
                                    ? 'border-foreground bg-foreground text-background'
                                    : 'border-foreground/40 text-foreground/70 hover:border-foreground'
                                    }`}
                            >
                                Ad Personam
                            </button>
                        </div>
                    </div>

                    {/* Ad Personam User Selection */}
                    {editingPromo.target_mode === 'personam' && (
                        <div className="md:col-span-2">
                            <label className="block text-xs md:text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-2">
                                <Search size={16} />
                                Modifica Utenti Selezionati
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
                                    className="w-full bg-transparent border-2 border-foreground rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-foreground/10 transition-all"
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
                        </div>
                    )}

                    {editingPromo.target_mode !== 'personam' && (
                        <>
                            <div>
                                <label className="block text-xs md:text-sm font-semibold mb-2 text-muted-foreground">Target Genere</label>
                                <select
                                    className="w-full bg-background border-2 border-foreground rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-foreground/10 transition-all"
                                    value={editingPromo.target_gender}
                                    onChange={e => setEditingPromo({ ...editingPromo, target_gender: e.target.value as 'Male' | 'Female' | 'All' })}
                                >
                                    <option value="All">Tutti</option>
                                    <option value="Male">Uomo</option>
                                    <option value="Female">Donna</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs md:text-sm font-semibold mb-2 text-muted-foreground">Età Min</label>
                                <input
                                    type="number"
                                    className="w-full bg-transparent border-2 border-foreground rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-foreground/10 transition-all"
                                    value={editingPromo.target_age_min}
                                    onChange={e => setEditingPromo({ ...editingPromo, target_age_min: Number(e.target.value) })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs md:text-sm font-semibold mb-2 text-muted-foreground">Età Max</label>
                                <input
                                    type="number"
                                    className="w-full bg-transparent border-2 border-foreground rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-foreground/10 transition-all"
                                    value={editingPromo.target_age_max}
                                    onChange={e => setEditingPromo({ ...editingPromo, target_age_max: Number(e.target.value) })}
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-xs md:text-sm font-semibold mb-2 text-muted-foreground">Utilizzo</label>
                        <select
                            className="w-full bg-background border-2 border-foreground rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-foreground/10 transition-all"
                            value={editingPromo.usage_limit}
                            onChange={e => setEditingPromo({ ...editingPromo, usage_limit: e.target.value as 'Unlimited' | 'Single' })}
                        >
                            <option value="Unlimited">Infinito</option>
                            <option value="Single">Singolo</option>
                        </select>
                    </div>

                    {/* Active toggle */}
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-2 border-foreground accent-foreground"
                                checked={editingPromo.active}
                                onChange={e => setEditingPromo({ ...editingPromo, active: e.target.checked })}
                            />
                            <span className="text-sm font-semibold text-muted-foreground">Promozione Attiva</span>
                        </label>
                    </div>

                    {/* Requires Activation toggle */}
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-2 border-foreground accent-foreground"
                                checked={editingPromo.requires_activation}
                                onChange={e => setEditingPromo({ ...editingPromo, requires_activation: e.target.checked })}
                            />
                            <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <ShieldCheck size={14} />
                                Richiede Attivazione Utente
                            </span>
                        </label>
                    </div>

                    <div className="md:col-span-2 flex gap-3 mt-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? "Salvataggio..." : "Salva Modifiche"}
                        </button>
                        <button
                            onClick={() => setEditingPromo(null)}
                            className="px-6 py-3 border-2 border-foreground rounded-lg font-bold text-sm hover:bg-foreground hover:text-background transition-all"
                        >
                            Annulla
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {promotions.map((promo) => (
                <div
                    key={promo.id}
                    className="bg-background border-2 border-foreground p-4 md:p-6 rounded-lg flex flex-col gap-3 md:gap-4 relative group hover:bg-primary transition-all duration-300 cursor-pointer"
                    onClick={() => setEditingPromo({ ...promo })}
                >
                    <div className="absolute top-3 right-3 md:top-4 md:right-4 flex items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(promo.id); }}
                            className="p-2 hover:bg-destructive rounded-full transition-colors text-foreground group-hover:text-primary-foreground"
                            title="Elimina"
                        >
                            <Trash2 size={16} className="md:hidden" />
                            <Trash2 size={18} className="hidden md:block" />
                        </button>
                        <ChevronRight size={16} className="text-foreground/40 group-hover:text-primary-foreground/60" />
                    </div>

                    <div>
                        <h3 className="text-lg md:text-xl font-bold font-heading mb-1 md:mb-2 text-foreground group-hover:text-primary-foreground transition-colors pr-16">{promo.title}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground group-hover:text-primary-foreground/70 transition-colors">{promo.description}</p>
                    </div>

                    <div className="flex flex-col gap-1.5 md:gap-2 mt-auto pt-3 md:pt-4 border-t border-foreground/20 group-hover:border-primary-foreground/20 text-xs md:text-sm transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary-foreground/80">
                            {promo.target_mode === 'personam' ? (
                                <><UserCheck size={14} /><span>Ad Personam ({(promo.target_users || []).length} utenti)</span></>
                            ) : (
                                <><Users size={14} /><span>{promo.target_gender === 'All' ? 'Tutti' : promo.target_gender} ({promo.target_age_min}-{promo.target_age_max} anni)</span></>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary-foreground/80">
                            <Calendar size={14} />
                            <span>{promo.usage_limit === 'Unlimited' ? 'Illimitato' : 'Singolo'}</span>
                        </div>
                        {promo.requires_activation && (
                            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary-foreground/80">
                                <ShieldCheck size={14} />
                                <span>Richiede attivazione</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
