const IDDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
        <p className="text-gray-800 text-center mb-4">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100"
          >
            Current
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default IDDialog;
