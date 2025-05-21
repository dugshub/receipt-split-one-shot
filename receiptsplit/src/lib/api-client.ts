// lib/api-client.ts - Client-side API wrappers
import { getClientToken } from './auth-helpers';

// Type definitions for API data
type Trip = {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  settled: boolean;
  created_at: string;
  updated_at: string;
};

type Receipt = {
  id: string;
  trip_id: string;
  payer_id: string;
  title: string;
  date: string;
  total_amount: number;
  merchant?: string;
  split_type: 'full' | 'line_item';
  created_at: string;
  updated_at: string;
};

type LineItem = {
  id: string;
  receipt_id: string;
  description: string;
  amount: number;
  quantity: number;
  created_at: string;
  updated_at: string;
};

type TripMember = {
  id: string;
  trip_id: string;
  user_id: string;
  role: 'owner' | 'member';
  created_at: string;
  updated_at: string;
};

type User = {
  id: string;
  username: string;
  email: string;
};

type Balance = {
  paid: number;
  owed: number;
  net: number;
};

type BalanceResult = {
  balances: Record<string, Balance>;
  transactions: Array<{
    from: string;
    to: string;
    amount: number;
  }>;
};

// Mock data for demo purposes
const MOCK_DATA = {
  trips: [
    {
      id: 'trip-1',
      name: 'Beach Vacation',
      description: 'Summer trip to Miami Beach',
      start_date: '2023-06-15',
      end_date: '2023-06-22',
      settled: false,
      created_at: '2023-06-01T00:00:00Z',
      updated_at: '2023-06-01T00:00:00Z'
    },
    {
      id: 'trip-2',
      name: 'Ski Trip',
      description: 'Winter escape to the mountains',
      start_date: '2023-12-10',
      end_date: '2023-12-17',
      settled: true,
      created_at: '2023-11-01T00:00:00Z',
      updated_at: '2023-11-01T00:00:00Z'
    }
  ],
  members: {
    'trip-1': [
      { id: 'member-1', trip_id: 'trip-1', user_id: 'demo-user-1', role: 'owner', username: 'user1' },
      { id: 'member-2', trip_id: 'trip-1', user_id: 'user-2', role: 'member', username: 'user2' },
      { id: 'member-3', trip_id: 'trip-1', user_id: 'user-3', role: 'member', username: 'user3' }
    ],
    'trip-2': [
      { id: 'member-4', trip_id: 'trip-2', user_id: 'demo-user-1', role: 'member', username: 'user1' },
      { id: 'member-5', trip_id: 'trip-2', user_id: 'user-2', role: 'owner', username: 'user2' }
    ]
  },
  receipts: {
    'trip-1': [
      {
        id: 'receipt-1',
        trip_id: 'trip-1',
        payer_id: 'demo-user-1',
        title: 'Dinner at Restaurant',
        date: '2023-06-16',
        total_amount: 120.50,
        merchant: 'Beach Bistro',
        split_type: 'full',
        created_at: '2023-06-16T20:00:00Z',
        updated_at: '2023-06-16T20:00:00Z'
      },
      {
        id: 'receipt-2',
        trip_id: 'trip-1',
        payer_id: 'user-2',
        title: 'Groceries',
        date: '2023-06-17',
        total_amount: 85.75,
        merchant: 'Local Market',
        split_type: 'line_item',
        created_at: '2023-06-17T15:30:00Z',
        updated_at: '2023-06-17T15:30:00Z'
      }
    ],
    'trip-2': [
      {
        id: 'receipt-3',
        trip_id: 'trip-2',
        payer_id: 'user-2',
        title: 'Ski Equipment Rental',
        date: '2023-12-11',
        total_amount: 200.00,
        merchant: 'Mountain Sports',
        split_type: 'full',
        created_at: '2023-12-11T10:00:00Z',
        updated_at: '2023-12-11T10:00:00Z'
      }
    ]
  },
  lineItems: {
    'receipt-2': [
      { id: 'item-1', receipt_id: 'receipt-2', description: 'Milk', amount: 4.50, quantity: 1 },
      { id: 'item-2', receipt_id: 'receipt-2', description: 'Bread', amount: 3.25, quantity: 2 },
      { id: 'item-3', receipt_id: 'receipt-2', description: 'Cheese', amount: 7.50, quantity: 1 }
    ]
  },
  balances: {
    'trip-1': {
      balances: {
        'demo-user-1': { paid: 120.50, owed: 40.17, net: 80.33 },
        'user-2': { paid: 85.75, owed: 85.75, net: 0 },
        'user-3': { paid: 0, owed: 80.33, net: -80.33 }
      },
      transactions: [
        { from: 'user-3', to: 'demo-user-1', amount: 80.33 }
      ]
    },
    'trip-2': {
      balances: {
        'demo-user-1': { paid: 0, owed: 100.00, net: -100.00 },
        'user-2': { paid: 200.00, owed: 100.00, net: 100.00 }
      },
      transactions: [
        { from: 'demo-user-1', to: 'user-2', amount: 100.00 }
      ]
    }
  },
  settlements: {
    'trip-2': [
      {
        id: 'settlement-1',
        trip_id: 'trip-2',
        payer_id: 'demo-user-1',
        receiver_id: 'user-2',
        amount: 100.00,
        date: '2023-12-17',
        note: 'Venmo payment',
        created_at: '2023-12-17T12:00:00Z'
      }
    ]
  }
};

// Helper function to handle API requests with mock data for demo
const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getClientToken();
  
  // For demo mode, intercept specific API calls and return mock data
  if (token && (token.startsWith('demo-token'))) {
    console.log('Using mock API data for:', url);
    
    // Trips API
    if (url === '/api/trips') {
      return MOCK_DATA.trips as unknown as T;
    }
    
    // Trip details
    const tripMatch = url.match(/\/api\/trips\/([^\/]+)$/);
    if (tripMatch) {
      const tripId = tripMatch[1];
      const trip = MOCK_DATA.trips.find(t => t.id === tripId);
      return (trip || {}) as unknown as T;
    }
    
    // Trip members
    const membersMatch = url.match(/\/api\/trips\/([^\/]+)\/members/);
    if (membersMatch) {
      const tripId = membersMatch[1];
      return (MOCK_DATA.members[tripId] || []) as unknown as T;
    }
    
    // Trip receipts
    const receiptsMatch = url.match(/\/api\/trips\/([^\/]+)\/receipts/);
    if (receiptsMatch) {
      const tripId = receiptsMatch[1];
      return (MOCK_DATA.receipts[tripId] || []) as unknown as T;
    }
    
    // Trip balances
    const balancesMatch = url.match(/\/api\/trips\/([^\/]+)\/balances/);
    if (balancesMatch) {
      const tripId = balancesMatch[1];
      return (MOCK_DATA.balances[tripId] || { balances: {}, transactions: [] }) as unknown as T;
    }
    
    // Receipt details
    const receiptMatch = url.match(/\/api\/receipts\/([^\/]+)$/);
    if (receiptMatch) {
      const receiptId = receiptMatch[1];
      const receipt = Object.values(MOCK_DATA.receipts)
        .flat()
        .find((r: any) => r.id === receiptId);
      return (receipt || {}) as unknown as T;
    }
    
    // Receipt line items
    const lineItemsMatch = url.match(/\/api\/receipts\/([^\/]+)\/line-items/);
    if (lineItemsMatch) {
      const receiptId = lineItemsMatch[1];
      return (MOCK_DATA.lineItems[receiptId] || []) as unknown as T;
    }
    
    // Trip settlements
    const settlementsMatch = url.match(/\/api\/trips\/([^\/]+)\/settlements/);
    if (settlementsMatch) {
      const tripId = settlementsMatch[1];
      return (MOCK_DATA.settlements[tripId] || []) as unknown as T;
    }
    
    // Default - empty response
    console.warn('No mock data found for:', url);
    return {} as T;
  }
  
  // Real API calls for non-demo mode
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
};

// Trips API
export const tripsApi = {
  // Get all trips for the current user
  getTrips: async (): Promise<Trip[]> => {
    return apiRequest<Trip[]>('/api/trips');
  },

  // Get a specific trip by ID
  getTrip: async (id: string): Promise<Trip> => {
    return apiRequest<Trip>(`/api/trips/${id}`);
  },

  // Create a new trip
  createTrip: async (data: Omit<Trip, 'id' | 'created_at' | 'updated_at'>): Promise<Trip> => {
    return apiRequest<Trip>('/api/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update an existing trip
  updateTrip: async (id: string, data: Partial<Trip>): Promise<Trip> => {
    return apiRequest<Trip>(`/api/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a trip
  deleteTrip: async (id: string): Promise<void> => {
    return apiRequest<void>(`/api/trips/${id}`, {
      method: 'DELETE',
    });
  },

  // Mark a trip as settled
  settleTrip: async (id: string): Promise<Trip> => {
    return apiRequest<Trip>(`/api/trips/${id}/settle`, {
      method: 'PUT',
    });
  },

  // Get trip balances
  getTripBalances: async (id: string): Promise<BalanceResult> => {
    return apiRequest<BalanceResult>(`/api/trips/${id}/balances`);
  },

  // Get trip members
  getTripMembers: async (id: string): Promise<TripMember[]> => {
    return apiRequest<TripMember[]>(`/api/trips/${id}/members`);
  },

  // Add a member to a trip
  addTripMember: async (
    tripId: string,
    data: { user_id: string; role: 'owner' | 'member' }
  ): Promise<TripMember> => {
    return apiRequest<TripMember>(`/api/trips/${tripId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Remove a member from a trip
  removeTripMember: async (tripId: string, userId: string): Promise<void> => {
    return apiRequest<void>(`/api/trips/${tripId}/members`, {
      method: 'DELETE',
      body: JSON.stringify({ user_id: userId }),
    });
  },
};

// Receipts API
export const receiptsApi = {
  // Get all receipts for a trip
  getReceipts: async (tripId: string): Promise<Receipt[]> => {
    return apiRequest<Receipt[]>(`/api/trips/${tripId}/receipts`);
  },

  // Get a specific receipt
  getReceipt: async (id: string): Promise<Receipt> => {
    return apiRequest<Receipt>(`/api/receipts/${id}`);
  },

  // Create a new receipt
  createReceipt: async (
    data: Omit<Receipt, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Receipt> => {
    return apiRequest<Receipt>(`/api/trips/${data.trip_id}/receipts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update an existing receipt
  updateReceipt: async (id: string, data: Partial<Receipt>): Promise<Receipt> => {
    return apiRequest<Receipt>(`/api/receipts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a receipt
  deleteReceipt: async (id: string): Promise<void> => {
    return apiRequest<void>(`/api/receipts/${id}`, {
      method: 'DELETE',
    });
  },

  // Split a receipt
  splitReceipt: async (
    id: string,
    data: {
      split_type: 'full' | 'line_item';
      splits: Array<{
        user_id: string;
        percentage: number;
        amount: number;
      }>;
    }
  ): Promise<Receipt> => {
    return apiRequest<Receipt>(`/api/receipts/${id}/split`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Add line items to a receipt
  addLineItems: async (
    receiptId: string,
    lineItems: Array<Omit<LineItem, 'id' | 'receipt_id' | 'created_at' | 'updated_at'>>
  ): Promise<LineItem[]> => {
    return apiRequest<LineItem[]>(`/api/receipts/${receiptId}/line-items`, {
      method: 'POST',
      body: JSON.stringify({ line_items: lineItems }),
    });
  },

  // Get receipt splits
  getReceiptSplits: async (receiptId: string): Promise<any[]> => {
    return apiRequest<any[]>(`/api/receipts/${receiptId}/splits`);
  },

  // Get line items for a receipt
  getLineItems: async (receiptId: string): Promise<any[]> => {
    return apiRequest<any[]>(`/api/receipts/${receiptId}/line-items`);
  },

  // Get line item splits
  getLineItemSplits: async (lineItemId: string): Promise<any[]> => {
    return apiRequest<any[]>(`/api/line-items/${lineItemId}/splits`);
  },

  // Split line items
  splitLineItems: async (
    receiptId: string,
    splits: Array<{
      line_item_id: string;
      user_id: string;
      percentage: number;
      amount: number;
    }>
  ): Promise<void> => {
    return apiRequest<void>(`/api/receipts/${receiptId}/line-items/split`, {
      method: 'POST',
      body: JSON.stringify({ splits }),
    });
  },
};

// Settlements API
export const settlementsApi = {
  // Create a settlement
  createSettlement: async (
    tripId: string,
    data: {
      payer_id: string;
      receiver_id: string;
      amount: number;
      date: string;
      note?: string;
    }
  ): Promise<void> => {
    return apiRequest<void>(`/api/trips/${tripId}/settlements`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get settlements for a trip
  getSettlements: async (tripId: string): Promise<any[]> => {
    return apiRequest<any[]>(`/api/trips/${tripId}/settlements`);
  },
};

// Users API
export const usersApi = {
  // Search for users
  searchUsers: async (query: string): Promise<User[]> => {
    return apiRequest<User[]>(`/api/users/search?q=${encodeURIComponent(query)}`);
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>('/api/auth/me');
  },
};