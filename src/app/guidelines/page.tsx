'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, FileText, Shield, Users, Lock, Scale, ChevronDown, ChevronUp, AlertTriangle, Clock, Mail, Eye, EyeOff, UserX, Flag } from "lucide-react";
import Link from "next/link";

interface ExpandableCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
}

function ExpandableCard({ icon, title, description, children, isExpanded, onToggle }: ExpandableCardProps) {
    return (
        <Card
            className={`cursor-pointer transition-all ${isExpanded ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`}
            onClick={onToggle}
        >
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        {icon}
                        <CardTitle className="text-lg mt-2">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <div className="text-muted-foreground">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent className="pt-0 border-t" onClick={(e) => e.stopPropagation()}>
                    {children}
                </CardContent>
            )}
        </Card>
    );
}

export default function GuidelinesPage() {
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    const toggleCard = (cardId: string) => {
        setExpandedCard(expandedCard === cardId ? null : cardId);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Community Guidelines</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Rate My Hospitals is built on trust, transparency, and respect. These guidelines help us
                        maintain a safe, honest platform where nurses can share experiences without fear of
                        retaliation.
                    </p>
                </div>

                {/* Core Principles Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-primary" />
                            Our Core Principles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-1">1. Honesty & Authenticity</h3>
                            <p className="text-muted-foreground">
                                Share your genuine experiences. Your honest feedback helps other nurses make informed career decisions.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">2. Privacy & Protection</h3>
                            <p className="text-muted-foreground">
                                We protect your anonymity. Never include patient information, specific names of individuals, or identifying details that could violate HIPAA or compromise anyone&apos;s privacy.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">3. Respect & Professionalism</h3>
                            <p className="text-muted-foreground">
                                Keep feedback constructive. You can be critical without being cruel. Focus on workplace conditions, systems, and policies rather than personal attacks.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">4. Legal Compliance</h3>
                            <p className="text-muted-foreground">
                                Follow all applicable laws. Don&apos;t post defamatory content, protected health information, or anything that violates employment agreements (where legally enforceable).
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Policy Cards Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <ExpandableCard
                        icon={<FileText className="w-8 h-8 text-blue-500" />}
                        title="Posting Rules"
                        description="What you can and cannot include in reviews and salary submissions"
                        isExpanded={expandedCard === 'posting'}
                        onToggle={() => toggleCard('posting')}
                    >
                        <div className="space-y-4 mt-4">
                            <div>
                                <h4 className="font-semibold text-green-600 flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-4 h-4" /> Do Include
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                                    <li>• Specific salary figures, differentials, and bonuses</li>
                                    <li>• Nurse-to-patient ratios you&apos;ve experienced</li>
                                    <li>• Descriptions of unit culture and teamwork</li>
                                    <li>• Management responsiveness and support</li>
                                    <li>• Equipment quality and resource availability</li>
                                    <li>• Scheduling practices and flexibility</li>
                                    <li>• Orientation and training quality</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-2">
                                    <XCircle className="w-4 h-4" /> Do Not Include
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                                    <li>• Names of specific managers, doctors, or coworkers</li>
                                    <li>• Any patient information or case details</li>
                                    <li>• Exact dates that could identify you</li>
                                    <li>• Information from confidential meetings</li>
                                    <li>• Unverified rumors or hearsay</li>
                                    <li>• Content copied from other sources</li>
                                </ul>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Tip:</strong> Write as if your review will be read by both a prospective nurse AND your hospital&apos;s administration. Be honest but fair.
                                </p>
                            </div>
                        </div>
                    </ExpandableCard>

                    <ExpandableCard
                        icon={<Shield className="w-8 h-8 text-green-500" />}
                        title="Moderation Policy"
                        description="How we review content and our appeals process"
                        isExpanded={expandedCard === 'moderation'}
                        onToggle={() => toggleCard('moderation')}
                    >
                        <div className="space-y-4 mt-4">
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-primary" /> Review Process
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                                    <li>• All submissions are reviewed within 24-48 hours</li>
                                    <li>• We check for guideline compliance, not opinions</li>
                                    <li>• Approved content is published immediately</li>
                                    <li>• Rejected content includes explanation</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                    <Flag className="w-4 h-4 text-primary" /> Reasons for Removal
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                                    <li>• Contains identifying information</li>
                                    <li>• Includes patient/HIPAA violations</li>
                                    <li>• Personal attacks or harassment</li>
                                    <li>• Suspected fake or incentivized review</li>
                                    <li>• Spam or promotional content</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                    <Mail className="w-4 h-4 text-primary" /> Appeals Process
                                </h4>
                                <p className="text-sm text-muted-foreground ml-6">
                                    Disagree with a decision? Email appeals@ratemyhospitals.com within 30 days. Include your submission ID and explain why you believe the content complies with guidelines. Appeals are reviewed within 5 business days.
                                </p>
                            </div>
                        </div>
                    </ExpandableCard>

                    <ExpandableCard
                        icon={<Users className="w-8 h-8 text-purple-500" />}
                        title="Professional Conduct"
                        description="Expected behavior and community standards"
                        isExpanded={expandedCard === 'conduct'}
                        onToggle={() => toggleCard('conduct')}
                    >
                        <div className="space-y-4 mt-4">
                            <div>
                                <h4 className="font-semibold mb-2">Community Standards</h4>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                                    <li>• <strong>Be constructive:</strong> Criticism should help others, not just vent</li>
                                    <li>• <strong>Be specific:</strong> Vague complaints aren&apos;t helpful to anyone</li>
                                    <li>• <strong>Be current:</strong> Note when you worked there; things change</li>
                                    <li>• <strong>Be balanced:</strong> Include positives when they exist</li>
                                    <li>• <strong>Be professional:</strong> No profanity or inflammatory language</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Consequences
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                                    <li>• <strong>First violation:</strong> Content removed with warning</li>
                                    <li>• <strong>Second violation:</strong> 30-day posting suspension</li>
                                    <li>• <strong>Third violation:</strong> Permanent account ban</li>
                                    <li>• <strong>Severe violations:</strong> Immediate permanent ban</li>
                                </ul>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg">
                                <p className="text-sm text-purple-800">
                                    <strong>Remember:</strong> We&apos;re all nurses here. Treat others how you&apos;d want to be treated by a colleague.
                                </p>
                            </div>
                        </div>
                    </ExpandableCard>

                    <ExpandableCard
                        icon={<Lock className="w-8 h-8 text-orange-500" />}
                        title="Privacy & Anonymity"
                        description="How we protect your identity and personal information"
                        isExpanded={expandedCard === 'privacy'}
                        onToggle={() => toggleCard('privacy')}
                    >
                        <div className="space-y-4 mt-4">
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                    <EyeOff className="w-4 h-4 text-primary" /> What We Hide
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                                    <li>• Your real name is never displayed publicly</li>
                                    <li>• Your email is never shared or sold</li>
                                    <li>• Exact submission dates are generalized</li>
                                    <li>• IP addresses are not stored long-term</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                    <Eye className="w-4 h-4 text-primary" /> What Is Visible
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                                    <li>• Your review content (as submitted)</li>
                                    <li>• Department/unit you selected</li>
                                    <li>• Position type (Staff, Travel, etc.)</li>
                                    <li>• General timeframe (Current, Within 6 months, etc.)</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                    <UserX className="w-4 h-4 text-primary" /> Legal Requests
                                </h4>
                                <p className="text-sm text-muted-foreground ml-6">
                                    We will only disclose user information if legally compelled by valid court order. We will notify affected users unless prohibited by law. We have never received a subpoena for user data.
                                </p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <p className="text-sm text-orange-800">
                                    <strong>Pro tip:</strong> Avoid mentioning specific shift times, unique incidents, or rare specialties that could narrow down your identity.
                                </p>
                            </div>
                        </div>
                    </ExpandableCard>
                </div>

                {/* Quick Reference Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Quick Reference: What&apos;s Allowed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Allowed Column */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span className="font-semibold text-green-600">Allowed</span>
                                </div>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        Honest workplace experiences
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        Specific compensation details
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        Staffing ratio observations
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        Management practices and culture
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        Workplace safety concerns
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        Benefits and scheduling information
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        Interview experiences
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        General department/unit references
                                    </li>
                                </ul>
                            </div>

                            {/* Not Allowed Column */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <XCircle className="w-5 h-5 text-red-500" />
                                    <span className="font-semibold text-red-600">Not Allowed</span>
                                </div>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        Patient information (PHI/HIPAA violations)
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        Full names of specific individuals
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        Threats or harassment
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        Discriminatory or hateful content
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        False or fabricated information
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        Trade secrets or proprietary information
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        Spam or promotional content
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        Content violating employment law
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Questions Footer */}
                <div className="text-center text-muted-foreground">
                    <p>
                        Questions about these guidelines?{" "}
                        <Link href="/contact" className="text-primary hover:underline">
                            Contact us
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
