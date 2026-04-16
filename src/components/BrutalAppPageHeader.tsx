import React from "react";
import { Coins } from "lucide-react";

type Props = {
  /** Pastki qator: sahifa nomi (masalan, «Davomat», «Community»). */
  pageLabel: string;
  maxWidthClass?: "max-w-4xl" | "max-w-6xl";
  right?: React.ReactNode;
  brandInteractive?: boolean;
  onBrandClick?: () => void;
  /** Tugma rejimida (brandInteractive) e’lon qilinadi */
  brandAriaLabel?: string;
};

/**
 * Community va boshqa umumiy sahifalar bilan bir xil: Coins + «Ozone-coin» + pastda sahifa nomi.
 */
export default function BrutalAppPageHeader({
  pageLabel,
  maxWidthClass = "max-w-4xl",
  right,
  brandInteractive,
  onBrandClick,
  brandAriaLabel = "Ozone-coin",
}: Props) {
  const mark = (
    <>
      <div className="bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
        <Coins className="text-black" size={32} />
      </div>
      <div className="min-w-0">
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight uppercase">Ozone-coin</h1>
        <p className="font-mono text-xs font-bold uppercase text-black/80">{pageLabel}</p>
      </div>
    </>
  );

  return (
    <header className="bg-[#FFD700] border-b-4 border-black p-6 sticky top-0 z-50">
      <div className={`${maxWidthClass} mx-auto flex items-center justify-between gap-4`}>
        {brandInteractive && onBrandClick ? (
          <button
            type="button"
            onClick={onBrandClick}
            className="flex min-w-0 items-center gap-3 text-black text-left"
            aria-label={brandAriaLabel}
          >
            {mark}
          </button>
        ) : (
          <div className="flex min-w-0 items-center gap-3 text-black">{mark}</div>
        )}
        {right != null ? <div className="flex shrink-0 items-center gap-2">{right}</div> : null}
      </div>
    </header>
  );
}
