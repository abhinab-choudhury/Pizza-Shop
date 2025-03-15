import { PizzaIcon } from 'lucide-react';

function PageNotFound() {
  return (
    <div className="border-t-2 h-screen mx-auto grid place-items-center text-center px-8">
      <div>
        <PizzaIcon className="w-14 h-14 mx-auto" />
        <h1 className="mt-10 !text-3xl !leading-snug md:!text-4xl">
          Error 404 <br /> It looks like something went wrong.
        </h1>
        <h4 className="mt-8 mb-14 text-[18px] font-normal text-gray-500 mx-auto md:max-w-sm">
          Don&apos;t worry, our team is already on it.Please try refreshing the page or come back
          later.
        </h4>
        <button className="w-full md:w-[8rem] bg-black text-white rounded-md px-4 py-2">
          back home
        </button>
      </div>
    </div>
  );
}

export default PageNotFound;
