import { Card, CardContent } from '@/components/ui/card';
import {
    ShieldCheck, TrendingUp, Users, Heart, MessageSquare, ClipboardCheck,
} from 'lucide-react';

export function WhyTrustUs() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Nurses Trust Us</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Built with the unique needs of healthcare professionals in mind
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-teal-50/50">
                        <CardContent className="p-8">
                            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                                <ShieldCheck className="w-6 h-6 text-teal-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">100% Anonymous</h3>
                            <p className="text-muted-foreground">
                                We never share your identity. Review without fear of retaliation from employers or colleagues.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-cyan-50/50">
                        <CardContent className="p-8">
                            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
                                <ClipboardCheck className="w-6 h-6 text-cyan-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Community Moderated</h3>
                            <p className="text-muted-foreground">
                                Every review is checked by our moderation team. No spam, no fake reviews, no hospital marketing.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-blue-50/50">
                        <CardContent className="p-8">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Salary Insights</h3>
                            <p className="text-muted-foreground">
                                Compare real salary data by unit, experience level, and shift differential across hospitals.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-violet-50/50">
                        <CardContent className="p-8">
                            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-6">
                                <Users className="w-6 h-6 text-violet-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Staffing Ratios</h3>
                            <p className="text-muted-foreground">
                                Know what you&apos;re walking into. See actual nurse-to-patient ratios reported by unit.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-rose-50/50">
                        <CardContent className="p-8">
                            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-6">
                                <Heart className="w-6 h-6 text-rose-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Culture & Support</h3>
                            <p className="text-muted-foreground">
                                Discover which hospitals truly support their nurses with mentorship, growth, and work-life balance.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-amber-50/50">
                        <CardContent className="p-8">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                                <MessageSquare className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Honest Feedback</h3>
                            <p className="text-muted-foreground">
                                Both pros and cons. We don&apos;t filter negative reviews—transparency is our promise.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
