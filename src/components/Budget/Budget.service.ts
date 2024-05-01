import {
  PocketBaseCollection,
  type TBudget,
  type TCreateBudgetPayload,
  type TUpdateBudgetPayload,
  ZBudget,
} from '@budgetbuddyde/types';
import {type RecordModel} from 'pocketbase';
import {z} from 'zod';

import {pb} from '@/pocketbase';

export class BudgetService {
  /**
   * Creates a new budget record.
   * @param payload - The payload containing the data for the new budget record.
   * @returns A Promise that resolves to the created budget record.
   */
  static async createBudget(payload: TCreateBudgetPayload): Promise<RecordModel> {
    const record = await pb.collection(PocketBaseCollection.BUDGET).create(payload);
    return record;
  }

  /**
   * Updates a budget with the specified ID using the provided payload.
   * @param budgetId - The ID of the budget to update.
   * @param payload - The payload containing the updated budget data.
   * @returns A Promise that resolves to the updated budget record.
   */
  static async updateBudget(budgetId: TBudget['id'], payload: TUpdateBudgetPayload): Promise<RecordModel> {
    const record = await pb.collection(PocketBaseCollection.BUDGET).update(budgetId, payload);
    return record;
  }

  /**
   * Retrieves the budgets from the PocketBase collection.
   * @returns A promise that resolves to an array of TBudget objects.
   * @throws If there is an error parsing the retrieved records.
   */
  static async getBudgets(): Promise<TBudget[]> {
    const records = await pb.collection(PocketBaseCollection.BUDGET).getFullList({
      expand: 'category',
    });

    const parsingResult = z.array(ZBudget).safeParse(records);
    if (!parsingResult.success) throw parsingResult.error;
    return parsingResult.data;
  }

  /**
   * Deletes a budget with the specified ID.
   * @param budgetId - The ID of the budget to delete.
   * @returns A promise that resolves to a boolean indicating whether the budget was successfully deleted.
   */
  static async deleteBudget(budgetId: TBudget['id']): Promise<boolean> {
    const record = await pb.collection(PocketBaseCollection.BUDGET).delete(budgetId);
    return record;
  }
}
