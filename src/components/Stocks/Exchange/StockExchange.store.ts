import {type TStockExchange} from '@budgetbuddyde/types';

import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/GenericStore';

import {type TStockExchangeAutocompleteOption} from './StockExchangeAutocomplete.component';

export const useStockExchangeStore = GenerateGenericStore<
  TStockExchange[],
  {selectOptions: TStockExchangeAutocompleteOption[]}
>(
  async () => {
    return [];
    // const records = await pb.collection(PocketBaseCollection.STOCK_EXCHANGE).getFullList();

    // const parsingResult = z.array(ZStockExchange).safeParse(records);
    // if (!parsingResult.success) {
    //   console.error(parsingResult.error);
    //   return [];
    // }
    // return parsingResult.data;
  },
  {selectOptions: []},
);
