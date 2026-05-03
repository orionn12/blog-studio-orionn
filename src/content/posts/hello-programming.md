---
title: "はじめてのAstroブログ構築メモ"
published: 2026-05-01
description: "AstroとFuwariテーマを使ってブログを構築した際の手順と注意点をまとめました。"
image: ""
tags: ["Astro", "ブログ", "フロントエンド"]
category: プログラミング
draft: false
---

## きっかけ

静的サイトジェネレーターを色々と試す中で、**Astro** の設計思想がとても気に入りました。  
特に「必要なときだけ JavaScript を送る」という Island Architecture は、ブログのような読み物サイトに最適です。

## Fuwari テーマを選んだ理由

- シンプルで読みやすいレイアウト
- ダークモード対応が標準搭載
- Svelte × Astro のハイブリッド構成で高速
- タグ・カテゴリ管理が柔軟

## セットアップ手順

```bash
pnpm create astro@latest . --template saicaca/fuwari
pnpm install
pnpm dev
```

`src/config.ts` を編集してサイト名や自己紹介を変更するだけで、すぐに自分のブログになります。

## カテゴリ機能の追加

Fuwari はデフォルトでカテゴリをアーカイブページのクエリパラメータで管理していますが、  
このブログでは `/programming/` のような独立した URL パスで運用できるように拡張しました。

```typescript
// src/constants/categories.ts
export const CATEGORIES = {
  programming: { label: "プログラミング", icon: "fa6-solid:code", hue: 220 },
  // ...
} as const;
```

## まとめ

Astro + Fuwari は、ブログを始めるのに非常におすすめな構成です。  
このブログもこの構成で動いています。
