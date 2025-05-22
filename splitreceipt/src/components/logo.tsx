"use client";

import { Receipt, ScissorsLineDashed } from 'lucide-react';

export function Logo({
  width = 150,
  height = 30,
  className = ""
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center ${className}`} style={{ width, height }}>
      <div className="flex items-center text-blue-600 mr-2">
        <Receipt size={18} className="mr-1" />
        <ScissorsLineDashed size={16} />
      </div>
      <span className="font-bold text-lg tracking-tight">SplitReceipt</span>
    </div>
  );
}

export function LogoSmall() {
  return (
    <div className="flex items-center text-blue-600">
      <Receipt size={16} className="mr-1" />
      <ScissorsLineDashed size={14} />
    </div>
  );
}