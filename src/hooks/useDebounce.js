import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value.
 *
 * WHAT IS DEBOUNCING?
 * When a user types "Matrix" in a search box, without debounce the app
 * would make 6 API calls: "M", "Ma", "Mat", "Matr", "Matri", "Matrix".
 * With debounce, it waits until the user STOPS typing (300ms by default)
 * and then makes ONE call with "Matrix".
 *
 * HOW IT WORKS:
 * 1. User types → value changes → timer starts (300ms)
 * 2. User types again → timer RESETS (old one cancelled)
 * 3. User stops typing → timer fires → debounced value updates
 * 4. Component re-renders with the new debounced value → API call fires
 *
 * USAGE:
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 300);
 *
 *   useEffect(() => {
 *     fetchMovies(debouncedSearch);  // Only fires after 300ms pause
 *   }, [debouncedSearch]);
 *
 * @param {any} value - The value to debounce
 * @param {number} delay - Milliseconds to wait (default 300)
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update the debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: if value changes before timer fires, cancel it
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
