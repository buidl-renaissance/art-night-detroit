import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import { NextSeo } from "next-seo";

const theme = {
  colors: {
    primary: "#6c63ff",
    primaryHover: "#5a52d5",
    text: "#333",
    textLight: "#666",
    border: "#ddd",
    background: "#fff",
  },
  fonts: {
    primary: "'Inter', sans-serif",
    display: "'Baloo 2', cursive",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1440px",
  }
};

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: ${props => props.theme.fonts.primary};
    color: ${props => props.theme.colors.text};
    background-color: #f5f5f5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${props => props.theme.fonts.display};
  }

  button {
    font-family: ${props => props.theme.fonts.primary};
  }
`;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Component {...pageProps} />
      {pageProps.meta && <NextSeo
        title={pageProps.meta.title}
        description={pageProps.meta.description}
        openGraph={{
          type: "website",
          title: pageProps.meta.title,
          description: pageProps.meta.description,
          images: [
            {
              url: pageProps.meta.image,
            }
          ]
        }}
      />}
    </ThemeProvider>
  );
}
