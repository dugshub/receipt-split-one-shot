"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { tripsApi } from "@/lib/api-client";
import { TripCard } from "./trip-card";

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

type TripWithStats = Trip & {
  totalAmount: number;
  yourContribution: number;
  yourBalance: number;
  memberCount: number;
  receiptCount: number;
};

type TripListProps = {
  isSettled?: boolean;
};

export function TripList({ isSettled = false }: TripListProps) {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setIsLoading(true);
        const tripsData = await tripsApi.getTrips();
        
        // Filter trips based on settled status
        const filteredTrips = tripsData.filter(
          (trip: Trip) => trip.settled === isSettled
        );
        
        // Fetch additional stats for each trip
        const tripsWithStats = await Promise.all(
          filteredTrips.map(async (trip: Trip) => {
            try {
              // Fetch balances
              const balances = await tripsApi.getTripBalances(trip.id);
              
              // Fetch members
              const members = await tripsApi.getTripMembers(trip.id);
              
              // Fetch receipts
              const receipts = await tripsApi.getReceipts(trip.id);
              
              // Calculate total amount
              const totalAmount = receipts.reduce(
                (sum: number, receipt: any) => sum + parseFloat(receipt.total_amount),
                0
              );
              
              // Calculate your contribution (amount you paid)
              const yourContribution = receipts
                .filter((receipt: any) => receipt.payer_id === user?.id)
                .reduce(
                  (sum: number, receipt: any) => sum + parseFloat(receipt.total_amount),
                  0
                );
              
              // Get your balance
              const yourBalance = user?.id ? (balances.balances[user.id]?.net || 0) : 0;
              
              return {
                ...trip,
                totalAmount,
                yourContribution,
                yourBalance,
                memberCount: members.length,
                receiptCount: receipts.length,
              };
            } catch (error) {
              console.warn(`Failed to fetch details for trip ${trip.id}:`, error);
              // If we can't fetch stats, return defaults
              return {
                ...trip,
                totalAmount: 0,
                yourContribution: 0,
                yourBalance: 0,
                memberCount: 0,
                receiptCount: 0,
              };
            }
          })
        );
        
        setTrips(tripsWithStats);
      } catch (err: any) {
        console.error("Failed to load trips:", err);
        
        // For demo purposes, if trips can't be loaded, use default data
        if (user?.id?.startsWith('demo-user')) {
          console.log('Using demo trip data');
          setTrips([
            {
              id: 'trip-1',
              name: 'Beach Vacation',
              description: 'Summer trip to Miami Beach',
              start_date: '2023-06-15',
              end_date: '2023-06-22',
              settled: false,
              created_at: '2023-06-01T00:00:00Z',
              updated_at: '2023-06-01T00:00:00Z',
              totalAmount: 206.25,
              yourContribution: 120.50,
              yourBalance: 80.33,
              memberCount: 3,
              receiptCount: 2
            },
            {
              id: 'trip-2',
              name: 'Ski Trip',
              description: 'Winter escape to the mountains',
              start_date: '2023-12-10',
              end_date: '2023-12-17',
              settled: true,
              created_at: '2023-11-01T00:00:00Z',
              updated_at: '2023-11-01T00:00:00Z',
              totalAmount: 200.00,
              yourContribution: 0,
              yourBalance: -100.00,
              memberCount: 2,
              receiptCount: 1
            }
          ].filter(trip => trip.settled === isSettled));
        } else {
          setError("Failed to load trips. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTrips();
    }
  }, [user, isSettled]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="border rounded-lg p-5 h-64 animate-pulse bg-gray-50"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        <p>{error}</p>
        <button
          className="text-sm underline mt-2"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="bg-blue-50 text-blue-600 p-6 rounded-md text-center">
        <p className="mb-2 font-medium">
          {isSettled
            ? "No settled trips yet"
            : "No active trips yet"}
        </p>
        <p className="text-sm text-blue-500">
          {isSettled
            ? "When you settle all expenses in a trip, it will appear here"
            : "Create your first trip to start tracking expenses"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          id={trip.id}
          name={trip.name}
          startDate={trip.start_date}
          endDate={trip.end_date}
          settled={trip.settled}
          totalAmount={trip.totalAmount}
          yourContribution={trip.yourContribution}
          yourBalance={trip.yourBalance}
          memberCount={trip.memberCount}
          receiptCount={trip.receiptCount}
        />
      ))}
    </div>
  );
}