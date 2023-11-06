import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DashboardRoute from '@/routes/Dashboard.route';
import NotFoundPage from '@/routes/NotFound.route';
import SignInRoute from './routes/SignIn.route';
import SignUpRoute from './routes/SignUp.route';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<DashboardRoute />} />
        <Route path="/sign-in" element={<SignInRoute />} />
        <Route path="/sign-up" element={<SignUpRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
