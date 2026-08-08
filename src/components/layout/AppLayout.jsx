import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function toggleMenu() {
    setIsMenuOpen((open) => !open);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isMenuOpen} onClose={closeMenu} />

      <div className={styles.main}>
        <Header onMenuClick={toggleMenu} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
