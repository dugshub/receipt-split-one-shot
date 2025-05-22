'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  PlusCircle, 
  DollarSign, 
  Users, 
  Receipt as ReceiptIcon,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';
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

type Receipt = {
  id: string;
  title: string;
  date: string;
  total_amount: number;
  merchant: string;
  payer_name: string;
};

type Member = {
  id: string;
  username: string;
  email: string;
  role: 'owner' | 'member';
};

type Balance = {
  user_id: string;
  username: string;
  paid: number;
  owed: number;
  net: number;
};

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { isAuthenticated, isLoading, user } = useAuth();
  
  useEffect(() => {
    // Redirect if not authenticated and loading is finished
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  useEffect(() => {
    // Fetch trip data when authenticated
    if (isAuthenticated) {
      // Simulate API fetch with mock data for demo
      setTimeout(() => {
        // Find the correct trip based on ID
        const mockTrips: Record<string, Trip> = {
          '1': {
            id: '1',
            name: 'Beach Vacation',
            description: 'Summer trip to the beach with friends. We rented a beach house and spent a week enjoying the sun, sand, and surf.',
            start_date: '2025-07-15',
            end_date: '2025-07-22',
            settled: false
          },
          '2': {
            id: '2',
            name: 'Camping Weekend',
            description: 'Weekend camping trip in the mountains. Hiking, fishing, and campfires.',
            start_date: '2025-08-05',
            end_date: '2025-08-07',
            settled: false
          },
          '3': {
            id: '3',
            name: 'City Break',
            description: 'Weekend city getaway with shopping, dining, and sightseeing.',
            start_date: '2025-04-10',
            end_date: '2025-04-12',
            settled: true
          }
        };
        
        const selectedTrip = mockTrips[tripId] || mockTrips['1'];
        setTrip(selectedTrip);
        
        // Mock receipts
        const mockReceipts: Receipt[] = [
          {
            id: '1',
            title: 'Groceries',
            date: '2025-07-15',
            total_amount: 85.75,
            merchant: 'Local Market',
            payer_name: 'John'
          },
          {
            id: '2',
            title: 'Dinner',
            date: '2025-07-16',
            total_amount: 120.50,
            merchant: 'Seafood Restaurant',
            payer_name: 'Alice'
          },
          {
            id: '3',
            title: 'Boat Rental',
            date: '2025-07-17',
            total_amount: 200.00,
            merchant: 'Marina Rentals',
            payer_name: 'John'
          },
          {
            id: '4',
            title: 'Drinks',
            date: '2025-07-18',
            total_amount: 64.25,
            merchant: 'Beach Bar',
            payer_name: 'Bob'
          }
        ];
        
        setReceipts(mockReceipts);
        
        // Mock members
        const mockMembers: Member[] = [
          {
            id: '1',
            username: 'John',
            email: 'john@example.com',
            role: 'owner'
          },
          {
            id: '2',
            username: 'Alice',
            email: 'alice@example.com',
            role: 'member'
          },
          {
            id: '3',
            username: 'Bob',
            email: 'bob@example.com',
            role: 'member'
          },
          {
            id: '4',
            username: 'Sarah',
            email: 'sarah@example.com',
            role: 'member'
          }
        ];
        
        setMembers(mockMembers);
        
        // Mock balances
        const mockBalances: Balance[] = [
          {
            user_id: '1',
            username: 'John',
            paid: 285.75,
            owed: 117.63,
            net: 168.12
          },
          {
            user_id: '2',
            username: 'Alice',
            paid: 120.50,
            owed: 117.62,
            net: 2.88
          },
          {
            user_id: '3',
            username: 'Bob',
            paid: 64.25,
            owed: 117.62,
            net: -53.37
          },
          {
            user_id: '4',
            username: 'Sarah',
            paid: 0,
            owed: 117.63,
            net: -117.63
          }
        ];
        
        setBalances(mockBalances);
        setLoading(false);
      }, 500);
    }
  }, [isAuthenticated, tripId]);
  
  if (isLoading || loading || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    );
  }
  
  // Find current user's balance
  const currentUserBalance = balances.find(b => b.username === user?.username) || balances[0];
  
  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link 
          href="/trips" 
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          <span>Back to Trips</span>
        </Link>
        
        {/* Trip header */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{trip.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  trip.settled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {trip.settled ? 'Settled' : 'Active'}
                </span>
              </div>
              
              <p className="text-slate-600 text-sm">
                {new Date(trip.start_date).toLocaleDateString()} 
                {trip.end_date && trip.start_date !== trip.end_date && (
                  <> - {new Date(trip.end_date).toLocaleDateString()}</>
                )}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
                <Edit size={18} />
              </button>
              <button className="p-2 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-full transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          
          <p className="text-slate-700 mt-4">
            {trip.description}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1">
                <Users size={16} />
                <span>Trip Members</span>
              </div>
              <div className="text-xl font-semibold">{members.length}</div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1">
                <ReceiptIcon size={16} />
                <span>Total Receipts</span>
              </div>
              <div className="text-xl font-semibold">{receipts.length}</div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1">
                <DollarSign size={16} />
                <span>Total Spent</span>
              </div>
              <div className="text-xl font-semibold">
                ${receipts.reduce((sum, r) => sum + r.total_amount, 0).toFixed(2)}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${
              currentUserBalance.net > 0 
                ? 'bg-green-50 border-green-200' 
                : currentUserBalance.net < 0 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1">
                <DollarSign size={16} />
                <span>Your Balance</span>
              </div>
              <div className={`text-xl font-semibold ${
                currentUserBalance.net > 0 
                  ? 'text-green-600' 
                  : currentUserBalance.net < 0 
                    ? 'text-red-600' 
                    : 'text-slate-700'
              }`}>
                {currentUserBalance.net > 0 ? '+' : ''}
                ${currentUserBalance.net.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-8">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('receipts')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'receipts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Receipts
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'members'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Members
            </button>
          </div>
          
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Balances</h2>
                  
                  {!trip.settled && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <CheckCircle size={18} />
                      <span>Mark as Settled</span>
                    </button>
                  )}
                </div>
                
                <div className="space-y-4 mb-8">
                  {balances.map((balance) => (
                    <div 
                      key={balance.user_id}
                      className="bg-slate-50 rounded-lg border border-slate-200 p-4"
                    >
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm mr-3">
                            {balance.username.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{balance.username}</div>
                            <div className="text-sm text-slate-600">
                              {balance.role === 'owner' ? 'Owner' : 'Member'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-6 mt-4 md:mt-0">
                          <div>
                            <div className="text-sm text-slate-600">Paid</div>
                            <div className="font-medium">${balance.paid.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-600">Owed</div>
                            <div className="font-medium">${balance.owed.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-600">Balance</div>
                            <div className={`font-medium ${
                              balance.net > 0 
                                ? 'text-green-600' 
                                : balance.net < 0 
                                  ? 'text-red-600' 
                                  : 'text-slate-700'
                            }`}>
                              {balance.net > 0 ? '+' : ''}
                              ${balance.net.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Suggested Settlements</h2>
                  
                  <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
                    <div className="mb-4 pb-4 border-b border-slate-200">
                      <div className="text-sm font-medium text-slate-700 mb-2">
                        To settle all balances, the following payments should be made:
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm">
                          B
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">Bob</span>
                          <span className="mx-2 text-slate-400">should pay</span>
                          <span className="font-medium">John</span>
                        </div>
                        <div className="font-medium">$53.37</div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm">
                          S
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">Sarah</span>
                          <span className="mx-2 text-slate-400">should pay</span>
                          <span className="font-medium">John</span>
                        </div>
                        <div className="font-medium">$117.63</div>
                      </div>
                    </div>
                    
                    <button className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      <DollarSign size={16} />
                      <span>Record a Settlement</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Receipts Tab */}
            {activeTab === 'receipts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Receipts</h2>
                  
                  <Link
                    href={`/trips/${tripId}/receipts/new`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusCircle size={18} />
                    <span>Add Receipt</span>
                  </Link>
                </div>
                
                {receipts.length === 0 ? (
                  <div className="bg-slate-50 p-8 rounded-lg border border-slate-200 text-center">
                    <p className="text-slate-600 mb-4">No receipts have been added yet</p>
                    <Link
                      href={`/trips/${tripId}/receipts/new`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlusCircle size={18} />
                      <span>Add First Receipt</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receipts.map((receipt) => (
                      <div
                        key={receipt.id}
                        className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-5">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{receipt.title}</h3>
                              <p className="text-slate-600 text-sm mt-1">
                                {new Date(receipt.date).toLocaleDateString()} • {receipt.merchant}
                              </p>
                            </div>
                            
                            <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                              <div className="text-xl font-semibold">
                                ${receipt.total_amount.toFixed(2)}
                              </div>
                              <div className="text-sm text-slate-600 mt-1">
                                Paid by {receipt.payer_name}
                              </div>
                              
                              <Link
                                href={`/trips/${tripId}/receipts/${receipt.id}`}
                                className="mt-3 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
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
            )}
            
            {/* Members Tab */}
            {activeTab === 'members' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Members</h2>
                  
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <PlusCircle size={18} />
                    <span>Add Member</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white rounded-lg border border-slate-200 p-5"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm mr-4">
                            {member.username.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold">{member.username}</div>
                            <div className="text-sm text-slate-600">{member.email}</div>
                          </div>
                          <div className="ml-4 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
                            {member.role === 'owner' ? 'Owner' : 'Member'}
                          </div>
                        </div>
                        
                        {member.role !== 'owner' && (
                          <button className="mt-4 md:mt-0 text-sm text-red-600 hover:text-red-800">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}