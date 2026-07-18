# CONTRATOS JSON MATIZA ENGINE

## Base item

```json
{
  "id": "",
  "source_type": "url|text|image|video|rss|social|manual",
  "source_url": "",
  "raw_text": "",
  "platform": "",
  "detected_at": "",
  "metadata": {}
}
```

## Base phase output

```json
{
  "phase": "",
  "input_id": "",
  "ok": true,
  "result": {},
  "warnings": [],
  "errors": [],
  "cost_estimate": null,
  "next_action": ""
}
```

## Hot topic output

```json
{
  "topic_id": "",
  "slug": "",
  "title": "",
  "public_concern_summary": "",
  "why_it_matters": "",
  "main_confusions": [],
  "source_map_status": "",
  "priority_score": 0,
  "social_heat_score": 0,
  "risk_score": 0,
  "evergreen_score": 0,
  "needs_new_vertical": true,
  "merge_with_existing_topic": null
}
```

## Relevance gate output

```json
{
  "should_process": true,
  "reason": "",
  "priority": "alta|media|baja|descartar",
  "public_interest_score": 0,
  "virality_score": 0,
  "harm_score": 0,
  "verification_value_score": 0,
  "commercial_noise_score": 0,
  "recommended_action": "process|queue|ignore|monitor_only"
}
```

## Semantic router output

```json
{
  "content_type": "",
  "claim_type": "",
  "topic_match": {
    "existing_topic_id": "",
    "confidence": 0,
    "should_merge": true
  },
  "category_tags": [],
  "needs_new_topic": false,
  "routing_reason": ""
}
```

## Source strategy output

```json
{
  "source_strategy": {
    "required_source_types": [],
    "preferred_authority_level": "",
    "minimum_sources": 0,
    "needs_original_source": true,
    "needs_context_source": true,
    "needs_counter_source": false,
    "manual_check_required": false
  },
  "search_queries": [],
  "reuse_from_cache": true,
  "reason": ""
}
```

## Verifier output

```json
{
  "verdict": "verdadero|falso|engañoso|falta_contexto|sin_pruebas|no_verificable",
  "confidence": 0,
  "what_is_true": [],
  "what_is_false": [],
  "what_lacks_context": [],
  "what_is_unknown": [],
  "key_sources": [],
  "human_review_required": true
}
```
