export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-black">
      <div className="p-8 bg-gray-900 rounded-2xl shadow-2xl border border-green-500/30 text-center">
        <h1 className="text-4xl font-bold text-green-500 mb-4">Submission Received!</h1>
        <p className="text-gray-400">Thank you for completing the regional assessment.</p>
        <p className="mt-2 text-sm text-gray-600">You may now close this tab.</p>
      </div>
    </div>
  );
}