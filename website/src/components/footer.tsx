function Footer() {
  return (
    <footer className="bg-white px-6">
      <div className="container py-8 mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex items-center justify-between gap-10 z-10 text-center">
            <h1 className="text-2xl font-poppins font-bold">Pinocchio's Pizza & Subs</h1>
          </div>

          <p className="max-w-md mx-auto mt-4 text-gray-500 dark:text-gray-400">
            Enjoy delicious pizza and subs made with fresh ingredients.
          </p>
        </div>

        <hr className="my-10 border-gray-200 dark:border-gray-700" />

        <div className="flex flex-col items-center sm:flex-row sm:justify-between">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Pinocchio's Pizza & Subs. All Rights Reserved.
          </p>

          <div className="flex mt-3 sm:mt-0">
            <a
              href="#"
              className="mx-2 text-sm text-gray-500 transition-colors duration-300 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Terms
            </a>
            <a
              href="#"
              className="mx-2 text-sm text-gray-500 transition-colors duration-300 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Privacy
            </a>
            <a
              href="#"
              className="mx-2 text-sm text-gray-500 transition-colors duration-300 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
