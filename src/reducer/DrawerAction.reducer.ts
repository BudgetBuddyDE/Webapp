export type DrawerActionState = {
  loading: boolean;
  success: boolean;
  error: string | Error | null;
};

export type DrawerAction =
  | { type: 'RESET' }
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS'; error?: DrawerActionState['error'] }
  | { type: 'ERROR'; error: DrawerActionState['error'] };

export function generateInitialDrawerActionState(): DrawerActionState {
  return {
    loading: false,
    success: false,
    error: null,
  };
}

export function DrawerActionReducer(state: DrawerActionState, action: DrawerAction): DrawerActionState {
  switch (action.type) {
    case 'RESET':
      return generateInitialDrawerActionState();

    case 'SUBMIT':
      return { ...state, loading: true };

    case 'SUCCESS':
      return { ...state, loading: false, success: true, error: action.error ?? null };

    case 'ERROR':
      return { ...state, loading: false, success: false, error: action.error };

    default:
      throw new Error('Trying to execute unknown action');
  }
}
