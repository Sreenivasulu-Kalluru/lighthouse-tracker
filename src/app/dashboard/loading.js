// This is a Server Component, so no "use client" is needed
export default function Loading() {
  // A simple Tailwind CSS spinner
  return (
    <div className="w-full flex justify-center items-center py-20">
      <div
        className="w-12 h-12 rounded-full animate-spin
                    border-4 border-solid border-blue-500 border-t-transparent"
      ></div>
    </div>
  );
}
