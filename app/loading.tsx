export default function Loading() {
  // Stack uses React Suspense, which will render this page while user data is being fetched.
  // See: https://nextjs.org/docs/app/api-reference/file-conventions/loading
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-6">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-4">
          <div className="h-8 w-48 bg-gray-200 rounded-md mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded-md mx-auto animate-pulse"></div>
        </div>
        <div className="bg-white rounded-md shadow-md p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md mb-4"></div>
          <div className="h-8 bg-gray-200 rounded-md mb-4"></div>
          <div className="h-8 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}
