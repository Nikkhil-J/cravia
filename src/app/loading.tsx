export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-dark">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <svg
          width={56}
          height={56}
          viewBox="0 0 100 110"
          fill="none"
          aria-hidden="true"
        >
          <path d="M36 8 C33 2 37 -2 35 -7" fill="none" stroke="#EF9F27" strokeWidth="2" strokeLinecap="round"/>
          <path d="M44 6 C46 0 42 -4 44 -9" fill="none" stroke="#FAC775" strokeWidth="2" strokeLinecap="round"/>
          <path d="M52 8 C55 2 51 -2 53 -7" fill="none" stroke="#EF9F27" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="44" cy="46" r="32" fill="none" stroke="#D85A30" strokeWidth="6"/>
          <circle cx="44" cy="46" r="26" fill="#3D1F14"/>
          <circle cx="44" cy="46" r="26" fill="none" stroke="#F0997B" strokeWidth="2"/>
          <circle cx="44" cy="46" r="17" fill="none" stroke="#EF9F27" strokeWidth="1.5" opacity="0.6"/>
          <circle cx="44" cy="46" r="10" fill="#D85A30"/>
          <circle cx="44" cy="46" r="7" fill="#EF9F27"/>
          <circle cx="44" cy="46" r="3.5" fill="#FAC775"/>
          <ellipse cx="35" cy="37" rx="6" ry="4" fill="#FAC775" opacity="0.15" transform="rotate(-30 35 37)"/>
          <rect x="66" y="66" width="8" height="32" rx="4" fill="#D85A30" transform="rotate(45 66 66)"/>
        </svg>
        {/* APPROVED HARDCODED COLOR — splash wordmark on dark bg */}
        <span
          className="text-2xl text-[#FAC775]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700 }}
        >
          Cravia
        </span>
      </div>
    </div>
  )
}
