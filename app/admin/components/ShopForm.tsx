"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Save, User } from "lucide-react";

export default function ShopForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        pin: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.pin) return;

        setLoading(true);

        const { error } = await supabase
            .from('shops')
            .insert([
                {
                    name: formData.name,
                    pin: formData.pin,
                }
            ]);

        setLoading(false);

        if (error) {
            console.error('Error creating shop:', error);
            if (error.code === '23505') { // Unique violation for PIN
                alert('Errore: Questo PIN è già utilizzato da un altro negozio.');
            } else {
                alert('Errore durante la creazione del negozio');
            }
        } else {
            setFormData({ name: "", pin: "" });
            onSuccess();
        }
    };

    return (
        <div className="bg-background border-2 border-foreground p-5 md:p-8 lg:p-10 rounded-lg mb-6 md:mb-10">
            <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-6 md:mb-8 flex items-center gap-2">
                <User className="w-6 h-6" />
                Nuovo Negozio
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className="block text-xs md:text-sm font-semibold mb-2 md:mb-3 text-muted-foreground">Nome Negozio</label>
                    <input
                        type="text"
                        className="w-full bg-transparent border-2 border-foreground rounded-lg px-4 py-2.5 md:px-5 md:py-3 text-foreground text-sm md:text-base placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-foreground/10 transition-all"
                        placeholder="Es. Bar Centrale"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs md:text-sm font-semibold mb-2 md:mb-3 text-muted-foreground">PIN (per accesso)</label>
                    <input
                        type="text"
                        className="w-full bg-transparent border-2 border-foreground rounded-lg px-4 py-2.5 md:px-5 md:py-3 text-foreground text-sm md:text-base placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-foreground/10 transition-all font-mono"
                        placeholder="1234"
                        value={formData.pin}
                        onChange={e => setFormData({ ...formData, pin: e.target.value })}
                        required
                        maxLength={6}
                    />
                </div>

                <div className="md:col-span-2 mt-2 md:mt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 md:py-4 rounded-lg font-bold text-sm md:text-base transition-all hover:translate-y-[-1px] flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(234,234,234,0.1)] hover:shadow-[0_4px_12px_rgba(234,234,234,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} />
                        {loading ? "Salvataggio..." : "Salva Negozio"}
                    </button>
                </div>
            </form>
        </div>
    );
}
