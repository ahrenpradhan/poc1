"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/primitives/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/primitives/tooltip";

export interface ConfigOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface ConfigSelectorProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ConfigOption<T>[];
  disabled?: boolean;
  className?: string;
}

export function ConfigSelector<T extends string>({
  value,
  onChange,
  options,
  disabled,
  className,
}: ConfigSelectorProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip open={isOpen ? false : undefined}>
        <TooltipTrigger asChild>
          <span>
            <Select
              value={value}
              onValueChange={onChange}
              disabled={disabled}
              onOpenChange={setIsOpen}
            >
              <SelectTrigger
                className={`w-auto h-8 text-sm ${className || ""}`}
              >
                <SelectValue>{selectedOption?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent className="max-w-xs">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col items-start gap-0.5">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground font-normal whitespace-normal">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </span>
        </TooltipTrigger>
        {selectedOption?.description && (
          <TooltipContent side="top" className="max-w-xs">
            {selectedOption.description}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
