import { FAQItem } from './FAQItem';
import { FAQItemType } from './types';

interface FAQListProps {
  faqs: FAQItemType[];
}

export function FAQList({ faqs }: FAQListProps) {
  return (
    <div className=" py-12">
      <div className="mx-auto max-w-[764px] px-6">
        <h2 className="text-center text-3xl font-bold">
          Frequently asked questions
        </h2>
        <div>
          {faqs.map((faq) => (
            <FAQItem key={faq.id} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
} 