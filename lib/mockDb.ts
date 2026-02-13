"use client";

// Types need to be exported
export type User = {
    id: string;
    name: string;
    surname: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    email: string;
    phone: string;
    cardId: string;
};

export type Promotion = {
    id: string;
    title: string;
    description: string;
    targetGender: 'All' | 'Male' | 'Female';
    targetAgeMin: number;
    targetAgeMax: number;
    usageLimit: 'Unlimited' | 'Single';
    shops: string[];
    active: boolean;
};

export type Shop = {
    id: string;
    name: string;
    pin: string;
};

// Initial Data
const INITIAL_PROMOTIONS: Promotion[] = [
    {
        id: 'promo-1',
        title: 'Sconto Benvenuto',
        description: '10% di sconto sul primo acquisto',
        targetGender: 'All',
        targetAgeMin: 0,
        targetAgeMax: 100,
        usageLimit: 'Single',
        shops: ['shop-1'],
        active: true,
    }
];

const INITIAL_SHOPS: Shop[] = [
    { id: 'shop-1', name: 'Negozio Principale', pin: '1234' },
    { id: 'shop-2', name: 'Filiale Centro', pin: '5678' }
];

// Helper to persist to localStorage
const save = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
    }
};

const load = <T>(key: string, fallback: T): T => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    }
    return fallback;
};

export const db = {
    users: {
        create: (user: User) => {
            const users = load<User[]>('users', []);
            users.push(user);
            save('users', users);
            return user;
        },
        getByCardId: (cardId: string) => {
            const users = load<User[]>('users', []);
            return users.find(u => u.cardId === cardId);
        },
    },
    promotions: {
        getAll: () => load<Promotion[]>('promotions', INITIAL_PROMOTIONS),
        create: (promo: Promotion) => {
            const promotions = load<Promotion[]>('promotions', INITIAL_PROMOTIONS);
            promotions.push(promo);
            save('promotions', promotions);
            return promo;
        },
        delete: (id: string) => {
            let promotions = load<Promotion[]>('promotions', INITIAL_PROMOTIONS);
            promotions = promotions.filter(p => p.id !== id);
            save('promotions', promotions);
        }
    },
    shops: {
        verifyPin: (pin: string) => {
            // Shops are static for now, but could be loaded
            return INITIAL_SHOPS.find(s => s.pin === pin);
        },
        getById: (id: string) => INITIAL_SHOPS.find(s => s.id === id),
    }
};
