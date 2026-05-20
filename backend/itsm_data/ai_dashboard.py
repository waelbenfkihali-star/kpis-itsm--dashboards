import json
import os
from urllib import request as urllib_request

MODULES = ["incidents", "requests", "changes"]
GROUPING_VALUES = [
    "service",
    "group",
    "month",
    "priority",
    "state",
    "site",
    "item",
    "type",
    "user",
    "division",
    "owner",
    "classification",
    "ci",
]
FILTER_FIELDS = [
    "service",
    "group",
    "site",
    "division",
    "owner",
    "classification",
    "ci",
    "item",
    "type",
    "user",
    "priority",
    "state",
]


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
                    "enum": MODULES,
                },
                {"type": "null"},
            ],
        },
        "modules": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": MODULES,
            },
        },
        "grouping": {
            "type": "string",
            "enum": GROUPING_VALUES,
        },
        "groupings": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": GROUPING_VALUES,
            },
        },
        "secondary_grouping": {
            "anyOf": [
                {
                    "type": "string",
                    "enum": GROUPING_VALUES,
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
        "filters": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "field": {
                        "type": "string",
                        "enum": FILTER_FIELDS,
                    },
                    "value": {"type": "string"},
                    "label": {"type": "string"},
                },
                "required": ["field", "value", "label"],
            },
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
        "filters",
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


def compact_json(value):
    return json.dumps(value, ensure_ascii=True, separators=(",", ":"))


def build_developer_prompt(data_context=None, hint_intent=None):
    context_text = compact_json(data_context or {})
    hint_text = compact_json(hint_intent or {})
    return (
        "Convert the user's ITSM dashboard request into a strict JSON intent. "
        "The user may write in English, French, Arabic transliteration, or a mixed sentence. "
        "The user may also write Tunisian darija in Latin letters such as warini, 3tini, 9aren, ch7al, kifech, maftou7, msakker, 3la, mta3, ib, service, groupe, priorite, akther, and par mois. "
        "Typical business words include incidents, requests, changes, backlog, SLA, service, group, priority, state, month, compare, trend, dashboard, owner, division, IB, CI, and KPI. "
        "Interpret short and messy user phrasing generously, but stay faithful to the requested business meaning. "
        "The assistant must understand these supported request families: global overview, monthly trend, service breakdown, group breakdown, priority breakdown, state breakdown, KPI overview, backlog analysis, SLA breaches, major incidents, emergency changes, overdue changes, module comparisons, and filtered dashboards by service, division, group, owner, item, type, user, site, or year. "
        "The assistant should map user intent to the closest valid dashboard supported by the app, even if the wording is informal, abbreviated, or mixed between languages. "
        "Use the provided data context to match real field values whenever the user mentions a service, group, division, owner, item, type, user, site, priority, state, or CI. "
        "If the user says IB, treat it as division. "
        "If the user says service owner, owner, managed by, or responsible owner, treat it as owner. "
        "If the user says CI, configuration item, asset, or server, treat it as ci. "
        "If the user uses Tunisian wording such as warini, 3tini, n7eb, 9aren, ch7al, kifech, akther, a9al, maftou7, or msakker, interpret the business meaning rather than the literal wording. "
        "Infer the closest dashboard intent from incidents, requests, and changes. "
        "Use compare=true only when the user clearly compares multiple modules. "
        "Set module to null only for comparisons; otherwise choose the closest single module. "
        "Use groupings to capture one or two requested dimensions in order of importance. "
        "Use filters when the user asks for a specific service, group, division, owner, item, type, user, state, or priority. "
        "Prefer month for trends over time, service or group for operational breakdowns, priority for severity-oriented requests, and bar for categorical charts. "
        "Use metric=count unless the user explicitly asks for major incidents, SLA breaches, emergency changes, or past-due changes. "
        "If the user asks for an overview or executive dashboard, prefer a broad intent with service or month as the main grouping. "
        "If the request is ambiguous, choose the most likely operational dashboard instead of inventing extra filters. "
        "A fast local parser has already proposed a probable intent guess. Use it as a helpful hint, but correct it if the user's wording clearly means something else. "
        "Return exact field values from the context when possible, not approximations. "
        "Never use a filter field that is not supported by the selected module unless it also exists in the data context for that module. "
        "Examples: "
        "1) warini incidents open by service for sap fi 2025 -> incidents, open, service, 2025. "
        "2) 3tini requests for ib corporate last 6 months -> requests with division filter corporate. "
        "3) compare requests and changes by month between 2024 and 2025 -> comparison by month. "
        "4) ch7al men incidents open andhom sla breach -> incidents, open, metric sla. "
        "5) warini akther service 3andou backlog requests -> requests, open, grouping service. "
        "6) 9aren incidents w changes par mois -> compare incidents and changes by month. "
        "7) 3tini synthese globale 3la incidents -> overview for incidents. "
        "8) warini changes urgent par groupe -> changes, metric emergency, grouping group. "
        "Keep title, answer, and summary grounded in the requested dashboard intent only. "
        "Never invent data values, extra entities, or unsupported dimensions. "
        f"Intent hint: {hint_text} "
        f"Data context: {context_text}"
    )


def normalize_grouping(value, fallback="service"):
    value = str(value or "").strip().lower()
    return value if value in GROUPING_VALUES else fallback


def normalize_module(value):
    value = str(value or "").strip().lower()
    return value if value in MODULES else None


def normalize_filters(filters):
    normalized = []
    seen = set()
    for item in filters or []:
        if not isinstance(item, dict):
            continue
        field = str(item.get("field", "")).strip().lower()
        value = str(item.get("value", "")).strip()
        label = str(item.get("label", "")).strip()
        if field not in FILTER_FIELDS or not value:
            continue
        if not label:
            label = f"{field.title()}: {value}"
        token = (field, value.lower())
        if token in seen:
            continue
        seen.add(token)
        normalized.append({
            "field": field,
            "value": value,
            "label": label,
        })
    return normalized


def normalize_intent(intent):
    if not isinstance(intent, dict):
        raise RuntimeError("The AI service returned an invalid dashboard intent.")

    modules = [
        normalize_module(module)
        for module in intent.get("modules", [])
    ]
    modules = [module for module in modules if module]

    module = normalize_module(intent.get("module"))
    compare = bool(intent.get("compare"))
    if compare:
        if module and module not in modules:
            modules.append(module)
        module = None
    elif module and not modules:
        modules = [module]
    elif not module and modules:
        module = modules[0]
    elif not module and not modules:
        module = "incidents"
        modules = ["incidents"]

    groupings = [
        normalize_grouping(grouping, "")
        for grouping in intent.get("groupings", [])
    ]
    groupings = [grouping for grouping in groupings if grouping]
    grouping = normalize_grouping(intent.get("grouping"), groupings[0] if groupings else "service")
    if not groupings:
        groupings = [grouping]

    secondary_grouping = intent.get("secondary_grouping")
    secondary_grouping = normalize_grouping(secondary_grouping, "") if secondary_grouping else None

    state = str(intent.get("state", "all")).strip().lower()
    if state not in {"all", "open", "closed"}:
        state = "all"

    metric = str(intent.get("metric", "count")).strip()
    if metric not in {"count", "major", "sla", "emergency", "pastDue"}:
        metric = "count"

    chart_type = str(intent.get("chart_type", "bar")).strip().lower()
    if chart_type not in {"bar", "line", "pie"}:
        chart_type = "bar"

    year = intent.get("year")
    year = int(year) if isinstance(year, (int, float)) else None

    year_range = intent.get("year_range")
    if not isinstance(year_range, list) or len(year_range) != 2:
        year_range = None
    else:
        try:
            year_range = [int(year_range[0]), int(year_range[1])]
        except Exception:
            year_range = None

    quarter = intent.get("quarter")
    quarter = int(quarter) if isinstance(quarter, (int, float)) and 1 <= int(quarter) <= 4 else None

    top_n = intent.get("top_n")
    top_n = int(top_n) if isinstance(top_n, (int, float)) and 1 <= int(top_n) <= 20 else None

    title = str(intent.get("title", "")).strip() or "AI Dashboard"
    answer = str(intent.get("answer", "")).strip() or "Dashboard generated from your request."
    summary = intent.get("summary")
    if not isinstance(summary, list):
        summary = []
    summary = [str(item).strip() for item in summary if str(item).strip()]

    return {
        "compare": compare,
        "module": module,
        "modules": modules,
        "grouping": grouping,
        "groupings": groupings,
        "secondary_grouping": secondary_grouping,
        "state": state,
        "metric": metric,
        "year": year,
        "year_range": year_range,
        "quarter": quarter,
        "top_n": top_n,
        "chart_type": chart_type,
        "filters": normalize_filters(intent.get("filters", [])),
        "title": title,
        "answer": answer,
        "summary": summary,
    }


def build_openai_intent(prompt, data_context=None, hint_intent=None):
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured on the backend.")

    model = os.getenv("OPENAI_DASHBOARD_MODEL", "gpt-5")
    req = urllib_request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(
            {
                "model": model,
                "messages": [
                    {"role": "developer", "content": build_developer_prompt(data_context, hint_intent)},
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
        ).encode("utf-8"),
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

    return normalize_intent(json.loads(content))


def build_ollama_intent(prompt, data_context=None, hint_intent=None):
    base_url = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434").rstrip("/")
    model = os.getenv("OLLAMA_MODEL", "llama3.1").strip() or "llama3.1"
    req = urllib_request.Request(
        f"{base_url}/api/chat",
        data=json.dumps(
            {
                "model": model,
                "stream": False,
                "format": AI_INTENT_SCHEMA,
                "messages": [
                    {"role": "system", "content": build_developer_prompt(data_context, hint_intent)},
                    {"role": "user", "content": prompt},
                ],
                "options": {
                    "temperature": 0.1,
                    "num_ctx": 2048,
                    "num_predict": 140,
                },
                "keep_alive": "30m",
            }
        ).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib_request.urlopen(req, timeout=180) as response:
        payload = json.loads(response.read().decode("utf-8"))

    content = payload.get("message", {}).get("content", "")
    if not content:
        raise RuntimeError("Ollama did not return structured dashboard content.")

    return normalize_intent(json.loads(content))


def build_ai_dashboard_intent(prompt, data_context=None, hint_intent=None):
    provider = os.getenv("AI_DASHBOARD_PROVIDER", "ollama").strip().lower()

    if provider == "ollama":
        return build_ollama_intent(prompt, data_context, hint_intent)
    if provider == "openai":
        return build_openai_intent(prompt, data_context, hint_intent)
    if provider == "auto":
        try:
            return build_ollama_intent(prompt, data_context, hint_intent)
        except Exception:
            return build_openai_intent(prompt, data_context, hint_intent)

    raise RuntimeError("Unsupported AI_DASHBOARD_PROVIDER. Use ollama, openai, or auto.")
