export default function NotFound(){
    return (
        <div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-4 py-12">
            <div className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-wide">
                404 - Page Not Found
            </div>

            <div className="w-120 h-[1px] m-10 bg-gray-500/60" aria-hidden="true" />

            <p className="text-sm md:text-base max-w-xl font-semibold tracking-wide">
                Sorry, the page you are looking for does not exist.
            </p>
        </div>
    );
}