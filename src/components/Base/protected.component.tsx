import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/';

export const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { session } = React.useContext(AuthContext);
  return session === null ? <Navigate to="/sign-in" replace /> : <>{children}</>;
};

export const ProtectedComponent: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { session } = React.useContext(AuthContext);
  if (session === null) return null;
  return <>{children}</>;
};
