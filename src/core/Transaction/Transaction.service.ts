import { z } from 'zod';
import {
  ZTransaction,
  type EDailyTransactionType,
  type TApiResponse,
  type TCreateTransactionPayload,
  type TDailyTransaction,
  type TDeleteTransactionPayload,
  type TTransaction,
  type TUpdateTransactionPayload,
  ZDailyTransaction,
  type TDeleteTransactionResponsePayload,
  ZDeleteTransactionResponsePayload,
  type TTransactionFile,
  type TFile,
  type TCreateTransactionFilePayload,
} from '@budgetbuddyde/types';
import { format, isSameMonth, subDays } from 'date-fns';
import { isRunningInProdEnv } from '@/utils/isRunningInProdEnv.util';
import { prepareRequestOptions } from '@/utils';
import { type IAuthContext } from '../Auth';
import { type TDashboardStats } from '@/components/DashboardStatsWrapper.component';
import { FileService } from '@/services/File.service';

/**
 * Service for managing transactions.
 */
export class TransactionService {
  private static host =
    (isRunningInProdEnv() ? (process.env.BACKEND_HOST as string) : '/api') + '/v1/transaction';

  /**
   * Retrieves transactions by UUID.
   * @param authOptions - The authentication options containing the UUID and password.
   * @param requestOptions - Optional request options for the fetch request.
   * @returns A promise that resolves to an array of transactions or an error.
   */
  static async getTransactionsByUuid({
    uuid,
    password,
  }: IAuthContext['authOptions']): Promise<[TTransaction[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(this.host + '?' + query.toString(), {
        ...prepareRequestOptions({ uuid, password }),
      });
      const json = (await response.json()) as TApiResponse<TTransaction[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZTransaction).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  /**
   * Retrieves daily transactions within a specified date range.
   * @param startDate The start date of the range.
   * @param endDate The end date of the range.
   * @param requestedData The type of data to be retrieved.
   * @param user The user's authentication options.
   * @returns A promise that resolves to an array of daily transactions or an error.
   */
  static async getDailyTransactions(
    startDate: Date,
    endDate: Date,
    requestedData: EDailyTransactionType,
    user: IAuthContext['authOptions']
  ): Promise<[TDailyTransaction[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('startDate', format(startDate, 'yyyy-MM-dd'));
      query.append('endDate', format(endDate, 'yyyy-MM-dd'));
      query.append('requestedData', requestedData.toString());
      const response = await fetch(this.host + '/daily?' + query.toString(), {
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TDailyTransaction[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZDailyTransaction).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  /**
   * Retrieves the dashboard statistics for a user.
   * @param user - The authentication options for the user.
   * @returns A promise that resolves to an array containing the dashboard statistics or an error.
   */
  static async getDashboardStats(
    user: IAuthContext['authOptions'],
    requestOptions?: RequestInit
  ): Promise<[TDashboardStats | null, Error | null]> {
    try {
      const response = await fetch(this.host + '/stats', {
        ...prepareRequestOptions(user),
        ...requestOptions,
      });
      const json = (await response.json()) as TApiResponse<TDashboardStats>;
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  /**
   * Returns an array of unique receivers from the given transactions within a specified number of days.
   * The receivers are sorted based on their frequency of occurrence in the transactions.
   *
   * @param transactions - The array of transactions.
   * @param days - The number of days to consider for filtering the transactions. Default is 30 days.
   * @returns An array of unique receivers sorted by frequency of occurrence.
   */
  static getUniqueReceivers(transactions: TTransaction[], days: number = 30): string[] {
    const uniqueReceivers = Array.from(new Set(transactions.map(({ receiver }) => receiver)));
    const now = new Date();
    const startDate = subDays(now, days);
    const receiverFrequencyMap: { [receiver: string]: number } = {};

    let pastNTransactions = transactions.filter(({ processedAt }) => processedAt >= startDate);
    if (pastNTransactions.length < 1) pastNTransactions = transactions.slice(0, 50);
    pastNTransactions.forEach(({ receiver, processedAt }) => {
      if (processedAt >= startDate && processedAt <= now) {
        receiverFrequencyMap[receiver] = (receiverFrequencyMap[receiver] || 0) + 1;
      }
    });

    return uniqueReceivers
      .map((receiver) => ({
        receiver,
        frequency: receiverFrequencyMap[receiver] || -1,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .map(({ receiver }) => receiver);
  }

  /**
   * Retrieves the unique senders of a set of transactions.
   * @param transactions - The transactions to retrieve the unique senders from.
   * @returns An array containing the unique senders.
   */
  static async create(
    transaction: TCreateTransactionPayload[],
    user: IAuthContext['authOptions']
  ): Promise<[TTransaction[] | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'POST',
        body: JSON.stringify(transaction),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TTransaction[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZTransaction).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  /**
   * Updates a transaction.
   * @param transaction - The updated transaction payload.
   * @param user - The user authentication options.
   * @returns A promise that resolves to a tuple containing the updated transaction or null, and an error or null.
   */
  static async update(
    transaction: TUpdateTransactionPayload,
    user: IAuthContext['authOptions']
  ): Promise<[TTransaction | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'PUT',
        body: JSON.stringify(transaction),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TTransaction>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZTransaction.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  /**
   * Deletes a transaction.
   * @param transaction - The transaction to be deleted.
   * @param user - The user's authentication options.
   * @returns A promise that resolves to an array containing the deleted transaction or null, and an error or null.
   */
  static async delete(
    transaction: TDeleteTransactionPayload,
    user: IAuthContext['authOptions']
  ): Promise<[TDeleteTransactionResponsePayload | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'DELETE',
        body: JSON.stringify(transaction),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TDeleteTransactionResponsePayload>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZDeleteTransactionResponsePayload.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  /**
   * Calculates the total received earnings from a list of transactions.
   * Only transactions with a positive transfer amount and processed within the current month are considered.
   * @deprecated Use the getDashboardStats method instead.
   * @param transactions - The list of transactions to calculate the earnings from.
   * @returns The total received earnings.
   */
  static calculateReceivedEarnings(transactions: TTransaction[]): number {
    const now = new Date();
    const num = transactions
      .filter(
        ({ transferAmount, processedAt }) =>
          transferAmount > 0 && processedAt <= now && isSameMonth(processedAt, now)
      )
      .reduce((prev, cur) => prev + cur.transferAmount, 0);
    return Number(num.toFixed(2));
  }

  /**
   * Calculates the total upcoming earnings from a list of transactions.
   * Only transactions that are in the current month, have a future processed date, and have a positive transfer amount are considered.
   * @deprecated Use the getDashboardStats method instead.
   * @param transactions - The list of transactions to calculate the upcoming earnings from.
   * @returns The total upcoming earnings.
   */
  static calculateUpcomingEarnings(transactions: TTransaction[]): number {
    const now = new Date();
    const num = transactions
      .filter(
        ({ processedAt, transferAmount }) =>
          isSameMonth(processedAt, now) && processedAt > now && transferAmount > 0
      )
      .reduce((prev, cur) => prev + cur.transferAmount, 0);
    return Number(num.toFixed(2));
  }

  /**
   * Converts a transaction object into an update payload object.
   * @param transaction - The transaction object to be converted.
   * @returns The update payload object.
   */
  static toUpdatePayload(transaction: TTransaction): TUpdateTransactionPayload {
    return {
      transactionId: transaction.id,
      categoryId: transaction.category.id,
      paymentMethodId: transaction.paymentMethod.id,
      receiver: transaction.receiver,
      transferAmount: transaction.transferAmount,
      processedAt: transaction.processedAt,
      description: transaction.description,
    };
  }

  /**
   * Transforms a transaction file into a payload for creating a transaction file.
   * @param file - The transaction file to transform.
   * @returns The payload for creating a transaction file.
   */
  static transformTransactionFileToCreatePayload(
    file: TTransactionFile,
    transactionId: TTransaction['id']
  ): TCreateTransactionFilePayload {
    return {
      transactionId,
      fileName: file.fileName,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      fileUrl: file.location,
    };
  }

  /**
   * Transforms a TFile object into a payload for creating a transaction file.
   * @param file The TFile object to transform.
   * @returns The transformed payload.
   */
  static transformTFileToCreatePayload(
    file: TFile,
    transactionId: TTransaction['id'],
    user: IAuthContext['authOptions']
  ): TCreateTransactionFilePayload {
    return {
      transactionId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      fileUrl: FileService.getFileUrl(file, user),
    };
  }
}
