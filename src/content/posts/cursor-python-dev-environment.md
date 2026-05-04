---
title: "Cursor + Python 開発環境構築について！"
published: 2026-03-18
updated: 2026-03-20
draft: false
description: "巷では、AIエディタが熱いようですね！ 備忘録もかねて開発環境を整えるための手順をまとめます。環境構築は順序を間違えるとぐじゃぐじゃになると思いますので参考にしてみてください。 ちなみに私はJupyter Noteboo [&helli"
image: "/images/wp-import/cursor-python-dev-environment/unnamed-2.jpg"
tags: ["Cursor","Python","開発環境","プログラミング"]
category: "プログラミング"
lang: "ja"
---
巷では、AIエディタが熱いようですね！

備忘録もかねて開発環境を整えるための手順をまとめます。
環境構築は順序を間違えるとぐじゃぐじゃになると思いますので参考にしてみてください。

ちなみに私はJupyter Notebookをつかっていて
Notebook無しだとコードが書けないへっぽこな為、
こちらの環境を構築するための手順となります。

AIに尋ねながらの構築であった為、ここは違うなどの部分もあるかもですが
ご了承の上お願いします！

## エディタ本体の入手：Cursor

[cursor.com](https://www.cursor.com/) にアクセスし、トップ画面の **「Download for Windows」** をクリックしてインストーラーを入手・実行します。

特に注意点的なのは・・・ないとおもいます！

ちなみにcursorは有料サブスクがあります
無料だとAIの使用回数に制限があるようです！
まずは無料で使ってみて満足できなかったら
有料版を検討してもいいかもですね！

## 言語の入手とインストール：Python

[python.org](https://www.python.org/downloads/windows/) から、Windows用インストーラーをダウンロードします。

downloads　→　download python install managerを選択してダウンロード

![](/images/wp-import/cursor-python-dev-environment/image-1024x411.png)

バージョンによって違いますが、python-manager-26.0.msixみたいなのが取得できますので
ダブルクリックでインストール開始
黒い画面が上がってきますので、全部【y】を入れちゃいましょう

特にPATHの部分は必須らしいので注意

> 注意： チェックを入れないと PC が Python の場所を認識できず、Cursor上でプログラムが動作しません。入れ忘れた場合は、一度アンインストールして最初からやり直すのが最も確実です。

![](/images/wp-import/cursor-python-dev-environment/image-1-1024x705.png)

### 【重要】なぜ Anaconda ではなく Python（公式）なのか

データ分析で一般的な Anaconda ではなく公式 Python を推奨する理由は、「軽量さと管理のシンプルさ」にあるそうです。

Anaconda は膨大なライブラリを内包するため動作が重くなりやすく、Cursorとのパス連携でトラブルが起きるケースがあるそうです。

公式 Python は最小限の構成で PC リソースを無駄にせず、環境構築の透明性が高いため、トラブル時の切り分けが容易とのこと！

まぁ実際のところはわかりませんが、ここはAIに従うことにします！

## 拡張機能の設定：Cursorの最適化

Cursor を開いたら、機能を拡張するためのプラグインを導入します。

画面右端のサイドバーにある、①「四角いブロックが組み合わさったアイコン」をクリック。
右のサイドバーが表示されていなければ②のサイドバーを表示させるボタンを押します

検索窓に Japanese と入力し、**「Japanese Language Pack」** をインストールします。
インストールが終わると、右下に「Change Language and Restart」のボタンが表示されるのでクリック
これで日本語化できます！
ボタンを押しそびれてもパレット（Ctrl + Shift + P）から display と入力して「表示言語を構成する」から変更可能です。

同様に Jupyter と検索し、Microsoft 公式の拡張機能をインストールします。

どちらも画像のものをインストールすればOKです

> 補足： Jupyter 拡張機能をインストールすると、関連する 「Python 拡張機能」も依存関係により自動的にインストールされます 。別途手動で入れる必要はありません。

![](/images/wp-import/cursor-python-dev-environment/image-2-966x1024.png)

## Jupyter Notebook の新規作成方法

環境が整ったら、対話的にコードを実行できる Notebook を作成します。

1. Ctrl + Shift + P を押してコマンドパレットを表示します。

2. 入力欄に Jupyter と入力し、リストから **「create: 新しい Jupyter ノートブックを作成」** を選択します。

3. .ipynb という形式の新しいファイルが開きます。

![](/images/wp-import/cursor-python-dev-environment/image-3-1024x164.png)

## カーネルの選択：Pythonの紐付け

作成した Notebook を動かすためには、使用する Python を指定する必要があります。

- **操作場所:** 画面の **「右上」** にある **「カーネルの選択」** という枠をクリックします。

- **選択手順:** 枠を押すと中央にリストがされるので、 その中からインストールした **「Python 〇.〇〇.〇〇」** をクリックして選択してください。 私はクリックしたとき「Python Environments…」が出てきました こちらがでたら選択することで**「Python 〇.〇〇.〇〇」** が表示されました ちなみに「Python Environments…」を押しても表示されない等の場合 一度cursorを再起動してみてください 私はこれで表示されました 最悪PC再起動してみるとかしてみた方がいいかもですね

> 重要： ここで正しいバージョンを選択しないと、コードを書いても実行ボタンが反応しません。

![](/images/wp-import/cursor-python-dev-environment/image-4-1024x268.png)

![](/images/wp-import/cursor-python-dev-environment/image-5-1024x252.png)

![](/images/wp-import/cursor-python-dev-environment/image-6-1024x136.png)

## まとめ

如何でしょうか？

こちらの手順が誰かのお役にたてればうれしいです

ではまた！
