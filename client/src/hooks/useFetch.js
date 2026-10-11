import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../utils/format.js';

/** Runs an async loader on mount and whenever deps change. Exposes loading/error/reload. */
export default function useFetch(loader, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const seq = useRef(0);

  const run = useCallback(() => {
    const id = ++seq.current;
    setLoading(true);
    setError('');
    return loader()
      .then((res) => { if (id === seq.current) setData(res); })
      .catch((err) => { if (id === seq.current) setError(errorMessage(err)); })
      .finally(() => { if (id === seq.current) setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);
  return { data, loading, error, reload: run, setData };
}
