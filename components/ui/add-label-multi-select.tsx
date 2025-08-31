'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LabelMultiSelect } from './multi-select';
import { ProjectLabelTableData } from '../data-table/project-label-table';

interface AddLabelMultiSelectProps {
  value: Array<ProjectLabelTableData['id']>;
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

  // extract label IDs from the value array - memoize to prevent infinite re-renders
  const selectedLabelIds = useMemo(() => value.map((item) => item), [value]);

  // fetch labels based on search term with debouncing
  // also runs on mount even if the search term is empty to get default project labels
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

  // update selected labels - optimize to prevent infinite re-renders
  useEffect(() => {
    console.log(value);
    setSelectedLabels((prev) => {
      const selectedIdSet = new Set(selectedLabelIds);
      const prevIdSet = new Set(prev.map((label) => label.id));

      // only update if the selection actually changed
      if (
        selectedIdSet.size === prevIdSet.size &&
        [...selectedIdSet].every((id) => prevIdSet.has(id))
      ) {
        return prev;
      }

      // keep existing labels that are still selected
      const existingLabels = prev.filter((label) => selectedIdSet.has(label.id));
      const existingIds = new Set(existingLabels.map((label) => label.id));

      // find new ids for label data
      const newIds = selectedLabelIds.filter((id) => !existingIds.has(id));

      if (newIds.length > 0) {
        // try and find new labels from search results
        const newLabels = searchResults.filter((label) => newIds.includes(label.id));
        return [...existingLabels, ...newLabels];
      }

      return existingLabels;
    });
  }, [selectedLabelIds, searchResults]);

  const handleSelect = useCallback(
    (label: ProjectLabelTableData) => {
      const isSelected = selectedLabelIds.includes(label.id);

      let newValue;
      if (isSelected) {
        // Remove label
        newValue = value.filter((item) => item !== label.id);
      } else {
        // Add label
        newValue = [...value, label.id];
      }

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

      console.log('id', id);
      console.log(
        'value',
        value.filter((item) => item !== id),
      );

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

  // exclude already selected labels from search results
  const availableLabels = useMemo(
    () => searchResults.filter((label) => !selectedLabelIds.includes(label.id)),
    [searchResults, selectedLabelIds],
  );

  // run fetchFunction once on mount
  // cleanup debounce on mount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const displayLabels = selectedLabels.slice(0, maxDisplayCount);
  const hiddenCount = selectedLabels.length - maxDisplayCount;

  return (
    <>
      <div>
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
      </div>
    </>
  );
}
