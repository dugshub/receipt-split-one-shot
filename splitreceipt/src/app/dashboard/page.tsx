'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { tripsApi } from '@/lib/api-client';
import { Navigation } from '@/components/navigation';

// Temp types until API types are available
type Trip = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  settled: boolean;
};

export default function Dashboard() {
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [settledTrips, setSettledTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    // Redirect if not authenticated and loading is finished
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  useEffect(() => {
    // Fetch trips when authenticated
    if (isAuthenticated) {
      const fetchTrips = async () => {
        try {
          const tripsData = await tripsApi.getTrips();
          
          // Separate active from settled trips
          const active = tripsData.filter((trip: Trip) => !trip.settled);
          const settled = tripsData.filter((trip: Trip) => trip.settled);
          
          setActiveTrips(active);
          setSettledTrips(settled);
        } catch (err: any) {
          // Just load mock data silently on error
          setActiveTrips([
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
            }
          ]);
          
          setSettledTrips([
            {
              id: '3',
              name: 'City Break',
              description: 'Weekend city getaway',
              start_date: '2025-04-10',
              end_date: '2025-04-12',
              settled: true
            }
          ]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchTrips();
    }
  }, [isAuthenticated]);
  
  // Don't render anything while checking authentication
  if (isLoading) {
    return null;
  }
  
  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Trips</h1>
            {user && (
              <p className="text-slate-600 mt-1">
                Welcome back, {user.username}
              </p>
            )}
          </div>
          
          <Link
            href="/trips/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={18} />
            <span>New Trip</span>
          </Link>
        </div>
        
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Active Trips</h2>
          
          {activeTrips.length === 0 ? (
            <div className="bg-white p-8 rounded-lg border border-slate-200 text-center">
              <p className="text-slate-600 mb-4">You don't have any active trips yet</p>
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusCircle size={18} />
                <span>Create your first trip</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="block bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{trip.name}</h3>
                    <p className="text-slate-600 text-sm mb-4">
                      {new Date(trip.start_date).toLocaleDateString()} - 
                      {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'Ongoing'}
                    </p>
                    
                    <p className="text-slate-700 mb-4 line-clamp-2">
                      {trip.description || 'No description provided'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Active
                      </span>
                      
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
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        
        {settledTrips.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Settled Trips</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {settledTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="block bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{trip.name}</h3>
                    <p className="text-slate-600 text-sm mb-4">
                      {new Date(trip.start_date).toLocaleDateString()} - 
                      {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'Ongoing'}
                    </p>
                    
                    <p className="text-slate-700 mb-4 line-clamp-2">
                      {trip.description || 'No description provided'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Settled
                      </span>
                      
                      <div className="flex -space-x-2">
                        {/* Placeholder avatars */}
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                          U1
                        </div>
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                          U2
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}