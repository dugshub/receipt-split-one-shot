"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type TripCardProps = {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  settled: boolean;
  totalAmount: number;
  yourContribution: number;
  yourBalance: number;
  memberCount: number;
  receiptCount: number;
};

export function TripCard({
  id,
  name,
  startDate,
  endDate,
  settled,
  totalAmount,
  yourContribution,
  yourBalance,
  memberCount,
  receiptCount,
}: TripCardProps) {
  // Format date for display
  const formattedDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (e) {
      return date;
    }
  };
  
  // Ensure consistent card height for better layout
  const cardHeight = "h-[280px]";

  return (
    <Link
      href={`/trips/${id}`}
      className={`block border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${cardHeight}`}
    >
      <div className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 truncate max-w-[200px]">{name}</h3>
            <p className="text-sm text-gray-500">
              {formattedDate(startDate)}
              {endDate && ` - ${formattedDate(endDate)}`}
            </p>
          </div>
          <div
            className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              settled
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            )}
          >
            {settled ? "Settled" : "Active"}
          </div>
        </div>

        <div className="space-y-3 mb-4 flex-grow">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total amount:</span>
            <span className="text-sm font-medium">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Your contribution:</span>
            <span className="text-sm font-medium">${yourContribution.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Your balance:</span>
            <span
              className={cn(
                "text-sm font-medium",
                yourBalance > 0
                  ? "text-green-600"
                  : yourBalance < 0
                  ? "text-red-600"
                  : ""
              )}
            >
              {yourBalance > 0
                ? `You are owed $${yourBalance.toFixed(2)}`
                : yourBalance < 0
                ? `You owe $${Math.abs(yourBalance).toFixed(2)}`
                : "Settled"}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center">
            <div className="flex -space-x-2 items-center mr-2">
              {[...Array(Math.min(3, memberCount))].map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center ring-2 ring-white"
                >
                  <User size={14} />
                </div>
              ))}
              {memberCount > 3 && (
                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium ring-2 ring-white">
                  +{memberCount - 3}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500">{memberCount} members</span>
          </div>
          <div className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
            {receiptCount} {receiptCount === 1 ? "receipt" : "receipts"}
          </div>
        </div>
      </div>
    </Link>
  );
}