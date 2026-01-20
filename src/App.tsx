import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Timeline from './components/Timeline';
import GlobalTimeline from './components/GlobalTimeline';
import CreateEventModal from './components/CreateEventModal';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useLifeStore } from './store/useLifeStore';
import type { LifeEvent } from './types';
import { useParams } from 'react-router-dom';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="text-slate-400 text-lg font-medium">Chargement de votre vie...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Component to handle category-specific view
const CategoryRoute: React.FC<{
  onEdit: (e: LifeEvent) => void;
  onDelete: (id: string) => void;
  onToggleImportant: (e: LifeEvent) => void;
  pixelsPerYear: number;
}> = (props) => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const events = useLifeStore((state) => state.events);
  const filteredEvents = events.filter(e => e.categoryId === categoryId);

  return <Timeline events={filteredEvents} selectedCategoryId={categoryId} {...props} />;
};

// Main app content (extracted for auth context access)
function AppContent() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LifeEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pixelsPerYear, setPixelsPerYear] = useState(100);

  const events = useLifeStore((state) => state.events);
  const fetchInitialData = useLifeStore((state) => state.fetchInitialData);
  const deleteEvent = useLifeStore((state) => state.deleteEvent);
  const updateEvent = useLifeStore((state) => state.updateEvent);
  const clearData = useLifeStore((state) => state.clearData);

  // Fetch events when user logs in
  useEffect(() => {
    if (user) {
      console.log('App: User detected, fetching data...');
      fetchInitialData();
    } else {
      console.log('App: No user, clearing data...');
      clearData();
    }
  }, [user, fetchInitialData, clearData]);

  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: LifeEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingEventId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEventId) return;
    setIsDeleting(true);
    await deleteEvent(deletingEventId);
    setIsDeleting(false);
    setDeletingEventId(null);
  };

  const handleToggleImportant = (event: LifeEvent) => {
    updateEvent(event.id, { isImportant: !event.isImportant });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const commonProps = {
    onEdit: handleEdit,
    onDelete: handleDelete,
    onToggleImportant: handleToggleImportant,
    pixelsPerYear,
    onOpenCategoryManager: () => setIsCategoryManagerOpen(true),
    onOpenAddModal: handleOpenAddModal,
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout
                onOpenAddModal={handleOpenAddModal}
                zoomLevel={pixelsPerYear}
                setZoomLevel={setPixelsPerYear}
                isCategoryModalOpen={isCategoryManagerOpen}
                onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
                onCloseCategoryManager={() => setIsCategoryManagerOpen(false)}
              >
                <Routes>
                  <Route path="/" element={<Timeline events={events} {...commonProps} />} />
                  <Route path="/category/:categoryId" element={<CategoryRoute {...commonProps} />} />
                  <Route path="/global" element={<GlobalTimeline events={events} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>

      <CreateEventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={editingEvent}
      />

      {/* Delete Confirmation Modal */}
      {deletingEventId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100">
                Supprimer ce souvenir ?
              </h3>
            </div>
            <p className="text-slate-400 mb-6">
              Cette action est irréversible. Le souvenir sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
              <button
                onClick={() => setDeletingEventId(null)}
                disabled={isDeleting}
                className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-medium py-2.5 rounded-xl transition-all active:scale-[0.98]"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
