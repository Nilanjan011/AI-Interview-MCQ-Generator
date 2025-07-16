
import { Metadata } from 'next';
import React from 'react'


export const metadata: Metadata = {
    title: "Sign Up",
    description: "Sign up",
  };
  

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <section>
        {children}
      </section>
    );
  }
  
