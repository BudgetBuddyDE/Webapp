import {type IEntityStore} from './store';

export interface IGenericHook<T> extends Omit<IEntityStore<T>, 'data' | 'getData' | 'fetchData'> {
  data: ReturnType<IEntityStore<T>['getData']>;
}
