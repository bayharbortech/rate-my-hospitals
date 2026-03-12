import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, FileText, Users, Scale, Shield, Info, Mail } from "lucide-react";
import Link from "next/link";

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Disclaimer</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Important information about the nature of content on Rate My Hospitals
                        and how it should be used.
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">Last updated: December 2024</p>
                </div>

                {/* General Disclaimer Card */}
                <Card className="mb-8 border-l-4 border-l-amber-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            General Disclaimer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            The information provided on Rate My Hospitals is for general informational
                            purposes only. All information on the site is provided in good faith;
                            however, we make no representation or warranty of any kind, express or
                            implied, regarding the accuracy, adequacy, validity, reliability,
                            availability, or completeness of any information on the site.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                            <p className="text-sm text-amber-800">
                                <strong>Under no circumstance</strong> shall we have any liability to you
                                for any loss or damage of any kind incurred as a result of the use of
                                the site or reliance on any information provided on the site.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Not Professional Advice Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Not Professional Advice
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            The content on this site is not intended to be a substitute for professional
                            advice. The site does not provide:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        Legal or employment advice
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        Medical or healthcare guidance
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        Financial or salary guarantees
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        Career or job counseling
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        Hiring recommendations
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        Official workplace assessments
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                            Always seek the advice of qualified professionals regarding any questions
                            you may have about career decisions, employment matters, or legal issues.
                        </p>
                    </CardContent>
                </Card>

                {/* User Reviews Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-500" />
                            User-Generated Content
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Rate My Hospitals contains reviews, ratings, and salary information submitted
                            by users. This content reflects the opinions and experiences of individual
                            users and does not represent the views of Rate My Hospitals.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <h4 className="font-semibold text-green-700 mb-2">What We Do</h4>
                                <ul className="text-sm text-green-600 space-y-1">
                                    <li>• Provide a platform for sharing</li>
                                    <li>• Moderate for guideline violations</li>
                                    <li>• Remove clearly inappropriate content</li>
                                    <li>• Aggregate anonymous statistics</li>
                                </ul>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                <h4 className="font-semibold text-red-700 mb-2">What We Don&apos;t Do</h4>
                                <ul className="text-sm text-red-600 space-y-1">
                                    <li>• Verify accuracy of claims</li>
                                    <li>• Guarantee salary information</li>
                                    <li>• Endorse or validate reviews</li>
                                    <li>• Confirm employment status</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Accuracy Disclaimer */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-purple-500" />
                            Accuracy & Verification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            While we encourage honest and accurate submissions, we cannot independently
                            verify the claims made in user reviews. Information may be:
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-purple-500 mt-1">•</span>
                                Outdated as workplace conditions change over time
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-500 mt-1">•</span>
                                Subjective based on individual experiences and expectations
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-500 mt-1">•</span>
                                Incomplete as no review captures every aspect of a workplace
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-500 mt-1">•</span>
                                Variable by department, shift, or specific unit within a facility
                            </li>
                        </ul>
                        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                            <p className="text-sm text-purple-800">
                                <strong>Recommendation:</strong> Use reviews as one data point among many
                                when researching potential employers. Visit facilities, speak with current
                                employees, and conduct your own due diligence.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Fair Use & Legal */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-slate-500" />
                            Fair Use & Legal Protection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Rate My Hospitals operates as a platform for lawful, protected speech.
                            User reviews constitute personal opinions protected under the First Amendment
                            when they represent genuine experiences shared in good faith.
                        </p>
                        <p className="text-muted-foreground">
                            We comply with the Communications Decency Act (Section 230), which provides
                            immunity for platforms hosting third-party content. We are not the publisher
                            of user-generated reviews and are not liable for their content.
                        </p>
                    </CardContent>
                </Card>

                {/* External Links */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-teal-500" />
                            External Links
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            The site may contain links to external websites that are not provided or
                            maintained by us. We do not guarantee the accuracy, relevance, timeliness,
                            or completeness of any information on these external websites. The inclusion
                            of any links does not imply endorsement or recommendation.
                        </p>
                    </CardContent>
                </Card>

                {/* Contact Footer */}
                <div className="text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Mail className="w-4 h-4" />
                        <span>Questions about this disclaimer?</span>
                    </div>
                    <p>
                        <Link href="/contact" className="text-primary hover:underline">
                            Contact us
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
