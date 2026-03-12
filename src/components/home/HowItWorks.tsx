import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function HowItWorks() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Making informed career decisions has never been easier
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="relative">
                        <Link href="/employers" className="block h-full">
                            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 h-full border border-teal-100 hover:shadow-lg hover:border-teal-200 transition-all cursor-pointer">
                                <div className="w-14 h-14 bg-teal-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-6">
                                    1
                                </div>
                                <h3 className="text-xl font-bold mb-3">Search Hospitals</h3>
                                <p className="text-muted-foreground">
                                    Browse by location, specialty, or hospital system. Filter by ratings that matter to you.
                                </p>
                            </div>
                        </Link>
                        <ChevronRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-teal-300 z-10" />
                    </div>

                    <div className="relative">
                        <Link href="/reviews" className="block h-full">
                            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 h-full border border-cyan-100 hover:shadow-lg hover:border-cyan-200 transition-all cursor-pointer">
                                <div className="w-14 h-14 bg-cyan-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-6">
                                    2
                                </div>
                                <h3 className="text-xl font-bold mb-3">Read Real Reviews</h3>
                                <p className="text-muted-foreground">
                                    Get unfiltered insights on staffing ratios, management, pay, and culture from nurses who&apos;ve been there.
                                </p>
                            </div>
                        </Link>
                        <ChevronRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-cyan-300 z-10" />
                    </div>

                    <div>
                        <Link href="/reviews/submit" className="block h-full">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 h-full border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer">
                                <div className="w-14 h-14 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-6">
                                    3
                                </div>
                                <h3 className="text-xl font-bold mb-3">Share Your Experience</h3>
                                <p className="text-muted-foreground">
                                    Help fellow nurses by anonymously sharing your own workplace review. Your voice matters.
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
