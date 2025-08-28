import { User } from '@/types/db.types';
import Image from 'next/image';
import { Badge } from './badge';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';

type MultiSelectProps = {
  open: boolean;
  setOpen: (input: boolean) => void;
  className?: string;
  placeholder: string;
  selectedUsers: User[];
  displayUsers: User[];
  availableUsers: User[];
  disabled: boolean;
  searchTerm: string;
  setSearchTerm: (input: string) => void;
  searchPlaceholder: string;
  loading: boolean;
  emptyMessage: string;
  hiddenCount: number;
  value: Array<User['id']>;
  handleRemove: (input: User['id'], event?: React.MouseEvent) => void;
  handleClearAll: (event: React.MouseEvent) => void;
  handleSelect: (input: User) => void;
};

export function MultiSelect({ props }: { props: MultiSelectProps }) {
  const {
    open,
    setOpen,
    className,
    placeholder,
    selectedUsers,
    displayUsers,
    availableUsers,
    disabled,
    searchTerm,
    setSearchTerm,
    searchPlaceholder,
    loading,
    emptyMessage,
    hiddenCount,
    value,
    handleRemove,
    handleClearAll,
    handleSelect,
  } = props;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={`h-auto min-h-[2.5rem] w-full justify-between px-3 py-2 ${className}`}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {selectedUsers.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {displayUsers.map((user) => (
                  <Badge key={user.id} variant="secondary" className="flex items-center gap-1 pr-1">
                    {user.imgLink && (
                      <Image
                        src={user.imgLink}
                        width={16}
                        height={16}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="rounded-full"
                      />
                    )}
                    <span className="max-w-[100px] truncate text-xs">
                      {user.primaryEmailAddress}
                    </span>
                    <span
                      onClick={(e) => handleRemove(user.id, e)}
                      className="hover:bg-destructive hover:text-destructive-foreground ml-1 inline-flex cursor-pointer items-center justify-center rounded-sm"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))}
                {hiddenCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    +{hiddenCount} more
                  </Badge>
                )}
              </>
            )}
          </div>
          <div className="ml-2 flex items-center gap-2">
            {selectedUsers.length > 0 && (
              <span
                onClick={handleClearAll}
                className="text-muted-foreground hover:text-foreground inline-flex h-5 cursor-pointer items-center px-1 text-sm"
              >
                Clear
              </span>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="border-border w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-muted-foreground text-sm">Searching...</span>
              </div>
            )}
            {!loading && searchTerm && availableUsers.length === 0 && (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}
            {!loading && searchTerm === '' && (
              <div className="text-muted-foreground p-4 text-center text-sm">
                Type to search for users
              </div>
            )}
            {!loading && availableUsers.length > 0 && (
              <CommandGroup>
                {availableUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.firstName} ${user.lastName} ${user.primaryEmailAddress}`}
                    onSelect={() => handleSelect(user)}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    {user.imgLink && (
                      <Image
                        src={user.imgLink}
                        width={32}
                        height={32}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="rounded-full"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-muted-foreground truncate text-sm">
                        {user.primaryEmailAddress}
                      </p>
                    </div>
                    {value.includes(user.id) && <Check className="h-4 w-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
