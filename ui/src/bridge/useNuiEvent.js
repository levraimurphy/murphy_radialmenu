import { useEffect } from 'react';

export default function useNuiEvent(action, handler) {
  useEffect(() => {
    function listener(event) {
      if (event.data?.action === action) {
        handler(event.data.payload || {});
      }
    }
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [action, handler]);
}
