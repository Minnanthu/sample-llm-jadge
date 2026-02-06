# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LLM-as-a-Judge evaluation framework. Evaluates LLM outputs across 3 use cases (summarization, report generation, report QA) using OpenAI or Gemini as judge models. Features 5-point rubric scoring across 11 criteria, format gate validation, and anti-verbosity bias mechanisms.

## Commands

- `npm run test` — Run all tests (unit, integration, E2E)
- `npm run typecheck` — TypeScript type checking
- `npm run build` — Compile TypeScript to dist/
- `npx tsx src/cli.ts validate --json <file> --schema <request|result>` — Validate JSON
- `npx tsx src/cli.ts run --json <file> --provider <openai|gemini>` — Run evaluation
- `npx tsx src/cli.ts aggregate <files...>` — Aggregate results

## Architecture

- `src/types/` — TypeScript type definitions
- `src/schemas/` — JSON Schema validation (Ajv), format gate
- `src/rubric/` — Criteria definitions, weight presets, prompt builder
- `src/evaluation/` — Scorer (weighted average + conciseness penalty), runner, aggregator
- `src/providers/` — BaseJudge abstract class, OpenAI/Gemini implementations, factory
- `src/commands/` — CLI command handlers
- `schemas/` — JSON Schema files
- `rubric/` — Criteria/weights JSON + prompt templates

## Key Design Decisions

- JSON Schemas use `additionalProperties: false` and `enum` for scores (not min/max) for OpenAI/Gemini compatibility
- Scoring: weighted average with conciseness penalty (score ≤ 2 → -0.3, floor 1.0)
- Pass criteria: format_valid AND weighted_score ≥ 3.0 AND format_compliance ≥ 3
- ESM modules throughout (`"type": "module"` in package.json)
- All logger output goes to stderr; only structured JSON output goes to stdout
