import { FAQItemType } from "../types";

const paragraph = "Explore the wild world with our amazing animal coloring pages! From majestic lions and playful dolphins to cute farm animals and exotic birds, this collection is perfect for animal lovers of all ages. These printable sheets offer a fun way to learn about different creatures while expressing creativity.";

const howToGuideTitle = "🦓 How-To Guide: Download & Print Your Animal Coloring Pages";

const howToGuide = [
  {
    step: 1,
    title: "Choose Your Creature",
    description: "Browse our diverse range of animal coloring pages and pick your favorites from the animal kingdom."
  },
  {
    step: 2,
    title: "Instant Download",
    description: "Click the download icon. Each page is a high-resolution PDF, ready for your artistic touch."
  },
  {
    step: 3,
    title: "Open the File",
    description: "Use any standard PDF viewer to open your downloaded animal coloring sheet."
  },
  {
    step: 4,
    title: "Print Your Page",
    description: "Print on A4 or US Letter paper. Use 'fit to page' for the best results."
  },
  {
    step: 5,
    title: "Start Coloring!",
    description: "Grab your crayons, markers, or colored pencils and bring these animals to life!"
  }
];

const activityIdeasTitle = "🐾 Activity Ideas Using Animal Coloring Pages";

const activityIdeas = [
  {
    title: "Animal Habitat Dioramas",
    description: "After coloring, cut out the animals and create a 3D habitat scene in a shoebox."
  },
  {
    title: "Learn Animal Facts",
    description: "While coloring, look up interesting facts about the animal being colored."
  },
  {
    title: "Create an Animal Alphabet Book",
    description: "Color an animal for each letter of the alphabet and compile them into a book."
  },
  {
    title: "Zoo or Farm Themed Party",
    description: "Use as a fun activity or party favor for animal-themed birthday parties."
  },
  {
    title: "Animal Masks",
    description: "Color and cut out animal faces to make simple masks for pretend play."
  }
];

const printableTipsTitle = "🎨 Printable Tips for the Best Animal Coloring Experience";

const printableTips = [
  {
    segments: [
      { text: "Use realistic colors or go wild with imagination!", bold: true },
      { text: " There's no wrong way to color an animal." }
    ]
  },
  {
    segments: [
      { text: "Try to add texture", bold: true },
      { text: " for fur, scales, or feathers using different coloring techniques (e.g., short strokes for fur)." }
    ]
  },
  {
    segments: [
      { text: "Color the background", bold: true },
      { text: " to place your animal in its natural habitat or a fun, imaginative setting." }
    ]
  },
  {
    segments: [
      { text: "For animals with patterns (like zebras or leopards),", bold: true },
      { text: " take your time with the details." }
    ]
  },
  {
    segments: [
      { text: "Laminate finished pages", bold: true },
      { text: " to use as reusable placemats or educational charts." }
    ]
  }
];

const faqs: FAQItemType[] = [
  {
    id: 1,
    question: "What types of animals are included in the coloring pages?",
    answer: "Our collection features a wide variety, including farm animals, wild animals (jungle, safari, forest), sea creatures, birds, insects, and even some prehistoric dinosaurs!"
  },
  {
    id: 2,
    question: "Are there animal coloring pages suitable for different skill levels?",
    answer: "Yes, we offer simple designs with bold outlines for younger children and more detailed, realistic animal illustrations for older kids and adults."
  },
  {
    id: 3,
    question: "Can these coloring pages be used for educational purposes?",
    answer: "Definitely! They are great for teaching children about different animal species, their habitats, and characteristics. They can complement biology lessons or nature studies."
  },
  {
    id: 4,
    question: "What's the best way to color fur or feathers?",
    answer: "For fur, try using short, layered strokes with colored pencils. For feathers, you can use smooth strokes and blend colors to show iridescence or texture."
  },
  {
    id: 5,
    question: "Do you have coloring pages of specific animal breeds (e.g., dog breeds)?",
    answer: "We are always expanding our collection! While we have general animal types, we are gradually adding more specific breeds and species. Check back often!"
  }
];

const animalsOtherDetailsData = {
  paragraph,
  howToGuideTitle,
  howToGuide,
  activityIdeasTitle,
  activityIdeas,
  printableTipsTitle,
  printableTips,
  faqs,
};

export default animalsOtherDetailsData; 