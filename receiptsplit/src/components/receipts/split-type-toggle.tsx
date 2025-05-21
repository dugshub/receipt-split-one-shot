"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SplitTypeToggleProps = {
  value: "full" | "line_item";
  onChange: (value: "full" | "line_item") => void;
  disabled?: boolean;
};

export function SplitTypeToggle({
  value,
  onChange,
  disabled = false,
}: SplitTypeToggleProps) {
  return (
    <div className="space-y-2">
      <Tabs
        value={value}
        onValueChange={(v) => onChange(v as "full" | "line_item")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="full" disabled={disabled}>
            Full Receipt Split
          </TabsTrigger>
          <TabsTrigger value="line_item" disabled={disabled}>
            Line Item Split
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <p className="text-xs text-muted-foreground">
        {value === "full"
          ? "Split the entire receipt amount among trip members"
          : "Split individual items among trip members"}
      </p>
      {disabled && (
        <p className="text-xs text-yellow-600 font-medium">
          Changing split type will remove existing splits.
        </p>
      )}
    </div>
  );
}