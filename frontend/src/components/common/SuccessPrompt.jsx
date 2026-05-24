// ============================================
// SuccessPrompt - Poruka posle uspesnog zakazivanja
// ============================================

const SuccessPrompt = ({ show, onNavigate }) => {
    if (!show) return null;

    return (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
            <p className="text-green-800 font-medium mb-3">
                ✅ Termin uspešno zakazan!
            </p>
            <p className="text-green-700 text-sm mb-4">
                Možete pregledati i upravljati svim svojim terminima u profilu.
            </p>
            <button
                onClick={() => onNavigate("/moj-profil")}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
            >
                👤 Pogledaj moj profil
            </button>
        </div>
    );
};

export default SuccessPrompt;
