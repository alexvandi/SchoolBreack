"use client";

import { useState, useEffect } from "react";
import { Trash2, Key, Store } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Shop = {
    id: string;
    name: string;
    pin: string;
    created_at: string;
};

export default function ShopList() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchShops = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('shops')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching shops:', error);
        } else {
            setShops(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchShops();

        // Subscribe to changes
        const subscription = supabase
            .channel('shops_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, fetchShops)
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Sei sicuro di voler eliminare il negozio "${name}"?`)) {
            const { error } = await supabase.from('shops').delete().eq('id', id);
            if (error) {
                console.error('Error deleting shop:', error);
                alert('Errore durante l\'eliminazione');
            } else {
                fetchShops(); // Refresh list
            }
        }
    };

    if (loading) {
        return <div className="text-center text-muted-foreground p-10">Caricamento negozi...</div>;
    }

    if (shops.length === 0) {
        return (
            <div className="p-6 md:p-10 text-center text-muted-foreground bg-background border-2 border-dashed border-foreground/30 rounded-lg text-sm md:text-base">
                Nessun negozio attivo. Creane uno nuovo!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {shops.map((shop) => (
                <div key={shop.id} className="bg-background border-2 border-foreground p-4 md:p-6 rounded-lg flex flex-col gap-3 md:gap-4 relative group hover:bg-primary transition-all duration-300">
                    <div className="absolute top-3 right-3 md:top-4 md:right-4">
                        <button
                            onClick={() => handleDelete(shop.id, shop.name)}
                            className="p-2 hover:bg-destructive rounded-full transition-colors text-foreground group-hover:text-primary-foreground"
                            title="Elimina"
                        >
                            <Trash2 size={16} className="md:hidden" />
                            <Trash2 size={18} className="hidden md:block" />
                        </button>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Store className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground/80 transition-colors" />
                            <h3 className="text-lg md:text-xl font-bold font-heading text-foreground group-hover:text-primary-foreground transition-colors">{shop.name}</h3>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 md:gap-2 mt-auto pt-3 md:pt-4 border-t border-foreground/20 group-hover:border-primary-foreground/20 text-xs md:text-sm transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary-foreground/80">
                            <Key size={14} />
                            <span className="font-mono tracking-wider">PIN: {shop.pin}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
