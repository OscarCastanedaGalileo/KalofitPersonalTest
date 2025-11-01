import { lightGreen, orange } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const palettes = {
  light: {
    mode: 'light',
    background: { default: '#C1CCCC', paper: '#C1CCCC' },
    onBackground: { main: '#0D1220' },
    onBackgroundVariant: { main: '#b3b3b3' },
    primary: { main: '#35CC8C' },
    onPrimary: { main: '#000000' },
    secondary: { main: '#AA9BD2' },
    surfacePrimary: { main: '#E3E7E6' },
    onSurfacePrimary: { main: '#0D1220' },
    surfaceVariant: { main: '#D1D5D4' },
    onSurfaceVariant: { main: '#4A5251' },
    outline: { main: '#707070' },
    outlineVariant: { main: '#D1D5D4' },
    boottonBarContainer: { main: '#E3E7E6' },
    navigationItem: { main: '#FFFFFF' },
    read: { main: '#FF0000' },
    orange: { main: orange[500] },
    lightGreen: { main: lightGreen[500] },
    green: { main: '#008000' },
    danger: { main: '#B00020' },
    // app specific tokens
    donutTrack: { main: '#2d4b48' },
    donutBar: { main: '#ffd166' },
    buttonBorder: { main: '#264745' },
    waterContainerBg: { main: '#4A4A4A' },
    waterGradientStart: { main: '#007bff' },
    waterGradientEnd: { main: '#3fa0ff' },
  },
  dark: {
    mode: 'dark',
    background: { default: '#122B2A', paper: '#122B2A' },
    onBackground: { main: '#b3b3b3' },
    onBackgroundVariant: { main: '#6E7179' },
    primary: { main: '#67E67C' },
    onPrimary: { main: '#242833' },
    secondary: { main: '#AA9BD2' },
    surfacePrimary: { main: '#242833' },
    onSurfacePrimary: { main: '#E6E6E6' },
    surfaceVariant: { main: '#3E414D' },
    onSurfaceVariant: { main: '#808080' },
    outline: { main: '#6E7179' },
    outlineVariant: { main: '#242833' },
    boottonBarContainer: { main: '#073622' },
    navigationItem: { main: '#49D199' },
    read: { main: '#B24F58' },
    orange: { main: '#CB7F5B' },
    lightGreen: { main: '#41FFBB' },
    green: { main: '#2DAE77' },
    danger: { main: '#FE7B72' },
    // app specific tokens
    donutTrack: { main: '#2d4b48' },
    donutBar: { main: '#ffd166' },
    buttonBorder: { main: '#264745' },
    waterContainerBg: { main: '#4A4A4A' },
    waterGradientStart: { main: '#007bff' },
    waterGradientEnd: { main: '#3fa0ff' },
  },
};

const getThemePalette = (mode) => palettes[mode] || palettes.dark;

export const getCustomTheme = (mode) => {
  return createTheme({
    palette: {
      ...getThemePalette(mode),
    },
    typography: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    },
  });
}
