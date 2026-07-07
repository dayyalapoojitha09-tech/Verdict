import os
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(dotenv_path)

grok_api_key = os.environ.get("GROK_API_KEY") or os.environ.get("GROQ_API_KEY")

if not grok_api_key:
    print("Warning: GROK_API_KEY / GROQ_API_KEY not found in environment.")

MODEL_NAME = "llama-3.3-70b-versatile"

def call_grok_api(system_instruction: str, user_message: str, response_json: bool = False) -> str:
    # Hot-reload environment variables to capture newly added keys
    load_dotenv(dotenv_path)
    active_key = os.environ.get("GROK_API_KEY") or os.environ.get("GROQ_API_KEY")

    if not active_key:
        raise RuntimeError("Groq API key is missing. Please add GROK_API_KEY to your .env file.")
        
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {active_key}",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.2
    }
    if response_json:
        payload["response_format"] = {"type": "json_object"}

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            return res_data["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        raise RuntimeError(f"API error: {e.code} - {err_msg}")
    except Exception as e:
        raise RuntimeError(f"Failed to communicate with API: {str(e)}")

def run_prosecutor(title: str, description: str, evidence_notes: str) -> str:
    system_instruction = (
        "You are a prosecuting AI analyst arguing that this security/fraud alert is a genuine threat. "
        "Give a confident, specific 2-3 sentence argument citing the evidence provided. "
        "Use a serious courtroom tone. Do not mention counter-evidence you haven't been given."
    )
    user_message = (
        f"Case: {title}\n"
        f"Description: {description}\n"
        f"Evidence Notes: {evidence_notes}"
    )
    return call_grok_api(system_instruction, user_message).strip()

def run_defense(title: str, description: str, evidence_notes: str, counter_evidence_notes: str, prosecutor_argument: str) -> str:
    system_instruction = (
        "You are a defense AI analyst arguing that this alert is a false positive. "
        "Directly rebut the specific argument just made by the prosecution — reference what they said — "
        "and cite the counter-evidence provided. 2-3 sentences, serious courtroom tone."
    )
    user_message = (
        f"Case: {title}\n"
        f"Description: {description}\n"
        f"Evidence Notes: {evidence_notes}\n"
        f"Counter-Evidence Notes: {counter_evidence_notes}\n"
        f"Prosecution's Argument: {prosecutor_argument}"
    )
    return call_grok_api(system_instruction, user_message).strip()

def run_judge(title: str, description: str, prosecutor_argument: str, defense_argument: str) -> dict:
    system_instruction = (
        "You are a neutral judge AI. Weigh both arguments and respond with ONLY a valid JSON object, "
        "no other text, no markdown code fences, in this exact format: "
        '{"verdict": "Malicious" or "False Positive", "confidence": <integer 0-100>, "recommended_action": "<short string>"}. '
        "Base the confidence score on how strong the evidence is on each side — do not default to 50 or round numbers, "
        "make a genuine judgment based on the arguments given."
    )
    user_message = (
        f"Case: {title}\n"
        f"Description: {description}\n"
        f"Prosecution's Argument: {prosecutor_argument}\n"
        f"Defense's Argument: {defense_argument}"
    )
    
    raw_text = call_grok_api(system_instruction, user_message, response_json=True).strip()
    
    try:
        verdict_data = json.loads(raw_text)
        # Standardize verdict exactly to "Malicious" or "False Positive"
        verdict_str = str(verdict_data.get("verdict", "")).strip()
        if "malicious" in verdict_str.lower():
            verdict_data["verdict"] = "Malicious"
        else:
            verdict_data["verdict"] = "False Positive"
            
        verdict_data["confidence"] = int(verdict_data.get("confidence", 50))
        return verdict_data
    except Exception as e:
        print(f"Error parsing structured judge output: {e}. Raw text was:\n{raw_text}")
        # Fallback parsing in case of bad formatting
        verdict = "False Positive"
        if "malicious" in raw_text.lower():
            verdict = "Malicious"
        return {
            "verdict": verdict,
            "confidence": 50,
            "recommended_action": "Isolate and inspect"
        }
