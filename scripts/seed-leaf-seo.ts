/**
 * One-off backfill: add anti-thin-content body copy to the coloring leaves that
 * shipped with `description: null` and an empty body (see plan/thin-content-guide.md).
 *
 *   node --import tsx scripts/seed-leaf-seo.ts            # write
 *   node --import tsx scripts/seed-leaf-seo.ts --dry-run  # print, don't write
 *
 * For each slug in CONTENT below, it finds the matching leaf .mdx anywhere under
 * content/coloring-pages, merges `description` + `seoDetails` into the existing
 * frontmatter (every other field is preserved), and re-validates against
 * coloringPageSchema before writing. Idempotent: re-running just rewrites the same
 * fields. Safe to delete once the generator emits seoDetails itself.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { coloringPageSchema } from '../lib/content/types';

type Tip = [lead: string, rest: string];
interface Faq { q: string; a: string }
interface Entry {
  description: string;
  paragraph: string;
  tips: Tip[];
  faqs: Faq[];
}

/* Coloring tips share two evergreen closers across pages but each lead/rest is
 * page-specific, so no two pages render identical tip text. */
const CONTENT: Record<string, Entry> = {
  /* ---- animals ---- */
  'baby-elephant': {
    description:
      'A cheerful baby elephant holding a single flower in its curled trunk, drawn with bold, rounded outlines that are easy for little hands to color.',
    paragraph:
      "This printable baby elephant coloring page shows a chubby, smiling calf with big floppy ears and a curled-up trunk holding one tiny flower. The lines are thick and well-spaced, so it suits toddlers and preschoolers who are still building fine-motor control, while older kids can have fun shading the wrinkly skin and detailing the ears. Elephants are a favourite first animal for early learners, and a page like this is a gentle way to talk about big-and-small, gentle giants, and where elephants live. Print it on standard US Letter or A4 paper and reach for whatever you have on hand — crayons, colored pencils, or washable markers all work beautifully on the open shapes.",
    tips: [
      ['Skip plain grey', 'real elephants are grey, but soft blue-grey, dusty lavender or warm taupe make a far more interesting page.'],
      ['Pop the flower', 'color the little flower in a bright accent — yellow, pink or red — so it stands out against the calm body.'],
      ['Add ground and sky', 'a strip of green grass and a pale blue background turn the single character into a whole little scene.'],
    ],
    faqs: [
      { q: 'Is this elephant coloring page good for toddlers?', a: 'Yes. The outlines are thick and the shapes are large and simple, which makes it well suited to toddlers and preschoolers who are still learning to color inside the lines.' },
      { q: 'What size does it print at?', a: 'It is sized for standard US Letter and A4 paper, so you can print it at home on a regular printer with no resizing needed.' },
    ],
  },
  'cute-puppy': {
    description:
      'A fluffy sitting puppy with floppy ears, a lifted paw and a little name-tag collar — a simple, friendly dog coloring page for all ages.',
    paragraph:
      "This cute puppy coloring page features a fluffy little dog sitting up with big round eyes, long floppy ears, a wagging tail and one front paw lifted as if asking to play. A small collar with a round name tag gives kids a fun extra detail to personalise. The bold outlines and roomy spaces make it forgiving for younger children, while the fur, ears and tag give older colorists places to practise light shading and texture. Puppies are one of the most-loved coloring subjects, and this page is a sweet way to talk about caring for a pet. Print it on US Letter or A4 and color it with crayons, pencils or markers.",
    tips: [
      ['Choose a breed', 'golden, brown, black-and-white or grey — picking a real coat color makes the puppy feel like a specific dog.'],
      ['Name the tag', 'write a name on the round tag and color it gold or silver for a shiny finishing touch.'],
      ['Layer the fur', 'press lightly first, then add a second darker pass along the ears and tail to suggest soft fur.'],
    ],
    faqs: [
      { q: 'Can my child personalise the puppy?', a: 'Yes — there is a round name tag on the collar where kids can write a pet name, and they can choose any coat color they like.' },
      { q: 'What can I color it with?', a: 'Crayons, colored pencils and washable markers all work well. The shapes are open enough that any medium colors in cleanly.' },
    ],
  },
  'friendly-lion': {
    description:
      'A happy cartoon lion with a big curly mane, sitting upright with a friendly smile — a bold, beginner-friendly animal coloring page.',
    paragraph:
      "This friendly lion coloring page shows a cheerful cartoon lion sitting upright, framed by a big, curly mane with a happy smile and a tufted tail curled beside it. The chunky mane is the star of the page: it is broken into clear curls that are satisfying to fill in one section at a time, which makes the page great for kids practising control as well as adults who enjoy a calmer, repetitive coloring rhythm. Lions are a natural lead-in to talking about Africa, big cats and the idea of being brave. Print it on US Letter or A4 paper and use warm colors for the mane to make it really glow.",
    tips: [
      ['Warm the mane', 'layer yellow, orange and a touch of brown through the curls so the mane looks full and sunlit.'],
      ['Vary the curls', 'color alternating curls slightly lighter and darker to give the mane depth instead of one flat tone.'],
      ['Keep the face soft', 'a pale tan face against the rich mane keeps the lion looking friendly rather than fierce.'],
    ],
    faqs: [
      { q: 'Is this lion scary for young children?', a: 'No — it is drawn as a smiling, rounded cartoon with a friendly face, so it is gentle enough for preschoolers.' },
      { q: 'Why is the mane split into sections?', a: 'The mane is drawn as separate curls so it is easy to color one piece at a time, which helps younger children and makes shading simpler for everyone.' },
    ],
  },
  /* ---- cozy ---- */
  'cozy-cat-by-the-window': {
    description:
      'A round, sleepy cat curled up on a windowsill cushion beside a steaming teacup — a calm, cozy scene to color and unwind with.',
    paragraph:
      "This cozy cat coloring page shows a round, fluffy cat curled up asleep on a windowsill cushion, with soft curtains, a little potted plant and a steaming teacup completing the scene. It belongs to our cozy collection — gentle, homey pictures designed for slow, relaxing coloring rather than busy detail. The mix of large shapes (the cat, the cushion) and small ones (the plant, the cup) gives you both quick wins and finer areas to focus on, which makes it a lovely page for teens and adults winding down, as well as children. Print it on US Letter or A4 and lean into soft, muted colors to keep that calm, hygge feeling.",
    tips: [
      ['Go muted', 'soft sage, dusty blue and warm cream feel cozier than bright primary colors for a scene like this.'],
      ['Warm the window light', 'a pale yellow glow behind the curtains makes the room feel snug and sunlit.'],
      ['Add steam', 'leave the area above the teacup white, or use the faintest grey, to suggest rising warmth.'],
    ],
    faqs: [
      { q: 'Is this page good for adult coloring?', a: 'Yes. It is part of our cozy range, which is made for relaxed, low-stress coloring, so it works well for adults and teens as well as kids.' },
      { q: 'What palette suits a cozy scene?', a: 'Soft, muted tones — sages, dusty blues, warm creams and gentle yellows — keep the calm, homey mood. Bright neons tend to break it.' },
    ],
  },
  'cozy-reading-nook': {
    description:
      'A snug reading nook with a comfy armchair, a draped blanket, a stack of books and a steaming mug — a peaceful scene for relaxed coloring.',
    paragraph:
      "This cozy reading nook coloring page captures a snug little corner: a plump armchair with a soft blanket over the arm, a tall stack of books, a side table holding a steaming mug, and a leafy plant hanging above. It is one of our cozy scenes, built for slow, unwinding coloring rather than fiddly detail. With lots of distinct objects, it is a satisfying page to work through piece by piece, and a nice quiet-time activity for book lovers of any age. The spines of the book stack are a fun spot to get creative with lots of colors. Print it on US Letter or A4 and settle in with your favourite drink.",
    tips: [
      ['Rainbow the spines', 'give every book in the stack a different color so the pile becomes the brightest part of the page.'],
      ['Pick a cozy chair', 'a deep mustard, rust or forest-green armchair instantly makes the nook feel warm and inviting.'],
      ['Texture the blanket', 'short pencil strokes in one direction suggest a soft, knitted throw.'],
    ],
    faqs: [
      { q: 'How detailed is this page?', a: 'It has several distinct objects — chair, books, mug, plant — but the shapes themselves are open and clean, so it stays relaxing rather than fiddly.' },
      { q: 'Can I print it more than once?', a: 'Yes. It is a free printable you can print as many times as you like — handy for trying different color schemes.' },
    ],
  },
  'hot-cocoa-and-blanket': {
    description:
      'A steaming mug of hot cocoa with marshmallows tucked in a knitted blanket, with a candy cane and little stars — a cozy winter coloring page.',
    paragraph:
      "This hot cocoa coloring page shows a big steaming mug topped with three round marshmallows, nestled inside a chunky knitted blanket, with a candy cane resting against the rim and a few little stars and a crescent moon floating around. It is a warm, wintry page from our cozy collection — simple enough for children but charming enough for teens and adults who enjoy seasonal coloring. It makes a lovely activity on a cold day or in the run-up to the holidays, and the candy cane and stars add cheerful pops of contrast. Print it on US Letter or A4 and keep your reds and browns rich for that snug, just-came-in-from-the-cold feeling.",
    tips: [
      ['Rich brown cocoa', 'a deep chocolate brown for the drink makes the pale marshmallows really stand out on top.'],
      ['Classic candy cane', 'red-and-white stripes on the candy cane add an instant festive accent.'],
      ['Knit the blanket', 'pick one cozy color for the blanket and add little V-shaped marks to hint at the knitted texture.'],
    ],
    faqs: [
      { q: 'Is this a good winter or holiday coloring page?', a: 'Yes — the cocoa, marshmallows, candy cane and crescent moon give it a cozy winter and holiday feel, perfect for the colder months.' },
      { q: 'Is it suitable for young children?', a: 'It is. The main shapes — mug, marshmallows, blanket — are large and bold, with just a few small details for older kids to enjoy.' },
    ],
  },
  /* ---- fairy ---- */
  'fairy-on-a-mushroom': {
    description:
      'A little fairy with pointed wings perched on a big spotted mushroom, holding a tiny flower among the grass — a sweet fairytale coloring page.',
    paragraph:
      "This fairy coloring page shows a little fairy with delicate pointed wings sitting on top of a big, round spotted mushroom, holding a tiny flower, with blades of grass and small toadstools around her. It is a gentle storybook scene that sparks imaginative play — kids love inventing names and stories for woodland fairies. The spotted mushroom cap gives a fun, repetitive area to color, and the wings are a perfect place to try soft, blended pastels. The page mixes big shapes with a few delicate details, so it grows with the child. Print it on US Letter or A4 and use light, magical colors for the wings to make them look almost see-through.",
    tips: [
      ['Spot the toadstool', 'a classic red cap with white spots is instantly recognisable and fun to color.'],
      ['Pastel the wings', 'blend the lightest pinks, blues and purples on the wings so they look delicate and magical.'],
      ['Layer the grass', 'use two shades of green for the grass and toadstools to give the little scene depth.'],
    ],
    faqs: [
      { q: 'What age is this fairy page for?', a: 'It suits a wide range — the large mushroom and fairy work for young children, while the wings and small toadstools give older kids finer detail to enjoy.' },
      { q: 'How do I make the wings look magical?', a: 'Color them with light, blended pastels and leave some areas almost white. Soft, see-through colors read as magical fairy wings.' },
    ],
  },
  'flying-fairy-with-wand': {
    description:
      'A cheerful fairy flying with a star-tipped wand trailing sparkles, surrounded by tiny stars — a magical coloring page full of movement.',
    paragraph:
      "This flying fairy coloring page captures a cheerful fairy mid-flight, wings outstretched, waving a star-tipped wand that trails a swirl of sparkles, with her dress and curly hair streaming back and tiny stars floating all around. The sense of movement makes it an exciting page for kids who love magic and fairytales, and the scattered stars give lots of little shapes to fill in once the main figure is done. The flowing dress and hair are great for practising long, smooth coloring strokes. Print it on US Letter or A4 and add a soft glow around the wand to make the magic feel real.",
    tips: [
      ['Glow the wand', 'color the star tip bright yellow and keep the area just around it pale so it looks like it is glowing.'],
      ['Trail the sparkles', 'pick one shimmery color — gold, pink or pale blue — for all the sparkles so they read as one magical trail.'],
      ['Flow the dress', 'use long strokes that follow the direction of the dress and hair to keep the feeling of movement.'],
    ],
    faqs: [
      { q: 'Are there small details to color?', a: 'Yes — besides the fairy, there are many little stars and sparkles scattered around the page, which are great for older children who like detail.' },
      { q: 'Is it a good page for fans of magic and fairytales?', a: 'Definitely. The flying pose, the star-tipped wand and the trail of sparkles make it one of our most magical fairy pages.' },
    ],
  },
  'garden-fairy-with-flowers': {
    description:
      'A sweet garden fairy kneeling among tall flowers with a watering can and fluttering butterflies — a gentle nature-and-fairy coloring page.',
    paragraph:
      "This garden fairy coloring page shows a sweet fairy kneeling among tall flowers, holding a little watering can, with leafy wings, a petal skirt and two butterflies fluttering nearby. It blends two favourite themes — fairies and gardens — into one calm, friendly scene. There are plenty of flowers and leaves to fill in, which makes it a relaxing page to work through and a nice springtime or Earth-Day activity that ties into talking about plants, bugs and looking after a garden. The butterflies are perfect little spots for bright, contrasting color. Print it on US Letter or A4 and let the flowers be as colorful as you like.",
    tips: [
      ['Mix the blooms', 'give each flower a different color so the garden looks lush and varied rather than uniform.'],
      ['Bright butterflies', 'color the two butterflies in bold, contrasting colors so they pop against the green leaves.'],
      ['Green the wings', 'soft leaf-greens on the wings tie the fairy into her garden surroundings.'],
    ],
    faqs: [
      { q: 'Is this a good spring or Earth Day coloring page?', a: 'Yes — the garden setting, flowers and butterflies make it a natural fit for spring, gardening and Earth Day themes.' },
      { q: 'Does it have lots to color?', a: 'It does. Alongside the fairy there are tall flowers, leaves and two butterflies, so it keeps colorists busy without being overwhelming.' },
    ],
  },
  /* ---- fantasy ---- */
  'friendly-dragon': {
    description:
      'A chubby, smiling baby dragon with little wings and soft rounded spikes — a cute, non-scary fantasy coloring page for all ages.',
    paragraph:
      "This friendly dragon coloring page features a chubby, happy baby dragon standing and smiling, with big round eyes, two short horns, small rounded wings, a curled tail lined with soft spikes and a plump belly. It is deliberately cute rather than fierce, so it suits children who love dragons but want a gentle, smiley one. The bold outlines and clear belly scales make it easy to color, and the wings and row of spikes are fun places to try a second color. Dragons are a gateway to all kinds of make-believe stories. Print it on US Letter or A4 and pick any color you like — dragons can be every color of the rainbow.",
    tips: [
      ['Any color goes', 'green, purple, blue, red — dragons are imaginary, so there are no wrong colors here.'],
      ['Contrast the belly', 'a lighter belly and inner wings against a darker body make the little dragon look rounded and full.'],
      ['Tip the spikes', 'color the row of back spikes in a second shade so they stand out along the tail.'],
    ],
    faqs: [
      { q: 'Is this dragon scary?', a: 'Not at all — it is a chubby, smiling baby dragon with big friendly eyes and soft rounded spikes, designed to be cute rather than frightening.' },
      { q: 'What color should the dragon be?', a: 'Any color you like. Because dragons are imaginary, children can pick their favourite color or mix several with no "wrong" answer.' },
    ],
  },
  'magic-castle': {
    description:
      'A whimsical fairytale castle with tall flag-topped towers, an arched gate and a winding path, framed by clouds and stars — a magical coloring page.',
    paragraph:
      "This magic castle coloring page shows a whimsical fairytale castle with tall pointed towers topped by waving flags, a big arched front gate, round windows and a winding path leading up to it, with fluffy clouds and stars around the spires. It is a classic fantasy scene that invites kids to imagine who lives inside — a princess, a knight, a friendly wizard. The many towers, windows and bricks give a satisfying amount to color, making it a good page for children who like to keep going, and the repeating shapes are calming for older colorists too. Print it on US Letter or A4 and try a sunset sky behind the towers for extra magic.",
    tips: [
      ['Flag every tower', 'color each triangular flag a different bright color to make the towers feel festive.'],
      ['Sunset sky', 'a peach-to-purple gradient behind the castle makes the whole scene look magical.'],
      ['Pick a stone color', 'soft grey, sandy tan or pale blue all make convincing castle walls — choose one and add a few darker bricks for detail.'],
    ],
    faqs: [
      { q: 'Does this castle page have lots of detail?', a: 'Yes — between the towers, windows, bricks, gate, path and stars there is plenty to color, so it keeps children engaged for a while.' },
      { q: 'Can I pair it with other fantasy pages?', a: 'Absolutely. It goes well with our unicorn, dragon and wizard pages if you want to build a whole fantasy coloring set.' },
    ],
  },
  'baby-unicorn-with-stars': {
    description:
      'A tiny, chubby baby unicorn with a curly mane and sparkly eyes, surrounded by floating stars and hearts — an adorable unicorn coloring page.',
    paragraph:
      "This baby unicorn coloring page shows a tiny, chubby unicorn sitting down with a small curly mane, a short spiral horn, big sparkly eyes and a fluffy tufted tail, surrounded by floating five-point stars and a couple of little hearts. It is one of the cutest pages in our unicorn collection and a favourite with younger children, thanks to its big shapes and gentle, rounded outlines. The scattered stars and hearts give extra little areas to color once the unicorn is done. The mane and tail are perfect for trying a rainbow of colors. Print it on US Letter or A4 and go as pastel or as bright as you like.",
    tips: [
      ['Rainbow the mane', 'split the curly mane and tail into bands of different colors for a classic unicorn look.'],
      ['Shimmer the horn', 'pale gold, lilac or pink keeps the little spiral horn looking magical.'],
      ['Fill the stars', 'color the floating stars and hearts in soft pastels so they frame the unicorn without overpowering it.'],
    ],
    faqs: [
      { q: 'Is this unicorn page good for young children?', a: 'Yes — it is a big, chubby baby unicorn with bold, rounded lines, which makes it one of our easiest and most toddler-friendly unicorn pages.' },
      { q: 'How should I color a unicorn mane?', a: 'Unicorn manes look great in rainbow bands or soft pastels. Pick several colors and color the curls in stripes for the classic magical effect.' },
    ],
  },
  'rainbow-unicorn': {
    description:
      'A graceful unicorn prancing with a rainbow-striped mane and a big arching rainbow behind it — a bright, joyful unicorn coloring page.',
    paragraph:
      "This rainbow unicorn coloring page shows a graceful unicorn prancing with one hoof raised, its long mane and tail made of rainbow-striped curls, a spiral horn, and a big arching rainbow with rounded clouds behind it. It is one of the most colorful pages in our unicorn set — the rainbow and the striped mane practically ask for every crayon in the box. The flowing mane is great for long, smooth strokes, while the rainbow is a fun chance to talk about color order. It suits children who love bright, happy pictures, and the bold outlines keep it easy. Print it on US Letter or A4 and let it be as vivid as possible.",
    tips: [
      ['Match mane to rainbow', 'use the same rainbow order in the mane and the arch behind for a beautifully coordinated page.'],
      ['Learn the order', 'red, orange, yellow, green, blue, purple — coloring the rainbow is a fun way to remember the sequence.'],
      ['Keep the body soft', 'a white or very pale unicorn body lets the rainbow mane be the star.'],
    ],
    faqs: [
      { q: 'Is this a colorful page or a simple one?', a: 'Both — the outlines are simple and bold, but the rainbow and striped mane invite lots of color, so it works for beginners and for kids who love going bright.' },
      { q: 'Can it help teach the colors of the rainbow?', a: 'Yes. Coloring the arching rainbow in order — red through purple — is a fun, hands-on way for children to learn the rainbow sequence.' },
    ],
  },
  'unicorn-castle': {
    description:
      'A magical unicorn standing before a tall fairytale castle under a starry sky — a dreamy coloring page that blends unicorns and castles.',
    paragraph:
      "This unicorn castle coloring page brings together two favourite themes: a magical unicorn with a flowing mane and spiral horn standing in front of a tall fairytale castle, with pointed towers, a crescent moon and stars in the sky, and a flower-lined path leading to the gate. It is a rich scene with plenty to color — the unicorn, the towers, the flowers and the night sky all offer different areas to work on, making it a great page for children who like a bigger project. It also pairs perfectly with our other unicorn and castle pages. Print it on US Letter or A4 and try a deep night sky to make the stars shine.",
    tips: [
      ['Night sky', 'a deep blue or purple sky behind the castle makes the moon and stars really stand out.'],
      ['Light the windows', 'leave the castle windows pale yellow so it looks warm and lived-in against the dark sky.'],
      ['Line the path', 'color the path flowers in mixed bright shades to lead the eye up to the castle gate.'],
    ],
    faqs: [
      { q: 'Is this page more advanced than a single-unicorn page?', a: 'A little — because it combines a unicorn, a full castle, a path and a night sky, there is more to color, which suits children who enjoy a longer project.' },
      { q: 'Does it go with your other fantasy pages?', a: 'Yes. It pairs naturally with our rainbow unicorn, baby unicorn and magic castle pages for a complete fantasy coloring set.' },
    ],
  },
  'wizard-with-wand': {
    description:
      'A friendly old wizard in a star-covered hat raising a glowing wand, with a little owl on his shoulder — a magical fantasy coloring page.',
    paragraph:
      "This wizard coloring page features a friendly old wizard with a long flowing beard and a tall pointed hat covered in stars and moons, holding up a wand topped with a glowing star, wearing a wide-sleeved robe, with a little round owl perched on his shoulder. It is a warm, storybook take on a wizard — wise and kindly rather than spooky — which makes it great for fantasy-loving kids. The star-and-moon hat and the flowing robe give lots of detail to enjoy, and the owl is a sweet bonus character to color. Print it on US Letter or A4 and use deep robe colors with bright stars for a classic magical look.",
    tips: [
      ['Deep robe, bright stars', 'a dark blue or purple robe and hat make the yellow stars and moons glow.'],
      ['Glow the wand', 'keep the area around the wand star pale so the magic looks like it is shining.'],
      ['White beard', 'leave the long beard white or pale grey to keep the wizard looking wise and friendly.'],
    ],
    faqs: [
      { q: 'Is the wizard friendly or spooky?', a: 'Friendly — he has a long beard, a kindly face and a little pet owl, so the page reads as warm and storybook rather than scary.' },
      { q: 'What detail does this page include?', a: 'Plenty: a star-and-moon hat, a flowing robe with wide sleeves, a glowing wand and an owl companion, giving older children lots to color.' },
    ],
  },
  /* ---- girl ---- */
  'girl-and-her-kitten': {
    description:
      'A smiling girl in a cute dress hugging a fluffy kitten, with little hearts floating around — a warm, friendly coloring page for kids.',
    paragraph:
      "This coloring page shows a smiling young girl in a cute dress gently hugging a small fluffy kitten in her arms, her hair in two bow-tied pigtails, with little hearts floating around them. It is a sweet, relatable scene about caring for a pet, which makes it a gentle favourite with younger children. The two characters — girl and kitten — plus the dress, bows and hearts give a nice range of things to color, from big areas to small accents. The dress is a great spot for kids to design their own pattern. Print it on US Letter or A4 and color it with whatever you have on hand.",
    tips: [
      ['Design the dress', 'add stripes, dots or flowers to the dress to make the outfit unique.'],
      ['Match the bows', 'color the two hair bows the same bright color to tie the whole look together.'],
      ['Soft kitten', 'a pale grey, ginger or cream kitten with light strokes looks fluffy and soft.'],
    ],
    faqs: [
      { q: 'What makes this a good page for young kids?', a: 'It is a warm, simple scene with two friendly characters and bold lines, and the theme of hugging a pet is one little children relate to easily.' },
      { q: 'Is there room to be creative?', a: 'Yes — the plain dress is perfect for inventing your own pattern, and the kitten and bows can be any colors a child likes.' },
    ],
  },
  'girl-with-balloons': {
    description:
      'A cheerful girl in a frilly dress holding a bunch of round balloons, with stars and confetti drifting around — a happy, party-themed coloring page.',
    paragraph:
      "This coloring page shows a cheerful girl holding a bunch of round balloons on curling strings, wearing a frilly dress and little shoes, her hair tied with a ribbon, with stars and bits of confetti drifting around her. The cluster of balloons makes it a bright, celebratory page that is perfect for birthdays and parties, and each balloon is its own simple shape to fill with a different color. With big, friendly outlines it suits younger children, while the confetti and curling strings add little details for older kids. Print it on US Letter or A4 and make every balloon a different color for a really festive look.",
    tips: [
      ['Every balloon different', 'give each balloon its own color so the bunch looks like a real party.'],
      ['Confetti pops', 'scatter several bright colors across the confetti and stars to fill the background with fun.'],
      ['Tie it together', 'match the hair ribbon to one of the balloon colors for a coordinated finish.'],
    ],
    faqs: [
      { q: 'Is this a good birthday coloring page?', a: 'Yes — with a big bunch of balloons, confetti and stars, it is a cheerful, party-themed page that suits birthdays and celebrations.' },
      { q: 'Is it easy enough for young children?', a: 'It is. The balloons and figure are drawn with large, bold outlines, and each balloon is a simple shape that is easy to color in.' },
    ],
  },
  'princess-dress': {
    description:
      'A young princess in a flowing ball gown and sparkling tiara doing a curtsy — an elegant, detail-rich coloring page for dress-up fans.',
    paragraph:
      "This princess coloring page shows a young princess in a big flowing ball gown with layered ruffled skirts and a sparkling pointed tiara, holding out the sides of her dress in a happy curtsy, with a few sparkles around the hem. The layered skirt is the heart of the page — its ruffles give lots of flowing lines to color and a perfect canvas for patterns, gradients or a single rich gown color. It is a favourite with children who love fairytales and dress-up, and the tiara and sparkles add glamorous little highlights. Print it on US Letter or A4 and try blending two shades on the skirt for a satiny, royal finish.",
    tips: [
      ['Blend the gown', 'use a lighter and a darker shade of the same color on the skirt to make the fabric look smooth and satiny.'],
      ['Sparkle the tiara', 'color the tiara gold and leave tiny white gaps so the jewels look like they catch the light.'],
      ['Pattern the ruffles', 'add small dots or flowers along the skirt layers for an extra-fancy gown.'],
    ],
    faqs: [
      { q: 'Is this princess page detailed?', a: 'The layered, ruffled ball gown gives it more flowing detail than a basic figure, which makes it especially rewarding for children who like to color carefully.' },
      { q: 'How do I make the dress look fancy?', a: 'Blend two shades of one color across the skirt and add a small repeating pattern to the ruffles — that satiny, patterned look reads as a royal gown.' },
    ],
  },
  /* ---- nature ---- */
  'flower-bouquet': {
    description:
      'A full bouquet of roses, daisies and tulips tied with a ribbon bow — a varied, beginner-friendly flower coloring page for all ages.',
    paragraph:
      "This flower bouquet coloring page shows a full gathering of mixed blooms — roses, daisies and tulips with leaves — tied together with a ribbon bow. The variety of petal shapes makes it a wonderfully versatile page: every flower can be a different color, so it never gets repetitive, and it works as a relaxing page for adults as readily as a cheerful one for kids. It is also a lovely make-your-own card or gift, perfect for Mother's Day, birthdays or a get-well note. The different flower types are a gentle nature lesson too. Print it on US Letter or A4 and mix warm and cool colors for a bouquet that really pops.",
    tips: [
      ['One color per bloom', 'color each flower differently so the bouquet looks fresh and full of variety.'],
      ['Two greens for leaves', 'use a lighter and a darker green on the leaves and stems to add natural depth.'],
      ['Finish the bow', 'a bright ribbon bow in a contrasting color makes a lovely finishing touch — perfect if you are turning it into a card.'],
    ],
    faqs: [
      { q: 'Is this page suitable for adults?', a: 'Yes — the variety of flowers and petals makes it a relaxing, satisfying page for adults, while still being simple enough for children.' },
      { q: 'Can I use it as a homemade card?', a: 'Absolutely. Colored and folded or mounted on card, the bouquet makes a lovely Mother’s Day, birthday or get-well card.' },
    ],
  },
  'mountain-landscape': {
    description:
      'A peaceful landscape of layered mountains, a winding river, pine trees and a bright sun — a calming nature coloring page for all ages.',
    paragraph:
      "This mountain landscape coloring page shows a peaceful scene of layered mountains, a winding river running through a valley, pointed pine trees in the foreground, a round sun and fluffy clouds in the sky, and two small birds in the distance. The clear layers — sky, mountains, valley, trees — make it easy to plan your colors and give the page a real sense of depth. It is a calming, all-ages page that works nicely for relaxed adult coloring as well as for children, and a gentle prompt for talking about nature, rivers and the outdoors. Print it on US Letter or A4 and use cooler colors in the far mountains to make them feel distant.",
    tips: [
      ['Fade the distance', 'color the far mountains in paler, cooler blues and the near pines in stronger greens so the scene looks deep.'],
      ['Wind the river', 'a light blue river with a few darker ripples draws the eye through the valley.'],
      ['Warm the sky', 'a soft yellow sun and pale sky keep the whole landscape feeling calm and sunny.'],
    ],
    faqs: [
      { q: 'Does this page show depth and perspective?', a: 'Yes — the layered mountains, valley and foreground trees create natural depth, which makes it a great page for practising near-and-far shading.' },
      { q: 'Is it a relaxing page to color?', a: 'Very. The calm, open landscape and clear layers make it a soothing choice for both children and adults.' },
    ],
  },
  'tree-with-birds': {
    description:
      'A big leafy tree with perched and flying birds, a little nest and flowers at the base — a friendly nature coloring page for kids and adults.',
    paragraph:
      "This tree coloring page shows a big leafy tree with a sturdy trunk and a rounded, cloud-like canopy, a couple of small birds perched on the branches and one in flight, a little round nest, and grass with a few flowers at the base of the trunk. It is a warm, friendly nature scene with a nice balance of big areas (the canopy and trunk) and small details (the birds, the nest, the flowers), so it suits a wide range of ages. It is also a gentle springtime page and a good starting point for talking about trees, birds and nests. Print it on US Letter or A4 and add texture to the bark and leaves for a lifelike finish.",
    tips: [
      ['Texture the canopy', 'add small leaf marks or two shades of green so the treetop looks full and leafy rather than flat.'],
      ['Bark lines', 'a few brown strokes down the trunk suggest rough, natural bark.'],
      ['Color the birds', 'give the little birds bright feathers — red, blue or yellow — so they stand out against the green leaves.'],
    ],
    faqs: [
      { q: 'Is this a good spring coloring page?', a: 'Yes — the leafy tree, nesting birds and flowers at the base give it a fresh, springtime feel that ties in nicely with nature themes.' },
      { q: 'Does it suit different ages?', a: 'It does. The large canopy and trunk are easy for younger children, while the birds, nest and flowers give older colorists finer details to enjoy.' },
    ],
  },
};

function toSeoDetails(e: Entry) {
  return {
    paragraph: e.paragraph,
    printableTipsTitle: 'Coloring Tips',
    printableTips: e.tips.map(([lead, rest]) => ({
      segments: [
        { text: `${lead} — `, bold: true },
        { text: rest },
      ],
    })),
    faqs: e.faqs.map((f, i) => ({ id: i + 1, question: f.q, answer: f.a })),
  };
}

const DRY = process.argv.includes('--dry-run');
const CP_DIR = path.join(process.cwd(), 'content', 'coloring-pages');

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    if (e.name.endsWith('.mdx') && e.name !== '_category.mdx') return [full];
    return [];
  });
}

const files = walk(CP_DIR);
const seen = new Set<string>();
let written = 0;

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = matter(raw);
  const slug = (parsed.data.slug as string) ?? path.basename(file, '.mdx');
  const entry = CONTENT[slug];
  if (!entry) {
    console.warn(`• no copy for "${slug}" — skipped (${path.relative(process.cwd(), file)})`);
    continue;
  }
  seen.add(slug);

  const nextData = {
    ...parsed.data,
    description: entry.description,
    seoDetails: toSeoDetails(entry),
  };

  // Re-validate the merged frontmatter before writing.
  const check = coloringPageSchema.safeParse({ ...nextData, slug });
  if (!check.success) {
    console.error(`✗ ${slug} fails schema:`, check.error.flatten().fieldErrors);
    process.exitCode = 1;
    continue;
  }

  const out = matter.stringify(parsed.content, nextData);
  if (DRY) {
    console.log(`\n===== ${slug} =====\n${out}`);
  } else {
    fs.writeFileSync(file, out);
  }
  written++;
  console.log(`✓ ${slug}`);
}

const missing = Object.keys(CONTENT).filter((s) => !seen.has(s));
if (missing.length) {
  console.error(`\n✗ ${missing.length} copy entries had no matching leaf file:`, missing);
  process.exitCode = 1;
}
console.log(`\n${DRY ? 'Would write' : 'Wrote'} ${written} leaf page(s).`);
