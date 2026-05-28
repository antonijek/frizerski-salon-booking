// ============================================
// ConfirmDialog - Dijalog za potvrdu akcije
// ============================================

const ConfirmDialog = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Obriši",
    cancelText = "Odustani",
    isLoading = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <div className="text-center">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold text-primary-dark mb-2">
                        {title || "Potvrda"}
                    </h3>
                    <p className="text-primary-light mb-6">{message}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 py-2 border border-gray-300 text-primary-dark rounded-lg hover:bg-primary-light transition font-medium disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Brisanje..." : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
