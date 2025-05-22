// Client-side API wrappers for the SplitReceipt application

// Helper function for API requests
async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API error: ${response.status}`);
  }
  
  return response.json();
}

// Trip-related API functions
export const tripsApi = {
  // Get all trips for the current user
  getTrips: async () => {
    return fetchApi('/api/trips');
  },
  
  // Get a specific trip by ID
  getTrip: async (id: string) => {
    return fetchApi(`/api/trips/${id}`);
  },
  
  // Create a new trip
  createTrip: async (data: any) => {
    return fetchApi('/api/trips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },
  
  // Update a trip
  updateTrip: async (id: string, data: any) => {
    return fetchApi(`/api/trips/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },
  
  // Delete a trip
  deleteTrip: async (id: string) => {
    return fetchApi(`/api/trips/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Get trip balances
  getTripBalances: async (id: string) => {
    return fetchApi(`/api/trips/${id}/balances`);
  },
  
  // Mark a trip as settled
  settleTripBalances: async (id: string) => {
    return fetchApi(`/api/trips/${id}/settle`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settled: true }),
    });
  },
};

// Receipt-related API functions
export const receiptsApi = {
  // Get all receipts for a trip
  getTripReceipts: async (tripId: string) => {
    return fetchApi(`/api/trips/${tripId}/receipts`);
  },
  
  // Get a specific receipt
  getReceipt: async (id: string) => {
    return fetchApi(`/api/receipts/${id}`);
  },
  
  // Create a new receipt
  createReceipt: async (tripId: string, data: any) => {
    return fetchApi(`/api/trips/${tripId}/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },
  
  // Update a receipt
  updateReceipt: async (id: string, data: any) => {
    return fetchApi(`/api/receipts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },
  
  // Delete a receipt
  deleteReceipt: async (id: string) => {
    return fetchApi(`/api/receipts/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Split a receipt
  splitReceipt: async (id: string, splitData: any) => {
    return fetchApi(`/api/receipts/${id}/split`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(splitData),
    });
  },
  
  // Get suggested even splits for a receipt
  getEvenSplits: async (id: string) => {
    return fetchApi(`/api/receipts/${id}/split`);
  },
};

// Trip members API functions
export const tripMembersApi = {
  // Get all members for a trip
  getTripMembers: async (tripId: string) => {
    return fetchApi(`/api/trips/${tripId}/members`);
  },
  
  // Add a member to a trip
  addTripMember: async (tripId: string, data: any) => {
    return fetchApi(`/api/trips/${tripId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },
  
  // Update a member's role
  updateMemberRole: async (tripId: string, memberId: string, role: string) => {
    return fetchApi(`/api/trips/${tripId}/members`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ memberId, role }),
    });
  },
  
  // Remove a member from a trip
  removeTripMember: async (tripId: string, memberId: string) => {
    return fetchApi(`/api/trips/${tripId}/members?memberId=${memberId}`, {
      method: 'DELETE',
    });
  },
};

// Settlement API functions
export const settlementsApi = {
  // Create a new settlement
  createSettlement: async (tripId: string, data: any) => {
    return fetchApi(`/api/trips/${tripId}/settlements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },
  
  // Get all settlements for a trip
  getTripSettlements: async (tripId: string) => {
    return fetchApi(`/api/trips/${tripId}/settlements`);
  },
};