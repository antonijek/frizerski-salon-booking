import useBookingForm from "../hooks/useBookingForm";
import FormField from "./common/FormField";
import TimeSlotPicker from "./common/TimeSlotPicker";
import SuccessPrompt from "./common/SuccessPrompt";

// ============================================
// BookingForm - Forma za zakazivanje termina
// ============================================

const BookingForm = ({ onNavigate }) => {
    const {
        values,
        errors,
        touched,
        services,
        barbers,
        selectedBarber,
        timeSlots,
        bookedTimes,
        pastSlots,
        loading,
        showProfilePrompt,
        minDate,
        maxDateStr,
        handleChange,
        handleBlur,
        handleSubmit,
        isDateAvailable,
        setShowProfilePrompt,
    } = useBookingForm();

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Zakažite termin
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Ime i prezime */}
                <FormField
                    label="Ime i prezime"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.name}
                    touched={touched.name}
                    placeholder="Unesite ime i prezime"
                    required
                />

                {/* Telefon */}
                <FormField
                    label="Broj telefona"
                    name="phone"
                    type="tel"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.phone}
                    touched={touched.phone}
                    placeholder="061/234-567"
                    required
                />

                {/* Email */}
                <FormField
                    label="Email (opciono)"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="email@primer.com"
                />

                {/* Datum */}
                <FormField
                    label="Datum"
                    name="date"
                    type="date"
                    value={values.date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.date}
                    touched={touched.date}
                    min={minDate}
                    max={maxDateStr}
                    required
                />

                {/* Vreme */}
                <TimeSlotPicker
                    timeSlots={timeSlots}
                    bookedTimes={bookedTimes}
                    pastSlots={pastSlots}
                    selectedTime={values.time}
                    onSelect={handleChange}
                    error={errors.time}
                    touched={touched.time}
                />

                {/* Usluga */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Usluga *
                    </label>
                    <select
                        name="service"
                        value={values.service}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                            touched.service && errors.service
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                        }`}
                    >
                        <option value="">Izaberite uslugu</option>
                        {services.map((service) => (
                            <option key={service.id} value={service.name}>
                                {service.icon} {service.name} - {service.price}€
                                (~{service.duration}min)
                            </option>
                        ))}
                    </select>
                    {touched.service && errors.service && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.service}
                        </p>
                    )}
                </div>

                {/* Izbor frizera (opciono) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Željeni frizer (opciono)
                    </label>
                    <select
                        name="barber_id"
                        value={values.barber_id || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    >
                        <option value="">Bilo koji frizer</option>
                        {barbers.map((barber) => (
                            <option key={barber.id} value={barber.id}>
                                ✂️ {barber.name}
                                {barber.work_start &&
                                    barber.work_end &&
                                    ` (${barber.work_start}-${barber.work_end})`}
                            </option>
                        ))}
                    </select>
                    {selectedBarber && (
                        <p className="mt-1 text-xs text-gray-500">
                            Radno vreme: {selectedBarber.work_start || "?"} -{" "}
                            {selectedBarber.work_end || "?"}
                        </p>
                    )}
                </div>

                {/* Upozorenje ako datum nije radni dan */}
                {values.date && !isDateAvailable(values.date) && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                        ⚠️{" "}
                        {selectedBarber
                            ? "Izabrani frizer ne radi na ovaj dan. Izaberite drugi datum ili drugog frizera."
                            : "Nijedan frizer ne radi na ovaj dan. Izaberite drugi datum."}
                    </div>
                )}

                {/* Submit dugme */}
                <button
                    type="submit"
                    disabled={
                        loading ||
                        (values.date && !isDateAvailable(values.date))
                    }
                    className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Zakazivanje..." : "Zakaži termin"}
                </button>
            </form>

            {/* Prompt za pregled profila posle zakazivanja */}
            <SuccessPrompt
                show={showProfilePrompt}
                onNavigate={() => {
                    setShowProfilePrompt(false);
                    onNavigate("/moj-profil");
                }}
            />
        </div>
    );
};

export default BookingForm;
