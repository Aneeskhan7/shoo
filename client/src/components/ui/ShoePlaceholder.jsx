/**
 * The shoe stand-in Figma uses everywhere in place of photography: a rounded
 * sole, an ellipse body, and a 3px electric-green accent.
 *
 * Proportions are taken from the product card media box (41:257–41:260,
 * 268×360) and expressed as percentages so the same component covers cards,
 * gallery panels and cart thumbnails. The hero has its own geometry in
 * components/hero/Hero.jsx, which is a different composition.
 *
 * Swap for a real <img> once product photography exists — see plan A3.
 */
export default function ShoePlaceholder({ label, accent = true, className = '' }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Shapes are percentages of this box, so it keeps the card's 268×360
          ratio regardless of the container — otherwise wide panels (editorial
          tiles, gallery) stretch the sole into a flat smear. */}
      <div className="relative aspect-[268/360] h-full max-h-full">
      <div
        className="absolute rounded-full opacity-85"
        style={{
          left: '20.90%',
          top: '72.33%',
          width: '58.21%',
          height: '14.67%',
          background: 'currentColor',
        }}
      />
      <div
        className="absolute rounded-[50%]"
        style={{
          left: '24.63%',
          top: '63.00%',
          width: '38.81%',
          height: '18.67%',
          background: 'currentColor',
          filter: 'brightness(0.88)',
        }}
      />
      {accent && (
        <div
          className="absolute rounded-[2px]"
          style={{
            left: '51.49%',
            top: '76.33%',
            width: '7.46%',
            height: '3px',
            background: '#C6FF00',
          }}
        />
      )}
        {label && (
          <span
            className="absolute text-[10px] font-medium tracking-[0.1em] opacity-30"
            style={{ left: '20.87%', top: '9.44%' }}
          >
            ◈  {label}
          </span>
        )}
      </div>
    </div>
  );
}
