import React from 'react';
import { Navigate } from 'react-router-dom';
import { FullPageLoader } from '@/components/Loading';
import { useAuthContext } from '../Auth.context';
import { AuthLayout } from './Auth.layout';
import { NotVerified } from './NotVerified.component';

/**
 * **IMPORTANT**
 *
 * Need to be wrapped by the **AuthProvider** from **src/core/Auth/Auth.context**
 */
export function withAuthLayout<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P & { isAuthenticated?: boolean }) {
    const { loading, session } = useAuthContext();

    if (loading) return <FullPageLoader />;
    if (!session) return <Navigate to="/sign-in" />;
    return (
      <AuthLayout>{session.isVerified ? <Component {...props} /> : <NotVerified />}</AuthLayout>
    );
  };
}
