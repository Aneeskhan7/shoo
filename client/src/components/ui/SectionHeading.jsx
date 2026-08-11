/** Eyebrow + display title pairing, e.g. "04 — IMMERSIVE 3D EXPERIENCE". */
export default function SectionHeading({ eyebrow, title, lead, align = 'left', className = '' }) {
  return (
    <header className={`${align === 'center' ? 'text-center' : ''} ${className}`}>
      {eyebrow && <p className="text-eyebrow text-grey-500">{eyebrow}</p>}
      {title && <h2 className="text-display-l mt-4">{title}</h2>}
      {lead && (
        <p
          className={`text-body-l mt-6 max-w-[640px] opacity-70 ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        >
          {lead}
        </p>
      )}
    </header>
  );
}
