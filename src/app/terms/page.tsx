import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, UserCheck, Shield, AlertTriangle, Scale, Ban, RefreshCw, Mail } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Please read these terms carefully before using Rate My Hospitals. By accessing or using
                        our platform, you agree to be bound by these terms and conditions.
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">Last updated: December 2024</p>
                </div>

                {/* Acceptance Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-primary" />
                            1. Acceptance of Terms
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            By creating an account, submitting content, or otherwise accessing Rate My Hospitals,
                            you acknowledge that you have read, understood, and agree to be bound by these Terms
                            of Service. If you do not agree to these terms, please do not use our platform.
                        </p>
                        <p className="text-muted-foreground">
                            We reserve the right to modify these terms at any time. Continued use of the platform
                            after changes constitutes acceptance of the modified terms.
                        </p>
                    </CardContent>
                </Card>

                {/* User Eligibility Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-500" />
                            2. User Eligibility & Accounts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            To use Rate My Hospitals, you must be at least 18 years old and a current or former
                            healthcare professional. By registering, you represent that all information you
                            provide is accurate and complete.
                        </p>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Account Responsibilities:</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    Maintain the confidentiality of your account credentials
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    Notify us immediately of any unauthorized access
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    Accept responsibility for all activities under your account
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    One account per person; no shared or fake accounts
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* User Content Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            3. User Content & Licensing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            You retain ownership of the content you submit, including reviews, salary data,
                            and comments. However, by posting content, you grant Rate My Hospitals a non-exclusive,
                            worldwide, royalty-free license to use, display, reproduce, and distribute your
                            content on our platform.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <h4 className="font-semibold text-green-700 mb-2">Your Rights</h4>
                                <ul className="text-sm text-green-600 space-y-1">
                                    <li>• Own your original content</li>
                                    <li>• Request content removal</li>
                                    <li>• Edit or update submissions</li>
                                    <li>• Control your anonymity level</li>
                                </ul>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h4 className="font-semibold text-blue-700 mb-2">Our Rights</h4>
                                <ul className="text-sm text-blue-600 space-y-1">
                                    <li>• Display content on platform</li>
                                    <li>• Moderate content for compliance</li>
                                    <li>• Remove violating content</li>
                                    <li>• Aggregate anonymized data</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Prohibited Conduct Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Ban className="w-5 h-5 text-red-500" />
                            4. Prohibited Conduct
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            The following activities are strictly prohibited and may result in immediate
                            account termination:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-1">✕</span>
                                    <span className="text-muted-foreground">Posting false or misleading information</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-1">✕</span>
                                    <span className="text-muted-foreground">Sharing protected health information (PHI)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-1">✕</span>
                                    <span className="text-muted-foreground">Harassment or threats against individuals</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-1">✕</span>
                                    <span className="text-muted-foreground">Defamatory statements about identifiable persons</span>
                                </li>
                            </ul>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-1">✕</span>
                                    <span className="text-muted-foreground">Spam, advertising, or promotional content</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-1">✕</span>
                                    <span className="text-muted-foreground">Impersonating another user or entity</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-1">✕</span>
                                    <span className="text-muted-foreground">Attempting to manipulate ratings or reviews</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-1">✕</span>
                                    <span className="text-muted-foreground">Violating any applicable laws or regulations</span>
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Disclaimer Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            5. Disclaimers & Limitations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                            <p className="text-sm text-amber-800">
                                <strong>Important:</strong> Rate My Hospitals provides user-generated content
                                &quot;as is&quot; without warranties of any kind. We do not verify the accuracy of
                                reviews or salary information submitted by users.
                            </p>
                        </div>
                        <p className="text-muted-foreground">
                            We are not liable for decisions made based on information found on our platform.
                            Always verify important information through official channels and conduct your
                            own due diligence when making career decisions.
                        </p>
                    </CardContent>
                </Card>

                {/* Termination Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-purple-500" />
                            6. Termination & Modifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            We reserve the right to suspend or terminate accounts that violate these terms.
                            You may delete your account at any time through your account settings.
                        </p>
                        <p className="text-muted-foreground">
                            We may modify, suspend, or discontinue any aspect of the service at any time.
                            Material changes to these terms will be communicated via email or platform notification.
                        </p>
                    </CardContent>
                </Card>

                {/* Governing Law Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-slate-500" />
                            7. Governing Law
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            These terms are governed by the laws of the State of California, without regard
                            to conflict of law principles. Any disputes arising from these terms or your use
                            of the platform shall be resolved in the courts of California.
                        </p>
                    </CardContent>
                </Card>

                {/* Contact Footer */}
                <div className="text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Mail className="w-4 h-4" />
                        <span>Questions about these terms?</span>
                    </div>
                    <p>
                        <Link href="/contact" className="text-primary hover:underline">
                            Contact our legal team
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
