"""
Steel-Man Gate: before a "challenge" reply can post, the author must submit
a fair restatement (steelman_text) of the argument they're disagreeing with.

MVP implementation note:
This uses a cheap lexical-overlap heuristic (Jaccard similarity over
normalized tokens) as a placeholder classifier. It is intentionally simple
so the app is fully self-contained with no external API dependency for the
MVP. It will pass obviously-related restatements and reject restatements
that share almost no vocabulary with the original (a strong signal of a
straw man or a non-sequitur).

This is NOT a semantic check -- it can't tell that "the plan is bad" fairly
restates "the plan increases costs" if the wording is disjoint. For anything
beyond MVP, swap `similarity_score` for one of:
  - a small sentence-embedding model (e.g. via sentence-transformers) with
    cosine similarity, run locally, no external API needed
  - a cheap LLM call ("does restatement B fairly represent argument A?
     yes/no") if you want more nuance and are OK with the latency/cost
Both slot into `passes_steelman_check` without changing the API contract.
"""

import re

STOPWORDS = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "and", "or", "but", "if", "then", "so", "to", "of", "in", "on", "for",
    "with", "as", "at", "by", "it", "this", "that", "these", "those", "i",
    "you", "he", "she", "they", "we", "not", "no", "do", "does", "did",
    "have", "has", "had", "will", "would", "can", "could", "should",
}


def _tokenize(text: str) -> set:
    words = re.findall(r"[a-zA-Z']+", text.lower())
    return {w for w in words if w not in STOPWORDS and len(w) > 2}


def similarity_score(original: str, restatement: str) -> float:
    """Jaccard similarity between normalized token sets. 0.0-1.0."""
    a, b = _tokenize(original), _tokenize(restatement)
    if not a or not b:
        return 0.0
    intersection = len(a & b)
    union = len(a | b)
    return intersection / union if union else 0.0


def passes_steelman_check(original_text: str, restatement: str, min_similarity: float) -> tuple[bool, float]:
    if not restatement or len(restatement.strip()) < 10:
        return False, 0.0
    score = similarity_score(original_text, restatement)
    return score >= min_similarity, score
