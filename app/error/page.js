import Link from "next/link";

export default async function ErrorPage({ searchParams }) {
  const { message } = await searchParams;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Authentication Error
        </h1>
        <p className="text-gray-600 mb-4">
          Sorry, there was an error during authentication. Please try again.
        </p>
        
        {message && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-left">
            <p className="text-sm text-red-700 font-medium">Error details:</p>
            <p className="text-sm text-red-600 break-words">{message}</p>
          </div>
        )}

        <Link
          href="/"
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
