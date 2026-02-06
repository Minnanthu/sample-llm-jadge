# sample-llm-jadge

LLM-as-a-Judge パターンによる LLM 出力品質評価フレームワーク。

## 機能

- **3つのユースケース**: 会話要約、レポート生成、レポートQA
- **2つのJudgeプロバイダ**: OpenAI (GPT-4o) / Google Gemini
- **11評価観点**: コア9観点 + 任意2観点、1/3/5スコアアンカー付き
- **反長文バイアス**: 3層防御（ルーブリックアンカー、プロンプト指示、機械的ペナルティ）
- **Format Gate**: Judge応答のJSON Schemaバリデーション
- **CLI**: validate / run / aggregate コマンド

## セットアップ

```bash
npm install
cp .env.example .env
# .env にAPIキーを設定
```

## 使い方

### リクエスト・結果のバリデーション

```bash
npx tsx src/cli.ts validate --json samples/uc1_request.json --schema request
npx tsx src/cli.ts validate --json samples/uc1_result.json
```

### 評価の実行

```bash
npx tsx src/cli.ts run --json samples/uc1_request.json --provider openai
npx tsx src/cli.ts run --json samples/uc1_request.json --provider gemini --output result.json
```

### 結果の集約

```bash
npx tsx src/cli.ts aggregate samples/uc1_result.json samples/uc2_result.json samples/uc3_result.json
```

## スコアリング

- **加重平均**: コア9観点の加重平均（重みはユースケースごとに異なる）
- **簡潔さペナルティ**: conciseness スコア ≤ 2 の場合 -0.3（下限: 1.0）
- **合否判定**: `format_valid AND weighted_score ≥ 3.0`

## テスト

```bash
npm run test          # 全テスト実行
npm run test:unit     # ユニットテストのみ
npm run test:e2e      # E2Eテストのみ
npm run typecheck     # 型チェック
```
