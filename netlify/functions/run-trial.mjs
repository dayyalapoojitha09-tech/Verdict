import Groq from "groq-sdk";

const MODEL_NAME = "llama-3.3-70b-versatile";

async function callGroq(apiKey, systemInstruction, userMessage, responseJson = false) {
  const client = new Groq({ apiKey });
  const kwargs = {
    model: MODEL_NAME,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: userMessage },
    ],
    temperature: 0.2,
  };
  if (responseJson) {
    kwargs.response_format = { type: "json_object" };
  }
  const completion = await client.chat.completions.create(kwargs);
  return completion.choices[0].message.content;
}

export default async (req, context) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = Netlify.env.get("GROQ_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY is not configured. Add it in Netlify Environment Variables." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { title, description, evidence_notes, counter_evidence_notes } = body;

  if (!title || !description) {
    return new Response(JSON.stringify({ error: "title and description are required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const evidenceNotes = evidence_notes || "No evidence provided.";
  const counterEvidenceNotes = counter_evidence_notes || "No counter-evidence provided.";

  try {
    // Step 1: Prosecutor
    const prosecutorArgument = (await callGroq(
      apiKey,
      "You are a prosecuting AI analyst arguing that this security/fraud alert is a genuine threat. " +
      "Give a confident, specific 2-3 sentence argument citing the evidence provided. " +
      "Use a serious courtroom tone. Do not mention counter-evidence you haven't been given.",
      `Case: ${title}\nDescription: ${description}\nEvidence Notes: ${evidenceNotes}`
    )).trim();

    // Step 2: Defense (receives prosecutor's argument)
    const defenseArgument = (await callGroq(
      apiKey,
      "You are a defense AI analyst arguing that this alert is a false positive. " +
      "Directly rebut the specific argument just made by the prosecution — reference what they said — " +
      "and cite the counter-evidence provided. 2-3 sentences, serious courtroom tone.",
      `Case: ${title}\nDescription: ${description}\nEvidence Notes: ${evidenceNotes}\n` +
      `Counter-Evidence Notes: ${counterEvidenceNotes}\nProsecution's Argument: ${prosecutorArgument}`
    )).trim();

    // Step 3: Judge (receives both arguments)
    const rawJudge = (await callGroq(
      apiKey,
      "You are a neutral judge AI. Weigh both arguments and respond with ONLY a valid JSON object, " +
      "no other text, no markdown code fences, in this exact format: " +
      '{"verdict": "Malicious" or "False Positive", "confidence": <integer 0-100>, "recommended_action": "<short string>"}. ' +
      "Base the confidence score on how strong the evidence is on each side — do not default to 50 or round numbers, " +
      "make a genuine judgment based on the arguments given.",
      `Case: ${title}\nDescription: ${description}\n` +
      `Prosecution's Argument: ${prosecutorArgument}\nDefense's Argument: ${defenseArgument}`,
      true
    )).trim();

    let judgeResult;
    try {
      judgeResult = JSON.parse(rawJudge);
      judgeResult.verdict = String(judgeResult.verdict || "").toLowerCase().includes("malicious")
        ? "Malicious" : "False Positive";
      judgeResult.confidence = parseInt(judgeResult.confidence, 10) || 50;
    } catch {
      judgeResult = {
        verdict: rawJudge.toLowerCase().includes("malicious") ? "Malicious" : "False Positive",
        confidence: 50,
        recommended_action: "Isolate and inspect",
      };
    }

    return new Response(JSON.stringify({
      prosecutor_argument: prosecutorArgument,
      defense_argument: defenseArgument,
      judge_verdict: judgeResult.verdict,
      confidence_score: judgeResult.confidence,
      recommended_action: judgeResult.recommended_action,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("AI pipeline error:", err);
    return new Response(JSON.stringify({ error: `AI reasoning pipeline failed: ${err.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/run-trial",
};
