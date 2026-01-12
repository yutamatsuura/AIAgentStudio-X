/**
 * DashboardPage コンポーネント
 *
 * ダッシュボードページ（準備中）
 */

import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

/**
 * DashboardPage
 */
export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        ダッシュボード
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          ようこそ、{user?.name}さん
        </Typography>
        <Typography variant="body1" color="text.secondary">
          このページは準備中です。
        </Typography>
      </Paper>
    </Box>
  );
};
