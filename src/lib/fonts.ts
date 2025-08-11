import { Inter, Baloo_2 } from 'next/font/google';

// Define fonts that can be loaded dynamically
export const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const baloo2 = Baloo_2({ 
  subsets: ['latin'],
  variable: '--font-baloo-2',
  display: 'swap',
  weight: ['400', '600', '700'],
});

// Function to load fonts dynamically on specific pages
export const loadPageFonts = (fontNames: string[]) => {
  const fonts = [];
  
  if (fontNames.includes('inter')) {
    fonts.push(inter);
  }
  
  if (fontNames.includes('baloo2')) {
    fonts.push(baloo2);
  }
  
  return fonts;
};

// CSS variables for use in styled-components
export const getFontCSSVariables = (fontNames: string[]) => {
  const variables: string[] = [];
  
  if (fontNames.includes('inter')) {
    variables.push(inter.style.fontFamily);
  }
  
  if (fontNames.includes('baloo2')) {
    variables.push(baloo2.style.fontFamily);
  }
  
  return variables.join('; ');
};
