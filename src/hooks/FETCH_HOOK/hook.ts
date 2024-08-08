import {type TEntityStore} from './store';

export type TGenericHook<T, X = {}> = Omit<TEntityStore<T, X>, 'set' | 'data' | 'getData' | 'fetchData'> & {
  data: ReturnType<TEntityStore<T, X>['getData']>;
};
