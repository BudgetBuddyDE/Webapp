import React from 'react';
import { AuthContext } from '../../context';

export type ProtectedComponentsProps = React.PropsWithChildren;

export const ProtectedComponents: React.FC<ProtectedComponentsProps> = ({ children }) => {
  const { session } = React.useContext(AuthContext);
  return session && session.user ? <React.Fragment>{children}</React.Fragment> : null;
};
