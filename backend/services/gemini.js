const fetch = require('node-fetch');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Analyzes a contact message using Gemini 1.5 Flash.
 * Returns score, priority, tags, summary, insights, and reply suggestion.
 */
async function analyzeWithGemini(entry) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('⚠️  No Gemini API key set. Using mock analysis.');
    return mockAnalysis(entry);
  }

  const prompt = `You are an AI assistant helping a software developer/portfolio owner analyze incoming contact messages.

Analyze this contact message and return a JSON object with the following fields:
- score: integer 0-100 (how valuable/interesting this contact is for career/projects/opportunities)
- priority: "high" | "normal" | "low"
- tags: array of strings (e.g. ["job offer", "freelance", "collaboration", "recruiter", "spam", "mentorship", "open source"])
- summary: 1-2 sentence summary of what this person wants
- insights: array of 2-3 strings with useful insights about this message (e.g. opportunity type, red flags, action items)
- replyHint: a 1-sentence hint on how to reply
- sentiment: "positive" | "neutral" | "negative"

Scoring guide:
- 80-100: Exceptional (strong job offer, meaningful collaboration, notable company, technical mentorship)
- 60-79: Good (freelance project, interesting collaboration, genuine networking)
- 40-59: Normal (general inquiry, students, bloggers)
- 20-39: Low value (vague asks, unsolicited services)
- 0-19: Spam or irrelevant

Message details:
Name: ${entry.name}
Email: ${entry.email}
Company: ${entry.company || 'Not provided'}
Subject: ${entry.subject}
Message: ${entry.message}

Return ONLY valid JSON, no markdown, no explanation.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return {
      score: Math.min(100, Math.max(0, parseInt(parsed.score) || 50)),
      priority: ['high', 'normal', 'low'].includes(parsed.priority) ? parsed.priority : 'normal',
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6) : [],
      summary: parsed.summary || '',
      insights: Array.isArray(parsed.insights) ? parsed.insights.slice(0, 3) : [],
      replyHint: parsed.replyHint || '',
      sentiment: parsed.sentiment || 'neutral',
      analyzedAt: new Date().toISOString(),
      model: 'gemini-1.5-flash'
    };

  } catch (err) {
    console.error('Gemini error:', err.message);
    return mockAnalysis(entry);
  }
}

function mockAnalysis(entry) {
  const text = (entry.message + ' ' + entry.subject).toLowerCase();
  let score = 50;
  const tags = [];

  if (text.includes('job') || text.includes('position') || text.includes('offer')) { score += 25; tags.push('job offer'); }
  if (text.includes('hire') || text.includes('recruit')) { score += 20; tags.push('recruiter'); }
  if (text.includes('freelance') || text.includes('contract')) { score += 15; tags.push('freelance'); }
  if (text.includes('collaborat') || text.includes('partner')) { score += 10; tags.push('collaboration'); }
  if (text.includes('spam') || text.includes('cheap') || text.includes('seo')) { score -= 30; tags.push('spam'); }

  score = Math.min(100, Math.max(0, score));
  const priority = score >= 70 ? 'high' : score >= 40 ? 'normal' : 'low';

  return {
    score,
    priority,
    tags: tags.length ? tags : ['general inquiry'],
    summary: `${entry.name} reached out about: ${entry.subject}`,
    insights: [
      'Gemini API key not configured — using keyword-based analysis',
      `Score based on keyword detection: ${score}/100`,
      'Add GEMINI_API_KEY to .env for AI-powered insights'
    ],
    replyHint: 'Review this message and respond personally.',
    sentiment: 'neutral',
    analyzedAt: new Date().toISOString(),
    model: 'mock'
  };
}

module.exports = { analyzeWithGemini };
