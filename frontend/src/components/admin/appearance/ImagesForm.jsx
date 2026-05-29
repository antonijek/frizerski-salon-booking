const ImagesForm = ({
    form,
    setForm,
    heroSelectedFile,
    heroPreview,
    heroUploading,
    heroFileInputRef,
    onHeroFileSelect,
    onHeroUpload,
    logoSelectedFile,
    logoPreview,
    logoUploading,
    logoFileInputRef,
    onLogoFileSelect,
    onLogoUpload,
}) => {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-primary-dark mb-4">
                🖼️ Slike
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Logotip
                    </label>
                    <div>
                        <input ref={logoFileInputRef} type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={onLogoFileSelect}
                            className="w-full text-sm text-primary-light file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-light file:text-primary-hover hover:file:bg-primary-light cursor-pointer" />
                        <p className="text-xs text-primary-light mt-1">JPG, PNG, GIF, WebP (max 10MB)</p>
                    </div>
                    {logoPreview && (
                        <div className="mt-2"><img src={logoPreview} alt="Logo" className="h-16 object-contain rounded-lg border border-gray-100" /></div>
                    )}
                    {logoSelectedFile && (
                        <button type="button" onClick={onLogoUpload} disabled={logoUploading}
                            className="mt-2 w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition text-sm font-medium disabled:opacity-50">
                            {logoUploading ? "Uploadovanje..." : "Uploaduj logo"}
                        </button>
                    )}
                    {form.logo_url && (
                        <div className="mt-2 relative inline-block">
                            <img src={form.logo_url} alt="Logo" className="h-16 object-contain rounded-lg border border-gray-100" />
                            <button type="button" onClick={() => setForm(p => ({ ...p, logo_url: "" }))}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
                        </div>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Hero slika (pozadina)
                    </label>
                    <div>
                        <input ref={heroFileInputRef} type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={onHeroFileSelect}
                            className="w-full text-sm text-primary-light file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-light file:text-primary-hover hover:file:bg-primary-light cursor-pointer" />
                        <p className="text-xs text-primary-light mt-1">JPG, PNG, GIF, WebP (max 10MB)</p>
                    </div>
                    {heroPreview && (
                        <div className="mt-2">
                            <div className="h-24 rounded-lg bg-cover bg-center border border-gray-100" style={{ backgroundImage: `url(${heroPreview})` }} />
                        </div>
                    )}
                    {heroSelectedFile && (
                        <button type="button" onClick={onHeroUpload} disabled={heroUploading}
                            className="mt-2 w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition text-sm font-medium disabled:opacity-50">
                            {heroUploading ? "Uploadovanje..." : "Uploaduj sliku"}
                        </button>
                    )}
                    {form.hero_image_url && (
                        <div className="mt-2 relative">
                            <div className="h-24 rounded-lg bg-cover bg-center border border-gray-100" style={{ backgroundImage: `url(${form.hero_image_url})` }} />
                            <button type="button" onClick={() => setForm(p => ({ ...p, hero_image_url: "" }))}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImagesForm;
