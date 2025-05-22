import * as React from "react";
import Link from 'next/link';
import { Logo } from "@/components/logo";
import { Navigation } from "@/components/navigation";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navigation />
      <div className="flex flex-col items-center justify-center flex-grow p-8 sm:p-20">
        <main className="container mx-auto flex flex-col items-center text-center">
          <Logo width={200} height={55} className="mb-8" />
          
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome to SplitReceipt
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-2xl">
            The easiest way to split expenses with friends and track who owes what.
            Perfect for trips, events, and shared living situations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
            
            <Link
              href="/auth/register"
              className="px-6 py-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Create Account
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full max-w-5xl">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold mb-3">Track Expenses</h3>
              <p className="text-slate-600">
                Add receipts with details and assign them to specific trips or events.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold mb-3">Split Fairly</h3>
              <p className="text-slate-600">
                Divide expenses evenly or by specific amounts for each person.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold mb-3">Settle Debts</h3>
              <p className="text-slate-600">
                See who owes what and settle balances with minimal transactions.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}