/** A01 — Splash: isotipo animado, fondo night, destellos violeta/aqua, máximo 1.2s. */
export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-night">
      <div className="campaign-gradient absolute inset-0 opacity-20" aria-hidden="true" />
      <img
        src={`${import.meta.env.BASE_URL}brand/me-perdi-logo.png`}
        alt=""
        aria-hidden="true"
        className="h-28 w-28 animate-[pulse_1.1s_ease-in-out_infinite] rounded-card object-contain motion-reduce:animate-none"
      />
      <p className="text-[28px] font-extrabold tracking-tight text-cream">ME PERDÍ</p>
      <span className="sr-only">Cargando ME PERDÍ</span>
    </div>
  )
}
