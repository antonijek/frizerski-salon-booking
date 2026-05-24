const NotificationBanner = ({ type = "error", message, onClose }) => {
    if (!message) return null;

    const styles = {
        error: "bg-red-50 border border-red-200 text-red-700",
        success: "bg-green-50 border border-green-200 text-green-700",
        info: "bg-blue-50 border border-blue-200 text-blue-700",
    };

    return (
        <div
            className={`${styles[type] || styles.error} px-4 py-3 rounded-lg mb-6 text-sm flex justify-between items-center`}
        >
            <span>{message}</span>
            {onClose && (
                <button
                    onClick={onClose}
                    className="ml-4 text-current opacity-60 hover:opacity-100"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export default NotificationBanner;
