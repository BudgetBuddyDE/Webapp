export type Filter = {
  keyword: string | null;
  categories: number[] | null;
  paymentMethods: number[] | null;
  dateFrom: Date | null;
  dateTo: Date | null;
  priceFrom: number | null;
  priceTo: number | null;
};
