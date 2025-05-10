import unicornOtherDetailsData from './unicorn';
import fairyOtherDetailsData from './fairy';
import natureOtherDetailsData from './nature';
import animalsOtherDetailsData from './animals';
import cozyOtherDetailsData from './cozy';
import fantasyOtherDetailsData from './fantasy';
import girlOtherDetailsData from './girl';
// Add imports for any other category data files you have

import { FAQItemType } from '../types'; // Assuming FAQItemType is in a shared types file

// This interface should match the one in OtherDetails.tsx
// or be imported from a shared types file if you prefer.
export interface OtherDetailsContent {
  paragraph?: string;
  howToGuideTitle?: string;
  howToGuide?: Array<{ step: number; title: string; description: string }>;
  activityIdeasTitle?: string;
  activityIdeas?: Array<{ title: string; description: string }>;
  printableTipsTitle?: string;
  printableTips?: Array<{ segments: Array<{ text: string; bold?: boolean }> }>;
  faqs?: FAQItemType[];
}

interface AllDetailsMap {
  [key: string]: OtherDetailsContent;
}

export const allDetailsData: AllDetailsMap = {
  unicorn: unicornOtherDetailsData,
  fairy: fairyOtherDetailsData,
  nature: natureOtherDetailsData,
  animals: animalsOtherDetailsData,
  cozy: cozyOtherDetailsData,
  fantasy: fantasyOtherDetailsData,
  girl: girlOtherDetailsData,
  // Add other categories here, mapping the slug to its data object
  // e.g., rainbow: rainbowOtherDetailsData,
};

export const defaultStaticContent: OtherDetailsContent = {
  paragraph: "Discover more about our wonderful coloring pages in this category!",
  howToGuideTitle: "How to Get Started",
  howToGuide: [],
  activityIdeasTitle: "Fun Activity Ideas",
  activityIdeas: [],
  printableTipsTitle: "Tips for Printing",
  printableTips: [],
  faqs: [],
}; 