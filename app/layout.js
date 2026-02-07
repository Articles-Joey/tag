// import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from 'react';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';

import "bootstrap/dist/css/bootstrap.min.css";

// import "./globals.css";
import "@/styles/index.scss";

import "@articles-media/articles-dev-box/dist/style.css";

import "@articles-media/articles-gamepad-helper/dist/articles-gamepad-helper.css";

// import SocketLogicHandler from "@/components/SocketLogicHandler";
import DarkModeHandler from '@/components/UI/DarkModeHandler';
import GlobalClientModals from '@/components/UI/GlobalClientModals';
import LayoutClient from './layout-client';

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata = {
  title: "Tag",
  description: "Multiplayer Peer-to-peer tag game built with React Three Fiber and Next.js. Run, hide, and tag your friends in a fun and dynamic 3D environment. Join the chase and see if you can avoid being 'it' in this fast-paced game of tag!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <head>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap" rel="stylesheet"></link>

        {/* <link
          rel="stylesheet"
          href={`${process.env.NEXT_PUBLIC_CDN}fonts/fontawsome/css/all.min.css`}
        /> */}

      </head>

      <body
      // className={`${geistSans.variable} ${geistMono.variable}`}
      >

        <Suspense>
          {/* <SocketLogicHandler /> */}
          <LayoutClient />
          <DarkModeHandler />
          <GlobalClientModals />
        </Suspense>

        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
