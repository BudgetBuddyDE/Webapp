import React from 'react';

import {useAuthContext} from '@/components/Auth';
import {AuthLayout, UnauthentificatedLayout} from '@/components/Auth/Layout';

import {Feature} from './Feature.enum';
import {FeatureNotEnabled} from './FeatureNotEnabled.component';
import {isFeatureEnabled} from './isFeatureEnabled';

export function withFeatureFlag<P extends object>(
  feature: Feature,
  Component: React.ComponentType<P>,
  wrapWithLayout = false,
) {
  return function WrappedComponent(props: P & {isAuthenticated?: boolean}) {
    const {sessionUser} = useAuthContext();

    if (!isFeatureEnabled(feature)) {
      if (!wrapWithLayout) return <FeatureNotEnabled />;
      return sessionUser ? (
        <AuthLayout>
          <FeatureNotEnabled />
        </AuthLayout>
      ) : (
        <UnauthentificatedLayout>
          <FeatureNotEnabled />
        </UnauthentificatedLayout>
      );
    }
    return <Component {...props} />;
  };
}
