'use client';

import { useState } from 'react';
import { Share2, Check, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareButtonProps {
    title: string;
    text: string;
    url: string;
    compact?: boolean;
}

export function ShareButton({ title, text, url, compact = false }: ShareButtonProps) {
    const [showCopied, setShowCopied] = useState(false);
    const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

    const copyToClipboard = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        } catch { /* clipboard not supported */ }
    };

    const handleShare = async (method: 'native' | 'copy' | 'twitter' | 'facebook' | 'email') => {
        const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

        switch (method) {
            case 'native':
                try {
                    await navigator.share({ title, text, url: fullUrl });
                } catch (err) {
                    if ((err as Error).name !== 'AbortError') copyToClipboard(fullUrl);
                }
                break;
            case 'copy':
                copyToClipboard(fullUrl);
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`, '_blank', 'width=550,height=420');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`, '_blank', 'width=550,height=420');
                break;
            case 'email':
                window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + fullUrl)}`;
                break;
        }
    };

    const icon = showCopied
        ? <Check className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        : <Share2 className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />;

    if (hasNativeShare) {
        return compact ? (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShare('native')} aria-label="Share">
                {icon}
            </Button>
        ) : (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleShare('native')}>
                {icon} {showCopied ? 'Copied!' : 'Share'}
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {compact ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Share">
                        {icon}
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" className="gap-2">
                        {icon} {showCopied ? 'Copied!' : 'Share'}
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleShare('copy')}>
                    <LinkIcon className="h-4 w-4 mr-2" /> Copy link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('twitter')}>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on X
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('facebook')}>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Share on Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('email')}>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Share via Email
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
