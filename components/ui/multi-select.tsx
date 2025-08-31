import { ProjectLabelData, User } from '@/types/db.types';
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
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { DEFAULT_COLOR } from '@/lib/validations/project-label.validations';
import { ProjectLabelTableData } from '../data-table/project-label-table';

export type MultiSelectProps<TData, TDataId> = {
  open: boolean;
  setOpen: (input: boolean) => void;
  className?: string;
  placeholder: string;
  selectedData: TData[];
  displayData: TData[];
  availableData: TData[];
  disabled: boolean;
  searchTerm: string;
  setSearchTerm: (input: string) => void;
  searchPlaceholder: string;
  loading: boolean;
  emptyMessage: string;
  hiddenCount: number;
  value: Array<TDataId>;
  handleRemove: (input: TDataId, event?: React.MouseEvent) => void;
  handleClearAll: (event: React.MouseEvent) => void;
  handleSelect: (input: TData) => void;
};

export function UserMultiSelect({ props }: { props: MultiSelectProps<User, User['id']> }) {
  const {
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
                      <Avatar className="h-4 w-4">
                        <AvatarImage
                          src={user.imgLink}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <AvatarFallback>
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
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
            {!loading &&
              availableUsers.length === 0 &&
              (searchTerm ? (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              ) : (
                <div className="text-muted-foreground p-4 text-center text-sm">
                  Type to search for users
                </div>
              ))}
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
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.imgLink}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
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

export function LabelMultiSelect({
  props,
}: {
  props: MultiSelectProps<ProjectLabelTableData, ProjectLabelTableData['id']>;
}) {
  const {
    open,
    setOpen,
    className,
    placeholder,
    selectedData: selectedLabels,
    displayData: displayLabels,
    availableData: availableLabels,
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
            {selectedLabels.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {displayLabels.map((label) => (
                  <Badge
                    key={label.id}
                    className="text-sm"
                    style={{ color: label.color ?? '#017de2' }}
                    variant="outline"
                  >
                    <span className="max-w-[100px] truncate text-xs">{label.labelName}</span>
                    <span
                      onClick={(e) => handleRemove(label.id, e)}
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
            {selectedLabels.length > 0 && (
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

      <PopoverContent className="border-border w-[300px] p-0" align="start">
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
            {!loading &&
              availableLabels.length === 0 &&
              (searchTerm ? (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              ) : (
                <div className="text-muted-foreground p-4 text-center text-sm">
                  Type to search for labels
                </div>
              ))}
            {!loading && availableLabels.length > 0 && (
              <CommandGroup>
                {availableLabels.map((label) => (
                  <CommandItem
                    key={label.id}
                    value={label.labelName}
                    onSelect={() => handleSelect(label)}
                    className="flex items-center gap-2 px-3 py-2"
                  >
                    <Badge
                      className="text-sm"
                      style={{ color: label.color ?? DEFAULT_COLOR }}
                      variant="outline"
                    >
                      {label.labelName}
                    </Badge>
                    {value.includes(label.id) && <Check className="ml-auto h-4 w-4" />}
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
