import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { To } from 'react-router-dom';
import { AuthContext } from '../../context';

export type ProtectedRoutesProps = {
  redirectTo?: To;
};

export const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ redirectTo = '/sign-in' }) => {
  const { session } = React.useContext(AuthContext);

  React.useEffect(() => {
    console.log(session);
  }, [session]);
  return <Outlet />;
  // return session && session.user ? <Outlet /> : <Navigate to={redirectTo} replace />;
};
