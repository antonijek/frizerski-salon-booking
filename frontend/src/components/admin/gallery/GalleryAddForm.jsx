const GalleryAddForm = ({
    showAddForm,
    addMode,
    setAddMode,
    saving,
    imageUrl,
    setImageUrl,
    urlPreview,
    setUrlPreview,
    selectedFile,
    preview,
    altText,
    setAltText,
    fileInputRef,
    handleFileSelect,
    handleAdd,
}) => {
    if (!showAddForm) return null;

    return (
        <form
            onSubmit={handleAdd}
            className="mb-6 p-4 bg-neutral rounded-xl border border-gray-200"
        >
            <div className="space-y-4">
                {/* Tabs za odabir načina dodavanja */}
                <div className="flex gap-2 mb-2">
                    <button
                        type="button"
                        onClick={() => setAddMode("url")}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                            addMode === "url"
                                ? "bg-primary text-white"
                                : "bg-neutral text-primary-light hover:bg-primary-light"
                        }`}
                    >
                        URL sa interneta
                    </button>
                    <button
                        type="button"
                        onClick={() => setAddMode("upload")}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                            addMode === "upload"
                                ? "bg-primary text-white"
                                : "bg-neutral text-primary-light hover:bg-primary-light"
                        }`}
                    >
                        Upload sa računara
                    </button>
                </div>

                {addMode === "upload" ? (
                    <>
                        {/* Upload fajla */}
                        <div>
                            <label className="block text-sm font-medium text-primary-dark mb-1">
                                Izaberi sliku sa kompjutera *
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handleFileSelect}
                                className="w-full text-sm text-primary-light file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-light file:text-primary-hover hover:file:bg-primary-light cursor-pointer"
                            />
                            <p className="text-xs text-primary-light mt-1">
                                Dozvoljeni formati: JPG, PNG, GIF, WebP (max
                                5MB)
                            </p>
                        </div>

                        {/* Preview uploada */}
                        {preview && (
                            <div>
                                <p className="text-sm text-primary-light mb-2">
                                    Preview:
                                </p>
                                <img
                                    src={preview}
                                    alt={altText || "Preview"}
                                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* URL slike */}
                        <div>
                            <label className="block text-sm font-medium text-primary-dark mb-1">
                                URL slike sa interneta *
                            </label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => {
                                    setImageUrl(e.target.value);
                                    setUrlPreview(e.target.value);
                                }}
                                placeholder="https://primer.com/slika.jpg"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                            />
                            <details className="mt-2">
                                <summary className="text-xs text-primary cursor-pointer hover:text-primary-hover font-medium">
                                    Kako da nađem URL slike?
                                </summary>
                                <div className="mt-2 p-3 bg-primary-light rounded-lg text-xs text-primary-light space-y-2">
                                    <p className="font-medium text-primary-dark">
                                        Sa Facebook-a:
                                    </p>
                                    <p>
                                        1. Otvori objavu sa slikom u pregledaču
                                        (Chrome, Safari)
                                    </p>
                                    <p>
                                        2. Desni klik (ili drži prst na
                                        mobilnom) na sliku
                                    </p>
                                    <p>
                                        3. Izaberi "Otvori sliku u novoj
                                        kartici" / "Open image in new tab"
                                    </p>
                                    <p>
                                        4. Kopiraj celu adresu iz adresnog polja
                                        (počinje sa https://...)
                                    </p>
                                    <p className="font-medium text-primary-dark mt-2">
                                        Sa Instagram-a:
                                    </p>
                                    <p>
                                        1. Otvori objavu u pregledaču (ne u
                                        aplikaciji)
                                    </p>
                                    <p>
                                        2. Desni klik na sliku → "Otvori sliku u
                                        novoj kartici"
                                    </p>
                                    <p>3. Kopiraj adresu (https://...)</p>
                                    <p className="font-medium text-primary-dark mt-2">
                                        Generalno (bilo koji sajt):
                                    </p>
                                    <p>
                                        1. Desni klik na sliku → "Kopiraj adresu
                                        slike" (Copy image address)
                                    </p>
                                    <p>
                                        2. Ili: otvori sliku u novoj kartici pa
                                        kopiraj adresu
                                    </p>
                                    <p>3. Nalepi ovde (Ctrl+V)</p>
                                </div>
                            </details>
                        </div>

                        {/* Preview URL-a */}
                        {urlPreview && (
                            <div>
                                <p className="text-sm text-primary-light mb-2">
                                    Preview:
                                </p>
                                <img
                                    src={urlPreview}
                                    alt={altText || "Preview"}
                                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                    onLoad={(e) => {
                                        e.target.style.display = "block";
                                    }}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Naziv slike */}
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Naziv slike *
                    </label>
                    <input
                        type="text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="Opis slike"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={
                        saving ||
                        (addMode === "upload" && !selectedFile) ||
                        (addMode === "url" && !imageUrl.trim())
                    }
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition text-sm font-medium disabled:opacity-50"
                >
                    {saving ? "Dodavanje..." : "Dodaj sliku"}
                </button>
            </div>
        </form>
    );
};

export default GalleryAddForm;
