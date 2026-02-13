"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, type User } from "@/lib/mockDb";
import { ArrowRight, UserPlus, CheckCircle } from "lucide-react";

export default function ActivatePage({ params }: { params: { cardId: string } }) {
    const router = useRouter();
    const cardId = params.cardId;
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({
        name: "",
        surname: "",
        email: "",
        phone: "",
        gender: "Male",
        age: 18,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.surname) return;

        const newUser: User = {
            id: crypto.randomUUID(),
            cardId: cardId,
            name: formData.name!,
            surname: formData.surname!,
            email: formData.email || "",
            phone: formData.phone || "",
            age: Number(formData.age),
            gender: formData.gender as any,
        };

        db.users.create(newUser);
        setSuccess(true);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center animate-scale-in">
                <div className="mb-6 p-6 border-2 border-white rounded-full text-white">
                    <CheckCircle size={64} />
                </div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2 text-white">Tessera Attivata!</h1>
                <p className="text-white/70 mb-8 text-lg">
                    La tua tessera è ora attiva
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-white hover:bg-white/90 text-black px-8 py-4 rounded-3xl font-bold transition-all hover:scale-[1.02]"
                >
                    Torna alla Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center p-6">
            <div className="w-full max-w-lg animate-slide-up mt-10">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 rounded-full border-2 border-white text-white mb-4">
                        <UserPlus size={40} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">Attiva Tessera</h1>
                    <p className="text-white/70">Compila il modulo per la tessera #{cardId}</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-black border-2 border-white p-6 md:p-8 rounded-3xl space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/90">Nome</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-transparent border-2 border-white rounded-2xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-4 focus:ring-white/20"
                                placeholder="Mario"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/90">Cognome</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-transparent border-2 border-white rounded-2xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-4 focus:ring-white/20"
                                placeholder="Rossi"
                                value={formData.surname}
                                onChange={e => setFormData({ ...formData, surname: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/90">Età</label>
                            <input
                                type="number"
                                required
                                className="w-full bg-transparent border-2 border-white rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-4 focus:ring-white/20"
                                placeholder="18"
                                min={1} max={120}
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/90">Genere</label>
                            <select
                                className="w-full bg-black border-2 border-white rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-4 focus:ring-white/20"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                            >
                                <option value="Male">Uomo</option>
                                <option value="Female">Donna</option>
                                <option value="Other">Altro</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-white/90">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-transparent border-2 border-white rounded-2xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-4 focus:ring-white/20"
                            placeholder="mario.rossi@example.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-white/90">Telefono</label>
                        <input
                            type="tel"
                            required
                            className="w-full bg-transparent border-2 border-white rounded-2xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-4 focus:ring-white/20"
                            placeholder="+39 333 1234567"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-white hover:bg-white/90 text-black py-4 rounded-2xl font-bold uppercase tracking-wider transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mt-6"
                    >
                        Attiva Tessera <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
