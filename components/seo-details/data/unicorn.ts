import { FAQItemType } from "../types";

const paragraph = "Let your child's imagination soar with our free unicorn coloring pages — designed especially for kids who love magical creatures, rainbows, and fairy tale fun. This collection features printable unicorn art perfect for toddlers, preschoolers, and early elementary kids. Whether you're planning a unicorn-themed birthday party or looking for creative, screen-free activities, our pages are ready to print and color anytime. With bold outlines, kid-friendly designs, and fantasy scenes, these unicorn coloring sheets are both fun and easy for little hands to enjoy.";

const howToGuideTitle = "🖨️ How-To Guide: Download & Print Your Unicorn Coloring Pages";

const howToGuide = [
  {
    step: 1,
    title: "Browse the collection",
    description: "Scroll through the unicorn coloring sheets and choose your favorites."
  },
  {
    step: 2,
    title: "Click the download icon",
    description: "Each page has a button below it — just one click to download the high-resolution printable PDF."
  },
  {
    step: 3,
    title: "Open the file",
    description: "Use any standard PDF viewer like Adobe Reader."
  },
  {
    step: 4,
    title: "Print at home or school",
    description: "Select A4 or US Letter paper. Use \"fit to page\" for perfect scaling."
  },
  {
    step: 5,
    title: "Start coloring",
    description: "Grab crayons, markers, or colored pencils and let the magical fun begin!"
  }
];

const activityIdeasTitle = "🎉 Activity Ideas Using Unicorn Coloring Pages";

const activityIdeas = [
  {
    title: "Birthday Party Craft Station",
    description: "Set up a table with printed unicorn pages and coloring supplies for instant party fun."
  },
  {
    title: "Quiet Time Routine",
    description: "Use the pages during wind-down time to help kids relax and stay off screens."
  },
  {
    title: "Storytelling Prompts",
    description: "After coloring, have kids make up a story about the unicorn they just brought to life."
  },
  {
    title: "Classroom Reward Activity",
    description: "Use coloring pages as a calming reward after tests or busy lessons."
  },
  {
    title: "Unicorn Week Theme",
    description: "Pair pages with unicorn books, stickers, and music for a magical themed week at home or in class."
  }
];

const printableTipsTitle = "📝 Printable Tips for the Best Coloring Experience";

const printableTips = [
  {
    segments: [
      { text: "Use heavier paper (like 32 lb. or cardstock)", bold: true },
      { text: " for smoother coloring and less bleed-through." }
    ]
  },
  {
    segments: [
      { text: "Crayons and colored pencils work best", bold: true },
      { text: " — avoid markers unless using thick paper." }
    ]
  },
  {
    segments: [
      { text: "Print in black & white", bold: true },
      { text: ", even if using a color printer, to keep outlines crisp and easy to color." }
    ]
  },
  {
    segments: [
      { text: "Let kids cut out their creations", bold: true },
      { text: " and use them in art projects, posters, or pretend play." }
    ]
  },
  {
    segments: [
      { text: "Store extras in a binder or folder", bold: true },
      { text: " for rainy days, travel, or screen-free time." }
    ]
  }
];

const faqs: FAQItemType[] = [
  {
    id: 1,
    question: "What age group are these unicorn coloring pages for?",
    answer: "These unicorn coloring sheets are perfect for children ages 3 to 10. Younger kids will love the simple shapes, while older kids can get creative with colors and details."
  },
  {
    id: 2,
    question: "Are the unicorn coloring pages free?",
    answer: "Yes! All unicorn coloring pages on Scribbloo are free to download and print. No sign-up required."
  },
  {
    id: 3,
    question: "How do I print the coloring pages?",
    answer: "Simply click the download icon below any image, then open the file and print on A4 or Letter-sized paper. Use your printers; 'fit to page' setting for the best results."
  },
  {
    id: 4,
    question: "Can I use these pages in a classroom or daycare?",
    answer: "Absolutely! Our unicorn coloring pages are perfect for educational settings. Teachers and caregivers are welcome to print multiple copies for classroom use."
  },
  {
    id: 5,
    question: "What makes these unicorn coloring pages special?",
    answer: [
      "Our unicorn coloring pages offer several unique features:",
      "Hand-drawn designs created specifically for different age groups",
      "Various unicorn themes and styles from simple to detailed",
      "Both realistic and fantasy-style unicorn illustrations",
      "Special seasonal unicorn pages for holidays and events"
    ]
  },
  {
    id: 6,
    question: "Do you have unicorn coloring pages for different themes?",
    answer: "Yes! We have unicorns in various themes including rainbow unicorns, baby unicorns, flying unicorns, unicorns with friends, seasonal unicorns, and magical castle scenes."
  },
  {
    id: 7,
    question: "What's the best way to color these unicorn pages?",
    answer: "Our pages work beautifully with colored pencils, crayons, markers, or even watercolors for older children. Try using glitter pens or stickers for extra magical effects!"
  },
  {
    id: 8,
    question: "Can I share my child's colored unicorn artwork?",
    answer: "We'd love to see their creations! With parental permission, you can share the finished artwork on social media with #ScribblooUnicorns or email it to our gallery."
  },
  {
    id: 9,
    question: "How often do you add new unicorn coloring pages?",
    answer: "We add new unicorn designs monthly, with special additions during holidays and seasonal events. Check back regularly for fresh magical unicorn scenes to color!"
  },
  {
    id: 10,
    question: "Why are unicorns good for children's coloring activities?",
    answer: "Unicorns inspire imagination and creativity in children. The magical nature of unicorns encourages kids to explore color combinations and develop their artistic expression while enjoying a fun activity."
  },
  {
    id: 11,
    question: "Do you have unicorn coloring pages for adults too?",
    answer: "Yes! We have several detailed unicorn designs specifically created for adults and older children who enjoy more intricate coloring activities for relaxation and mindfulness."
  },
  {
    id: 12,
    question: "How can I help my child get the most from these coloring pages?",
    answer: [
      "Here are some tips for a great coloring experience:",
      "Print on thicker paper for better results",
      "Talk about color choices and encourage creativity",
      "Use coloring time to discuss magical stories and imagination",
      "Display finished artwork to boost confidence"
    ]
  },
  {
    id: 13,
    question: "Who can I contact for support or suggestions?",
    answer: "For any questions, feedback, or coloring page requests, reach out via our contact page or email support@scribbloo.com."
  }
];

// Combine all details into a single object
const unicornOtherDetailsData = {
  paragraph,
  howToGuideTitle,
  howToGuide,
  activityIdeasTitle,
  activityIdeas,
  printableTipsTitle,
  printableTips,
  faqs,
};

export default unicornOtherDetailsData;