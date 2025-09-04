'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X } from 'lucide-react';
import { User } from '@/types/db.types';
import { Table, TableBody, TableRow, TableCell } from './table';
import { SELECT_ROLE_VALUES } from '@/lib/db/schema/enums';
import { UserMultiSelect } from './multi-select';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

export type MemberValue = Array<{ userId: string; role: string }>;

interface MemberMultiSelectProps {
  value: MemberValue;
  onChange: (value: MemberValue) => void;
  fetchFunction: (searchTerm: string) => Promise<User[]>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  maxDisplayCount?: number;
  debounceMs?: number;
}

export function AddMemberMultiSelect({
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
  const selectedUserIds = useMemo(() => value.map((item) => item.userId), [value]);

  // fetch users based on search term with debouncing
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
        newValue = value.filter((item) => item.userId !== user.id);
      } else {
        // Add user with default role
        newValue = [...value, { userId: user.id, role: 'member' }];
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

      const newValue = value.filter((item) => item.userId !== userId);
      onChange(newValue);
    },
    [value, onChange],
  );

  const handleRoleChange = useCallback(
    (userId: string, newRole: string) => {
      const newValue = value.map((item) =>
        item.userId === userId ? { ...item, role: newRole } : item,
      );
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
      {displayUsers.length > 0 && (
        <SelectedUserTable
          selectedUsers={displayUsers}
          userRoles={value}
          handleRemove={handleRemove}
          handleRoleChange={handleRoleChange}
          handleClearAll={handleClearAll}
        />
      )}
    </>
  );
}

function SelectedUserTable({
  selectedUsers,
  userRoles,
  handleRemove,
  handleRoleChange,
  handleClearAll,
}: {
  selectedUsers: Array<User>;
  userRoles: Array<{ userId: string; role: string }>;
  handleRemove: (userId: string, event?: React.MouseEvent) => void;
  handleRoleChange: (userId: string, role: string) => void;
  handleClearAll: (event: React.MouseEvent) => void;
}) {
  const getUserRole = (userId: string) => {
    return userRoles.find((item) => item.userId === userId)?.role || 'member';
  };

  return (
    <div className="bg-input/30 rounded-sm">
      <Table>
        <TableBody>
          {selectedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div key={user.id} className="flex items-center gap-3 px-3 py-2">
                  {user.imgLink && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.imgLink} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback>
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-muted-foreground truncate text-sm">
                      {user.primaryEmailAddress}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-row items-center justify-center gap-2">
                  <p>Role:</p>
                  <select
                    name="role"
                    value={getUserRole(user.id)}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="border-border bg-card rounded-lg border px-3 py-2 capitalize focus:outline-hidden focus-visible:ring"
                  >
                    {
                      // exclude owner as selectable role
                      SELECT_ROLE_VALUES.filter((v) => v !== 'owner').map((role, index) => (
                        <option key={index} value={role}>
                          {role}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </TableCell>
              <TableCell>
                <button
                  type="button"
                  onClick={(e) => handleRemove(user.id, e)}
                  className="hover:bg-destructive hover:text-destructive-foreground ml-1 inline-flex cursor-pointer items-center justify-center rounded-sm"
                >
                  <X size={16} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex-end border-border flex flex-row justify-center border-t-1 p-2">
        <button
          type="button"
          onClick={handleClearAll}
          className="text-muted-foreground hover:text-foreground text-md px-1d inline-flex h-5 cursor-pointer items-center"
        >
          Remove All
        </button>
      </div>
    </div>
  );
}
