import { Button } from "@/components/ui/button";

export default function login() {
    return (
        <div>
            <h1>Login to Pinocchio's pizza</h1>
            <div className="flex flex-col gap-4 w-full max-w-sm">
                <Button
                    className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    aria-label="Sign in with Google"
                >
                    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                        <path fill="#EA4335" d="M24 12.5c3.9 0 7 1.5 9.1 3.2l6.7-6.7C35.9 5.2 30.4 3 24 3 14.6 3 6.7 8.6 3.1 16.7l7.7 6C12.4 15.1 17.8 12.5 24 12.5z" />
                        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h12.6c-.5 2.8-2 5.2-4.3 6.8l6.9 5.3C43.8 36.1 46.5 30.9 46.5 24.5z" />
                        <path fill="#FBBC05" d="M10.8 29.1A14.6 14.6 0 0 1 9 24.5c0-1.6.3-3.1.8-4.5l-7.7-6A24 24 0 0 0 0 24.5c0 3.9.9 7.6 2.5 11.1l8.3-6.5z" />
                        <path fill="#34A853" d="M24 44.9c6.4 0 11.9-2.1 16-5.7l-7.6-5.9c-2.3 1.6-5.2 2.6-8.4 2.6-6.2 0-11.6-3-14.8-7.6l-8.3 6.5C6.7 40.3 14.6 44.9 24 44.9z" />
                    </svg>
                    Sign in with Google
                </Button>
            </div>
        </div>
    )
}