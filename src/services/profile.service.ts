import { supabase } from '../supabase';
import type { uuid, IBaseProfile, IExportProfile } from '../types/profile.interface';
import type { TExportType } from '../components/user-profile.component';

export class ProfileService {
  private static table = 'profiles';

  /**
   * Get the user-profile, ready for the export
   */
  static export(userId: uuid, type: TExportType = 'json'): Promise<IExportProfile[] | string> {
    return new Promise((res, rej) => {
      switch (type) {
        case 'json':
          supabase
            .from<IBaseProfile>(this.table)
            .select(`*`)
            .eq('id', userId)
            .then((result) => {
              if (result.error) rej(result.error);
              // @ts-ignore
              res(result.data ?? []);
            });
          break;

        case 'csv':
          supabase
            .from<IBaseProfile>(this.table)
            .select(`*`)
            .eq('id', userId)
            .csv()
            .then((result) => {
              if (result.error) rej(result.error);
              res((result.data as string) ?? '');
            });
          break;
      }
    });
  }
}
