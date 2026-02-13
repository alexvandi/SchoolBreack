import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-16 animate-fade-in">
        <div className="relative w-24 h-24 mb-4">
          <Image
            src="/assets/Schoolbreak logo.PNG"
            alt="SchoolBreak"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-xl font-heading font-bold text-white text-center tracking-[0.2em]">
          SCHOOLBREAK
        </h1>
      </div>

      {/* Vertical Actions Stack */}
      <div className="w-full max-w-sm flex flex-col gap-5">

        {/* Gestionale Button */}
        <Link
          href="/admin"
          className="w-full bg-transparent border border-white text-white py-4 rounded-lg font-medium text-sm tracking-widest hover:bg-white hover:text-black transition-all duration-300 uppercase block text-center"
        >
          Richiedi la tua tessera ora
        </Link>

        {/* Negozio Button */}
        <Link
          href="/shop"
          className="w-full bg-transparent border border-white text-white py-4 rounded-lg font-medium text-sm tracking-widest hover:bg-white hover:text-black transition-all duration-300 uppercase block text-center"
        >
          Negoziante
        </Link>

        {/* Email Input Placeholder (Visual Only as requested) */}
        <div className="w-full">
          <input
            type="email"
            placeholder="Email (Optional)"
            className="w-full bg-transparent border border-white rounded-lg py-4 px-6 text-white text-sm placeholder:text-white/70 focus:outline-none focus:bg-white/5 transition-all"
            disabled
          />
        </div>

      </div>

      {/* Footer Status */}
      <div className="mt-16 flex items-center gap-2 animate-pulse">
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
        <span className="text-green-500 text-xs tracking-widest font-bold">ATTIVO</span>
      </div>

      {/* Star Decoration */}
      <div className="absolute bottom-8 right-8 text-white/20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

    </div>
  );
}
