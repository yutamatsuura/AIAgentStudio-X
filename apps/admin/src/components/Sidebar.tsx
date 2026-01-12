/**
 * Sidebar コンポーネント
 *
 * ナビゲーションドロワー
 */

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * ドロワー幅
 */
const DRAWER_WIDTH = 240;

/**
 * ナビゲーションアイテム
 */
interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'プロンプト管理',
    path: '/prompts',
    icon: <DescriptionIcon />,
  },
  {
    label: 'ユーザー管理',
    path: '/users',
    icon: <PeopleIcon />,
  },
  {
    label: 'システム設定',
    path: '/settings',
    icon: <SettingsIcon />,
  },
];

/**
 * プロパティ
 */
interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Sidebar
 */
export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const drawerContent = (
    <>
      <Toolbar />
      <Divider />
      <List>
        {NAVIGATION_ITEMS.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <>
      {/* デスクトップ用 */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* モバイル用 */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // パフォーマンス向上
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
