# sample-llm-jadge

LLM-as-a-Judge evaluation framework for assessing LLM output quality.

## Features

- **3 Use Cases**: Summarization, Report Generation, Report QA
- **2 Judge Providers**: OpenAI (GPT-4o) and Google Gemini
- **11 Evaluation Criteria**: 9 core + 2 optional, with 1/3/5 score anchors
- **Anti-Verbosity Bias**: 3-layer defense (rubric anchors, prompt instructions, mechanical penalty)
- **Format Gate**: JSON Schema validation of judge responses
- **CLI**: validate, run, and aggregate commands

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your API keys
```

## Usage

### Validate a request or result

```bash
npx tsx src/cli.ts validate --json samples/uc1_request.json --schema request
npx tsx src/cli.ts validate --json samples/uc1_result.json
```

### Run evaluation

```bash
npx tsx src/cli.ts run --json samples/uc1_request.json --provider openai
npx tsx src/cli.ts run --json samples/uc1_request.json --provider gemini --output result.json
```

### Aggregate results

```bash
npx tsx src/cli.ts aggregate samples/uc1_result.json samples/uc2_result.json samples/uc3_result.json
```

## Scoring

- **Weighted average** across 9 core criteria (weights vary by use case)
- **Conciseness penalty**: -0.3 when conciseness score ≤ 2 (floor: 1.0)
- **Pass**: `format_valid AND weighted_score ≥ 3.0`

## Testing

```bash
npm run test          # All tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests only
npm run typecheck     # Type checking
```
