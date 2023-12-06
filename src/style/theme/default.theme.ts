import { createTheme } from '@mui/material';

export const drawerWidth = 280;

export const DefaultTheme = createTheme({
  breakpoints: {
    keys: ['xs', 'sm', 'md', 'lg', 'xl'],
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
    unit: 'px',
  },
  direction: 'ltr',
  palette: {
    mode: 'dark',
    primary: {
      '50': '#F0F7FF',
      '100': '#C2E0FF',
      '200': '#99CCF3',
      '300': '#66B2FF',
      '400': '#3399FF',
      '500': '#007FFF',
      '600': '#0072E5',
      '700': '#0059B2',
      '800': '#004C99',
      '900': '#003A75',
      main: '#3399FF',
      light: '#66B2FF',
      dark: '#0059B2',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    divider: 'rgba(194, 224, 255, 0.08)',
    background: {
      default: '#001E3C',
      paper: '#001E3C',
    },
    common: {
      black: '#1D1D1D',
      white: '#fff',
    },
    text: {
      primary: '#fff',
      secondary: '#B2BAC2',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    grey: {
      '50': '#F3F6F9',
      '100': '#E7EBF0',
      '200': '#E0E3E7',
      '300': '#CDD2D7',
      '400': '#B2BAC2',
      '500': '#A0AAB4',
      '600': '#6F7E8C',
      '700': '#3E5060',
      '800': '#2D3843',
      '900': '#1A2027',
      A100: '#f5f5f5',
      A200: '#eeeeee',
      A400: '#bdbdbd',
      A700: '#616161',
    },
    error: {
      '50': '#FFF0F1',
      '100': '#FFDBDE',
      '200': '#FFBDC2',
      '300': '#FF99A2',
      '400': '#FF7A86',
      '500': '#FF505F',
      '600': '#EB0014',
      '700': '#C70011',
      '800': '#94000D',
      '900': '#570007',
      main: '#EB0014',
      light: '#FF99A2',
      dark: '#C70011',
      contrastText: '#fff',
    },
    success: {
      '50': '#E9FBF0',
      '100': '#C6F6D9',
      '200': '#9AEFBC',
      '300': '#6AE79C',
      '400': '#3EE07F',
      '500': '#21CC66',
      '600': '#1DB45A',
      '700': '#1AA251',
      '800': '#178D46',
      '900': '#0F5C2E',
      main: '#1DB45A',
      light: '#6AE79C',
      dark: '#1AA251',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    warning: {
      '50': '#FFF9EB',
      '100': '#FFF3C1',
      '200': '#FFECA1',
      '300': '#FFDC48',
      '400': '#F4C000',
      '500': '#DEA500',
      '600': '#D18E00',
      '700': '#AB6800',
      '800': '#8C5800',
      '900': '#5A3600',
      main: '#DEA500',
      light: '#FFDC48',
      dark: '#AB6800',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    secondary: {
      main: '#ce93d8',
      light: '#f3e5f5',
      dark: '#ab47bc',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    info: {
      main: '#29b6f6',
      light: '#4fc3f7',
      dark: '#0288d1',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
    action: {
      active: '#fff',
      hover: 'rgba(255, 255, 255, 0.08)',
      hoverOpacity: 0.08,
      selected: 'rgba(255, 255, 255, 0.16)',
      selectedOpacity: 0.16,
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
      disabledOpacity: 0.38,
      focus: 'rgba(255, 255, 255, 0.12)',
      focusOpacity: 0.12,
      activatedOpacity: 0.24,
    },
  },
  shape: {
    borderRadius: 10,
  },
  unstable_strictMode: true,
  components: {
    MuiMenu: {
      styleOverrides: {
        root: {
          '& .MuiList-root': {
            paddingTop: 0,
            paddingBottom: 0,
            margin: '.3rem',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          '& .MuiToggleButtonGroup-grouped': {
            margin: '.25rem',
            border: 0,
            '&.Mui-disabled': {
              border: 0,
            },
            '&:not(:first-of-type)': {
              borderRadius: 10,
            },
            '&:first-of-type': {
              borderRadius: 10,
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid rgba(194, 224, 255, 0.08)',
        },
      },
    },
  },
  typography: {
    fontFamily:
      '"Source Sans Pro","IBM Plex Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
    h1: {
      fontFamily:
        '"Source Sans Pro","PlusJakartaSans-ExtraBold",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
      fontSize: 'clamp(2.625rem, 1.2857rem + 3.5714vw, 4rem)',
      fontWeight: 800,
      lineHeight: 1.1142857142857143,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
    },
    h2: {
      fontFamily:
        '"Source Sans Pro","PlusJakartaSans-ExtraBold",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
      fontSize: 'clamp(1.5rem, 0.9643rem + 1.4286vw, 2.25rem)',
      fontWeight: 800,
      lineHeight: 1.2222222222222223,
      color: '#E7EBF0',
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
    },
    h3: {
      fontFamily:
        '"Source Sans Pro","PlusJakartaSans-Bold",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
      fontSize: '2.25rem',
      lineHeight: 1.2222222222222223,
      letterSpacing: 0.2,
      fontWeight: 400,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
    },
    h4: {
      fontFamily:
        '"Source Sans Pro","PlusJakartaSans-Bold",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
      fontSize: '1.75rem',
      lineHeight: 1.5,
      letterSpacing: 0.2,
      fontWeight: 400,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
    },
    h5: {
      fontFamily:
        '"Source Sans Pro","PlusJakartaSans-Bold",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
      fontSize: '1.5rem',
      lineHeight: 1.5,
      letterSpacing: 0.1,
      fontWeight: 400,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
    },
    h6: {
      fontSize: '1.25rem',
      lineHeight: 1.5,
      fontFamily:
        '"Source Sans Pro","IBM Plex Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
      fontWeight: 500,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
    },
    button: {
      textTransform: 'initial',
      fontWeight: 700,
      letterSpacing: 0,
      fontFamily:
        '"Source Sans Pro","IBM Plex Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
      fontSize: '0.875rem',
      lineHeight: 1.75,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
    },
    subtitle1: {
      fontSize: '1.125rem',
      lineHeight: 1.3333333333333333,
      letterSpacing: 0,
      fontWeight: 500,
      fontFamily:
        '"Source Sans Pro","IBM Plex Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: 0,
      fontFamily:
        '"Source Sans Pro","IBM Plex Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
      fontWeight: 400,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: 0,
      fontFamily:
        '"Source Sans Pro","IBM Plex Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
      fontWeight: 400,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
    },
    caption: {
      display: 'inline-block',
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: 0,
      fontWeight: 700,
      fontFamily:
        '"Source Sans Pro","IBM Plex Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
    },
    allVariants: {
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
    },
    htmlFontSize: 16,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    subtitle2: {
      fontFamily:
        '"Source Sans Pro","IBM Plex Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.57,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
    },
    overline: {
      fontFamily:
        '"Source Sans Pro","IBM Plex Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 2.66,
      textTransform: 'uppercase',
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
    },
  },
  mixins: {
    toolbar: {
      minHeight: 56,
      '@media (min-width:0px)': {
        '@media (orientation: landscape)': {
          minHeight: 48,
        },
      },
      '@media (min-width:600px)': {
        minHeight: 64,
      },
    },
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
    '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
    '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
    '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
    '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
    '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
    '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
    '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
    '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
    '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
    '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
    '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
    '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
    '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
    '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
  ],
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
  zIndex: {
    mobileStepper: 1000,
    fab: 1050,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
});
