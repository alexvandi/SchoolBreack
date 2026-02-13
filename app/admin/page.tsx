"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import PromoList from "./components/PromoList";
import PromoForm from "./components/PromoForm";

export default function AdminPage() {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-[#bdbdbd] text-base">Gestisci le promozioni attive</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-[#eaeaea] hover:bg-[#f5f5f5] text-black px-6 py-3 rounded-[12px] font-bold transition-all hover:translate-y-[-1px] shadow-[0_2px_8px_rgba(234,234,234,0.1)] hover:shadow-[0_4px_12px_rgba(234,234,234,0.2)]"
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
                <h2 className="text-xl font-heading font-semibold mb-8 text-white">
                    Promozioni Attive
                </h2>
                <PromoList />
            </section>
        </div>
    );
}
