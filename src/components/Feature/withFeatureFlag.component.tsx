import React from 'react';

import {AppConfig, Feature} from '@/app.config';
import {useAuthContext} from '@/components/Auth';
import {AuthLayout, UnauthentificatedLayout} from '@/components/Auth/Layout';

import {FeatureNotEnabled} from './FeatureNotEnabled.component';

export function withFeatureFlag<P extends object>(
  feature: Feature,
  Component: React.ComponentType<P>,
  wrapWithLayout = false,
) {
  return function WrappedComponent(props: P & {isAuthenticated?: boolean}) {
    const {sessionUser} = useAuthContext();

    const isFeatureEnabled = AppConfig.feature[feature];
    if (!isFeatureEnabled) {
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
