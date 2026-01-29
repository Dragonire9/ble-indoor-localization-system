import { Check, PlusCircle } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface FacetedFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export interface DataTableFacetedFilterProps {
  title: string;
  options: FacetedFilterOption[];
  selectedValues: string[];
  onSelectedChange: (values: string[]) => void;
  getCounts?: () => Promise<Record<string, number>>;
  isLoading?: boolean;
}

export function DataTableFacetedFilter({
  title,
  options,
  selectedValues,
  onSelectedChange,
  getCounts,
}: DataTableFacetedFilterProps) {
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = React.useState('');

  // Use local state for optimistic updates to handle fast clicks or parent delays
  const [localSelectedValues, setLocalSelectedValues] =
    React.useState(selectedValues);

  // Sync local state when props change
  React.useEffect(() => {
    setLocalSelectedValues(selectedValues);
  }, [selectedValues]);

  const selectedValuesSet = new Set(localSelectedValues);

  React.useEffect(() => {
    if (getCounts) {
      getCounts().then(setCounts).catch(console.error);
    } else {
      const optionCounts: Record<string, number> = {};
      options.forEach((opt) => {
        if (opt.count !== undefined) {
          optionCounts[opt.value] = opt.count;
        }
      });
      setCounts(optionCounts);
    }
  }, [getCounts, options]);

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValuesSet.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValuesSet.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selectedValuesSet.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValuesSet.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValuesSet.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={title}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <CommandList>
            {filteredOptions.length === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            <CommandGroup>
              {filteredOptions.map((option) => {
                const isSelected = selectedValuesSet.has(option.value);
                const count = counts[option.value] ?? option.count ?? 0;

                return (
                  <CommandItem
                    key={option.value}
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const newSelected = selectedValuesSet.has(option.value)
                        ? localSelectedValues.filter((v) => v !== option.value)
                        : [...localSelectedValues, option.value];

                      setLocalSelectedValues(newSelected);
                      onSelectedChange(newSelected);
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className={cn('h-4 w-4')} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {count > 0 && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {count}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValuesSet.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLocalSelectedValues([]);
                      onSelectedChange([]);
                    }}
                    className="justify-center text-center cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
