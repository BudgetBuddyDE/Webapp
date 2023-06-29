import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthentificatedLayout } from './components/Layout/AuthentificatedLayout.component';
import { NotAuthentificatedLayout } from './components/Layout/NotAuthentificatedLayout.component';
import BudgetRoute from './routes/Budget.route';
import CategoriesRoute from './routes/Categories.route';
import DashboardRoute from './routes/Dashboard.route';
import PageNotFoundRoute from './routes/PageNotFound.route';
import PaymentMethodsRoute from './routes/PaymentMethods.route';
import RequestPasswordResetRoute from './routes/RequestPasswordReset.route';
import ResetPasswordRoute from './routes/ResetPasswordRoute.route';
import SettingsRoute from './routes/Settings.route';
import SignInRoute from './routes/SignIn.route';
import SignUpRoute from './routes/SignUp.route';
import SubscriptionsRoute from './routes/Subscriptions.route';
import TransactionsRoute from './routes/Transactions.route';

const NonAuthWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return <NotAuthentificatedLayout>{children}</NotAuthentificatedLayout>;
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AuthentificatedLayout />}>
                    <Route index element={<Navigate to="/dashboard" />} />
                    <Route path="dashboard" element={<DashboardRoute />} />
                    <Route path="transactions" element={<TransactionsRoute />} />
                    <Route path="budget" element={<BudgetRoute />} />
                    <Route path="subscriptions" element={<SubscriptionsRoute />} />
                    <Route path="payment-methods" element={<PaymentMethodsRoute />} />
                    <Route path="categories" element={<CategoriesRoute />} />
                    {/* Settings */}
                    <Route path="settings" element={<SettingsRoute />} />
                    <Route path="settings/profile" element={<SettingsRoute />} />
                    <Route path="settings/profile/edit" element={<SettingsRoute editProfile />} />
                    <Route path="settings/feedback" element={<SettingsRoute />} />
                </Route>
                <Route path="/sign-in" element={<NonAuthWrapper children={<SignInRoute />} />} />
                <Route path="/sign-up" element={<NonAuthWrapper children={<SignUpRoute />} />} />
                <Route path="/request-reset" element={<NonAuthWrapper children={<RequestPasswordResetRoute />} />} />
                <Route path="/reset-password" element={<NonAuthWrapper children={<ResetPasswordRoute />} />} />
                <Route path="*" element={<PageNotFoundRoute />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
