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
      </Head>   
      <NavigationBar/>
      <main>
        {children}
      </main>
    </>
  );
}

export default DefaultLayout;
