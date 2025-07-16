
import Sidebar from '@/components/sidebar';
import { Metadata } from 'next';
import React from 'react'


export const metadata: Metadata = {
    title: "Dashboard",
    description: "Admin Dashboard",
  };
  

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar />
      
            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10">
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, Admin!</p>
              </header>
      
              {/* Table Section */}
             {children}
            </main>
          </div>
    );
  }
  
