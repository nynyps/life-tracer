import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Heart, Plus, Activity, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLifeStore } from '../store/useLifeStore';
import CategoryManagerModal from './CategoryManagerModal';

interface LayoutProps {
    children: React.ReactNode;
    onOpenAddModal: () => void;
    zoomLevel: number;
    setZoomLevel: (level: number) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onOpenAddModal, zoomLevel, setZoomLevel }) => {
    const location = useLocation();
    const { user, signOut } = useAuth();
    const categories = useLifeStore((state) => state.categories);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);

    const navItems = [
        { path: '/', label: 'Tout', icon: Layers },
        ...categories.map(cat => ({
            path: `/category/${cat.id}`,
            label: cat.name,
            icon: Heart,
            color: cat.color
        })),
        { path: '/global', label: 'Vue Globale', icon: Activity },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
                <div className="max-w-[1920px] mx-auto px-6 h-16 flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between">
                    <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent justify-self-start">
                        Life Tracer
                    </Link>

                    <div className="hidden md:flex gap-1 justify-center">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                                        ? 'bg-white/10 text-white shadow-lg shadow-white/5'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : ''}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-slate-300 transition-all ml-1"
                            title="Gérer les catégories"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4 justify-self-end">

                        {/* Zoom Control */}
                        <div className="hidden sm:flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-lg border border-white/10 pr-3">
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

                        <button
                            onClick={onOpenAddModal}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Ajouter</span>
                        </button>

                        {/* User & Logout */}
                        <div className="flex items-center gap-3">
                            <span className="hidden md:block text-xs text-slate-500 truncate max-w-[150px]">
                                {user?.email}
                            </span>
                            <button
                                onClick={signOut}
                                className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-all"
                                title="Se déconnecter"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
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

            <main className="relative z-10 pt-24 pb-24 px-6 max-w-[1920px] mx-auto">
                {children}
            </main>

            <CategoryManagerModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
            />
        </div>
    );
};

export default Layout;
