'use client';

import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { X, ChevronDown, Check, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { User } from '@/types/db.types';

interface UserMultiSelectProps {
  value: User['id'][];
  onChange: (value: User['id'][]) => void;
  fetchFunction: (searchTerm: string) => Promise<User[]>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  maxDisplayCount?: number;
  debounceMs?: number;
}

export function UserMultiSelect({
  value = [],
  onChange,
  fetchFunction,
  placeholder = 'Select users...',
  searchPlaceholder = 'Search users...',
  emptyMessage = 'No users found',
  disabled = false,
  className,
  maxDisplayCount = 3,
  debounceMs = 300,
}: UserMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout>(null);

  // fetch users based on search term with debouncing
  // TODO implement debouncer (i.e lodash debouncer)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!searchTerm.trim()) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const users = await fetchFunction(searchTerm);
        setSearchResults(users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, fetchFunction, debounceMs]);

  // update selected users
  useEffect(() => {
    if (value.length === 0) {
      setSelectedUsers([]);
      return;
    }

    setSelectedUsers((prev) => {
      // keep existing users that are still selected
      const existingUsers = prev.filter((user) => value.includes(user.id));
      const existingIds = existingUsers.map((user) => user.id);

      // find new ids for user data
      const newIds = value.filter((id) => !existingIds.includes(id));

      if (newIds.length > 0) {
        // try and find new users
        const newUsers = searchResults.filter((user) => newIds.includes(user.id));
        return [...existingUsers, ...newUsers];
      }

      return existingUsers;
    });
  }, [value, searchResults]);

  const handleSelect = (user: User) => {
    const newValue = value.includes(user.id)
      ? value.filter((id) => id !== user.id)
      : [...value, user.id];

    onChange(newValue);

    setOpen(true);
    setSearchTerm('');
  };

  const handleRemove = (userId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const newValue = value.filter((id) => id !== userId);
    onChange(newValue);
  };

  const handleClearAll = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onChange([]);
  };

  // exclude already selected users from search results
  const availableUsers = searchResults.filter((user) => !value.includes(user.id));

  // TODO refactor
  // cleanup debounce on mount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const displayUsers = selectedUsers.slice(0, maxDisplayCount);
  const hiddenCount = selectedUsers.length - maxDisplayCount;

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

      <PopoverContent className="w-[400px] p-0" align="start">
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
