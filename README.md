# AI Alcohol Label Verifier

AI-assisted prototype for verifying alcohol beverage label artwork against application data.

## Live Application

https://ai-alcohol-label-verifier-1.onrender.com/

## API

Backend: https://ai-alcohol-label-verifier.onrender.com/

API Docs: https://ai-alcohol-label-verifier.onrender.com/docs

## Features

- Upload JPG, PNG, or WebP label artwork
- AI-powered extraction of compliance-relevant fields
- Compare label data against application data
- PASS / FAIL / REVIEW results
- Exact-text government warning verification
- Normalized matching for capitalization, punctuation, and whitespace
- Side-by-side application and detected values
- Uploaded images are not intentionally persisted

## Fields Verified

- Brand name
- Class / type
- Alcohol content
- Net contents
- Producer name / address
- Country of origin
- Government warning

## Architecture

React/Vite frontend → FastAPI backend → OpenAI multimodal extraction → deterministic verification logic.

AI is used to read information visible on the label. Comparison rules are implemented separately in Python so the verification behavior remains explicit and auditable.

## Verification Logic

Standard fields use normalized comparison so insignificant differences in case, punctuation, and whitespace do not cause failures.

The government warning uses strict text comparison.

If information cannot be identified on the label, the field receives REVIEW rather than allowing the AI to guess.

Overall result:

- FAIL: one or more fields fail
- REVIEW: no failures, but one or more fields require review
- PASS: all fields pass

## Technology

- React
- Vite
- FastAPI
- Python
- OpenAI API
- Render

## Local Setup

Clone the repository:

```bash
git clone https://github.com/khondkar/ai-alcohol-label-verifier.git
cd ai-alcohol-label-verifier
