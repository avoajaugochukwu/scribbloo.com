import { FAQItem } from './FAQItem';
import { FAQItemType } from './types';

interface FAQListProps {
  faqs: FAQItemType[];
}

export function FAQList({ faqs }: FAQListProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="py-8">
      <div className="mx-auto max-w-[764px]">
        <h2 className="text-retro mb-2 text-center font-display text-3xl font-extrabold">
          Frequently asked questions
        </h2>
        <svg
          aria-hidden="true"
          viewBox="0 0 200 12"
          preserveAspectRatio="none"
          className="mx-auto mb-6 h-2.5 w-40 text-terracotta"
        >
          <path d="M2 8 Q 50 0 100 6 T 198 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <FAQItem key={faq.id} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
} 