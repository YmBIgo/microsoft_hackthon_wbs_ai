const { app } = require('@azure/functions');
const OpenAI = require('openai');
const fs = require('fs/promises');

const endpoint = process.env.OPENAI_AZURE_COFFEECUP_ENDPOINT;
const deploymentName = "gpt-5-mini";
const apiKey = process.env.OPENAI_AZURE_COFFEECUP_API_KEY;

const openai = new OpenAI({
    baseURL: endpoint,
    apiKey: apiKey
});

async function chat(message, systemPrompt) {
  const response = await openai.responses
    .create({
      model: deploymentName,
      input: message,
      instructions: systemPrompt,
    })
  // console.log(response.output_text);
  return response.output_text;
}

async function chatWbs(projectDescription, /* now */) {
  // Get WBS from user input
  const systemPrompt = `あなたはプロジェクトマネージャーです。以下のプロジェクトのWBSを作成してください。
ユーザーの入力した「プロジェクト」「目的」「要件」をもとに、プロジェクトを完了するためのタスクを洗い出し、各タスクの開始時間と終了時間を設定してください。
以下の例にあるように入力は自然言語でされるので、WBSは以下の出力のようなJSON形式で出力してください。

例：
\`\`\`入力
プロジェクト: 新しいウェブサイトの開発
目的: 企業のオンラインプレゼンスを向上させるために、新しいウェブサイトを開発する。
要件:
- モダンでレスポンシブなデザイン
- ユーザーフレンドリーなインターフェース
- SEO最適化
- CMSの統合
- ソーシャルメディア連携
- セキュリティ対策
- パフォーマンス最適化
- テストと品質保証
- デプロイメントと保守
\`\`\`

\`\`\`出力
{
"timeStep": "日",
"project": "新しいウェブサイトの開発",
"tasks":
[
  {
    "startTime": 0,
    "endTime": 10,
    "task": "プロジェクト計画と要件定義"
    "description": "プロジェクトの計画を立て、要件を定義する。"
  },
  {
    "startTime": 10,
    "endTime": 20,
    "task": "デザインとプロトタイピング"
    "description": "モダンでレスポンシブなデザインを作成し、プロトタイプを作成する。"
  },
  {
    "startTime": 20,
    "endTime": 35,
    "task": "開発と実装"
    "description": "ユーザーフレンドリーなインターフェースを開発し、SEO最適化、CMSの統合、ソーシャルメディア連携、セキュリティ対策、パフォーマンス最適化を実装する。"
  },
  {
    "startTime": 35,
    "endTime": 45,
    "task": "テストと品質保証"
    "description": "ウェブサイトのテストを行い、品質を保証する。"
  },
  {
    "startTime": 45,
    "endTime": 50,
    "task": "デプロイメントと保守"
    "description": "ウェブサイトをデプロイし、保守を行う。"
  }
]
}
\`\`\`

- timeStepは週か日で設定してください。`
  const prompt = projectDescription;
  try {
    const response = await chat(prompt, systemPrompt);
    const wbs = JSON.parse(response);
    // await fs.writeFile(`./${now}_wbs.json`, JSON.stringify(wbs, null, 2));
    return wbs;
  } catch (error) {
    console.error("Error:", error);
    return {};
  }
}

async function chatStakeholders(step, projectDescription, /* now */) {
  // stepの型は以下。
  /*
    {
      "startTime": number,
      "endTime": number,
      "task": string,
      "description": string,
      "timeStep": string,
      "project": string,
      "stepIndex": number
    }
  */
// 抽出するステークホルダーは、環境除き 7 でいいか？
  const listUpStakeholdersSystemPrompt = `あなたはプロジェクトマネージャーです。
入力されたプロジェクトの概要とそのステップに関連する、ステークホルダーを7個まで洗い出してください。

例：
\`\`\`入力
プロジェクト：
一戸建ての建設
目的：家族のための快適な住まいを提供すること
要件：
- 土地の選定と購入
- 建築設計と許可の取得
- 基礎工事と構造の建設
- 内装工事と設備の設置
- 外構工事と庭の整備
- 最終検査と引き渡し
ステップ：
{
  "startTime": 0,
  "endTime": 14,
  "task": "プロジェクト立ち上げと計画・予算策定",
  "description": "プロジェクトチーム編成、スコープ決定、予算策定、スケジュール策定、資金計画の確定。",
  "timeStep": "日",
  "project": "一戸建ての建設",
  "stepIndex": 0
}
\`\`\`

\`\`\`出力
[
  {
    "name": "施主（家族）",
    "role": "プロジェクトオーナー・要求定義・意思決定"
  },
  {
    "name": "プロジェクトマネージャー",
    "role": "全体進行管理・コスト管理・リスク管理"
  },
  {
    "name": "建築会社",
    "role": "建築計画・施工実施"
  },
  {
    "name": "設計士・建築士",
    "role": "設計・法規対応・図面作成"
  },
  {
    "name": "金融機関",
    "role": "住宅ローン・資金提供"
  },
  {
    "name": "行政機関",
    "role": "建築確認・許認可"
  },
  {
    "name": "近隣住民",
    "role": "騒音・工事影響の利害関係者"
  },
  {
    "name": "施工業者",
    "role": "各工事の実施工"
  },
  {
    "name": "不動産会社",
    "role": "土地紹介・契約支援"
  }
]
\`\`\`
`;
  const stakeholdersPrompt = `プロジェクト：
${projectDescription}
ステップ：
${JSON.stringify(step)}`;
  try {
    const stakeholdersString = await chat(stakeholdersPrompt, listUpStakeholdersSystemPrompt);
    const stakeholders = JSON.parse(stakeholdersString);
    console.log("ステークホルダー:", stakeholders);
    const stakeholdersIncludeEnv = [...stakeholders, {
      name: "環境",
      role: "プロジェクトの外部要因として、天候や災害などのリスクをもたらす可能性がある。"
    }];
    // await fs.writeFile(`./${now}_${step.task}_stakeholders.json`, JSON.stringify(stakeholdersIncludeEnv, null, 2));
    return stakeholdersIncludeEnv;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

async function estimateStakeholdersRisks(stakeholders, step, projectDescription, /* now */) {
  const systemPrompt = `あなたはプロジェクトマネージャーです。
入力されたプロジェクトの概要と・そのステップと・そのステップのステークホルダー２人に対するリスクを洗い出してください。
リスクは、ステークホルダー同士の間でプロジェクトに与える可能性のある悪影響や、ステークホルダー同士の間で発生する可能性のある問題を指します。
返答は以下の型のJSON形式で出力してください。

\`\`\`json
{
  "stakeholder1": "ステークホルダー1の名前",
  "stakeholder2": "ステークホルダー2の名前",
  "risks": [
    {
      "description": "リスク1の説明",
      "impact": "リスク1が発生した場合のプロジェクトへの影響の説明",
      "likelihoodScore": "リスク1が発生する可能性の説明（0〜100点）",
      "mitigation": "リスク1の発生を防止・軽減するための対策の説明",
      "riskScore: "リスク1のリスクスコア（impactをもとに0〜100点で算出）",
      "delayTime": "リスク1が発生した場合のプロジェクトの遅延時間（例：6、入力のtimeStepと合わせる）"
    },
    {
      "description": "リスク2の説明",
      "impact": "リスク2が発生した場合のプロジェクトへの影響の説明",
      "likelihoodScore": "リスク2が発生する可能性の説明（0〜100点）",
      "mitigation": "リスク2の発生を防止・軽減するための対策の説明",
      "riskScore: "リスク2のリスクスコア（impactをもとに0〜100点で算出）",
      "delayTime": "リスク2が発生した場合のプロジェクトの遅延時間（例：6、入力のtimeStepと合わせる）"
    },
    {
      "description": "リスク2の説明",
      "impact": "リスク2が発生した場合のプロジェクトへの影響の説明",
      "likelihoodScore": "リスク2が発生する可能性の説明（0〜100点）",
      "mitigation": "リスク2の発生を防止・軽減するための対策の説明",
      "riskScore: "リスク2のリスクスコア（impactをもとに0〜100点で算出）",
      "delayTime": "リスク3が発生した場合のプロジェクトの遅延時間（例：6、入力のtimeStepと合わせる）"
    }
  ]
}
\`\`\`

例：
\`\`\`入力
プロジェクト：
一戸建ての建設
目的：家族のための快適な住まいを提供すること
要件：
- 土地の選定と購入
- 建築設計と許可の取得
- 基礎工事と構造の建設
- 内装工事と設備の設置
- 外構工事と庭の整備
- 最終検査と引き渡し
ステップ：
{
  "startTime": 0,
  "endTime": 14,
  "task": "プロジェクト立ち上げと計画・予算策定",
  "description": "プロジェクトチーム編成、スコープ決定、予算策定、スケジュール策定、資金計画の確定。",
  "timeStep": "日",
  "project": "一戸建ての建設",
  "stepIndex": 0
}
ステークホルダー１：
{
  "name": "施主（家族）",
  "role": "プロジェクトオーナー・要求定義・最終意思決定・資金確保の承認"
}
ステークホルダー２：
{
  "name": "プロジェクトマネージャー",
  "role": "全体計画・予算・スケジュール策定・関係者調整・リスク管理"
}
\`\`\`

\`\`\`出力
{
  "stakeholder1": "施主（家族）",
  "stakeholder2": "プロジェクトマネージャー",
  "risks": [
    {
      "description": "施主が理想の住宅仕様を追加要求し続け、当初予算やスコープと乖離する",
      "impact": "予算超過やスケジュール再調整が必要となり、プロジェクト全体の計画が不安定になる",
      "likelihoodScore": 82,
      "mitigation": "初期段階で優先順位付きの要件一覧を作成し、変更時には費用・工期影響を事前説明して承認制にする",
      "riskScore": 88,
      "delayTime": 10
    },
    {
      "description": "施主とプロジェクトマネージャーの間で予算感覚に差があり、計画承認が進まない",
      "impact": "予算策定や資金計画の確定が遅れ、後続工程の開始が延期される",
      "likelihoodScore": 70,
      "mitigation": "市場相場を基準にした概算見積もりを提示し、予算上限と優先事項を合意形成する",
      "riskScore": 76,
      "delayTime": 7
    },
    {
      "description": "プロジェクトマネージャーがスケジュールを楽観的に設定し、施主への説明と実態に差異が発生する",
      "impact": "施主の期待値と現実の進捗にズレが生じ、信頼低下や計画見直しが発生する",
      "likelihoodScore": 65,
      "mitigation": "過去実績ベースでバッファを含めた工程計画を作成し、リスク前提を施主へ共有する",
      "riskScore": 74,
      "delayTime": 6
    }
  ]
}
\`\`\`

- ステークホルダー１と２が同一だった場合は、そのステークホルダーに関連するリスクを洗い出してください。例えば、施主（家族）と施主（家族）がペアだった場合は、施主（家族）に関連するリスクを洗い出すということです。`;
  const stackHoldersLength = stakeholders.length;
  const stakeholderPairs = createStakeholderPairs(stackHoldersLength);
  const stakeholderPairsChunks = devideArrayIntoChunks(stakeholderPairs, 5);
  let stakeholderResults = [];
  for (const chunk of stakeholderPairsChunks) {
    const stakeholderResult = await Promise.all(chunk.map(async(pair) => {
    const prompt = `プロジェクト：
${projectDescription}
ステップ：
${JSON.stringify(step)}
ステークホルダー１：
${JSON.stringify(stakeholders[pair[0]])}
ステークホルダー２：
${JSON.stringify(stakeholders[pair[1]])}`;
      try {
        const riskString = await chat(prompt, systemPrompt);
        const risk = JSON.parse(riskString);
        return risk;
      } catch (error) {
        console.error("Error:", error);
        return null;
      }
    }));
    stakeholderResults = [...stakeholderResults, ...stakeholderResult].filter(Boolean);
  }
  console.log("stakeholderResults:", stakeholderResults);
  return stakeholderResults;
//   await fs.writeFile(`./${now}_${step.task}_stakeholderRisks.json`, JSON.stringify(stakeholderResults, null, 2));
}

function createStakeholderPairs(stakeholdersLength) {
  const pairs = [];
  for (let i = 0; i < stakeholdersLength; i++) {
    for (let j = i + 1; j < stakeholdersLength; j++) {
      pairs.push([i, j].sort(() => i - j));
    }
  }
  const pairsSet = Array.from(new Set(pairs));
  const samePairs = Array(stakeholdersLength).fill(0).map((_, index) => [index, index]);
  return [...samePairs, ...pairsSet];
}

function devideArrayIntoChunks(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

app.http('wbs-openai', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        const body = await request.json();
        const path = body.path;
        context.log('Request body:', body, body.path);
        if (!path) {
          return { status: 404, body: 'Please provide a path in the request body.' };
        } else if (path === '/chatWbs') {
          context.log('Received request chatWbs');
          try {
            const wbs = await chatWbs(body.projectDescription, /* now */);
            context.log('WBS Successfully Retrieved:');
            return { body: JSON.stringify(wbs) };
          } catch (error) {
            context.log('Error in chatWbs:', error);
            return { status: 500, body: 'An error occurred while processing the request. 1' };
          }
        } else if (path === '/chatStakeholders') {
          context.log('Received request chatStakeholders');
          try {
            const step = body.step;
            const stakeholders = await chatStakeholders(step, body.projectDescription, /* now */);
            context.log('Stakeholders Successfully Retrieved:');
            return { body: JSON.stringify(stakeholders) };
          } catch (error) {
            context.log('Error in chatStakeholders:', error);
            return { status: 500, body: 'An error occurred while processing the request. 2' };
        }
        } else if (path === '/estimateStakeholdersRisks') {
          context.log('Received request estimateStakeholdersRisks');
          try {
            const step = body.step;
            const stakeholders = body.stakeholders;
            const risks = await estimateStakeholdersRisks(stakeholders, step, body.projectDescription, /* now */);
            context.log('Stakeholder Risks Successfully Retrieved:');
            return { body: JSON.stringify(risks) };
          } catch (error) {
            context.log('Error in estimateStakeholdersRisks:', error);
            return { status: 500, body: 'An error occurred while processing the request. 3' };
          }
        }
        return { body: `Hello World` };
    }
});
