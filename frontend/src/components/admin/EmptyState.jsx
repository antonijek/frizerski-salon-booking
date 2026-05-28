const EmptyState = ({ icon = "📭", message = "Nema podataka" }) => {
    return (
        <div className="text-center py-12 bg-white rounded-xl">
            <div className="text-5xl mb-4">{icon}</div>
            <p className="text-primary-light">{message}</p>
        </div>
    );
};

export default EmptyState;
