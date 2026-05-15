---
title: "ローカルAIだけで動く選択肢式ノベル生成システムを作った話"
published: 2026-05-15
draft: false
description: "オンデバイスAIでシミュレーションゲームを構築してみた話。Ollama + Stable Diffusionをフル活用してPCだけで動く選択肢式ビジュアルノベルを1週間弱で作りました。"
tags: ["Ollama", "LocalAI", "個人開発", "LLM", "StableDiffusion"]
category: プログラミング
lang: "ja"
---

どうもorionnです。

オンデバイスAIでシミュレーションゲームを構築してみた話です。

ClaudeなどのAIに直接「シミュレーションゲームをプレイしたいので展開して」とチャットを投げれば普通に始めてくれますが、普段AIを触らない層の人にも楽しんでもらおうと企画しました。
まだ現段階ではPCとブラウザ上で動く形です。

## 作ったもの

PCだけで完結する、選択肢式ビジュアルノベルの自動生成システムです。

- **テキスト生成**: Ollama + `qwen3:8b-nothink`（ローカルLLM）
- **場面画像生成**: Python Diffusers + `nota-ai/bk-sdm-tiny`
- **サーバー**: Node.js（フレームワークなし）
- **UI**: ブラウザで動く HTML/JS

ジャンルと世界観をボタンで選ぶと、物語が自動生成されます。
選択肢もAIが生成するため、ユーザーは一切テキストを入力しません。

将来的に商用公開を想定しているため、すべてのモデルを商用利用可能なライセンスで構成しています。

![実際の生成シーン（ミステリー / 夢の森）](/images/ondevice-ai-novel/demo-scene.png)

## 実装で工夫した点

### 1. `<think>` ブロックの除去

qwen3などの推論系モデルは、出力の前に `<think>...</think>` という内部思考を吐き出します。
これをそのまま表示するとノベルとして破綻するため、正規表現で除去しています。

```js
function stripThinking(text) {
  const value = String(text ?? "");
  const closed = value.replace(/<think>[\s\S]*?<\/think>/gi, "");
  if (/<think>/i.test(closed)) return "";
  const titleIndex = closed.search(/タイトル\s*:/);
  if (titleIndex >= 0) return closed.slice(titleIndex).trim();
  // 英語の思考漏れも除去
  if (/^\s*(Okay|Sure|Let me|We need)/i.test(closed)) return "";
  return closed.trim();
}
```

「閉じタグがない場合は空文字を返す」という処理が地味に重要で、
これがないとモデルが途中で止まったときに思考途中の文章が表示されます。

### 2. LLMで画像プロンプトを書き直す二段階パイプライン

日本語で生成したストーリーをそのままStable Diffusionに渡しても、
日本語を理解できないため精度が下がります。

そこで **LLM → LLM → 画像モデル** という二段階にしました。

1. qwen3でストーリーを日本語生成
2. qwen3に「このシーンを英語の画像プロンプトに変換して」と頼む
3. 変換後のプロンプトをbk-sdm-tinyに渡す

```js
// プロンプトの品質チェック（ゴミ出力を弾く）
function isUsefulVisualPrompt(text) {
  const value = String(text ?? "").trim();
  if (value.length < 40) return false;
  const asciiLetters = value.match(/[A-Za-z]/g)?.length ?? 0;
  return asciiLetters >= 20;
}
```

変換失敗時はストーリー本文を直接プロンプトとして使うフォールバックも実装しています。

### 3. キャラクター外見の固定

選択肢を進むたびに主人公の見た目が変わると没入感が壊れます。
`visualMemory` という構造体にジャンル・世界観・主人公の外見情報を蓄積し、
毎回の画像生成プロンプトに「この外見を維持せよ」と混ぜています。

```js
const sourcePrompt = [
  "Preserve the fixed protagonist appearance from Visual memory exactly.",
  "Do not change hair, clothing, age, or silhouette.",
  ...
].join("\n");
```

## ライセンス選定について

商用公開（広告）を想定しているため、モデル選定は慎重に行いました。

| モデル | ライセンス | 商用利用 |
|--------|-----------|---------|
| qwen3:8b | Apache 2.0 | ✅ |
| nota-ai/bk-sdm-tiny | OpenRAIL-M | ✅（制限条件あり） |
| DeepSeek Janus-Pro-7B | MIT | ✅ |

OpenRAIL系は「AIが生成したコンテンツを悪用しない」という行動制限があるため、
商用公開前にライセンス本文の禁止用途を再確認します。

## 現状と課題

Android端末に突っ込むことを想定して始めた企画ですが、現時点での最大の課題は**容量**です。
AI部分がやっぱり大きいため、

- qwen3:8b: 約5GB
- bk-sdm-tiny: 約1GB
- 合計: 約6〜8GB

Google Playなどのモバイル配信を視野に入れると、この容量はダウンロードのハードルになります。

容量の問題もありますが、自身の高スペックPCでもかなりの生成時間になります。
ここら辺も改善の必要がありそうです。

2〜3年以内にSLM（Small Language Model）の性能が上がり、
3〜4B程度で今の8B並みの品質が出るようになったタイミングで改めて公開する予定です。

## 使用技術まとめ

- **Node.js**（フレームワークなし、標準APIのみ）
- **Ollama** + qwen3:8b-nothink
- **Python** + Diffusers + PyTorch（CUDA）
- **Stable Diffusion**: nota-ai/bk-sdm-tiny
- HTML / CSS / Vanilla JS

## おわりに

このプロジェクトは、Codexを使って約1週間弱で形になりました。
何を作るかの設計判断・モデル選定・ライセンス確認・動作テストあたりは自分でやった感じです。

今後もローカルAIを使った作品を作り続ける予定なのでよろしくお願いします。
