import { ShieldCheck, Star, Users, Building2 } from 'lucide-react';

export function StatsSection() {
    return (
        <section className="py-8 bg-white relative z-10 -mt-1">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-teal-600 mb-1">12.5K+</div>
                        <div className="text-sm text-muted-foreground font-medium">Verified Reviews</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-teal-600 mb-1">847</div>
                        <div className="text-sm text-muted-foreground font-medium">Hospitals Listed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-teal-600 mb-1">15K+</div>
                        <div className="text-sm text-muted-foreground font-medium">Nurses Helped</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-teal-600 mb-1">98%</div>
                        <div className="text-sm text-muted-foreground font-medium">Would Recommend</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function TrustBadges() {
    return (
        <section className="py-8 bg-slate-50 border-y">
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
                    <div className="flex items-center gap-2 text-slate-600">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="font-semibold text-sm">HIPAA Compliant</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                        <Star className="w-5 h-5" />
                        <span className="font-semibold text-sm">Real Reviews</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                        <Users className="w-5 h-5" />
                        <span className="font-semibold text-sm">Community Moderated</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                        <Building2 className="w-5 h-5" />
                        <span className="font-semibold text-sm">Updated Weekly</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
