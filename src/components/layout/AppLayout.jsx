import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function toggleSidebarCollapse() {
    setIsSidebarCollapsed((collapsed) => !collapsed);
  }

  return (
    <div className={styles.layout}>
      <Sidebar
        isOpen={isMenuOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={closeMenu}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <div className={styles.main}>
        <Header />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
