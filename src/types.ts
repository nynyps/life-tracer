export interface Category {
    id: string;
    name: string;
    color: string; // Tailwind color name like 'rose', 'emerald', 'indigo' or hex
    icon?: string; // Icon name
    userId: string;
}

export interface LifeEvent {
    id: string;
    date: string; // ISO date string YYYY-MM-DD
    endDate?: string; // Optional end date
    title: string;
    description?: string;
    categoryId: string; // Link to Category.id
    location?: string;
    people?: string[];
    isImportant?: boolean;
}

// Helper to get Tailwind color classes from category color
export const getCategoryStyles = (color: string) => {
    // If it's a tailwind color name
    const colors: Record<string, string> = {
        rose: 'bg-rose-500/10 border-rose-500/20 text-rose-200 hover:border-rose-500/40',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200 hover:border-emerald-500/40',
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-200 hover:border-blue-500/40',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-200 hover:border-amber-500/40',
        violet: 'bg-violet-500/10 border-violet-500/20 text-violet-200 hover:border-violet-500/40',
        cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200 hover:border-cyan-500/40',
        indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200 hover:border-indigo-500/40',
    };

    return colors[color] || colors.indigo;
};

export const AVAILABLE_COLORS = [
    { name: 'rose', label: 'Rose', class: 'bg-rose-500' },
    { name: 'emerald', label: 'Vert', class: 'bg-emerald-500' },
    { name: 'blue', label: 'Bleu', class: 'bg-blue-500' },
    { name: 'amber', label: 'Ambre', class: 'bg-amber-500' },
    { name: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
    { name: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
];

import { Heart, Briefcase, Globe, Home, GraduationCap, Dumbbell, Music, Camera, Star, Users, Leaf, Car, Lightbulb, Palette, Coffee } from 'lucide-react';

export const CATEGORY_ICONS: Record<string, any> = {
    heart: Heart,
    briefcase: Briefcase,
    globe: Globe,
    home: Home,
    graduation: GraduationCap,
    dumbbell: Dumbbell,
    music: Music,
    camera: Camera,
    star: Star,
    users: Users,
    leaf: Leaf,
    car: Car,
    lightbulb: Lightbulb,
    palette: Palette,
    coffee: Coffee,
};

export const getCategoryIcon = (iconName?: string) => {
    if (!iconName) return Heart;
    return CATEGORY_ICONS[iconName] || Heart;
};
