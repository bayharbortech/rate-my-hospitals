import { formatISO } from 'date-fns';
import Anthropic from '@anthropic-ai/sdk';
import { SupabaseClient } from '@supabase/supabase-js';
import { AIReviewResult } from '@/lib/types';

/**
 * Extract JSON from a response that may be wrapped in markdown code fences.
 * Handles ```json ... ```, ``` ... ```, or plain JSON.
 */
function extractJSON(text: string): string {
    const trimmed = text.trim();

    // Match ```json ... ``` or ``` ... ``` (with optional language tag)
    const fenceMatch = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
    if (fenceMatch) {
        return fenceMatch[1].trim();
    }

    // If it starts with { and ends with }, assume raw JSON
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return trimmed;
    }

    // Try to find JSON object embedded in other text
    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objectMatch) {
        return objectMatch[0];
    }

    return trimmed;
}

const SYSTEM_PROMPT = `You are a legal compliance reviewer for a healthcare workplace review platform called "RateMyHospital." Nurses anonymously review hospitals and healthcare facilities. Your job is to analyze each review for legal and compliance risks before it is published.

CRITICAL: You must review BOTH the review title AND the review text. The title is publicly visible and equally subject to all compliance rules. Flag issues in the title separately from issues in the review text.

Evaluate BOTH the title and the review text against these criteria:

1. **Defamation/Slander Risk**: Flag specific factual claims about named individuals that could be considered defamatory. This includes:
   - Naming specific doctors, nurses, managers, or staff members by name, initials, or identifiable description
   - Making negative factual claims about identifiable individuals (e.g. "Dr. Smith is incompetent")
   - This applies to BOTH the title and body — a title like "Dr. Johnson is terrible" is defamatory
   - Opinions about the facility as a whole are protected; claims about specific people are not

2. **HIPAA Violations**: Flag any content that could identify specific patients, including:
   - Patient names, initials, or identifying details
   - Specific medical conditions tied to identifiable patients
   - Dates of treatment combined with other identifying info
   - Room numbers or other location data that could identify patients

3. **Platform Liability**: Flag content that could expose the platform to legal action:
   - Threats of violence or harm
   - Accusations of criminal activity without evidence
   - Content that could be construed as harassment or discrimination
   - Trade secrets or confidential business information

4. **Professionalism**: Flag content that undermines the platform's credibility:
   - Excessive profanity or vulgar language (in title OR body)
   - Personal attacks on identifiable individuals
   - Clearly fabricated or impossible claims

For each issue found, the "excerpt" field MUST contain the exact problematic text. If the issue is in the title, quote the title text. If in the body, quote the body text.

Return your analysis as JSON with this exact structure:
{
  "risk_level": "low" | "medium" | "high",
  "recommendation": "approve" | "revise" | "reject",
  "summary": "Brief 1-2 sentence overall assessment",
  "issues": [
    {
      "type": "defamation" | "hipaa" | "liability" | "professionalism" | "other",
      "severity": "low" | "medium" | "high",
      "excerpt": "the exact problematic text from the title or review",
      "explanation": "why this is problematic and what should change"
    }
  ],
  "revised_title": "the review title, modified to fix all flagged issues or kept as-is if clean",
  "revised_text": "the full review text rewritten to address all flagged issues while preserving the reviewer's voice and sentiment"
}

If the review has no issues, return risk_level "low", recommendation "approve", an empty issues array, and the original title and text unchanged.

IMPORTANT: Always return valid JSON only. No markdown, no explanation outside the JSON.`;

/**
 * Run AI compliance review on a review and save the result.
 * Returns the AI result, or null if AI is unavailable or fails.
 */
export async function runAIReview(
    reviewId: string,
    supabase: SupabaseClient
): Promise<AIReviewResult | null> {
    // Set ANTHROPIC_API_KEY in .env.local (local) or Vercel Environment Variables (production)
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY is not configured. Add it to Vercel environment variables and redeploy.');
    }

    // Fetch the review with employer name
    const { data: review, error: fetchError } = await supabase
        .from('reviews')
        .select('*, employer:employers(name)')
        .eq('id', reviewId)
        .single();

    if (fetchError || !review) {
        throw new Error(`Review not found: ${fetchError?.message || 'unknown error'}`);
    }

    const employerName = review.employer?.name || 'Unknown Facility';

    const userMessage = `Please review the following workplace review submission:

**Facility:** ${employerName}
**Review Title:** ${review.title}
**Department:** ${review.department || 'Not specified'}
**Position:** ${review.position_type || 'Not specified'}

**Review Text:**
${review.review_text}

**Ratings:** Overall: ${review.rating_overall}/5, Staffing: ${review.rating_staffing}/5, Safety: ${review.rating_safety}/5, Culture: ${review.rating_culture}/5, Management: ${review.rating_management}/5, Pay: ${review.rating_pay_benefits}/5`;

    try {
        const anthropic = new Anthropic({
            apiKey,
            timeout: 30000, // 30 second timeout
        });

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessage }],
        });

        const rawText = message.content[0].type === 'text' ? message.content[0].text : '';

        // Claude sometimes wraps JSON in markdown code fences — strip them
        const jsonText = extractJSON(rawText);

        let aiResult: AIReviewResult;
        try {
            aiResult = JSON.parse(jsonText);
        } catch {
            console.error('AI returned invalid JSON. Raw response:', rawText);
            throw new Error('AI returned invalid JSON response');
        }

        // Save the result on the review
        const { error: updateError } = await supabase
            .from('reviews')
            .update({
                ai_review_result: aiResult,
                updated_at: formatISO(new Date()),
            })
            .eq('id', reviewId);

        if (updateError) {
            console.error('Failed to save AI result:', updateError);
            throw new Error(`Failed to save AI result: ${updateError.message}`);
        }

        return aiResult;
    } catch (err) {
        console.error('AI review failed:', err);
        throw err;
    }
}
