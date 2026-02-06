# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

LLM-as-a-Judge 評価フレームワーク。3つのユースケース（会話要約、レポート生成、レポートQA）に対し、OpenAI または Gemini を Judge モデルとして LLM 出力を評価する。11観点の5段階ルーブリック評価、Format Gate バリデーション、反長文バイアス機構を備える。

## コマンド

- `npm run test` — 全テスト実行（ユニット、インテグレーション、E2E）
- `npm run typecheck` — TypeScript 型チェック
- `npm run build` — TypeScript を dist/ にコンパイル
- `npx tsx src/cli.ts validate --json <file> --schema <request|result>` — JSONバリデーション
- `npx tsx src/cli.ts run --json <file> --provider <openai|gemini>` — 評価実行
- `npx tsx src/cli.ts aggregate <files...>` — 結果集約

## アーキテクチャ

- `src/types/` — TypeScript 型定義
- `src/schemas/` — JSON Schema バリデーション（Ajv）、Format Gate
- `src/rubric/` — 評価観点定義、重みプリセット、プロンプトビルダー
- `src/evaluation/` — スコアラー（加重平均 + 簡潔さペナルティ）、ランナー、アグリゲーター
- `src/providers/` — BaseJudge 抽象クラス、OpenAI/Gemini 実装、ファクトリ
- `src/commands/` — CLI コマンドハンドラ
- `schemas/` — JSON Schema ファイル
- `rubric/` — 評価観点/重み JSON + プロンプトテンプレート

## 主要な設計判断

- JSON Schema は `additionalProperties: false` と `enum` によるスコア定義（min/max ではなく）で OpenAI/Gemini 両対応
- スコアリング: 加重平均 + 簡潔さペナルティ（score ≤ 2 → -0.3、下限 1.0）
- 合否判定: format_valid AND weighted_score ≥ 3.0 AND format_compliance ≥ 3
- 全体を通して ESM モジュール（package.json に `"type": "module"`）
- ロガー出力は stderr、構造化 JSON 出力のみ stdout
