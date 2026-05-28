const ImagesForm = ({
    form,
    handleChange,
    heroUploadMode,
    heroSelectedFile,
    heroPreview,
    heroUploading,
    heroFileInputRef,
    onHeroFileSelect,
    onHeroUpload,
    onHeroModeChange,
}) => {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-primary-dark mb-4">
                🖼️ Slike
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        URL logotipa
                    </label>
                    <input
                        type="url"
                        name="logo_url"
                        value={form.logo_url}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                    {form.logo_url && (
                        <img
                            src={form.logo_url}
                            alt="Logo preview"
                            className="mt-2 h-16 object-contain rounded-lg border border-gray-100"
                            onError={(e) => {
                                e.target.style.display = "none";
                            }}
                        />
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Hero slika (pozadina)
                    </label>

                    {/* Tabs for selecting input mode */}
                    <div className="flex gap-2 mb-3">
                        <button
                            type="button"
                            onClick={() => onHeroModeChange("url")}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
                                heroUploadMode === "url"
                                    ? "bg-primary text-white"
                                    : "bg-neutral text-primary-light hover:bg-primary-light"
                            }`}
                        >
                            URL sa interneta
                        </button>
                        <button
                            type="button"
                            onClick={() => onHeroModeChange("upload")}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
                                heroUploadMode === "upload"
                                    ? "bg-primary text-white"
                                    : "bg-neutral text-primary-light hover:bg-primary-light"
                            }`}
                        >
                            Upload sa računara
                        </button>
                    </div>

                    {heroUploadMode === "upload" ? (
                        <>
                            {/* File upload */}
                            <div>
                                <input
                                    ref={heroFileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={onHeroFileSelect}
                                    className="w-full text-sm text-primary-light file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-light file:text-primary-hover hover:file:bg-primary-light cursor-pointer"
                                />
                                <p className="text-xs text-primary-light mt-1">
                                    Dozvoljeni formati: JPG, PNG, GIF, WebP (max
                                    10MB)
                                </p>
                            </div>

                            {/* Upload preview */}
                            {heroPreview && (
                                <div className="mt-2">
                                    <div
                                        className="h-24 rounded-lg bg-cover bg-center border border-gray-100"
                                        style={{
                                            backgroundImage: `url(${heroPreview})`,
                                        }}
                                    />
                                </div>
                            )}

                            {/* Upload button */}
                            {heroSelectedFile && (
                                <button
                                    type="button"
                                    onClick={onHeroUpload}
                                    disabled={heroUploading}
                                    className="mt-2 w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition text-sm font-medium disabled:opacity-50"
                                >
                                    {heroUploading
                                        ? "Uploadovanje..."
                                        : "📤 Uploaduj sliku"}
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <input
                                type="url"
                                name="hero_image_url"
                                value={form.hero_image_url}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            />
                        </>
                    )}

                    {/* Current hero image display */}
                    {form.hero_image_url && heroUploadMode === "url" && (
                        <div
                            className="mt-2 h-24 rounded-lg bg-cover bg-center border border-gray-100"
                            style={{
                                backgroundImage: `url(${form.hero_image_url})`,
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImagesForm;
