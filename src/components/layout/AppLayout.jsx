import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  function toggleMenu() {
    if (window.matchMedia('(max-width: 768px)').matches) {
      setIsMenuOpen((open) => !open);
      return;
    }

    setIsSidebarCollapsed((collapsed) => !collapsed);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function toggleSidebarCollapse() {
    setIsSidebarCollapsed((collapsed) => !collapsed);
  }

  const isMobileViewport =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  const menuAriaLabel = isMobileViewport
    ? isMenuOpen
      ? 'Close navigation menu'
      : 'Open navigation menu'
    : isSidebarCollapsed
      ? 'Expand sidebar'
      : 'Collapse sidebar';

  return (
    <div className={styles.layout}>
      <Sidebar
        isOpen={isMenuOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={closeMenu}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <div className={styles.main}>
        <Header
          onMenuClick={toggleMenu}
          isSidebarCollapsed={isSidebarCollapsed}
          isMobileMenuOpen={isMenuOpen}
          menuAriaLabel={menuAriaLabel}
        />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
