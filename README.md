# sample-llm-jadge

LLM-as-a-Judge パターンによる LLM 出力品質評価フレームワーク。

## 機能

- **3つのユースケース**: 会話要約、レポート生成、レポートQA
- **2つのJudgeプロバイダ**: OpenAI / Google Gemini (デフォルト: GPT-4o / Gemini 1.5 Pro)
- **11評価観点**: コア9観点 + 任意2観点、1/3/5スコアアンカー付き
- **反長文バイアス**: 3層防御（ルーブリックアンカー、プロンプト指示、機械的ペナルティ）
- **Format Gate**: Judge応答のJSON Schemaバリデーション
- **CLI**: validate / run / aggregate コマンド

### 評価観点 (Core)

これらは標準で評価に使用される9つの観点です。

| 観点 (ID) | 説明 |
|---|---|
| `accuracy` | **正確性**。ソースに基づいた事実確認。ハルシネーションがないか。 |
| `completeness` | **網羅性**。主要なポイントをすべてカバーしているか。 |
| `relevance` | **関連性**。指示や質問に直接答えているか。 |
| `coherence` | **一貫性**。論理的な構成と矛盾のなさ。 |
| `conciseness` | **簡潔さ**。無駄な記述がなく、情報密度が高いか。 |
| `clarity` | **明確さ**。わかりやすく、曖昧さのない表現か。 |
| `reasoning` | **推論力**。結論に至るまでの論理展開の質。 |
| `harmlessness` | **無害性**。バイアス、差別、危険な内容が含まれていないか。 |
| `format_compliance` | **形式準拠**。指定されたフォーマット（文字数、JSON形式など）に従っているか。 |

### 評価観点 (Optional)

これらは特定の条件下やカスタマイズ時に使用される観点です（デフォルトでは無効）。

| 観点 (ID) | 説明 |
|---|---|
| `citation_quality` | **引用品質**。情報の出典が正確に示されているか。 |
| `actionability` | **実用性**。具体的で実行可能な提案が含まれているか。 |

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

### リクエストJSONの作成

評価を実行するには、以下のフォーマットでJSONファイルを作成してください。特に `task_type` は評価の重み付けとプロンプトテンプレートを決定する重要なフィールドです。

```json
{
  "request_id": "unique-id-001",
  "task_type": "summarization",  // 必須: summarization | report_generation | report_qa
  "input": {
    "source_text": "評価対象LLMに入力した元テキスト",
    "instruction": "評価対象LLMへの指示",
    "reference_output": "（任意）正解データの例"
  },
  "output": {
    "model_name": "my-custom-model",
    "generated_text": "評価対象LLMが生成したテキスト"
  }
}
```

- **task_type**: 以下のいずれかを指定します。これにより評価の重みとプロンプトが切り替わります。
  - `summarization`: 会話要約（簡潔さ重視）
  - `report_generation`: レポート生成（網羅性・構成重視）
  - `report_qa`: レポートQA（正確性・推論重視）
- **generated_text**: 自前LLMの出力がJSONの場合は、文字列化（stringify）して記述してください。

### 評価の実行

```bash
npx tsx src/cli.ts run --json samples/uc1_request.json --provider openai
npx tsx src/cli.ts run --json samples/uc1_request.json --provider gemini --output result.json
```

### 評価結果の例

実行結果は以下のようなJSON形式で出力されます。観点ごとのスコア・理由と、総合判定が含まれます。

```json
{
  "judge_model": "gpt-4o",
  "scores": [
    { "criterion": "accuracy", "score": 5, "reasoning": "事実関係はソースと一致しています..." },
    { "criterion": "conciseness", "score": 4, "reasoning": "簡潔ですが、一部重複があります..." },
    ...
  ],
  "overall": {
    "weighted_score": 4.85,    // 加重平均スコア
    "pass": true,              // 合否判定 (weighted_score ≥ 3.0)
    "conciseness_penalty_applied": false // ペナルティ適用の有無
  }
}
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
