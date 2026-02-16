"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { db, type User } from "@/lib/mockDb";

export default function RequestPage() {
    const router = useRouter();
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        email: "",
        phone: "",
        age: 18,
        gender: "Male"
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Simulation of request submission
        // In a real app we would save this to a "Requests" table
        // For now we just show success

        setTimeout(() => {
            setSuccess(true);
        }, 1000);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-scale-in">
                <div className="mb-6 p-6 border-2 border-foreground rounded-full text-foreground">
                    <Send size={48} />
                </div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2 text-foreground">Richiesta Inviata!</h1>
                <p className="text-foreground/70 mb-8 text-base md:text-lg max-w-md">
                    Abbiamo ricevuto la tua richiesta. Ti contatteremo presto via email per il ritiro della tessera.
                </p>
                <Link
                    href="/"
                    className="bg-foreground hover:bg-foreground/90 text-background px-8 py-4 rounded-lg font-bold transition-all hover:scale-[1.02]"
                >
                    Torna alla Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-6">
            <div className="w-full max-w-lg animate-slide-up mt-6 md:mt-10">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="p-2 border border-foreground/30 rounded-full hover:bg-foreground hover:text-background text-foreground transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground tracking-widest uppercase">
                        Richiedi Tessera
                    </h1>
                    <div className="w-10"></div>
                </div>

                <form onSubmit={handleSubmit} className="bg-background border border-foreground/20 p-6 md:p-8 rounded-2xl space-y-5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-bold mb-2 text-foreground/70">Nome</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-transparent border-b border-foreground/30 py-2 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground transition-all"
                                placeholder="Mario"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-bold mb-2 text-foreground/70">Cognome</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-transparent border-b border-foreground/30 py-2 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground transition-all"
                                placeholder="Rossi"
                                value={formData.surname}
                                onChange={e => setFormData({ ...formData, surname: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider font-bold mb-2 text-foreground/70">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-transparent border-b border-foreground/30 py-2 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground transition-all"
                            placeholder="mario@example.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-bold mb-2 text-foreground/70">Telefono</label>
                            <input
                                type="tel"
                                className="w-full bg-transparent border-b border-foreground/30 py-2 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground transition-all"
                                placeholder="+39 ..."
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-bold mb-2 text-foreground/70">Età</label>
                            <input
                                type="number"
                                required
                                min={10} max={100}
                                className="w-full bg-transparent border-b border-foreground/30 py-2 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground transition-all"
                                placeholder="18"
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider font-bold mb-2 text-foreground/70">Genere</label>
                        <select
                            className="w-full bg-background border-b border-foreground/30 py-2 text-foreground focus:outline-none focus:border-foreground transition-all appearance-none"
                            value={formData.gender}
                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                        >
                            <option value="Male">Uomo</option>
                            <option value="Female">Donna</option>
                            <option value="Other">Altro</option>
                        </select>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-foreground text-background py-4 rounded-lg font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-all active:scale-[0.98]"
                        >
                            Invia Richiesta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
