'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Filter, Calendar, SortAsc, SortDesc } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

// Temp types until API types are available
type Trip = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  settled: boolean;
};

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'settled'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    // Redirect if not authenticated and loading is finished
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  useEffect(() => {
    // Fetch trips when authenticated
    if (isAuthenticated) {
      // Simulate API fetch with mock data for demo
      setTimeout(() => {
        const mockTrips: Trip[] = [
          {
            id: '1',
            name: 'Beach Vacation',
            description: 'Summer trip to the beach',
            start_date: '2025-07-15',
            end_date: '2025-07-22',
            settled: false
          },
          {
            id: '2',
            name: 'Camping Weekend',
            description: 'Weekend camping trip',
            start_date: '2025-08-05',
            end_date: '2025-08-07',
            settled: false
          },
          {
            id: '3',
            name: 'City Break',
            description: 'Weekend city getaway',
            start_date: '2025-04-10',
            end_date: '2025-04-12',
            settled: true
          },
          {
            id: '4',
            name: 'Ski Trip',
            description: 'Winter vacation in the mountains',
            start_date: '2025-12-20',
            end_date: '2025-12-27',
            settled: false
          },
          {
            id: '5',
            name: 'Birthday Dinner',
            description: 'Celebration at fancy restaurant',
            start_date: '2025-06-15',
            end_date: '2025-06-15',
            settled: true
          }
        ];
        
        setTrips(mockTrips);
        setLoading(false);
      }, 500);
    }
  }, [isAuthenticated]);
  
  // Filter trips based on selected filter
  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true;
    if (filter === 'active') return !trip.settled;
    if (filter === 'settled') return trip.settled;
    return true;
  });
  
  // Sort trips based on selected order
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    const dateA = new Date(a.start_date).getTime();
    const dateB = new Date(b.start_date).getTime();
    
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });
  
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Trips</h1>
            <p className="text-slate-600 mt-1">
              Manage and view all your trips
            </p>
          </div>
          
          <Link
            href="/trips/new"
            className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={18} />
            <span>New Trip</span>
          </Link>
        </div>
        
        {/* Filters and Sorting */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Filter:</span>
              <div className="flex bg-slate-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-1.5 text-sm ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-4 py-1.5 text-sm ${
                    filter === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter('settled')}
                  className={`px-4 py-1.5 text-sm ${
                    filter === 'settled'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Settled
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Sort by date:</span>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-1 px-4 py-1.5 text-sm bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200"
              >
                {sortOrder === 'asc' ? (
                  <>
                    <SortAsc size={16} />
                    <span>Oldest first</span>
                  </>
                ) : (
                  <>
                    <SortDesc size={16} />
                    <span>Newest first</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Trips List */}
        {sortedTrips.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-slate-200 text-center">
            <p className="text-slate-600 mb-4">You don't have any trips yet</p>
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle size={18} />
              <span>Create your first trip</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">{trip.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          trip.settled 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {trip.settled ? 'Settled' : 'Active'}
                        </span>
                      </div>
                      
                      <p className="text-slate-600 text-sm mt-1">
                        {new Date(trip.start_date).toLocaleDateString()} 
                        {trip.end_date && trip.start_date !== trip.end_date && (
                          <> - {new Date(trip.end_date).toLocaleDateString()}</>
                        )}
                      </p>
                      
                      <p className="text-slate-700 mt-3">
                        {trip.description || 'No description provided'}
                      </p>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col md:items-end justify-between">
                      <div className="flex -space-x-2">
                        {/* Placeholder avatars - would be replaced with actual member avatars */}
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                          U1
                        </div>
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                          U2
                        </div>
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                          +2
                        </div>
                      </div>
                      
                      <Link
                        href={`/trips/${trip.id}`}
                        className="mt-4 px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}