/**
 * MainLayout コンポーネント
 *
 * 認証後のメインレイアウト（Header + Sidebar + コンテンツ）
 */

import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import type { ReactNode } from 'react';

/**
 * プロパティ
 */
interface MainLayoutProps {
  children: ReactNode;
}

/**
 * MainLayout
 */
export const MainLayout = ({ children }: MainLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* ヘッダー */}
      <Header onMenuClick={handleDrawerToggle} />

      {/* サイドバー */}
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} />

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
