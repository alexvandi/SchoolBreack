"use client";

import { useState } from "react";
import { type Promotion, db } from "@/lib/mockDb";
import { Save } from "lucide-react";

export default function PromoForm({ onSuccess }: { onSuccess: () => void }) {
    const [formData, setFormData] = useState<Partial<Promotion>>({
        title: "",
        description: "",
        targetGender: "All",
        targetAgeMin: 0,
        targetAgeMax: 99,
        usageLimit: "Unlimited",
        active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description) return;

        const newPromo: Promotion = {
            id: crypto.randomUUID(),
            title: formData.title!,
            description: formData.description!,
            targetGender: formData.targetGender as any,
            targetAgeMin: Number(formData.targetAgeMin),
            targetAgeMax: Number(formData.targetAgeMax),
            usageLimit: formData.usageLimit as any,
            shops: ['shop-1'],
            active: true,
        };

        db.promotions.create(newPromo);
        onSuccess();
    };

    return (
        <div className="bg-black border-2 border-white p-8 md:p-10 rounded-[12px] mb-10">
            <h3 className="text-2xl font-heading font-bold text-white mb-8">Nuova Promozione</h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-3 text-[#bdbdbd]">Titolo</label>
                    <input
                        type="text"
                        className="w-full bg-transparent border-2 border-white rounded-[12px] px-5 py-3 text-white placeholder:text-[#bdbdbd] focus:outline-none focus:ring-4 focus:ring-white/10 transition-all"
                        placeholder="Es. Sconto Studenti"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-3 text-[#bdbdbd]">Descrizione</label>
                    <textarea
                        className="w-full bg-transparent border-2 border-white rounded-[12px] px-5 py-3 text-white placeholder:text-[#bdbdbd] focus:outline-none focus:ring-4 focus:ring-white/10 min-h-[100px] transition-all"
                        placeholder="Dettagli dell'offerta..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-3 text-[#bdbdbd]">Target Genere</label>
                    <select
                        className="w-full bg-black border-2 border-white rounded-[12px] px-5 py-3 text-white focus:outline-none focus:ring-4 focus:ring-white/10 transition-all"
                        value={formData.targetGender}
                        onChange={e => setFormData({ ...formData, targetGender: e.target.value as any })}
                    >
                        <option value="All">Tutti</option>
                        <option value="Male">Uomo</option>
                        <option value="Female">Donna</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-3 text-[#bdbdbd]">Utilizzo</label>
                    <select
                        className="w-full bg-black border-2 border-white rounded-[12px] px-5 py-3 text-white focus:outline-none focus:ring-4 focus:ring-white/10 transition-all"
                        value={formData.usageLimit}
                        onChange={e => setFormData({ ...formData, usageLimit: e.target.value as any })}
                    >
                        <option value="Unlimited">Infinito</option>
                        <option value="Single">Singolo</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-3 text-[#bdbdbd]">Età Minima</label>
                    <input
                        type="number"
                        className="w-full bg-transparent border-2 border-white rounded-[12px] px-5 py-3 text-white focus:outline-none focus:ring-4 focus:ring-white/10 transition-all"
                        value={formData.targetAgeMin}
                        onChange={e => setFormData({ ...formData, targetAgeMin: Number(e.target.value) })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-3 text-[#bdbdbd]">Età Massima</label>
                    <input
                        type="number"
                        className="w-full bg-transparent border-2 border-white rounded-[12px] px-5 py-3 text-white focus:outline-none focus:ring-4 focus:ring-white/10 transition-all"
                        value={formData.targetAgeMax}
                        onChange={e => setFormData({ ...formData, targetAgeMax: Number(e.target.value) })}
                    />
                </div>

                <div className="md:col-span-2 mt-4">
                    <button
                        type="submit"
                        className="w-full bg-[#eaeaea] hover:bg-[#f5f5f5] text-black py-4 rounded-[12px] font-bold transition-all hover:translate-y-[-1px] flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(234,234,234,0.1)] hover:shadow-[0_4px_12px_rgba(234,234,234,0.2)]"
                    >
                        <Save size={18} />
                        Salva Promozione
                    </button>
                </div>
            </form>
        </div>
    );
}
