import { uuid } from '@/types';

export interface IBaseProfile {
    id: uuid;
    username: string;
    avatar_url: string | null;
    website: string | null;
    updated_at: null | string | Date;
}

export interface IExportProfile {
    id: uuid;
    username: string;
    avatar_url: string | null;
    website: string | null;
    updated_at: null | string | Date;
}
