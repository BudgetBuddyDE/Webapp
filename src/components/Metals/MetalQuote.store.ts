import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/store';

import {MetalService, type TMetalQuote} from './Metal.service';

export const useMetalQuoteStore = GenerateGenericStore<TMetalQuote[]>(async () => {
  const [result, error] = await MetalService.getQuotes();
  if (error) console.error(error);
  return (result ?? []).filter(Boolean);
});
