import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthentificatedLayout, NotAuthentificatedLayout } from '@/components';
import {
    Budget,
    Categories,
    Dashboard,
    PaymentMethods,
    RequestReset,
    ResetPassword,
    Settings,
    SignIn,
    SignUp,
    Subscriptions,
    Transactions,
} from '@/routes';

const NonAuthWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return <NotAuthentificatedLayout>{children}</NotAuthentificatedLayout>;
};

export const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AuthentificatedLayout />}>
                    <Route index element={<Navigate to="/dashboard" />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="budget" element={<Budget />} />
                    <Route path="subscriptions" element={<Subscriptions />} />
                    <Route path="payment-methods" element={<PaymentMethods />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="settings" element={<Settings />}>
                        <Route path="profile" element={<h1>profile</h1>} />
                        <Route path="profile/edit" element={<h1>edit profile</h1>} />
                        <Route path="feedback" element={<h1>feedback</h1>} />
                    </Route>
                </Route>
                <Route path="/sign-in" element={<NonAuthWrapper children={<SignIn />} />} />
                <Route path="/sign-up" element={<NonAuthWrapper children={<SignUp />} />} />
                <Route path="/request-reset" element={<NonAuthWrapper children={<RequestReset />} />} />
                <Route path="/reset-password" element={<NonAuthWrapper children={<ResetPassword />} />} />
                <Route path="*" element={<NonAuthWrapper children={<h1>Page Not Found</h1>} />} />
            </Routes>
        </BrowserRouter>
    );
};
