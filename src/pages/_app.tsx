import "@/styles/globals.css";
import { useState } from "react";
import type { AppProps } from "next/app";
import { MantineProvider } from '@mantine/core';
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default function AppWrapper(props: AppProps) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={props.pageProps.initialSession}
    >
      <MantineProvider 
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: 'light',
        }}>
        <App {...props} />
      </MantineProvider>
    </SessionContextProvider>
  );
}
