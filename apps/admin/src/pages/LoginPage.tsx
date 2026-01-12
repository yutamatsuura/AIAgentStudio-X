/**
 * LoginPage コンポーネント
 *
 * ログインページ
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { logger } from '../lib/logger';

/**
 * LoginPage
 */
export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password, rememberMe });
      logger.info('Login successful, redirecting to /prompts');
      navigate('/prompts');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ログインに失敗しました';
      setError(message);
      logger.error('Login failed', { error: err });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, width: '100%' }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            ログイン
          </Typography>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            管理画面にアクセスするにはログインしてください
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="メールアドレス"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="email"
            />

            <TextField
              label="パスワード"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="current-password"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label="ログイン状態を保持"
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{ mb: 3 }}
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
            <Typography variant="caption" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
              デモアカウント
            </Typography>
            <Typography variant="caption" component="div" sx={{ mb: 1 }}>
              <strong>管理者:</strong>
              <br />
              admin@aiagent-studio-x.local
              <br />
              DevAdmin2026!
            </Typography>
            <Typography variant="caption" component="div">
              <strong>一般ユーザー:</strong>
              <br />
              testuser@aiagent-studio-x.local
              <br />
              TestUser2026!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
