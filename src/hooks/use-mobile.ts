import { useSyncExternalStore } from 'react'

const query = window.matchMedia('(max-width: 767px)')
function subscribe(listener: () => void) {
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}
export function useIsMobile() {
  return useSyncExternalStore(subscribe, () => query.matches)
}
