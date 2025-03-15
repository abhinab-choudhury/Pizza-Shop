import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Index from './pages';
import { BaseLayout, AuthLayout } from './components/layout';
import About from './pages/about';
import Login from './pages/login';
import Register from './pages/register';
import Menu from './pages/menu';
import PageNotFound from './pages/page-not-found';
import Contact from './pages/contact';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BaseLayout />}>
          <Route index element={<Index />} />
          <Route path="/cart" element />
          <Route path="menu" element={<Menu />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
