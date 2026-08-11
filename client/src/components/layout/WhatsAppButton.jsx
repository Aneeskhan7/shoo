const PHONE = '923089191256';

/**
 * Floating "message us" button — site-wide, bottom-right, opens a WhatsApp
 * chat with SHOO support. Uses WhatsApp's own brand green rather than the
 * SHOO palette: it's a third-party affordance, and the recognizable colour
 * is what makes people trust it's actually WhatsApp before they tap it.
 */
export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-[10px]">
      <span className="relative rounded-[14px] bg-white px-[14px] py-[8px] text-[13px] font-bold tracking-[0.01em] text-black shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        We are here! 👋
        <span className="absolute -bottom-[6px] right-[22px] h-[12px] w-[12px] rotate-45 bg-white" />
      </span>

      <a
        href={`https://wa.me/${PHONE}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Message us on WhatsApp"
        className="flex h-[68px] w-[68px] items-center justify-center rounded-full border border-black/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-transform hover:scale-105"
      >
        <svg width="52" height="52" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M16.004 4C9.377 4 4 9.373 4 16c0 2.223.605 4.302 1.657 6.088L4 28l6.076-1.62A11.93 11.93 0 0 0 16.004 28C22.63 28 28 22.627 28 16S22.63 4 16.004 4Z"
            fill="#25D366"
          />
          <path
            d="M22.14 19.09c-.33-.166-1.96-.967-2.264-1.078-.304-.11-.525-.166-.746.166-.22.331-.856 1.078-1.05 1.3-.193.22-.386.248-.716.083-.33-.166-1.393-.514-2.653-1.638-.981-.875-1.644-1.956-1.837-2.287-.193-.331-.02-.51.145-.674.15-.148.331-.386.497-.58.166-.192.22-.33.331-.55.11-.222.055-.415-.028-.58-.083-.166-.746-1.797-1.022-2.462-.269-.646-.543-.559-.746-.569-.193-.009-.414-.011-.635-.011-.22 0-.58.083-.883.415-.304.33-1.16 1.133-1.16 2.763s1.188 3.204 1.353 3.426c.166.221 2.339 3.571 5.667 5.008.792.342 1.41.546 1.892.699.795.253 1.518.217 2.09.132.638-.095 1.96-.802 2.236-1.577.276-.774.276-1.438.193-1.577-.083-.138-.304-.221-.635-.387Z"
            fill="#fff"
          />
        </svg>
      </a>
    </div>
  );
}
