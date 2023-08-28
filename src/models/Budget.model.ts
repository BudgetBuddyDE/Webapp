import { BudgetService } from '@/services/Budget.service';
import type { uuid } from '@/type';
import type { BudgetProgressView } from '@/type/budget.type';
import type { CategoryView } from '@/type/category.type';

export class Budget {
  id: number;
  category: CategoryView;
  budget: number;
  currentlySpent: number;
  created_by: uuid;
  updated_at: Date;
  inserted_at: Date;

  constructor({ id, category, budget, currentlySpent, created_by, updated_at, inserted_at }: BudgetProgressView) {
    this.id = id;
    this.category = category;
    this.budget = budget;
    this.currentlySpent = currentlySpent ?? 0;
    this.created_by = created_by;
    this.updated_at = new Date(updated_at);
    this.inserted_at = new Date(inserted_at);
  }

  async update(updatedInformation: { budget: number }) {
    try {
      return await BudgetService.update(this.id, {
        ...updatedInformation,
        created_by: this.created_by,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async delete() {
    try {
      return await BudgetService.deleteById(this.id);
    } catch (error) {
      console.error(error);
    }
  }
}
