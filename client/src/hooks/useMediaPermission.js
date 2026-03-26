import { useState, useEffect } from 'react';

export default function useMediaPermission() {
  // 'unknown' | 'granted' | 'prompt' | 'denied'
  const [state, setState] = useState('unknown');

  useEffect(() => {
    if (!navigator.permissions || !navigator.permissions.query) {
      setState('prompt'); // Assume prompt if API not available
      return;
    }

    navigator.permissions.query({ name: 'microphone' }).then((result) => {
      setState(result.state);
      result.onchange = () => setState(result.state);
    }).catch(() => {
      setState('prompt');
    });
  }, []);

  return state;
}
