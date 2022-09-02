import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

export const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { session } = React.useContext(AuthContext);

  return session === null ? <Navigate to="/sign-in" replace /> : <>{children}</>;
};
