import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import { Link, Outlet } from 'react-router-dom';

function BaseLayout() {
  return (
    <main className="">
      <Navbar />
      <Outlet />
      <Footer />
    </main>
  );
}

function AuthLayout() {
  return (
    <main>
      <Link to="/" className="fixed top-4 left-4 px-3 py-2 bg-black text-white rounded-md">
        Back to Home
      </Link>
      <Outlet />
    </main>
  );
}

export { BaseLayout, AuthLayout };
