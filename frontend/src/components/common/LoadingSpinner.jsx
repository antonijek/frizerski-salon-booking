// ============================================
// LoadingSpinner - Indikator učitavanja
// ============================================

const LoadingSpinner = ({ message = "Učitavanje..." }) => {
    return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
                <div className="text-5xl mb-4 animate-spin">⏳</div>
                <p className="text-primary-light">{message}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
