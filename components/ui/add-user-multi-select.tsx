'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { User } from '@/types/db.types';
import { UserMultiSelect } from './multi-select';

export type MemberValue = Array<{ userId: string; role: string }>;

interface MemberMultiSelectProps {
  value: Array<User['id']>;
  onChange: (value: Array<User['id']>) => void;
  fetchFunction: (searchTerm: string) => Promise<User[]>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  maxDisplayCount?: number;
  debounceMs?: number;
}

export function AddUserMultiSelect({
  value = [],
  onChange,
  fetchFunction,
  placeholder = 'Select users...',
  searchPlaceholder = 'Search users...',
  emptyMessage = 'No users found',
  disabled = false,
  className,
  maxDisplayCount = 3,
  debounceMs = 200,
}: MemberMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout>(null);

  // Extract user IDs from the value array - memoize to prevent infinite re-renders
  const selectedUserIds = useMemo(() => value.map((item) => item), [value]);

  // fetch users based on search term with debouncing
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
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

  // update selected users - optimize to prevent infinite re-renders
  useEffect(() => {
    console.log(value);
    setSelectedUsers((prev) => {
      const selectedIdSet = new Set(selectedUserIds);
      const prevIdSet = new Set(prev.map((user) => user.id));

      // only update if the selection actually changed
      if (
        selectedIdSet.size === prevIdSet.size &&
        [...selectedIdSet].every((id) => prevIdSet.has(id))
      ) {
        return prev;
      }

      // keep existing users that are still selected
      const existingUsers = prev.filter((user) => selectedIdSet.has(user.id));
      const existingIds = new Set(existingUsers.map((user) => user.id));

      // find new ids for user data
      const newIds = selectedUserIds.filter((id) => !existingIds.has(id));

      if (newIds.length > 0) {
        // try and find new users from search results
        const newUsers = searchResults.filter((user) => newIds.includes(user.id));
        return [...existingUsers, ...newUsers];
      }

      return existingUsers;
    });
  }, [selectedUserIds, searchResults]);

  const handleSelect = useCallback(
    (user: User) => {
      const isSelected = selectedUserIds.includes(user.id);

      let newValue;
      if (isSelected) {
        // Remove user
        newValue = value.filter((item) => item !== user.id);
      } else {
        newValue = [...value, user.id];
      }

      onChange(newValue);
      setOpen(true);
      setSearchTerm('');
    },
    [selectedUserIds, value, onChange],
  );

  const handleRemove = useCallback(
    (userId: string, event?: React.MouseEvent) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      const newValue = value.filter((item) => item !== userId);
      onChange(newValue);
    },
    [value, onChange],
  );

  const handleClearAll = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onChange([]);
    },
    [onChange],
  );

  // exclude already selected users from search results
  const availableUsers = useMemo(
    () => searchResults.filter((user) => !selectedUserIds.includes(user.id)),
    [searchResults, selectedUserIds],
  );

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
    <>
      <div>
        <UserMultiSelect
          props={{
            open,
            setOpen,
            className,
            placeholder,
            selectedData: selectedUsers,
            displayData: displayUsers,
            availableData: availableUsers,
            disabled,
            searchTerm,
            setSearchTerm,
            searchPlaceholder,
            loading,
            emptyMessage,
            hiddenCount,
            value: selectedUserIds,
            handleRemove,
            handleClearAll,
            handleSelect,
          }}
        />
      </div>
    </>
  );
}
