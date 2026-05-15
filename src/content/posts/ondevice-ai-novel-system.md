---
title: "ローカルAIだけで動く選択肢式ノベル生成システムを作った話"
published: 2026-05-15
draft: false
description: "オンデバイスAIでシミュレーションゲームを構築してみた話。Ollama + Stable Diffusionをフル活用してPCだけで動く選択肢式ビジュアルノベルを1週間弱で作りました。"
tags: ["Ollama", "LocalAI", "個人開発", "LLM", "StableDiffusion"]
category: プログラミング
lang: "ja"
---

どうも、orionnです。初投稿になります。

ローカルAIでシミュレーションゲームを構築してみた話です。

ClaudeなどのAIに直接「シミュレーションゲームをプレイしたいので展開して」とチャットを投げれば、普通に物語を始めてくれます。  
ただ、普段AIを触らない層の人にも、ボタンを選ぶだけでAI生成の物語を体験してもらえたら面白いのではないかと思い、今回の企画を始めました。

まだ現段階では、PCとブラウザ上で動くプロトタイプです。

## 作ったもの

PCだけで完結する、選択肢式ビジュアルノベルの自動生成システムを作りました。

- **テキスト生成**: Ollama + `qwen3:8b-nothink`
- **場面画像生成**: Python Diffusers + `nota-ai/bk-sdm-tiny`
- **サーバー**: Node.js（フレームワークなし）
- **UI**: ブラウザで動く HTML / CSS / JavaScript

ジャンルと世界観をボタンで選ぶと、物語が自動生成されます。  
選択肢もAIが生成するため、ユーザーは一切テキストを入力しません。

将来的な商用公開を想定し、ライセンス上の制限を確認しながらモデルを選定しています。

![](/images/ondevice-ai-novel/demo-scene.webp)

## システム構成

```text
ブラウザ（HTML / CSS / JavaScript）
  ↓ POST /api/generate
Node.js サーバー（server.mjs）
  ↓ Ollama API
qwen3:8b-nothink（テキスト生成）
  ↓ POST /api/image
Node.js サーバー
  ↓ Python サブプロセス
Diffusers + nota-ai/bk-sdm-tiny（画像生成）
```

## 実装で工夫した点

### 1. AIの出力をそのまま使わず、アプリ用に整形する

LLMの出力は、毎回きれいな形で返ってくるとは限りません。  
特にローカルLLMでは、本文の前に内部思考が混ざったり、画像生成に向かない文章が返ってきたりすることがあります。

そのため、AIの出力をそのまま画面に出すのではなく、アプリ側でいくつか整形処理を入れています。

たとえば、qwen3などの推論系モデルでは、出力の前に `<think>...</think>` のような内部思考が混ざることがあります。  
これをそのまま表示するとノベルとして破綻するため、表示前に除去しています。

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

また、物語本文と画像生成プロンプトでは、必要な文章の性質が違います。  
物語本文は日本語として自然である必要がありますが、画像生成では英語の短い視覚的な説明の方が安定します。

そこで、以下のような流れにしています。

```text
qwen3でストーリーを日本語生成
  ↓
出力から内部思考や不要な文章を除去
  ↓
qwen3に「このシーンを英語の画像プロンプトに変換して」と依頼
  ↓
変換結果をチェック
  ↓
問題なければbk-sdm-tinyに渡す
```

画像プロンプトについても、変換結果が短すぎたり、英語として成立していない場合はそのまま使わないようにしています。

```js
function isUsefulVisualPrompt(text) {
  const value = String(text ?? "").trim();
  if (value.length < 40) return false;

  const asciiLetters = value.match(/[A-Za-z]/g)?.length ?? 0;
  return asciiLetters >= 20;
}
```

変換に失敗した場合は、ストーリー本文やジャンル、世界観からフォールバック用のプロンプトを作るようにしています。

このように、LLMの出力をそのまま信じるのではなく、本文用・画像用・UI表示用に分けて整形することで、ローカルAIでもアプリとして破綻しにくくしています。

### 2. 物語用メモリと画像用メモリを分けて管理する

選択肢を進むたびに、AIには前回までの流れをある程度覚えてもらう必要があります。  
ただし、過去の本文をすべて毎回渡すとプロンプトが重くなり、生成も不安定になります。

そこで、物語を進めるための情報をいくつかのメモリに分けて管理しています。

たとえば、以下のような情報を内部的に保持しています。

- 前回までの出来事
- 主人公の状態
- 世界観やジャンル
- 昼夜や明るさ
- 主人公の外見
- 危険な選択をしたかどうか
- エンディングに近づいているかどうか

これらをそのまま画面に出すのではなく、次の生成時に必要な形へ整理してAIに渡しています。

特に画像生成では、主人公の外見や世界観、昼夜、暗さなどを別管理し、毎回の画像プロンプトに混ぜています。  
これにより、選択肢を進むたびに主人公の見た目や世界の雰囲気が大きく変わってしまう問題を抑えています。

```js
const sourcePrompt = [
  "Preserve the fixed protagonist appearance from Visual memory exactly.",
  "Do not change hair, clothing, age, or silhouette.",
  "Reflect the current genre, world setting, time of day, and lighting mood.",
  "Use the recent scene summary only as context, not as visible text.",
  // ...
].join("\n");
```

また、危険度のようなゲーム進行用の内部パラメータも持っています。  
これは画面には表示しませんが、危険な選択肢を選び続けるとバッドエンドに近づく、といった分岐制御に使っています。

このように、本文・画像・ゲーム進行で使う情報を分けて管理することで、毎回すべての文章を渡さなくても、ある程度一貫した物語を続けられるようにしています。

## ライセンス選定について

将来的に商用公開（広告モデル）も検討しているため、モデル選定ではライセンスを確認しました。

| モデル | 用途 | ライセンス | 商用利用 |
| --- | --- | --- | --- |
| `qwen3:8b` | テキスト生成 | Apache 2.0 | 可能 |
| `nota-ai/bk-sdm-tiny` | 画像生成 | CreativeML Open RAIL-M | 可能（制限条件あり） |

`nota-ai/bk-sdm-tiny` は商用利用自体は可能ですが、OpenRAIL系のライセンスなので禁止用途があります。  
商用公開前には、ライセンス本文と禁止用途を再確認する予定です。

また、過去には `DeepSeek Janus-Pro-7B` などの画像生成・マルチモーダル系モデルも検証しましたが、現構成では採用していません。

## 現状と課題

Android端末に入れることを想定して始めた企画ですが、現時点での最大の課題は容量です。

AI部分だけでも、おおよそ以下のサイズになります。

```text
qwen3:8b: 約5GB
bk-sdm-tiny: 約1GB
合計: 約6〜8GB
```

Google Playなどのモバイル配信を視野に入れると、この容量はかなり大きなハードルになります。

精度も残念ながら高くないです。

また、容量だけでなく生成時間も課題です。  
高スペックPCでも、テキスト生成と画像生成を毎ターン行うと待ち時間がそれなりに発生します。

今後、SLM（Small Language Model）の性能が上がり、3〜4B程度で現在の8Bに近い品質が出るようになれば、再度モバイル向けの公開を検討したいと思っています。

## 使用技術まとめ

- Node.js（フレームワークなし、標準API中心）
- Ollama + `qwen3:8b-nothink`
- Python + Diffusers + PyTorch
- `nota-ai/bk-sdm-tiny`
- HTML / CSS / Vanilla JavaScript

## おわりに

このプロジェクトは、CodexなどのAIコーディング支援を使って約1週間弱で形にできました。

コードの多くはAIに生成してもらいましたが、企画、モデル選定、ライセンス確認、生成結果の評価、UI調整、動作検証は自分で行っています。

今後もローカルAIを使った作品を作り続ける予定なので、よろしくお願いします。
