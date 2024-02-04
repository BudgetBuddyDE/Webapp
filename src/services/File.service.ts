import { type TTransactionFile, type TApiResponse, type TFile } from '@budgetbuddyde/types';
import { prepareRequestOptions } from '@/utils';
import { type IAuthContext } from '@/core/Auth';
import { isRunningInProdEnv } from '@/utils/isRunningInProdEnv.util';

export class FileService {
  private static host = isRunningInProdEnv() ? (process.env.FILE_SERVICE_HOST as string) : '/file';
  // private static host = '/file';

  static getFileUrl(file: TFile, { uuid }: IAuthContext['authOptions']): string {
    return `${this.host}/static/${uuid}/${file.name}`;
  }

  static getFilePreviewUrl(file: TFile, { uuid, password }: IAuthContext['authOptions']): string {
    const query = new URLSearchParams();
    query.append('bearer', `${uuid}.${password}`);
    return `${this.getFileUrl(file, { uuid, password })}?${query.toString()}`;
  }

  static transformTransactionFileToTFile(transactionFile: TTransactionFile): TFile {
    return {
      name: transactionFile.fileName,
      size: transactionFile.fileSize,
      type: transactionFile.mimeType,
      location: transactionFile.location,
      created_at: transactionFile.createdAt,
      last_edited_at: transactionFile.createdAt,
    };
  }

  // static async checkStatus(
  //   user: IAuthContext['authOptions']
  // ): Promise<[Boolean | null, Error | null]> {
  //   try {
  //     const response = await fetch(this.host + `/status`, {
  //       ...prepareRequestOptions(user),
  //     });
  //     return [response.status === 200 || response.status === 401, null];
  //   } catch (error) {
  //     console.error(error);
  //     return [null, error as Error];
  //   }
  // }

  static async upload(
    files: File[],
    user: IAuthContext['authOptions']
  ): Promise<[TFile[] | null, Error | null]> {
    try {
      if (files.length === 0) return [null, new Error('No files to upload')];
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const requestOptions = prepareRequestOptions(user);
      const requestHeaders = new Headers(requestOptions.headers);
      if (requestHeaders.has('Content-Type')) requestHeaders.delete('Content-Type');
      const response = await fetch(this.host + `/upload`, {
        method: 'POST',
        body: formData,
        ...requestOptions,
        headers: requestHeaders,
      });
      const json = (await response.json()) as TApiResponse<TFile[]>;
      if (json.status !== 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }
}
