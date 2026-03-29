import json
import os
from urllib import request as urllib_request


AI_INTENT_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "module": {
            "type": "string",
            "enum": ["incidents", "requests", "changes"],
        },
        "grouping": {
            "type": "string",
            "enum": ["service", "group", "month", "priority", "state", "site", "item", "type", "user"],
        },
        "state": {
            "type": "string",
            "enum": ["all", "open", "closed"],
        },
        "year": {
            "anyOf": [
                {"type": "integer"},
                {"type": "null"},
            ],
        },
        "chart_type": {
            "type": "string",
            "enum": ["bar", "line"],
        },
        "title": {"type": "string"},
        "answer": {"type": "string"},
        "summary": {
            "type": "array",
            "items": {"type": "string"},
        },
    },
    "required": ["module", "grouping", "state", "year", "chart_type", "title", "answer", "summary"],
}


def extract_response_text(payload):
    if isinstance(payload.get("output_text"), str) and payload["output_text"].strip():
        return payload["output_text"]

    for item in payload.get("output", []):
        for content in item.get("content", []):
            text = content.get("text")
            if isinstance(text, str) and text.strip():
                return text
    return ""


def build_ai_dashboard_intent(prompt):
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured on the backend.")

    model = os.getenv("OPENAI_DASHBOARD_MODEL", "gpt-5")

    developer_prompt = (
        "Convert the user's ITSM dashboard request into a strict JSON intent. "
        "The user may write in English or French. "
        "Infer the closest module, grouping, state scope, year, and chart type. "
        "Prefer 'month' for trends over time, 'service' or 'group' for breakdowns, and 'bar' for categorical charts. "
        "The answer and summary must stay grounded in the requested intent only, not invented data."
    )

    body = {
        "model": model,
        "messages": [
            {"role": "developer", "content": developer_prompt},
            {"role": "user", "content": prompt},
        ],
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "dashboard_intent",
                "strict": True,
                "schema": AI_INTENT_SCHEMA,
            },
        },
    }

    req = urllib_request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )

    with urllib_request.urlopen(req, timeout=45) as response:
        payload = json.loads(response.read().decode("utf-8"))

    content = payload["choices"][0]["message"].get("content", "")
    if not content:
        content = extract_response_text(payload)
    if not content:
        raise RuntimeError("The AI service did not return structured dashboard content.")

    return json.loads(content)
