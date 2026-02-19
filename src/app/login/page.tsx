import { AuthForm } from '@/components/auth/AuthForm'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string; next?: string }>
}) {
    const { view, next } = await searchParams
    const defaultView = view === 'signup' ? 'signup' : 'login'

    return (
        <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Rate My Hospitals
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email to sign in to your account
                    </p>
                </div>
                <AuthForm defaultView={defaultView} redirectTo={next} />
            </div>
        </div>
    )
}
