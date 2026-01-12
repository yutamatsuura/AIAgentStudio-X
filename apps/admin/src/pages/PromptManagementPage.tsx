/**
 * PromptManagementPage コンポーネント
 *
 * プロンプト管理ページ（準備中）
 */

import { Box, Typography, Paper } from '@mui/material';

/**
 * PromptManagementPage
 */
export const PromptManagementPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        プロンプト管理
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          このページは準備中です。
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Phase 0-4のプロンプト管理機能を実装予定です。
        </Typography>
      </Paper>
    </Box>
  );
};
