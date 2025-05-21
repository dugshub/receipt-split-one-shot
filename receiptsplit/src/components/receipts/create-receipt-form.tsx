"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { receiptsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CreateReceiptFormProps = {
  tripId: string;
};

type LineItem = {
  description: string;
  amount: string;
  quantity: number;
  id?: string;
};

export function CreateReceiptForm({ tripId }: CreateReceiptFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [merchant, setMerchant] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", amount: "", quantity: 1 },
  ]);
  const [splitType, setSplitType] = useState<"full" | "line_item">("full");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total amount based on line items
  useEffect(() => {
    if (splitType === "line_item" && lineItems.length > 0) {
      const total = lineItems.reduce((sum, item) => {
        const itemAmount = parseFloat(item.amount) || 0;
        const itemQuantity = item.quantity || 1;
        return sum + itemAmount * itemQuantity;
      }, 0);
      
      setTotalAmount(total.toFixed(2));
    }
  }, [lineItems, splitType]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: "", amount: "", quantity: 1 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    const newLineItems = [...lineItems];
    newLineItems.splice(index, 1);
    setLineItems(newLineItems);
  };

  const handleLineItemChange = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    const newLineItems = [...lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: value,
    };
    setLineItems(newLineItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title || !date || !totalAmount) {
      setError("Title, date, and amount are required");
      return;
    }
    
    if (splitType === "line_item" && lineItems.some(item => !item.description || !item.amount)) {
      setError("All line items must have a description and amount");
      return;
    }
    
    setIsLoading(true);

    try {
      // Create the receipt
      const newReceipt = await receiptsApi.createReceipt({
        trip_id: tripId,
        title,
        date,
        total_amount: parseFloat(totalAmount),
        merchant: merchant || undefined,
        split_type: splitType,
      });
      
      // If it's a line item receipt, add the line items
      if (splitType === "line_item" && lineItems.length > 0) {
        // Format line items for the API
        const formattedLineItems = lineItems.map(item => ({
          description: item.description,
          amount: parseFloat(item.amount),
          quantity: item.quantity,
        }));
        
        await receiptsApi.addLineItems(newReceipt.id, formattedLineItems);
      }
      
      // Redirect to the receipt details page
      router.push(`/trips/${tripId}/receipts/${newReceipt.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create receipt. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Receipt</CardTitle>
        <CardDescription>
          Enter receipt details to track expenses for your trip
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Receipt Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Receipt Title*</Label>
              <Input
                id="title"
                placeholder="Dinner at Restaurant"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date*</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="merchant">Merchant</Label>
                <Input
                  id="merchant"
                  placeholder="Store or restaurant name"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Split Type</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={splitType === "full" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setSplitType("full")}
                >
                  Full Receipt Split
                </Button>
                <Button
                  type="button"
                  variant={splitType === "line_item" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setSplitType("line_item")}
                >
                  Line Item Split
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {splitType === "full"
                  ? "Split the entire receipt amount among trip members"
                  : "Split individual items among trip members"}
              </p>
            </div>
          </div>

          {/* Line Items (only if line_item split type) */}
          {splitType === "line_item" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Line Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLineItem}
                >
                  <Plus size={16} className="mr-1" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-grow">
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) =>
                          handleLineItemChange(index, "description", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        required
                      />
                    </div>
                    <div className="w-28">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) =>
                          handleLineItemChange(index, "amount", e.target.value)
                        }
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveLineItem(index)}
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <div className="bg-blue-50 px-4 py-2 rounded-md">
                  <span className="text-sm text-blue-600">Total:</span>
                  <span className="ml-2 font-medium">${totalAmount}</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="totalAmount">Total Amount*</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  placeholder="0.00"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
          
          {error && (
            <div className="text-sm text-red-500 font-medium">{error}</div>
          )}
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(`/trips/${tripId}`)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Add Receipt"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}