import { FAQList } from "./FAQList";
import type { SeoDetails } from "@/lib/content/types";
import type { FAQItemType } from "./types";

type Props = {
  details?: SeoDetails;
};

export default function OtherDetails({ details }: Props) {
  if (!details) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[764px] px-6 py-20">
      {/* Introductory Paragraph */}
      {details.paragraph && (
        <p className="text-ink/80 mb-10 text-lg leading-relaxed">
          {details.paragraph}
        </p>
      )}

      {/* How-To Guide Section */}
      {details.howToGuideTitle && details.howToGuide && details.howToGuide.length > 0 && (
        <section className="rounded-[var(--radius)] border-2 border-ink bg-cream shadow-pop-sm p-7 mb-10">
          <h2 className="font-display text-2xl font-bold text-center mb-6 text-terracotta-deep">{details.howToGuideTitle}</h2>
          <ol className="list-decimal list-inside space-y-4 marker:font-display marker:font-bold marker:text-terracotta">
            {details.howToGuide.map((item) => (
              <li key={item.step} className="text-ink/80 leading-relaxed">
                <strong className="font-display font-bold text-ink">{item.title}:</strong> {item.description}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Activity Ideas Section */}
      {details.activityIdeasTitle && details.activityIdeas && details.activityIdeas.length > 0 && (
        <section className="rounded-[var(--radius)] border-2 border-ink bg-cream shadow-pop-sm p-7 mb-10">
          <h2 className="font-display text-2xl font-bold text-center mb-6 text-teal-deep">{details.activityIdeasTitle}</h2>
          <ul className="list-disc list-inside space-y-3 marker:text-teal">
            {details.activityIdeas.map((idea, index) => (
              <li key={index} className="text-ink/80 leading-relaxed">
                <strong className="font-display font-bold text-ink">{idea.title}:</strong> {idea.description}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Printable Tips Section */}
      {details.printableTipsTitle && details.printableTips && details.printableTips.length > 0 && (
        <section className="rounded-[var(--radius)] border-2 border-ink bg-cream shadow-pop-sm p-7 mb-10">
          <h2 className="font-display text-2xl font-bold text-center mb-6 text-mustard-deep">{details.printableTipsTitle}</h2>
          <ul className="list-disc list-inside space-y-3 marker:text-mustard-deep">
            {details.printableTips.map((tip, index) => (
              <li key={index} className="text-ink/80 leading-relaxed">
                {tip.segments.map((segment, segIndex) => (
                  segment.bold ? <strong key={segIndex} className="font-display font-bold text-ink">{segment.text}</strong> : <span key={segIndex}>{segment.text}</span>
                ))}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ List Section */}
      <section className="pt-6">
        <FAQList faqs={(details.faqs as FAQItemType[]) || []} />
      </section>
    </div>
  );
}
