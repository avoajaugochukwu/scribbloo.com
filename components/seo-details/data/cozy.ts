import { FAQItemType } from "../types";

const paragraph = "Wrap yourself in warmth with our cozy coloring pages! Featuring comforting scenes like crackling fireplaces, steaming mugs of cocoa, soft blankets, and peaceful reading nooks. These printable designs are perfect for unwinding, de-stressing, and embracing the simple joys of comfort and relaxation.";

const howToGuideTitle = "☕ How-To Guide: Download & Print Your Cozy Coloring Pages";

const howToGuide = [
  {
    step: 1,
    title: "Find Your Comfort",
    description: "Browse our selection of cozy-themed coloring sheets and choose the scenes that make you feel warm and relaxed."
  },
  {
    step: 2,
    title: "Instant Download",
    description: "Click the download icon. Each page is a high-resolution PDF, ready for your coloring session."
  },
  {
    step: 3,
    title: "Open the File",
    description: "Use any standard PDF viewer to open your downloaded cozy coloring page."
  },
  {
    step: 4,
    title: "Print Your Page",
    description: "Print on A4 or US Letter paper. Consider a slightly thicker paper for a premium feel."
  },
  {
    step: 5,
    title: "Relax and Color",
    description: "Grab your favorite coloring tools, a warm drink, and enjoy a peaceful coloring experience."
  }
];

const activityIdeasTitle = "🧣 Activity Ideas Using Cozy Coloring Pages";

const activityIdeas = [
  {
    title: "Hygge Coloring Night",
    description: "Host a cozy coloring night with friends, complete with soft lighting, calming music, and warm beverages."
  },
  {
    title: "Personalized Greeting Cards",
    description: "Color a cozy scene and turn it into a heartfelt greeting card for a loved one."
  },
  {
    title: "Journal or Planner Decoration",
    description: "Cut out elements from colored pages to decorate your journal, planner, or scrapbook."
  },
  {
    title: "Vision Board for Comfort",
    description: "Use colored cozy images on a vision board to represent your ideal relaxing environment."
  },
  {
    title: "Mindfulness Practice",
    description: "Use coloring these pages as a mindfulness exercise, focusing on colors and strokes to de-stress."
  }
];

const printableTipsTitle = "🕯️ Printable Tips for the Best Cozy Coloring Experience";

const printableTips = [
  {
    segments: [
      { text: "Use warm color palettes", bold: true },
      { text: " like browns, oranges, deep reds, and soft yellows to enhance the cozy feel." }
    ]
  },
  {
    segments: [
      { text: "Soft shading and blending techniques", bold: true },
      { text: " can create a gentle, inviting look." }
    ]
  },
  {
    segments: [
      { text: "Consider adding textures", bold: true },
      { text: " for blankets or knitted items using cross-hatching or stippling." }
    ]
  },
  {
    segments: [
      { text: "Play some calming music or a podcast", bold: true },
      { text: " while you color to fully immerse yourself in the cozy atmosphere." }
    ]
  },
  {
    segments: [
      { text: "Don't rush the process;", bold: true },
      { text: " enjoy the journey of bringing a comforting scene to life." }
    ]
  }
];

const faqs: FAQItemType[] = [
  {
    id: 1,
    question: "What kind of scenes are typical in 'cozy' coloring pages?",
    answer: "Think warm interiors, comfy furniture, books, tea/coffee, fireplaces, soft lighting, autumn or winter elements, and anything that evokes a sense of comfort and peace."
  },
  {
    id: 2,
    question: "Are these pages good for stress relief?",
    answer: "Yes, absolutely! Coloring, especially scenes designed to be calming and cozy, can be a wonderful way to reduce stress, practice mindfulness, and relax."
  },
  {
    id: 3,
    question: "Can I use these for a 'self-care' day activity?",
    answer: "They are perfect for self-care! Pair your coloring session with other relaxing activities like a warm bath, reading, or enjoying your favorite comfort food."
  },
  {
    id: 4,
    question: "What colors best represent a 'cozy' feeling?",
    answer: "Warm earth tones, muted shades, soft blues, creamy whites, and gentle oranges or yellows often create a cozy ambiance. However, feel free to use any colors that make you feel comfortable!"
  },
  {
    id: 5,
    question: "Do you have seasonal cozy coloring pages (e.g., for autumn or winter)?",
    answer: "Yes, many of our cozy designs incorporate seasonal elements, making them perfect for coloring during colder months or whenever you need a touch of warmth."
  }
];

const cozyOtherDetailsData = {
  paragraph,
  howToGuideTitle,
  howToGuide,
  activityIdeasTitle,
  activityIdeas,
  printableTipsTitle,
  printableTips,
  faqs,
};

export default cozyOtherDetailsData; 