# studio orionn blog

**blog.studio-orionn.com** — プログラミング・ガジェット・サブスク・旅について書くブログ。  
[Astro](https://astro.build/) + [Fuwari](https://github.com/saicaca/fuwari) テーマをベースに構築。

---

## ローカル開発

### 必要なもの

- [Node.js](https://nodejs.org/) v22 以上
- [pnpm](https://pnpm.io/) v9 以上

```bash
# pnpm が未インストールの場合
npm install -g pnpm
```

### 起動手順

```bash
# 依存パッケージをインストール
pnpm install

# 開発サーバーを起動（http://localhost:4321）
pnpm dev
```

### ビルド確認

```bash
pnpm build       # dist/ に静的ファイルを出力
pnpm preview     # ビルド結果をローカルでプレビュー
```

---

## 新しい記事の追加方法

### スクリプトで作成（推奨）

```bash
pnpm new-post my-article-slug
```

`src/content/posts/my-article-slug.md` が生成されます。

### フロントマター仕様

```yaml
---
title: "記事タイトル"
published: 2026-05-01          # 公開日（必須）
description: "記事の概要"        # OGP や一覧に使われる
image: ""                       # カバー画像のパス（省略可）
tags: ["タグ1", "タグ2"]         # 複数指定可
category: programming           # 下記4つのいずれか（必須）
draft: false                    # true にすると本番ビルドで除外
---
```

### カテゴリ一覧

| フロントマター値 | URL | 表示名 |
|---------------|-----|--------|
| `programming` | `/programming/` | プログラミング |
| `gadget` | `/gadget/` | ガジェット |
| `subscription` | `/subscription/` | サブスク |
| `travel` | `/travel/` | 旅 |

カテゴリを追加したい場合は [`src/constants/categories.ts`](src/constants/categories.ts) を編集し、  
対応するページファイル `src/pages/<slug>/[...page].astro` を作成してください。

---

## Firebase プロジェクトの初期設定

### 1. Firebase CLI のインストール

```bash
npm install -g firebase-tools
firebase login
```

### 2. Firebase プロジェクトの作成

[Firebase Console](https://console.firebase.google.com/) で新しいプロジェクトを作成します。

- プロジェクト ID: `studio-orionn-blog`（`.firebaserc` と一致させる）
- Hosting を有効化

### 3. `.firebaserc` の確認・修正

```json
{
  "projects": {
    "default": "studio-orionn-blog"
  }
}
```

プロジェクト ID が異なる場合は上記を実際の ID に変更してください。

### 4. ローカルからの手動デプロイ（任意）

```bash
pnpm build
firebase deploy --only hosting
```

---

## GitHub Secrets の登録

### FIREBASE_SERVICE_ACCOUNT の作成方法

1. [Firebase Console](https://console.firebase.google.com/) → プロジェクト設定 → サービスアカウント
2. 「新しい秘密鍵の生成」をクリック → JSON ファイルをダウンロード
3. ダウンロードした JSON の**中身全体**をコピー

### GitHub リポジトリへの登録手順

1. GitHub リポジトリ → Settings → Secrets and variables → Actions
2. 「New repository secret」をクリック
3. 以下を設定：

| Name | Value |
|------|-------|
| `FIREBASE_SERVICE_ACCOUNT` | 手順3でコピーした JSON 全体 |

---

## CI/CD の動作

| トリガー | ワークフロー | デプロイ先 |
|---------|------------|----------|
| `main` ブランチへの push | [deploy.yml](.github/workflows/deploy.yml) | 本番（live チャンネル） |
| PR 作成 / 更新 | [preview.yml](.github/workflows/preview.yml) | プレビューチャンネル（自動 URL 生成） |

プレビュー URL は PR のコメントに自動投稿されます。

---

## カスタムドメインの設定

### Firebase Hosting でのカスタムドメイン設定

1. [Firebase Console](https://console.firebase.google.com/) → Hosting → 「カスタムドメインを追加」
2. `blog.studio-orionn.com` を入力
3. Firebase が提示する DNS レコード（A レコードまたは CNAME）をドメイン管理画面に追加
4. SSL 証明書は Firebase が自動発行・更新

### DNS レコードの設定例

Firebase Console の画面に表示される IP アドレスや CNAME 値を使って設定します。

```
タイプ: A
ホスト: blog
値: （Firebase Console に表示される IP アドレス）
TTL: 3600
```

反映には最大 24 時間かかることがあります。

---

## サイト設定の変更

主な設定は [`src/config.ts`](src/config.ts) で行います。

```typescript
export const siteConfig = {
  title: "studio orionn",       // サイト名
  subtitle: "...",              // サブタイトル
  lang: "ja",                   // 言語コード
  themeColor: { hue: 240 },    // デフォルトテーマカラー（0〜360）
};

export const profileConfig = {
  name: "orionn",               // プロフィール名
  bio: "...",                   // 自己紹介文
  links: [                      // SNS リンク
    { name: "GitHub", icon: "fa6-brands:github", url: "..." },
  ],
};
```

---

## ディレクトリ構成

```
src/
├── config.ts                  # サイト設定
├── constants/
│   └── categories.ts          # カテゴリ定義（スラッグ・色・アイコン）
├── content/
│   └── posts/                 # 記事 Markdown ファイル
├── pages/
│   ├── [...page].astro        # トップページ（ページネーション）
│   ├── programming/           # カテゴリページ
│   ├── gadget/
│   ├── subscription/
│   ├── travel/
│   ├── posts/[...slug].astro  # 記事詳細ページ
│   ├── archive.astro          # アーカイブページ
│   ├── about.astro            # About ページ
│   └── 404.astro              # 404 ページ
└── components/
    └── CategoryHeader.astro   # カテゴリヘッダーコンポーネント
```

---

## OGP デフォルト画像の変更

`public/og-default.svg` を任意の画像（推奨: 1200×630px の PNG/JPG）に差し替えてください。  
差し替えた場合、`src/layouts/Layout.astro` の `og:image` パスも合わせて変更してください。

---

Powered by [Fuwari](https://github.com/saicaca/fuwari) / [Astro](https://astro.build/)
