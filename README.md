# WBS AI - プロジェクトリスク分析ツール

AIを活用して、Work Breakdown Structure（WBS）の生成とプロジェクトリスク分析を行う包括的なWebアプリケーションです。

## 主な機能

* **WBS生成**
  プロジェクト概要・目的・要件から、詳細なWBS・ガントチャートを自動生成

* **リスク分析**
  各プロジェクト工程におけるステークホルダー間のリスクを分析

* **リスクマトリクス可視化**
  ステークホルダー影響ベースでリスクを一覧表示・管理

* **JSONインポート / エクスポート**
  リスク分析データをJSON形式でダウンロード・アップロード可能

---

## 技術スタック

* **フロントエンド**: React 19 + TypeScript
* **UIライブラリ**: Material-UI (MUI)
* **ルーティング**: React Router v7
* **ガントチャート**: @svar-ui/react-gantt
* **ビルドツール**: Vite
* **スタイリング**: Emotion (CSS-in-JS)

---

## プロジェクト構成

```text
src/
├── pages/
│   ├── Input.tsx           # プロジェクト入力フォーム（STEP 1）
│   ├── Wbs.tsx             # ガントチャート付きWBS表示（STEP 2）
│   ├── RiskMatrix.tsx      # リスク分析ダッシュボード（STEP 3）
│   └── RiskMatrixInput.tsx # リスクデータJSONアップロード
├── const/
│   ├── url.ts              # APIエンドポイント設定
│   └── uuid.ts             # UUID生成ユーティリティ
├── App.tsx                 # メインルーター設定
└── main.tsx                # アプリケーションエントリポイント
```

---

## ワークフロー

### STEP 1: プロジェクト情報入力

* プロジェクト概要・目的・要件を入力
* AI APIを利用してWBSを生成

### STEP 2: WBS確認 & タスク選択

* ガントチャート形式でスケジュールを可視化
* タスク一覧・期間・詳細説明を確認
* リスク分析対象となるタスクを選択

### STEP 3: リスク分析

* ステークホルダーベースのリスクマトリクスを表示
* ステークホルダー間のリスクを分析
* リスク分析結果をJSON形式でダウンロード
* 別タスクへ切り替えて再分析可能

---

## はじめ方

### インストール

```bash
npm install
```

### 開発環境起動

```bash
npm run dev
```

開発モードでアプリを起動します。
URL: `http://localhost:5173`

### 本番ビルド

```bash
npm run build
```

本番用ビルドを `build` ディレクトリへ出力します。

### Lint実行

```bash
npm run lint
```

---

## API連携

本アプリケーションは Azure OpenAI エンドポイントと連携し、以下を実現しています。

* WBS生成 (`/chatWbs`)
* ステークホルダー抽出 (`/chatStakeholders`)
* リスク分析 (`/estimateStakeholdersRisks`)

API URL は `src/const/url.ts` で設定してください。

```typescript
export const AZURE_FUNCTION_URL = "your-azure-function-url";
```

---

## 主な依存ライブラリ

* `@mui/material` - UIコンポーネント
* `@mui/icons-material` - Material Icons
* `@svar-ui/react-gantt` - ガントチャート表示
* `react-router` - クライアントサイドルーティング
* `@emotion/react` / `@emotion/styled` - CSS-in-JS

---

## データモデル

### WBSタスク

```typescript
{
  startTime: number;
  endTime: number;
  task: string;
  description: string;
  timeStep: "日" | "週" | "月";
  project: string;
}
```

### リスクエントリ

```typescript
{
  stakeholder1: string;
  stakeholder2: string;
  risks: Array<{
    content: string;
    mitigation: string;
    delayTime: number;
    likelihoodScore: number;
  }>;
}
```

---

## ライセンス

MIT
