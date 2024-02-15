import { z } from 'zod';
import {
  type TTransactionFile,
  type TApiResponse,
  type TFile,
  type TTransaction,
  type TServiceResponse,
  ZTransactionFile,
} from '@budgetbuddyde/types';
import { prepareRequestOptions } from '@/utils';
import { type IAuthContext } from '@/core/Auth';
import { isRunningInProdEnv } from '@/utils/isRunningInProdEnv.util';

const ZDetachResponse = z.object({
  path: z.string(),
  files: z.array(ZTransactionFile),
});
export type TDetachResponse = z.infer<typeof ZDetachResponse>;

export class FileService {
  private static host = isRunningInProdEnv() ? (process.env.FILE_SERVICE_HOST as string) : '/file';
  private static serviceUrl = process.env.FILE_SERVICE_HOST;

  static getFileUrl(file: TFile, { uuid }: IAuthContext['authOptions']): string {
    return `${this.serviceUrl}/static/${uuid}/${file.name}`;
  }

  static getAuthentificatedFileLink(
    fileUrl: string,
    { uuid, password }: IAuthContext['authOptions']
  ) {
    const query = new URLSearchParams();
    query.append('bearer', `${uuid}.${password}`);
    return `${fileUrl}?${query.toString()}`;
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

  static async attachFilesToTransaction(
    transactionId: TTransaction['id'],
    files: File[],
    user: IAuthContext['authOptions']
  ): Promise<TServiceResponse<TTransactionFile[]>> {
    if (files.length === 0) return [null, new Error('No files to upload')];
    const query = new URLSearchParams();
    query.append('transactionId', transactionId.toString());
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file, file.name));
    try {
      const requestOptions = prepareRequestOptions(user);
      const requestHeaders = new Headers(requestOptions.headers);
      if (requestHeaders.has('Content-Type')) requestHeaders.delete('Content-Type');
      const response = await fetch(`${this.host}/transaction/upload?${query.toString()}`, {
        method: 'POST',
        body: formData,
        headers: requestHeaders,
      });
      const json = (await response.json()) as TApiResponse<TFile[]>;
      if (json.status !== 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZTransactionFile).safeParse(json.data);
      if (!parsingResult.success) return [null, new Error(parsingResult.error.message)];
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async detachFilesFromTransaction(
    transactionId: TTransaction['id'],
    files: TTransactionFile['uuid'][],
    user: IAuthContext['authOptions']
  ): Promise<TServiceResponse<TDetachResponse>> {
    try {
      const query = new URLSearchParams();
      query.append('transactionId', transactionId.toString());
      files.forEach((file) => query.append('files', file));

      const response = await fetch(`${this.host}/transaction/delete?${query.toString()}`, {
        method: 'DELETE',
        headers: {
          ...prepareRequestOptions(user).headers,
        },
      });
      const json = (await response.json()) as TApiResponse<{ path: string; files: TFile[] }>;
      if (json.status !== 200) return [null, new Error(json.message!)];

      const parsingResult = ZDetachResponse.safeParse(json.data);
      if (!parsingResult.success) return [null, new Error(parsingResult.error.message)];
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }
}
