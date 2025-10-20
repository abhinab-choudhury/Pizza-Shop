export default function loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900 dark:border-gray-100"></div>
      <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
        Loading...
      </p>
    </div>
  );
}