import { AppConfig } from '@/App.config';
import { ActionPaper, Card, Linkify, NoResults } from '@/components/Base';
import { Pagination, type PaginationHandler } from '@/components/Base/Pagination';
import { Table } from '@/components/Base/Table';
import { DeleteDialog } from '@/components/DeleteDialog.component';
import { ContentGrid } from '@/components/Layout';
import { CircularProgress } from '@/components/Loading';
import { withAuthLayout } from '@/core/Auth/Layout';
import { CreateCategoryDrawer, EditCategoryDrawer } from '@/core/Category';
import { DescriptionTableCellStyle } from '@/style/DescriptionTableCell.style';
import { TCategory } from '@/types';
import { AddRounded, DeleteRounded, EditRounded } from '@mui/icons-material';
import {
  Box,
  Grid,
  IconButton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';

interface BudgetsHandler {
  onSearch: (keyword: string) => void;
  onCategoryDelete: (category: TCategory) => void;
  onConfirmCategoryDelete: () => void;
  onEditCategory: (category: TCategory) => void;
  pagination: PaginationHandler;
}

export const DATE_RANGE_INPUT_FORMAT = 'dd.MM';
export type TChartContentType = 'INCOME' | 'SPENDINGS';
export const ChartContentTypes = [
  { type: 'INCOME' as TChartContentType, label: 'Income' },
  { type: 'SPENDINGS' as TChartContentType, label: 'Spendings' },
];

export const Budgets = () => {
  return <ContentGrid title={'Budget'}></ContentGrid>;
};

export default withAuthLayout(Budgets);
