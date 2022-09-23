import { FC, PropsWithChildren, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

export const ProtectedRoute: FC<PropsWithChildren> = ({ children }) => {
  const { session } = useContext(AuthContext);
  return session === null ? <Navigate to="/sign-in" replace /> : <>{children}</>;
};

export const ProtectedComponent: FC<PropsWithChildren> = ({ children }) => {
  const { session } = useContext(AuthContext);
  if (session === null) return null;
  return <>{children}</>;
};
