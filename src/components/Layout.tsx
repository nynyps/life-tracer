import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Plus, Activity, LogOut, Settings, User, KeyRound, Trash2, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useLifeStore } from '../store/useLifeStore';
import CategoryManagerModal from './CategoryManagerModal';
import TutorialModal from './TutorialModal';
import { getCategoryIcon } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    onOpenAddModal: () => void;
    zoomLevel: number;
    setZoomLevel: (level: number) => void;
    isCategoryModalOpen: boolean;
    onOpenCategoryManager: () => void;
    onCloseCategoryManager: () => void;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    onOpenAddModal,
    zoomLevel,
    setZoomLevel,
    isCategoryModalOpen,
    onOpenCategoryManager,
    onCloseCategoryManager
}) => {
    const location = useLocation();
    const { user, signOut } = useAuth();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = React.useState(false);
    const categories = useLifeStore((state) => state.categories);

    const navItems = [
        { path: '/', label: 'Tout', icon: Layers },
        ...categories.map(cat => ({
            path: `/category/${cat.id}`,
            label: cat.name,
            icon: getCategoryIcon(cat.icon),
            color: cat.color
        })),
        { path: '/global', label: 'Vue Globale', icon: Activity },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
                <div className="max-w-[1920px] mx-auto px-4 md:px-6 h-16 flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between">
                    <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent justify-self-start">
                        Life Tracer
                    </Link>

                    <div className="hidden md:flex items-center gap-2 justify-center">
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[30vw] xl:max-w-[40vw] pr-2">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        id={item.path === '/global' ? 'tutorial-global-view' : undefined}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${isActive
                                            ? 'bg-white/10 text-white shadow-lg shadow-white/5'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : ''}`} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="w-px h-6 bg-slate-800 mx-1 flex-shrink-0" />
                        <button
                            id="tutorial-categories"
                            onClick={onOpenCategoryManager}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg whitespace-nowrap bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-95 flex-shrink-0"
                            title="Gérer les catégories"
                        >
                            <Settings className="w-4 h-4" />
                            Gérer catégories
                        </button>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4 justify-self-end flex-shrink-0 ml-auto">

                        {/* Zoom Control */}
                        {location.pathname !== '/global' && (
                            <div className="hidden xl:flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-lg border border-white/10 pr-3">
                                <span className="text-[10px] text-slate-400 font-mono tracking-wider ml-1">ZOOM</span>
                                <input
                                    type="range"
                                    min="100"
                                    max="4000"
                                    step="100"
                                    value={zoomLevel}
                                    onChange={(e) => setZoomLevel(Number(e.target.value))}
                                    className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-indigo-400 transition-all"
                                    title="Ajuster l'échelle de temps"
                                />
                                <span className="text-xs text-indigo-400 font-mono w-10 text-right font-bold">
                                    {Math.round((zoomLevel / 1000) * 100)}%
                                </span>
                            </div>
                        )}

                        <button
                            id="tutorial-add-event"
                            onClick={categories.length > 0 ? onOpenAddModal : undefined}
                            disabled={categories.length === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg whitespace-nowrap ${categories.length === 0
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-95'
                                }`}
                            title={categories.length === 0 ? "Créez d'abord une catégorie" : "Ajouter un souvenir"}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Ajouter souvenir</span>
                        </button>

                        {/* Help Button */}
                        <button
                            onClick={() => setIsTutorialOpen(true)}
                            className="p-2 rounded-full text-slate-400 hover:text-indigo-400 hover:bg-white/5 transition-all"
                            title="Tutoriel"
                        >
                            <HelpCircle className="w-5 h-5" />
                        </button>

                        {/* User & Dropdown */}
                        <div className="relative">
                            {isUserMenuOpen && (
                                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                            )}
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className={`flex items-center gap-2 p-2 rounded-full transition-all outline-none relative z-50 ${isUserMenuOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-300">
                                    <User className="w-4 h-4" />
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            <div className={`absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 transition-all duration-200 z-50 ${isUserMenuOpen
                                ? 'visible opacity-100 translate-y-0'
                                : 'invisible opacity-0 translate-y-2'
                                }`}>
                                <div className="px-3 py-3 border-b border-slate-800 mb-1">
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Connecté en tant que</p>
                                    <p className="text-sm text-slate-200 truncate font-semibold">{user?.email}</p>
                                </div>

                                <button
                                    onClick={async () => {
                                        setIsUserMenuOpen(false);
                                        const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '');
                                        if (!error) alert('Email de réinitialisation envoyé !');
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <KeyRound className="w-4 h-4 text-slate-400" />
                                    Changer mot de passe
                                </button>

                                <button
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Supprimer le compte
                                </button>

                                <div className="h-px bg-slate-800 my-1 mx-2" />

                                <button
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        signOut();
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Se déconnecter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-slate-950/90 backdrop-blur-lg pb-safe">
                <div className="flex justify-around p-2">
                    {navItems.slice(0, 5).map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500'
                                    }`}
                            >
                                <Icon className="w-5 h-5 mb-1" />
                                <span className="text-[10px]">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <main className="relative z-10 pt-20 md:pt-24 pb-24 px-4 md:px-6 max-w-[1920px] mx-auto">
                {children}
            </main>

            <CategoryManagerModal
                isOpen={isCategoryModalOpen}
                onClose={onCloseCategoryManager}
            />

            <TutorialModal
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
            />

            {/* Delete Account Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-white mb-2">Supprimer le compte ?</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Cette action est irréversible. Toutes vos données (souvenirs, catégories) seront définitivement effacées.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={async () => {
                                    setIsDeleting(true);
                                    try {
                                        const { error } = await supabase.rpc('delete_user');
                                        if (error) {
                                            console.error('Error deleting account:', error);
                                            alert('Erreur : ' + error.message);
                                            setIsDeleting(false);
                                        } else {
                                            await signOut();
                                            // Redirect or handled by auth state change
                                        }
                                    } catch (err) {
                                        console.error('Unexpected error:', err);
                                        setIsDeleting(false);
                                    }
                                }}
                                disabled={isDeleting}
                                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-red-600/20"
                            >
                                {isDeleting ? 'Suppression en cours...' : 'Oui, supprimer mon compte'}
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                                className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-medium py-3 rounded-xl transition-all"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;
