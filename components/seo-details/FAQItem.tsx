interface FAQItemProps {
  question: string;
  answer: string | string[];
}

/**
 * Collapsible FAQ row built on native <details>/<summary> — no JS required.
 * The marker rotates from + to − via the `open` state.
 */
export function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <details className="group rounded-[var(--radius)] border-2 border-ink bg-cream shadow-pop-sm open:bg-mustard/15">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-base font-bold text-ink [&::-webkit-details-marker]:hidden">
        {question}
        <span
          aria-hidden="true"
          className="grid size-6 shrink-0 place-items-center rounded-full border-2 border-ink bg-terracotta text-cream transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="px-5 pb-5 text-ink/80 leading-relaxed">
        {Array.isArray(answer) ? (
          <ul className="list-disc space-y-2 pl-5 marker:text-terracotta">
            {answer.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          answer
        )}
      </div>
    </details>
  );
}
