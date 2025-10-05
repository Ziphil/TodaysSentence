<div align="center">
<h1>「今日の○○語」画像生成スクリプト</h1>
</div>


## 概要
Twitter (現 X) で行っている「[今日のシャレイア語](https://x.com/search?q=%23%E4%BB%8A%E6%97%A5%E3%81%AE%E3%82%B7%E3%83%A3%E3%83%AC%E3%82%A4%E3%82%A2%E8%AA%9E&f=live)」という企画で使用している画像を生成するスクリプトです。

## 使い方
諸々の環境を整えた後で、以下を実行してください。

```bash
npm run start -- -l (言語名) -o (向き) -i (インデックス)
```

- 言語名 — `shaleian` or `fennese`
- 向き — `landscape` or `portrait`
- インデックス — 数字 (0 始まり) or `last` or `all`
  - スペース区切りで複数個を指定可能