import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {FullPageLoader} from './components/Loading/FullPageLoader.component';
import {DashboardLayout, DashboardView, BudgetView, StocksView} from './routes/Dashboard';
import StockRoute from './routes/Stock.route';
import StocksRoute from './routes/Stocks.route';
import TransactionsRoute from './routes/Transactions.route';
import SubscriptionsRoute from './routes/Subscriptions.route';
import PaymentMethodsRoute from './routes/PaymentMethods.route';
import CategoriesRoute from './routes/Categories.route';
import NotFoundPage from './routes/NotFound.route';
const SignInRoute = React.lazy(() => import('./routes/SignIn.route'));
const SignUpRoute = React.lazy(() => import('./routes/SignUp.route'));
const VerifyMailRoute = React.lazy(() => import('./routes/VerifyMail.route'));
const RequestPasswordResetRoute = React.lazy(() => import('./routes/RequestPasswordReset.route'));
const ResetPasswordRoute = React.lazy(() => import('./routes/ResetPassword.route'));
import SettingsRoute from './routes/Settings.route';

const App = () => {
  return (
    <React.Suspense fallback={<FullPageLoader />}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardLayout useOutletInsteadOfChildren />}>
            <Route index element={<DashboardView />} />
            <Route path="budget" element={<BudgetView />} />
            <Route path="stocks" element={<StocksView />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
          <Route path="/stocks">
            <Route index element={<StocksRoute />} />
            <Route path=":isin" element={<StockRoute />} />
          </Route>
          <Route path="/transactions" element={<TransactionsRoute />} />
          <Route path="/subscriptions" element={<SubscriptionsRoute />} />
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
    </React.Suspense>
  );
};

export default App;
