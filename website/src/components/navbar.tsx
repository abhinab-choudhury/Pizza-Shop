import mascot from '@/assets/pinocchio_72.gif';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const { pathname } = useLocation();
  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full h-26 flex justify-center items-center bg-white">
        <div className="absolute top-0 left-0 w-full h-full flex">
          <div className="w-[30%] h-full bg-green-600"></div>
          <div className="w-[40%] h-full bg-white border-b-1"></div>
          <div className="w-[30%] h-full bg-red-700"></div>
        </div>

        <div className="relative justify-between align-middle items-center flex gap-10 z-10 text-center">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-poppins font-bold">
            Pinocchio's Pizza & Subs
          </h1>
          <img src={mascot} className="h-24" />
        </div>
      </div>
      <div className="font-poppins flex flex-row justify-center align-middle items-center ">
        <ul className="w-fit flex flex-row justify-center align-middle items-center gap-8">
          <Link to={'/'}>
            <button
              className={
                pathname === '/'
                  ? 'border border-b-transparent rounded-br-none rounded-bl-none rounded-sm bg-black text-white font-semibold p-2'
                  : 'p-2'
              }
            >
              Home
            </button>
          </Link>
          <Link to="/menu">
            <button
              className={
                pathname === '/menu'
                  ? 'border border-b-transparent rounded-br-none rounded-bl-none rounded-sm bg-black text-white font-semibold p-2'
                  : 'p-2'
              }
            >
              Menu
            </button>
          </Link>
          <Link to="/contact">
            <button
              className={
                pathname === '/contact'
                  ? 'border border-b-transparent rounded-br-none rounded-bl-none rounded-sm bg-black text-white font-semibold p-2'
                  : 'p-2'
              }
            >
              Contact Us
            </button>
          </Link>
          <Link to="/auth/login">
            <button
              className={
                pathname === '/login'
                  ? 'border border-b-transparent rounded-br-none rounded-bl-none rounded-sm bg-black text-white font-semibold p-2'
                  : 'p-2'
              }
            >
              Login
            </button>
          </Link>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
