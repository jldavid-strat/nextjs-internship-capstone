'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LabelMultiSelect } from './multi-select';
import { ProjectLabelTableData } from '../data-table/project-label-table';

interface AddLabelMultiSelectProps {
  value: Array<ProjectLabelTableData['id']>;
  defaultValues?: Array<ProjectLabelTableData>;
  onChange: (value: Array<ProjectLabelTableData['id']>) => void;
  fetchFunction: (searchTerm: string) => Promise<ProjectLabelTableData[]>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  maxDisplayCount?: number;
  debounceMs?: number;
}

export function AddLabelMultiSelect({
  value = [],
  defaultValues = [],
  onChange,
  fetchFunction,
  placeholder = 'Select labels...',
  searchPlaceholder = 'Search labels...',
  emptyMessage = 'No labels found',
  disabled = false,
  className,
  maxDisplayCount = 6,
  debounceMs = 200,
}: AddLabelMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProjectLabelTableData[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<ProjectLabelTableData[]>([]);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout>(null);

  const selectedLabelIds = useMemo(() => value.map((item) => item), [value]);

  // sync defaultValues on mount or in the event they change
  useEffect(() => {
    if (defaultValues?.length > 0) {
      setSelectedLabels(defaultValues);
      onChange(defaultValues.map((d) => d.id));
    }
  }, [defaultValues, onChange]);

  // fetch labels with debouncing
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const labels = await fetchFunction(searchTerm);
        setSearchResults(labels);
      } catch (error) {
        console.error('Failed to fetch labels:', error);
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

  // keep selectedLabels updated when `value` changes
  useEffect(() => {
    setSelectedLabels((prev) => {
      const selectedIdSet = new Set(selectedLabelIds);
      const prevIdSet = new Set(prev.map((label) => label.id));

      if (
        selectedIdSet.size === prevIdSet.size &&
        [...selectedIdSet].every((id) => prevIdSet.has(id))
      ) {
        return prev;
      }

      const existingLabels = prev.filter((label) => selectedIdSet.has(label.id));
      const existingIds = new Set(existingLabels.map((label) => label.id));
      const newIds = selectedLabelIds.filter((id) => !existingIds.has(id));

      if (newIds.length > 0) {
        const newLabels = searchResults.filter((label) => newIds.includes(label.id));
        return [...existingLabels, ...newLabels];
      }

      return existingLabels;
    });
  }, [selectedLabelIds, searchResults]);

  const handleSelect = useCallback(
    (label: ProjectLabelTableData) => {
      const isSelected = selectedLabelIds.includes(label.id);

      const newValue = isSelected
        ? value.filter((item) => item !== label.id)
        : [...value, label.id];

      onChange(newValue);
      setOpen(true);
      setSearchTerm('');
    },
    [selectedLabelIds, value, onChange],
  );

  const handleRemove = useCallback(
    (id: ProjectLabelTableData['id'], event?: React.MouseEvent) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      const newValue = value.filter((item) => item !== id);
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

  const availableLabels = useMemo(
    () => searchResults.filter((label) => !selectedLabelIds.includes(label.id)),
    [searchResults, selectedLabelIds],
  );

  const displayLabels = selectedLabels.slice(0, maxDisplayCount);
  const hiddenCount = selectedLabels.length - maxDisplayCount;

  return (
    <LabelMultiSelect
      props={{
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
        value: selectedLabelIds,
        handleRemove,
        handleClearAll,
        handleSelect,
      }}
    />
  );
}
