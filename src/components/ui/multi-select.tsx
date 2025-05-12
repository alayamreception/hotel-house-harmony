
import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selected?: string[];
  onChange?: (selected: string[]) => void;
  className?: string;
  placeholder?: string;
  value?: string[];
}

export function MultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder = "Select options",
  value = [],
}: MultiSelectProps) {
  // Use the value prop or the selected prop (for backward compatibility)
  const selectedValues = value || selected || [];
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: string) => {
    if (onChange) {
      onChange(selectedValues.filter((i) => i !== item));
    }
  };

  const handleSelect = (item: string) => {
    if (onChange) {
      if (selectedValues.includes(item)) {
        onChange(selectedValues.filter((i) => i !== item));
      } else {
        onChange([...selectedValues, item]);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex min-h-10 w-full flex-wrap items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            className
          )}
        >
          <div className="flex flex-wrap gap-1">
            {selectedValues.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {selectedValues.map((item) => {
              const option = options.find((o) => o.value === item);
              if (!option) return null;
              
              return (
                <Badge
                  key={item}
                  variant="secondary"
                  className="mr-1 mb-1 flex items-center gap-1"
                >
                  {option.label}
                  <button
                    className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleUnselect(item)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              );
            })}
          </div>
          <div className="flex shrink-0 opacity-50">▼</div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  handleSelect(option.value);
                  setOpen(true); // keep the popover open after selection
                }}
              >
                <div
                  className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    selectedValues.includes(option.value)
                      ? "bg-primary text-primary-foreground"
                      : "opacity-50 [&_svg]:invisible"
                  )}
                >
                  <X className="h-3 w-3" />
                </div>
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
