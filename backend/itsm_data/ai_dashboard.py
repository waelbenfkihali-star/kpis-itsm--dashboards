import json
import os
from urllib import request as urllib_request


AI_INTENT_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "compare": {
            "type": "boolean",
        },
        "module": {
            "anyOf": [
                {
                    "type": "string",
                    "enum": ["incidents", "requests", "changes"],
                },
                {"type": "null"},
            ],
        },
        "modules": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": ["incidents", "requests", "changes"],
            },
        },
        "grouping": {
            "type": "string",
            "enum": ["service", "group", "month", "priority", "state", "site", "item", "type", "user"],
        },
        "groupings": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": ["service", "group", "month", "priority", "state", "site", "item", "type", "user"],
            },
        },
        "secondary_grouping": {
            "anyOf": [
                {
                    "type": "string",
                    "enum": ["service", "group", "month", "priority", "state", "site", "item", "type", "user"],
                },
                {"type": "null"},
            ],
        },
        "state": {
            "type": "string",
            "enum": ["all", "open", "closed"],
        },
        "metric": {
            "type": "string",
            "enum": ["count", "major", "sla", "emergency", "pastDue"],
        },
        "year": {
            "anyOf": [
                {"type": "integer"},
                {"type": "null"},
            ],
        },
        "year_range": {
            "anyOf": [
                {
                    "type": "array",
                    "items": {"type": "integer"},
                    "minItems": 2,
                    "maxItems": 2,
                },
                {"type": "null"},
            ],
        },
        "quarter": {
            "anyOf": [
                {"type": "integer", "minimum": 1, "maximum": 4},
                {"type": "null"},
            ],
        },
        "top_n": {
            "anyOf": [
                {"type": "integer", "minimum": 1, "maximum": 20},
                {"type": "null"},
            ],
        },
        "chart_type": {
            "type": "string",
            "enum": ["bar", "line", "pie"],
        },
        "title": {"type": "string"},
        "answer": {"type": "string"},
        "summary": {
            "type": "array",
            "items": {"type": "string"},
        },
    },
    "required": [
        "compare",
        "module",
        "modules",
        "grouping",
        "groupings",
        "secondary_grouping",
        "state",
        "metric",
        "year",
        "year_range",
        "quarter",
        "top_n",
        "chart_type",
        "title",
        "answer",
        "summary",
    ],
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
        "The user may write in English, French, Arabic transliteration, or a mixed sentence. "
        "Infer the closest dashboard intent from incidents, requests, and changes. "
        "Use compare=true when the user clearly compares multiple modules. "
        "Set module to null only for comparisons; otherwise choose the closest single module. "
        "Use groupings to capture one or two requested dimensions in order of importance. "
        "Prefer 'month' for trends over time, 'service' or 'group' for operational breakdowns, and 'bar' for categorical charts. "
        "Use metric=count unless the user explicitly asks for major incidents, SLA breaches, emergency changes, or past-due changes. "
        "Keep title, answer, and summary grounded in the requested dashboard intent only. "
        "Never invent data values."
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
