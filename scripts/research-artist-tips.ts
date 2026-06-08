/**
 * Ground a drawing tutorial in REAL, attributable artist advice using the
 * Perplexity API (returns native citations). Given a subject, returns verified
 * tips and short direct quotes from named, recognized artists/educators, each
 * with a source URL — so the writer never invents a quote.
 *
 *   npm run research -- "how to draw a rose"
 *   npm run research -- "drawing for beginners" --json
 *
 * Output: a Grounding block (markdown) plus raw citations. Costs Perplexity API.
 */

import fs from 'node:fs';
import path from 'node:path';

process.loadEnvFile?.('.env');

const KEY = process.env.PERPLEXITY_API_KEY;
if (!KEY) throw new Error('Missing PERPLEXITY_API_KEY in .env');

const subject = process.argv.slice(2).filter((a) => !a.startsWith('--')).join(' ').trim();
const asJson = process.argv.includes('--json');
const save = process.argv.includes('--save');
if (!subject) throw new Error('Usage: npm run research -- "<subject>" [--json] [--save]');

const prompt = `I am writing a beginner-friendly "how to draw" tutorial about: ${subject}.

Find GENUINE, verifiable drawing advice from named, recognized artists, art educators, or reputable art-instruction sources (museums, established drawing books, art schools, art-supply makers). I specifically need:

1. 2-3 concrete technique tips that real instructors actually teach for this subject or for beginner drawing (e.g. "start with light construction shapes before committing").
2. 1-2 SHORT direct quotes (under 25 words each) from a NAMED real artist or art educator about drawing, observation, or practice. Give the EXACT wording, the person's full name, who they are, and the source.
3. One common beginner mistake an instructor warns about.

For EVERY tip and quote, give the source name and URL. Do NOT invent quotes or attribute words to anyone unless they are real and verifiable. If you are not sure a quote is real, omit it. Prefer well-documented quotes.

Format as a short list. Be concise.`;

async function main() {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content:
            'You are a meticulous art-history and drawing-instruction researcher. You never fabricate quotes or attributions. Every claim has a source. If a famous quote is commonly misattributed, you say so.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    throw new Error(`Perplexity ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
    citations?: string[];
    search_results?: Array<{ title: string; url: string }>;
  };

  const content = data.choices?.[0]?.message?.content ?? '';
  const citations = data.citations ?? data.search_results?.map((s) => s.url) ?? [];

  if (asJson) {
    console.log(JSON.stringify({ subject, content, citations }, null, 2));
  } else {
    console.log(`\n=== GROUNDING: ${subject} ===\n`);
    console.log(content);
    console.log('\n--- citations ---');
    citations.forEach((c, i) => console.log(`[${i + 1}] ${c}`));
  }

  if (save) {
    const dir = path.join(process.cwd(), 'scripts', 'research');
    fs.mkdirSync(dir, { recursive: true });
    const slug = subject.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    fs.writeFileSync(path.join(dir, `${slug}.json`), JSON.stringify({ subject, content, citations }, null, 2));
    console.log(`\nsaved → scripts/research/${slug}.json`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
