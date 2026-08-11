import { theme } from 'antd';

const { defaultAlgorithm } = theme;

// Aurora Design System Colors
const auroraColors = {
  primary: '#4f46e5',      // Azul Royal
  secondary: '#a78bfa',    // Lilás
  success: '#34d399',      // Verde Kawasaki
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const auroraTheme = {
  algorithm: defaultAlgorithm,
  token: {
    colorPrimary: auroraColors.primary,
    colorSuccess: auroraColors.success,
    colorWarning: auroraColors.warning,
    colorError: auroraColors.error,
    colorInfo: auroraColors.info,
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgSpotlight: '#faf5ff',
    colorBorder: '#e9d5ff',
    colorBorderSecondary: '#d8b4fe',
    colorText: '#1a1a2e',
    colorTextSecondary: '#64748b',
    colorTextTertiary: '#94a3b8',
    colorTextQuaternary: '#cbd5e1',
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    borderRadiusXS: 4,
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    controlHeight: 48,
    controlHeightLG: 56,
    controlHeightSM: 36,
  },
  components: {
    Button: {
      primaryShadow: '0 10px 24px rgba(79, 70, 229, 0.28)',
      paddingInline: 24,
      paddingBlock: 12,
      borderRadius: 12,
      fontWeight: 600,
    },
    Input: {
      borderRadius: 12,
      paddingInline: 16,
      paddingBlock: 10,
      colorBorder: '#e2e8f0',
      colorBorderHover: '#4f46e5',
      colorPrimaryHover: '#4f46e5',
    },
    Card: {
      borderRadiusLG: 16,
      paddingLG: 24,
    },
    Form: {
      itemMarginBottom: 16,
    },
    Select: {
      borderRadius: 12,
      controlHeight: 48,
    },
    Checkbox: {
      borderRadius: 6,
      colorPrimary: '#4f46e5',
    },
    Radio: {
      colorPrimary: '#4f46e5',
      buttonBg: '#faf5ff',
      buttonSolidCheckedBg: '#4f46e5',
    },
    Steps: {
      colorPrimary: '#4f46e5',
    },
    Progress: {
      colorSuccess: '#34d399',
    },
    Alert: {
      borderRadius: 12,
      padding: 16,
    },
  },
};

export default auroraTheme;
