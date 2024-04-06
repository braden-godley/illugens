import React, { type PropsWithChildren } from "react";
import Head from "next/head";
import NavigationBar from "@/components/NavigationBar";

type LayoutProps = {
  title: string;
};

const DefaultLayout: React.FC<PropsWithChildren<LayoutProps>> = ({ children, title }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Illusions At Your Fingertips" />
        <link rel="icon" href="/favicon.ico" />
      </Head>   
      <NavigationBar/>
      <main className="min-h-screen bg-background text-foreground">
        {children}
      </main>
    </>
  );
}

export default DefaultLayout;
