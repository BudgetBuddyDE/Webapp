import {describe, expect, it} from 'vitest';

import {AppConfig} from './app.config';
import {Feature} from './components/Feature';

describe('AppConfig', () => {
  it('should have the correct feature', () => {
    expect(AppConfig.feature[Feature.STOCKS]).toBe(process.env.STOCK_SERVICE_HOST !== undefined);
  });
});
