import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryHover: string;
      error: string;
      errorHover: string;
      text: {
        primary: string;
        light: string;
      };
      border: string;
      background: {
        primary: string;
        secondary: string;
      };
    };
    fonts: {
      primary: string;
      display: string;
    };
    breakpoints: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  }
} 