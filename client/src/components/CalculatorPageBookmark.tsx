import { BookmarkButton } from "@/components/BookmarkButton";

/** Floating favorite control for calculator detail pages. */
export function CalculatorPageBookmark({ calculatorId }: { calculatorId: string }) {
  return (
    <div className="fixed top-3 right-3 z-40 lg:top-4 lg:right-4">
      <BookmarkButton itemType="calculator" itemId={calculatorId} className="shadow-md bg-white" />
    </div>
  );
}
