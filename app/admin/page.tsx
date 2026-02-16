"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import PromoList from "./components/PromoList";
import PromoForm from "./components/PromoForm";

export default function AdminPage() {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="space-y-6 md:space-y-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-1 md:mb-2">Dashboard</h1>
                    <p className="text-muted-foreground text-sm md:text-base">Gestisci le promozioni attive</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-bold transition-all hover:translate-y-[-1px] shadow-[0_2px_8px_rgba(234,234,234,0.1)] hover:shadow-[0_4px_12px_rgba(234,234,234,0.2)] text-sm md:text-base"
                >
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    {showForm ? "Chiudi" : "Nuova Promozione"}
                </button>
            </div>

            {showForm && (
                <div className="animate-slide-down">
                    <PromoForm onSuccess={() => setShowForm(false)} />
                </div>
            )}

            <section>
                <h2 className="text-lg md:text-xl font-heading font-semibold mb-6 md:mb-8 text-foreground">
                    Promozioni Attive
                </h2>
                <PromoList />
            </section>
        </div>
    );
}
