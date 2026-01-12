import type { Components, Theme } from '@mui/material/styles';

/**
 * モダンSaaS型コンポーネントカスタマイズ
 *
 * 設計方針:
 * - フラットデザイン + 適度なシャドウ
 * - ホバー時の視覚的フィードバック
 * - テーブルビューの情報密度向上
 * - 折りたたみ可能サイドバー対応
 */

export const components: Components<Theme> = {
  // ボタンのカスタマイズ
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        padding: '8px 16px',
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-1px)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        },
      },
      outlined: {
        borderWidth: 1.5,
        '&:hover': {
          borderWidth: 1.5,
        },
      },
    },
    defaultProps: {
      disableElevation: false,
    },
  },

  // カードのカスタマイズ
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },

  // Paperのカスタマイズ
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
      elevation1: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      elevation2: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
      elevation3: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    },
  },

  // AppBarのカスタマイズ
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
      },
    },
    defaultProps: {
      elevation: 0,
    },
  },

  // Drawerのカスタマイズ（折りたたみサイドバー対応）
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: '1px solid #E0E0E0',
        boxShadow: 'none',
        backgroundColor: '#FFFFFF',
      },
    },
  },

  // テーブルのカスタマイズ（情報密度向上）
  MuiTable: {
    styleOverrides: {
      root: {
        borderCollapse: 'separate',
        borderSpacing: 0,
      },
    },
  },

  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: '#F5F7FA',
        '& .MuiTableCell-root': {
          fontWeight: 600,
          color: '#212121',
          borderBottom: '2px solid #E0E0E0',
        },
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: '12px 16px',
        fontSize: '0.875rem',
        borderBottom: '1px solid #F0F0F0',
      },
      head: {
        fontSize: '0.875rem',
        fontWeight: 600,
      },
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: '#F5F7FA',
        },
        '&.Mui-selected': {
          backgroundColor: '#E3F2FD',
          '&:hover': {
            backgroundColor: '#BBDEFB',
          },
        },
      },
    },
  },

  // インプットフィールドのカスタマイズ
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
    },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 6,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976D2',
          },
        },
      },
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderWidth: 2,
        },
      },
      notchedOutline: {
        borderColor: '#E0E0E0',
      },
    },
  },

  // リストアイテムのカスタマイズ（サイドバー用）
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        margin: '4px 8px',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: '#F5F7FA',
        },
        '&.Mui-selected': {
          backgroundColor: '#E3F2FD',
          '&:hover': {
            backgroundColor: '#BBDEFB',
          },
        },
      },
    },
  },

  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: 40,
        color: '#757575',
      },
    },
  },

  // チップのカスタマイズ
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontWeight: 500,
      },
    },
  },

  // タブのカスタマイズ
  MuiTabs: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid #E0E0E0',
      },
      indicator: {
        height: 3,
        borderRadius: '3px 3px 0 0',
      },
    },
  },

  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.875rem',
        minHeight: 48,
        '&.Mui-selected': {
          fontWeight: 600,
        },
      },
    },
  },

  // ツールチップのカスタマイズ
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: '#424242',
        fontSize: '0.75rem',
        borderRadius: 4,
        padding: '6px 12px',
      },
    },
  },

  // ダイアログのカスタマイズ
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      },
    },
  },

  // アラートのカスタマイズ
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontSize: '0.875rem',
      },
      standardSuccess: {
        backgroundColor: '#E8F5E9',
        color: '#2E7D32',
      },
      standardError: {
        backgroundColor: '#FFEBEE',
        color: '#C62828',
      },
      standardWarning: {
        backgroundColor: '#FFF3E0',
        color: '#E65100',
      },
      standardInfo: {
        backgroundColor: '#E3F2FD',
        color: '#1565C0',
      },
    },
  },
};
