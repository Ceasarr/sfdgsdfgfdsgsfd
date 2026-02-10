export default function Loading() {
    return (
        <main className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                {/* Spinner */}
                <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
                </div>

                {/* Loading Text */}
                <p className="text-lg font-medium text-muted-foreground">Загрузка...</p>
            </div>
        </main>
    );
}
