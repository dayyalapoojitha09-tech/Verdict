import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv(".env")
key = os.environ.get("GROK_API_KEY") or os.environ.get("GROQ_API_KEY")

url = "https://api.groq.com/openai/v1/models"
req = urllib.request.Request(url, headers={
    "Authorization": f"Bearer {key}",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
})
try:
    with urllib.request.urlopen(req) as res:
        print(json.dumps(json.loads(res.read().decode()), indent=2))
except Exception as e:
    if hasattr(e, "read"):
        print("Error details:", e.read().decode())
    else:
        print("Error:", e)
