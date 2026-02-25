import { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useIsMobile } from '@/shared/hooks/useMediaQuery';
import { PageProvider } from '@/shared/context/PageContext';

export function AppShell() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  // Scroll para o topo ao mudar de rota
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <PageProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--surface-page)]">
        {/* Sidebar desktop */}
        {!isMobile && (
          <div className="hidden lg:block lg:shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Sidebar mobile (drawer) */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-[var(--surface-overlay)] backdrop-blur-[1px]"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="fixed inset-y-0 left-0 z-50 w-[280px]"
              >
                <Sidebar mobile onClose={() => setSidebarOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Conteúdo principal */}
        <div className="flex flex-1 flex-col overflow-x-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main ref={mainRef} className="flex-1 overflow-y-auto bg-[var(--surface-page)] custom-scrollbar">
            <Outlet />
          </main>
        </div>
      </div>
    </PageProvider>
  );
}
