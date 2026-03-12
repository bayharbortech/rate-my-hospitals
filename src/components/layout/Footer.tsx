import Link from 'next/link';
import { Stethoscope } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container mx-auto px-4 py-10 md:py-16">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-bold text-xl text-primary">
                            <Stethoscope className="h-6 w-6" />
                            <span>RateMyHospital</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Empowering nurses with transparent workplace reviews. Anonymous, secure, and community-driven.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Platform</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/employers" className="hover:text-primary">Browse Hospitals</Link></li>
                            <li><Link href="/reviews/submit" className="hover:text-primary">Write a Review</Link></li>
                            <li><Link href="/search" className="hover:text-primary">Search</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Community</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/guidelines" className="hover:text-primary">Community Guidelines</Link></li>
                            <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-primary">Contact Support</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                            <li><Link href="/disclaimer" className="hover:text-primary">Disclaimer</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} RateMyHospital. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
