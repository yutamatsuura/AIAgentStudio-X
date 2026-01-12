/**
 * UserManagementPage コンポーネント
 *
 * ユーザー管理ページ（準備中）
 */

import { Box, Typography, Paper } from '@mui/material';

/**
 * UserManagementPage
 */
export const UserManagementPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        ユーザー管理
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          このページは準備中です。
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          ユーザーの作成・編集・削除機能を実装予定です。
        </Typography>
      </Paper>
    </Box>
  );
};
