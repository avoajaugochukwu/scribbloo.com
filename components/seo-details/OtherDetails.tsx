"use client";

import { FAQList } from "./FAQList";
import { FAQItemType } from "./types";
import { allDetailsData, defaultStaticContent } from './data'; // Import from the new data/index.ts

// Define a type for the structure of "other details"
interface OtherDetailsContent {
  paragraph?: string;
  howToGuideTitle?: string;
  howToGuide?: Array<{ step: number; title: string; description: string }>;
  activityIdeasTitle?: string;
  activityIdeas?: Array<{ title: string; description: string }>;
  printableTipsTitle?: string;
  printableTips?: Array<{ segments: Array<{ text: string; bold?: boolean }> }>;
  faqs?: FAQItemType[];
}

type Props = {
  type: string;
}

export default function OtherDetails(props: Props) {
  const { type } = props;

  // Directly get details from the imported object, with a fallback
  const details: OtherDetailsContent = allDetailsData[type.toLowerCase()] || defaultStaticContent;

  return (
    <div className="mx-auto max-w-[764px] px-6 py-24">
      {/* Introductory Paragraph */}
      {details.paragraph && (
        <p className="text-gray-700 mb-8 leading-relaxed">
          {details.paragraph}
        </p>
      )}

      {/* How-To Guide Section */}
      {details.howToGuideTitle && details.howToGuide && details.howToGuide.length > 0 && (
        <section className="py-6 border-t border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-center mb-6 text-pink-600">{details.howToGuideTitle}</h2>
          <ol className="list-decimal list-inside space-y-4 pl-4">
            {details.howToGuide.map((item) => (
              <li key={item.step} className="text-gray-700">
                <strong className="font-medium text-gray-800">{item.title}:</strong> {item.description}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Activity Ideas Section */}
      {details.activityIdeasTitle && details.activityIdeas && details.activityIdeas.length > 0 && (
        <section className="py-6">
          <h2 className="text-2xl font-semibold text-center mb-6 text-purple-600">{details.activityIdeasTitle}</h2>
          <ul className="list-disc list-inside space-y-3 pl-4">
            {details.activityIdeas.map((idea, index) => (
              <li key={index} className="text-gray-700">
                <strong className="font-medium text-gray-800">{idea.title}:</strong> {idea.description}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Printable Tips Section */}
      {details.printableTipsTitle && details.printableTips && details.printableTips.length > 0 && (
        <section className="py-6 border-t border-gray-200">
          <h2 className="text-2xl font-semibold text-center mb-6 text-teal-600">{details.printableTipsTitle}</h2>
          <ul className="list-disc list-inside space-y-3 pl-4">
            {details.printableTips.map((tip, index) => (
              <li key={index} className="text-gray-700">
                {tip.segments.map((segment, segIndex) => (
                  segment.bold ? <strong key={segIndex} className="font-medium text-gray-800">{segment.text}</strong> : <span key={segIndex}>{segment.text}</span>
                ))}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ List Section - Assuming this is always present or handled by FAQList */}
      <section className="py-6">
        <FAQList faqs={details.faqs || []} />
      </section>
    </div>
  );
}
