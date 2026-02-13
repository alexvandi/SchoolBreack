"use client";

import { useState, useEffect } from "react";
import { Trash2, Users, Calendar } from "lucide-react";
import { type Promotion, db } from "@/lib/mockDb";

export default function PromoList() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);

    useEffect(() => {
        setPromotions(db.promotions.getAll());
    }, []);

    const handleDelete = (id: string) => {
        if (confirm("Sei sicuro di voler eliminare questa promozione?")) {
            db.promotions.delete(id);
            setPromotions([...db.promotions.getAll()]);
        }
    };

    if (promotions.length === 0) {
        return (
            <div className="p-10 text-center text-[#bdbdbd] bg-black border-2 border-dashed border-white/30 rounded-[12px] text-base">
                Nessuna promozione attiva. Creane una nuova!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => (
                <div key={promo.id} className="bg-black border-2 border-white p-6 rounded-[12px] flex flex-col gap-4 relative group hover:bg-[#eaeaea] transition-all duration-300">
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={() => handleDelete(promo.id)}
                            className="p-2 hover:bg-red-500 rounded-full transition-colors text-white group-hover:text-black"
                            title="Elimina"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold font-heading mb-2 text-white group-hover:text-black transition-colors">{promo.title}</h3>
                        <p className="text-sm text-[#bdbdbd] group-hover:text-black/70 transition-colors">{promo.description}</p>
                    </div>

                    <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-white/20 group-hover:border-black/20 text-sm transition-colors">
                        <div className="flex items-center gap-2 text-[#bdbdbd] group-hover:text-black/80">
                            <Users size={14} />
                            <span>{promo.targetGender === 'All' ? 'Tutti' : promo.targetGender} ({promo.targetAgeMin}-{promo.targetAgeMax} anni)</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#bdbdbd] group-hover:text-black/80">
                            <Calendar size={14} />
                            <span>{promo.usageLimit === 'Unlimited' ? 'Illimitato' : 'Singolo'}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
