'use client';

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                    <svg
                        className="h-10 w-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728M12 9v4m0 4h.01"
                        />
                        <line x1="4" y1="4" x2="20" y2="20" strokeLinecap="round" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-3">
                    You&apos;re Offline
                </h1>

                <p className="text-slate-600 mb-6 leading-relaxed">
                    It looks like you&apos;ve lost your internet connection.
                    RateMyHospital needs an active connection to load reviews and hospital data.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        Try Again
                    </button>

                    <p className="text-sm text-slate-400">
                        Check your Wi-Fi or cellular data and try again.
                    </p>
                </div>
            </div>
        </div>
    );
}
