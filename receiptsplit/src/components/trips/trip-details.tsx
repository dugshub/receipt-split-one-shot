"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Edit, ArrowLeft } from "lucide-react";
import { tripsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { ReceiptList } from "@/components/receipts/receipt-list";
import { BalanceSummary } from "@/components/trips/balance-summary";
import { SettlementsHistory } from "@/components/trips/settlements-history";

type TripDetailsProps = {
  tripId: string;
};

export function TripDetails({ tripId }: TripDetailsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [trip, setTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch trip details
        const tripData = await tripsApi.getTrip(tripId);
        setTrip(tripData);
        
        // Check if current user is the trip owner
        const members = await tripsApi.getTripMembers(tripId);
        const currentMember = members.find((member: any) => member.user_id === user?.id);
        setIsOwner(currentMember?.role === "owner");
      } catch (err: any) {
        setError(err.message || "Failed to load trip details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTripDetails();
    }
  }, [tripId, user]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
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

  if (!trip) {
    return (
      <div className="bg-yellow-50 text-yellow-600 p-4 rounded-md">
        <p>Trip not found or you don't have access to this trip.</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const formattedStartDate = format(new Date(trip.start_date), "MMM d, yyyy");
  const formattedEndDate = trip.end_date
    ? format(new Date(trip.end_date), "MMM d, yyyy")
    : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">{trip.name}</h1>
          <p className="text-muted-foreground">
            {formattedStartDate}
            {formattedEndDate && ` - ${formattedEndDate}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <Button variant="outline" onClick={() => router.push(`/trips/${tripId}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Trip
            </Button>
          )}
          <Button onClick={() => router.push(`/trips/${tripId}/receipts/new`)}>
            Add Receipt
          </Button>
        </div>
      </div>

      <Card className="p-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="p-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Trip Details</h3>
                {trip.description && (
                  <p className="text-muted-foreground">{trip.description}</p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Status</h3>
                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {trip.settled ? "Settled" : "Active"}
                </div>
              </div>
              
              <div>
                <BalanceSummary tripId={tripId} />
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <SettlementsHistory tripId={tripId} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="receipts" className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Receipts</h3>
                <Button
                  size="sm"
                  onClick={() => router.push(`/trips/${tripId}/receipts/new`)}
                >
                  Add Receipt
                </Button>
              </div>
              
              {/* Use ReceiptList component */}
              {trip && tripId && (
                <div className="mt-4">
                  <ReceiptList tripId={tripId} />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="members" className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Trip Members</h3>
                {isOwner && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/trips/${tripId}/members/add`)}
                  >
                    Add Member
                  </Button>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                Loading members...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}