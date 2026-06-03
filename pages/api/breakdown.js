function buildPrompt(task, energy, timeAvailable) {
  return `You are a productivity assistant helping someone who is overwhelmed and needs small, achievable steps.

Break this task into 4-6 micro-steps: "${task}"

Context:
- Current energy level: ${energy}
- Time available: ${timeAvailable}

Rules:
- Each step description must be maximum 60 characters. Be very concise.
- Each step must be tiny and immediately actionable
- Steps should be ordered from smallest to largest effort
- For each step also provide an even smaller "too hard" fallback version
- Match step duration to energy: low energy = 2-10 min, medium = 10-20 min, high = 20+ min
- For physical or practical tasks (fixing, building, cleaning, cooking), the first step must identify any tools or materials needed before starting, e.g. 'Get a screwdriver and a cloth — that's all you need.'
- At medium energy, steps should represent real visible progress (15-25 min each). At high energy, steps should be substantial and move the task meaningfully forward (20-40 min each). Never give the same step sizes regardless of energy level.

Respond ONLY with a JSON array, no markdown, no explanation:
[
  {
    "text": "The micro-step description",
    "tags": ["tiny step", "no prep needed"],
    "mins": 5,
    "energy": "low",
    "tooHard": "An even smaller version of this step"
  }
]`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured" });
  }

  const { task, energy, timeAvailable, prompt: clientPrompt } = req.body || {};
  if (!task || !energy || !timeAvailable) {
    return res.status(400).json({ error: "task, energy, and timeAvailable are required" });
  }

  const prompt = clientPrompt || buildPrompt(task, energy, timeAvailable);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ error: "Anthropic API request failed", detail });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text?.trim();
    if (!text) {
      return res.status(502).json({ error: "Empty response from Anthropic" });
    }

    let jsonText = text;
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) jsonText = fenced[1].trim();

    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) {
      return res.status(502).json({ error: "AI response was not a JSON array" });
    }
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(502).json({ error: err.message || "Failed to parse AI response" });
  }
}
