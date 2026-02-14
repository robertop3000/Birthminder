// Re-export everything from BirthdaysContext for backward compatibility.
// All components that import from hooks/useBirthdays will now get
// the shared context-based version instead of isolated per-component state.
export { useBirthdaysContext as useBirthdays } from '../contexts/BirthdaysContext';
export type { Person, PersonGroup, BirthdayInput } from '../contexts/BirthdaysContext';
