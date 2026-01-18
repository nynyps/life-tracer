import { create } from 'zustand';
import type { LifeEvent, Category } from '../types';
import { supabase } from '../lib/supabase';

interface LifeStore {
    events: LifeEvent[];
    categories: Category[];
    loading: boolean;

    // Initial fetch
    fetchInitialData: () => Promise<void>;

    // Categories CRUD
    fetchCategories: () => Promise<void>;
    addCategory: (category: Omit<Category, 'id' | 'userId'>) => Promise<void>;
    updateCategory: (id: string, category: Partial<Omit<Category, 'id' | 'userId'>>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;

    // Events CRUD
    fetchEvents: () => Promise<void>;
    addEvent: (event: Omit<LifeEvent, 'id'>) => Promise<void>;
    updateEvent: (id: string, event: Partial<Omit<LifeEvent, 'id'>>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;

    // Utility
    getEventsByCategoryId: (categoryId: string) => LifeEvent[];
    clearData: () => void;
}

export const useLifeStore = create<LifeStore>()((set, get) => ({
    events: [],
    categories: [],
    loading: false,

    fetchInitialData: async () => {
        set({ loading: true });
        await Promise.all([get().fetchCategories(), get().fetchEvents()]);
        set({ loading: false });
    },

    fetchCategories: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
            return;
        }

        let fetchedCategories: Category[] = (data || []).map((c) => ({
            id: c.id,
            name: c.name,
            color: c.color,
            userId: c.user_id,
        }));



        set({ categories: fetchedCategories });
    },

    addCategory: async (newCategory) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('categories')
            .insert({
                user_id: user.id,
                name: newCategory.name,
                color: newCategory.color,
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding category:', error);
            return;
        }

        if (data) {
            const category: Category = {
                id: data.id,
                name: data.name,
                color: data.color,
                userId: data.user_id,
            };
            set((state) => ({ categories: [...state.categories, category] }));
        }
    },

    updateCategory: async (id, updatedCategory) => {
        const { error } = await supabase
            .from('categories')
            .update({
                name: updatedCategory.name,
                color: updatedCategory.color,
            })
            .eq('id', id);

        if (error) {
            console.error('Error updating category:', error);
            return;
        }

        set((state) => ({
            categories: state.categories.map((c) =>
                c.id === id ? { ...c, ...updatedCategory } : c
            ),
        }));
    },

    deleteCategory: async (id) => {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting category:', error);
            return;
        }

        set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
            // Optionally cleanup events, but database handles it or we reassign them
            events: state.events.map(e => e.categoryId === id ? { ...e, categoryId: '' } : e)
        }));
    },

    fetchEvents: async () => {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching events:', error);
            return;
        }

        const events: LifeEvent[] = (data || []).map((e) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            categoryId: e.category || '', // Map category from DB
            description: e.description || undefined,
            location: e.location || undefined,
            people: e.people || undefined,
            isImportant: e.is_important || false,
        }));

        set({ events });
    },

    addEvent: async (newEvent) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('events')
            .insert({
                user_id: user.id,
                title: newEvent.title,
                date: newEvent.date,
                category: newEvent.categoryId,
                description: newEvent.description || null,
                location: newEvent.location || null,
                people: newEvent.people || null,
                is_important: newEvent.isImportant || false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding event:', error);
            return;
        }

        if (data) {
            const event: LifeEvent = {
                id: data.id,
                title: data.title,
                date: data.date,
                categoryId: data.category || '',
                description: data.description || undefined,
                location: data.location || undefined,
                people: data.people || undefined,
                isImportant: data.is_important || false,
            };
            set((state) => ({
                events: [event, ...state.events].sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                ),
            }));
        }
    },

    updateEvent: async (id, updatedEvent) => {
        const updateData: Record<string, any> = {};
        if (updatedEvent.title !== undefined) updateData.title = updatedEvent.title;
        if (updatedEvent.date !== undefined) updateData.date = updatedEvent.date;
        if (updatedEvent.categoryId !== undefined) updateData.category = updatedEvent.categoryId;
        if (updatedEvent.description !== undefined) updateData.description = updatedEvent.description;
        if (updatedEvent.location !== undefined) updateData.location = updatedEvent.location;
        if (updatedEvent.people !== undefined) updateData.people = updatedEvent.people;
        if (updatedEvent.isImportant !== undefined) updateData.is_important = updatedEvent.isImportant;

        const { error } = await supabase
            .from('events')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error updating event:', error);
            return;
        }

        set((state) => ({
            events: state.events
                .map((e) => (e.id === id ? { ...e, ...updatedEvent } : e))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        }));
    },

    deleteEvent: async (id) => {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting event:', error);
            return;
        }

        set((state) => ({
            events: state.events.filter((e) => e.id !== id),
        }));
    },

    getEventsByCategoryId: (categoryId) => {
        return get().events.filter((e) => e.categoryId === categoryId);
    },

    clearData: () => {
        set({ events: [], categories: [] });
    },
}));
