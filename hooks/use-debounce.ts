'use client';

import { debounce } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';

export default function useDebounce(callback: () => void, delay: number) {
  const ref = useRef(() => {});

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.();
    };

    return debounce(func, delay);
  }, []);

  return debouncedCallback;
}
