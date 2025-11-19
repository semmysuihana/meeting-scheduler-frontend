import { useEffect } from "react";

export default function ShowAlert({
  setShowAlert,
  alert,
}: {
  setShowAlert: (value: boolean) => void;
  alert: string;
}) {

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [setShowAlert]);

  return (
    <div
      className="fixed top-10 right-4 flex items-center justify-between max-w-sm w-full p-4 mb-4 text-sm text-white border border-blue-400 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 shadow-lg z-50"
      role="alert"
    >
      <span>{alert}</span>

      <button
        onClick={() => {setShowAlert(false); alert = ""}}
        className="ml-4 text-white hover:text-gray-200 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
