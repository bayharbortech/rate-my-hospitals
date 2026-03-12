import Anthropic from '@anthropic-ai/sdk';
import { requireAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { BLOG_CATEGORIES } from '@/lib/constants';
import { parseBody } from '@/lib/api-utils';
import { blogGenerateApiSchema, generatedBlogPostSchema } from '@/lib/schemas';
import { getServerEnv } from '@/lib/env';

const SYSTEM_PROMPT = `You are a professional blog writer for a healthcare nursing platform called "The Nursing Station." Write in a friendly but professional tone. Your audience is registered nurses, travel nurses, CNAs, and nursing students.

Generate a blog post about the given topic. Return ONLY valid JSON (no markdown fences, no extra text) with these fields:

- "title": A compelling blog post title (not the same as the topic — make it engaging)
- "summary": A 1-2 sentence summary for the blog listing page
- "category": Exactly one of these values: ${BLOG_CATEGORIES.join(', ')}
- "tags": An array of 2-4 short tag strings. The first tag MUST be the topic name. Additional tags should be relevant keywords.
- "content": The full blog post as HTML. Write exactly 5 paragraphs. Use <h2> for the main heading, <h3> for subheadings if appropriate, <p> for paragraphs, <strong> for emphasis, and <em> for italics. Make the content informative, actionable, and relevant to nursing professionals. Do NOT include the title in the content — it will be rendered separately.

Example JSON structure:
{
  "title": "Finding Harmony: A Nurse's Guide to Work-Life Balance",
  "summary": "Practical strategies for nurses to maintain healthy boundaries between work and personal life.",
  "category": "Wellness",
  "tags": ["Work/Life Balance", "Self-Care", "Nursing"],
  "content": "<h2>Why Balance Matters</h2><p>...</p><p>...</p><h2>Practical Tips</h2><p>...</p><p>...</p><p>...</p>"
}`;

function extractJSON(text: string): string {
    const trimmed = text.trim();
    const fenceMatch = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
    if (fenceMatch) {
        return fenceMatch[1].trim();
    }
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return trimmed;
    }
    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objectMatch) {
        return objectMatch[0];
    }
    return trimmed;
}

export async function POST(request: NextRequest) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const parsed = await parseBody(request, blogGenerateApiSchema);
    if ('error' in parsed) return parsed.error;
    const body = parsed.data;

    let serverEnv;
    try {
        serverEnv = getServerEnv();
    } catch {
        return NextResponse.json(
            { error: 'Anthropic API key is not configured' },
            { status: 500 }
        );
    }

    const anthropic = new Anthropic({
        apiKey: serverEnv.ANTHROPIC_API_KEY,
        timeout: 60000,
    });

    let userMessage = `Topic: "${body.topicTitle.trim()}"`;
    if (body.topicDescription?.trim()) {
        userMessage += `\n\nDetails: ${body.topicDescription.trim()}`;
    }

    try {
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessage }],
        });

        const rawText = message.content[0].type === 'text' ? message.content[0].text : '';
        const jsonText = extractJSON(rawText);

        let rawResult: unknown;
        try {
            rawResult = JSON.parse(jsonText);
        } catch {
            return NextResponse.json(
                { error: 'AI returned invalid JSON. Please try again.' },
                { status: 500 }
            );
        }

        const validation = generatedBlogPostSchema.safeParse(rawResult);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'AI response missing required fields. Please try again.' },
                { status: 500 }
            );
        }

        const result = validation.data;

        if (!BLOG_CATEGORIES.includes(result.category as typeof BLOG_CATEGORIES[number])) {
            result.category = 'Tips';
        }

        if (result.tags.length === 0) {
            result.tags = [body.topicTitle.trim()];
        }

        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json(
            { error: `Blog generation failed: ${message}` },
            { status: 500 }
        );
    }
}
