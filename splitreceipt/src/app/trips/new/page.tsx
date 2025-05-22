'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function NewTripPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Set default dates
  useEffect(() => {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    
    setStartDate(formattedToday);
    
    // Default end date to today + 7 days
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const formattedNextWeek = nextWeek.toISOString().split('T')[0];
    
    setEndDate(formattedNextWeek);
  }, []);
  
  useEffect(() => {
    // Redirect if not authenticated and loading is finished
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Trip name is required');
      return;
    }
    
    if (!startDate) {
      setError('Start date is required');
      return;
    }
    
    setLoading(true);
    
    try {
      // Since the API isn't connected, we'll just simulate a successful trip creation
      setTimeout(() => {
        // Redirect to the trips page
        router.push('/trips');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to create trip');
      setLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back button */}
        <Link 
          href="/trips" 
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          <span>Back to Trips</span>
        </Link>
        
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h1 className="text-2xl font-bold mb-6">Create New Trip</h1>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Trip Name *
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Beach Vacation, Family Trip, etc."
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this trip is about..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">
                  Start Date *
                </label>
                <input
                  id="startDate"
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  id="endDate"
                  type="date"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="pt-4">
              <div className="flex flex-col-reverse md:flex-row justify-end gap-3">
                <Link
                  href="/trips"
                  className="px-4 py-2 text-center text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </Link>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Trip'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}