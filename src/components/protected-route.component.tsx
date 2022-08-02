import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

export const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();
  const { session } = React.useContext(AuthContext);

  React.useEffect(() => {
    if (!session) return navigate('/sign-in', { replace: true });
  }, [session]);

  return <>{children}</>;
};
