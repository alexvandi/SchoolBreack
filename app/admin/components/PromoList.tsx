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
            <div className="p-6 md:p-10 text-center text-muted-foreground bg-background border-2 border-dashed border-foreground/30 rounded-lg text-sm md:text-base">
                Nessuna promozione attiva. Creane una nuova!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {promotions.map((promo) => (
                <div key={promo.id} className="bg-background border-2 border-foreground p-4 md:p-6 rounded-lg flex flex-col gap-3 md:gap-4 relative group hover:bg-primary transition-all duration-300">
                    <div className="absolute top-3 right-3 md:top-4 md:right-4">
                        <button
                            onClick={() => handleDelete(promo.id)}
                            className="p-2 hover:bg-destructive rounded-full transition-colors text-foreground group-hover:text-primary-foreground"
                            title="Elimina"
                        >
                            <Trash2 size={16} className="md:hidden" />
                            <Trash2 size={18} className="hidden md:block" />
                        </button>
                    </div>

                    <div>
                        <h3 className="text-lg md:text-xl font-bold font-heading mb-1 md:mb-2 text-foreground group-hover:text-primary-foreground transition-colors">{promo.title}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground group-hover:text-primary-foreground/70 transition-colors">{promo.description}</p>
                    </div>

                    <div className="flex flex-col gap-1.5 md:gap-2 mt-auto pt-3 md:pt-4 border-t border-foreground/20 group-hover:border-primary-foreground/20 text-xs md:text-sm transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary-foreground/80">
                            <Users size={14} />
                            <span>{promo.targetGender === 'All' ? 'Tutti' : promo.targetGender} ({promo.targetAgeMin}-{promo.targetAgeMax} anni)</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary-foreground/80">
                            <Calendar size={14} />
                            <span>{promo.usageLimit === 'Unlimited' ? 'Illimitato' : 'Singolo'}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
