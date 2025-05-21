"use client";

import { format } from "date-fns";
import Link from "next/link";
import { Receipt, User } from "lucide-react";
import { cn } from "@/lib/utils";

type ReceiptCardProps = {
  id: string;
  title: string;
  date: string;
  totalAmount: number;
  merchant: string;
  splitType: "full" | "line_item";
  payerName: string;
  yourShare: number;
  tripId: string;
};

export function ReceiptCard({
  id,
  title,
  date,
  totalAmount,
  merchant,
  splitType,
  payerName,
  yourShare,
  tripId,
}: ReceiptCardProps) {
  // Format date for display
  const formattedDate = format(new Date(date), "MMM d, yyyy");

  return (
    <Link
      href={`/trips/${tripId}/receipts/${id}`}
      className="block border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">
              {merchant ? `${merchant} • ` : ""}
              {formattedDate}
            </p>
          </div>
          <div
            className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              splitType === "full"
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800"
            )}
          >
            {splitType === "full" ? "Full Split" : "Line Items"}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total amount:</span>
            <span className="text-sm font-medium">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Your share:</span>
            <span className="text-sm font-medium">${yourShare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Paid by:</span>
            <span className="text-sm font-medium flex items-center">
              <User size={14} className="mr-1" />
              {payerName}
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <span className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800">
            <Receipt size={14} className="mr-1" />
            View details
          </span>
        </div>
      </div>
    </Link>
  );
}