/**
 * Object used in views
 */
export interface IPaymentMethodView {
  id: number;
  name: string;
  address: string;
  provider: string;
  description: string | null;
}
