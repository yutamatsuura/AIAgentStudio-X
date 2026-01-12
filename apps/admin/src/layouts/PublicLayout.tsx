/**
 * PublicLayout コンポーネント
 *
 * ログインページなどの公開ページ用レイアウト
 */

import { Box, AppBar, Toolbar, Typography } from '@mui/material';
import type { ReactNode } from 'react';

/**
 * プロパティ
 */
interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * PublicLayout
 */
export const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AIAgentStudio-X 管理画面
          </Typography>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default',
          padding: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
