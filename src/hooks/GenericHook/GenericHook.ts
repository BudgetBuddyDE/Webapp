import {type TEntityStore} from './GenericStore';

export type TGenericHook<T, X = {}, FA = {}> = Omit<
  TEntityStore<T, X, FA>,
  'set' | 'data' | 'getData' | 'fetchData'
> & {
  data: ReturnType<TEntityStore<T, X, FA>['getData']>;
};
