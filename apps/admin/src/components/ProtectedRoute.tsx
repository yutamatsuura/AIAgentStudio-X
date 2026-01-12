/**
 * ProtectedRoute コンポーネント
 *
 * 認証済みユーザーのみアクセス可能なルートを保護
 */

import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

/**
 * プロパティ
 */
interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // ローディング中
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 未認証の場合はログインページにリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
