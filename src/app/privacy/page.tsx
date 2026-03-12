import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Database, Lock, Share2, UserCog, Bell, Mail, Globe } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        At Rate My Hospitals, protecting your privacy is fundamental to our mission.
                        This policy explains how we collect, use, and safeguard your personal information.
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">Last updated: December 2024</p>
                </div>

                {/* Our Commitment Card */}
                <Card className="mb-8 border-l-4 border-l-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            Our Privacy Commitment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            We understand that nurses sharing workplace experiences need assurance that their
                            identity is protected. Rate My Hospitals is designed with privacy-first principles,
                            allowing you to share honest feedback without fear of retaliation.
                        </p>
                    </CardContent>
                </Card>

                {/* Information We Collect */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-blue-500" />
                            Information We Collect
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2">Account Information</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                                When you create an account, we collect:
                            </p>
                            <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">•</span> Email address
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">•</span> Password (encrypted)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">•</span> Professional credentials
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">•</span> Optional profile information
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Content You Submit</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                                When you contribute to our platform:
                            </p>
                            <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">•</span> Hospital reviews
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">•</span> Salary information
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">•</span> Department/unit details
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">•</span> Employment dates (year only)
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Automatic Information</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                                We automatically collect technical data:
                            </p>
                            <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">•</span> IP address (anonymized)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">•</span> Browser type
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">•</span> Device information
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">•</span> Usage patterns
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* How We Use Information */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="w-5 h-5 text-green-500" />
                            How We Use Your Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Platform Operation</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Provide, maintain, and improve our services
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Account Security</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Authenticate users and prevent fraud
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Communication</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Send service updates and respond to inquiries
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Analytics</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Understand usage patterns to improve UX
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Aggregated Insights</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Create anonymized statistics and trends
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Legal Compliance</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Meet legal obligations and protect rights
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Security */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-amber-500" />
                            Data Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            We implement industry-standard security measures to protect your information:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-sm mb-2">Technical Safeguards</h4>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                    <li>• SSL/TLS encryption in transit</li>
                                    <li>• AES-256 encryption at rest</li>
                                    <li>• Regular security audits</li>
                                    <li>• Secure cloud infrastructure</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-sm mb-2">Operational Practices</h4>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                    <li>• Access controls and logging</li>
                                    <li>• Employee training requirements</li>
                                    <li>• Incident response procedures</li>
                                    <li>• Regular backups</li>
                                </ul>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                            <p className="text-xs text-amber-800">
                                <strong>Note:</strong> While we implement robust security measures, no system
                                is 100% secure. We encourage you to use strong passwords and protect your
                                account credentials.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Information Sharing */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-purple-500" />
                            Information Sharing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            We do NOT sell your personal information. We may share data only in these cases:
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-sm">Public Content</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Reviews and ratings you submit are publicly visible (but anonymous)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <UserCog className="w-5 h-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-sm">Service Providers</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Trusted partners who help us operate (hosting, analytics) under strict agreements
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-sm">Legal Requirements</h4>
                                    <p className="text-xs text-muted-foreground">
                                        When required by law, court order, or to protect safety and rights
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Your Rights */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserCog className="w-5 h-5 text-teal-500" />
                            Your Privacy Rights
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            You have control over your personal information. Here are your rights:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <div>
                                        <span className="font-semibold text-sm">Access</span>
                                        <p className="text-xs text-muted-foreground">Request a copy of your data</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <div>
                                        <span className="font-semibold text-sm">Correction</span>
                                        <p className="text-xs text-muted-foreground">Update inaccurate information</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <div>
                                        <span className="font-semibold text-sm">Deletion</span>
                                        <p className="text-xs text-muted-foreground">Request account and data removal</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <div>
                                        <span className="font-semibold text-sm">Portability</span>
                                        <p className="text-xs text-muted-foreground">Export your data in common format</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <div>
                                        <span className="font-semibold text-sm">Opt-out</span>
                                        <p className="text-xs text-muted-foreground">Control marketing communications</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <div>
                                        <span className="font-semibold text-sm">Object</span>
                                        <p className="text-xs text-muted-foreground">Contest certain data processing</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cookies */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-orange-500" />
                            Cookies & Tracking
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            We use cookies and similar technologies to enhance your experience:
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                <h4 className="font-semibold text-green-700 mb-1">Essential</h4>
                                <p className="text-xs text-green-600">Required for site functionality</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <h4 className="font-semibold text-blue-700 mb-1">Analytics</h4>
                                <p className="text-xs text-blue-600">Help us improve the platform</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <h4 className="font-semibold text-purple-700 mb-1">Preferences</h4>
                                <p className="text-xs text-purple-600">Remember your settings</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            You can manage cookie preferences through your browser settings.
                        </p>
                    </CardContent>
                </Card>

                {/* Contact Footer */}
                <div className="text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Mail className="w-4 h-4" />
                        <span>Privacy questions or data requests?</span>
                    </div>
                    <p>
                        <Link href="/contact" className="text-primary hover:underline">
                            Contact our privacy team
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
