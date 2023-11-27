import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DashboardRoute from '@/routes/Dashboard.route';
import TransactionsRoute from './routes/Transactions.route';
import SubscriptionsRoute from './routes/Subscriptions.route';
import PaymentMethodsRoute from './routes/PaymentMethods.route';
import CategoriesRoute from './routes/Categories.route';
import NotFoundPage from '@/routes/NotFound.route';
import SignInRoute from './routes/SignIn.route';
import SignUpRoute from './routes/SignUp.route';
import BudgetRoute from './routes/Budget.route';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<DashboardRoute />} />
        <Route path="/transactions" element={<TransactionsRoute />} />
        <Route path="/subscriptions" element={<SubscriptionsRoute />} />
        <Route path="/budgets" element={<BudgetRoute />} />
        <Route path="/payment-methods" element={<PaymentMethodsRoute />} />
        <Route path="/categories" element={<CategoriesRoute />} />
        <Route path="/sign-in" element={<SignInRoute />} />
        <Route path="/sign-up" element={<SignUpRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
