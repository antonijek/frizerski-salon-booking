import { useAppContext } from "../../context/AppContext";

// ============================================
// Notification komponenta
// ============================================

const Notification = () => {
    const { notification, hideNotification } = useAppContext();

    if (!notification) return null;

    const typeStyles = {
        success: "bg-green-100 text-green-700 border-green-200",
        error: "bg-red-100 text-red-700 border-red-200",
        info: "bg-blue-100 text-blue-700 border-blue-200",
        warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };

    const icons = {
        success: "✅",
        error: "❌",
        info: "ℹ️",
        warning: "⚠️",
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div
                className={`px-6 py-4 rounded-lg border shadow-lg ${
                    typeStyles[notification.type] || typeStyles.info
                } flex items-center gap-3 max-w-md`}
            >
                <span className="text-xl">
                    {icons[notification.type] || icons.info}
                </span>
                <p className="flex-1 text-sm font-medium">
                    {notification.message}
                </p>
                <button
                    onClick={hideNotification}
                    className="p-1 hover:opacity-70 transition"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default Notification;
