'use client';

interface FAQItemProps {
  question: string;
  answer: string | string[];
}

export function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="py-6">
        <span className="text-base font-medium">{question}</span>
      </div>
      <div className="pb-6 text-muted-foreground">
        {Array.isArray(answer) ? (
          <ul className="list-none space-y-2">
            {answer.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          answer
        )}
      </div>
    </div>
  );
} 