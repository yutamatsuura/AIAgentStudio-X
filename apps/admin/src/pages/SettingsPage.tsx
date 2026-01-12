/**
 * SettingsPage コンポーネント
 *
 * システム設定ページ（準備中）
 */

import { Box, Typography, Paper } from '@mui/material';

/**
 * SettingsPage
 */
export const SettingsPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        システム設定
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          このページは準備中です。
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          APIキー管理、監査ログ閲覧などの機能を実装予定です。
        </Typography>
      </Paper>
    </Box>
  );
};
