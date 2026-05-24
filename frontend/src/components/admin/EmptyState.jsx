const EmptyState = ({ icon = "📭", message = "Nema podataka" }) => {
    return (
        <div className="text-center py-12 bg-white rounded-xl">
            <div className="text-5xl mb-4">{icon}</div>
            <p className="text-gray-500">{message}</p>
        </div>
    );
};

export default EmptyState;
