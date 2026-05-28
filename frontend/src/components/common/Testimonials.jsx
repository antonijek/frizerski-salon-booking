import { useState } from "react";
import salonConfig from "../../config/salonConfig";
import SectionWrapper from "./SectionWrapper";

// ============================================
// Testimonials - Sekcija sa utiscima musterija
// ============================================

const StarRating = ({ rating }) => {
    return (
        <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-5 h-5 ${
                        star <= rating ? "text-amber-400" : "text-gray-200"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

const Testimonials = () => {
    const { testimonials } = salonConfig;
    const [activeIndex, setActiveIndex] = useState(0);

    // Ako testimonijali nisu ukljuceni ili nema stavki, ne prikazuj nista
    if (!testimonials?.enabled || !testimonials?.items?.length) return null;

    const { items } = testimonials;

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % items.length);
    };

    return (
        <SectionWrapper
            title={testimonials.title}
            subtitle={testimonials.subtitle}
            background="bg-neutral"
        >
            <div className="max-w-3xl mx-auto">
                {/* Aktivni testimonial */}
                <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-primary-light text-center relative">
                    {/* Navicnik */}
                    <div className="text-5xl text-primary-light mb-4 font-serif leading-none">
                        &ldquo;
                    </div>

                    <StarRating rating={items[activeIndex].rating} />

                    <p className="text-primary-light text-lg leading-relaxed mb-6 italic">
                        &ldquo;{items[activeIndex].text}&rdquo;
                    </p>

                    <div className="w-12 h-0.5 bg-primary-light mx-auto mb-4" />

                    <p className="font-semibold text-primary-dark">
                        {items[activeIndex].name}
                    </p>

                    {/* Navigacija */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={handlePrev}
                            className="w-10 h-10 rounded-full border border-primary-light flex items-center justify-center text-primary-light hover:bg-primary-light hover:text-primary hover:border-primary-light transition-all"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>

                        {/* Dots */}
                        <div className="flex items-center gap-2">
                            {items.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                        index === activeIndex
                                            ? "bg-primary w-6"
                                            : "bg-neutral hover:bg-primary-light"
                                    }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-10 h-10 rounded-full border border-primary-light flex items-center justify-center text-primary-light hover:bg-primary-light hover:text-primary hover:border-primary-light transition-all"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
};

export default Testimonials;
