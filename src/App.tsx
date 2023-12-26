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
import VerifyMailRoute from './routes/VerifyMail.route';
import RequestPasswordResetRoute from './routes/RequestPasswordReset.route';
import ResetPasswordRoute from './routes/ResetPassword.route';
import SettingsRoute from './routes/Settings.route';

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
        <Route path="/settings/profile" element={<SettingsRoute />} />
        <Route path="/sign-in" element={<SignInRoute />} />
        <Route path="/sign-up" element={<SignUpRoute />} />
        <Route path="/verify-email" element={<VerifyMailRoute />} />
        <Route path="/request-password-reset" element={<RequestPasswordResetRoute />} />
        <Route path="/reset-password" element={<ResetPasswordRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
