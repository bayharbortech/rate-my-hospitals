import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTASection() {
    return (
        <section className="py-24 bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

            <div className="container mx-auto px-4 text-center relative z-10">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Your Voice Matters</h2>
                    <p className="text-xl mb-10 text-teal-100 leading-relaxed">
                        Every review helps a nurse find a better workplace. Share your experience anonymously
                        and make a difference in someone&apos;s career.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/reviews/submit">
                            <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 font-bold text-lg px-8 h-14 rounded-xl shadow-lg">
                                Write a Review
                            </Button>
                        </Link>
                        <Link href="/employers">
                            <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 font-bold text-lg px-8 h-14 rounded-xl shadow-lg">
                                Browse Hospitals
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
