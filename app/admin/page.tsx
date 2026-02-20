"use client";

import { useState } from "react";
import { Plus, X, Tag, Store } from "lucide-react";
import Link from "next/link";
import PromoList from "./components/PromoList";
import PromoForm from "./components/PromoForm";
import ShopList from "./components/ShopList";
import ShopForm from "./components/ShopForm";

type Tab = 'promotions' | 'shops';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<Tab>('promotions');
    const [showForm, setShowForm] = useState(false);

    // Reset form visibility when switching tabs
    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        setShowForm(false);
    };

    return (
        <div className="space-y-6 md:space-y-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-1 md:mb-2">Dashboard</h1>
                    <p className="text-muted-foreground text-sm md:text-base">Gestisci promozioni e negozi</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-bold transition-all hover:translate-y-[-1px] shadow-[0_2px_8px_rgba(234,234,234,0.1)] hover:shadow-[0_4px_12px_rgba(234,234,234,0.2)] text-sm md:text-base"
                >
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    {showForm ? "Chiudi" : (activeTab === 'promotions' ? "Nuova Promozione" : "Nuovo Negozio")}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-foreground/20">
                <button
                    onClick={() => handleTabChange('promotions')}
                    className={`pb-3 px-2 flex items-center gap-2 font-bold text-sm md:text-base transition-colors relative ${activeTab === 'promotions' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'}`}
                >
                    <Tag size={18} />
                    Promozioni
                    {activeTab === 'promotions' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"></div>
                    )}
                </button>
                <button
                    onClick={() => handleTabChange('shops')}
                    className={`pb-3 px-2 flex items-center gap-2 font-bold text-sm md:text-base transition-colors relative ${activeTab === 'shops' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'}`}
                >
                    <Store size={18} />
                    Negozi
                    {activeTab === 'shops' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"></div>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="animate-fade-in">
                {showForm && (
                    <div className="animate-slide-down mb-8">
                        {activeTab === 'promotions' ? (
                            <PromoForm onSuccess={() => setShowForm(false)} />
                        ) : (
                            <ShopForm onSuccess={() => setShowForm(false)} />
                        )}
                    </div>
                )}

                <section>
                    <h2 className="text-lg md:text-xl font-heading font-semibold mb-6 md:mb-8 text-foreground">
                        {activeTab === 'promotions' ? 'Promozioni Attive' : 'Negozi Registrati'}
                    </h2>

                    {activeTab === 'promotions' ? <PromoList /> : <ShopList />}
                </section>
            </div>
        </div>
    );
}
