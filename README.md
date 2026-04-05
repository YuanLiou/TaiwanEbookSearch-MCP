# TaiwanEbookSearch MCP

<!-- TODO: 可以加上 npm version / license badge，例如：
[![npm version](https://img.shields.io/npm/v/taiwan-ebook-search-mcp)](https://www.npmjs.com/package/taiwan-ebook-search-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
-->

透過 Claude Desktop，直接用自然語言查詢各大台灣電子書平台的書籍價格，免開瀏覽器。

MCP Server for searching and comparing ebook prices across Taiwan bookstores.

<img width="800px" alt="Preview Image" src="https://github.com/user-attachments/assets/6a2ec289-e5cd-4203-8d36-eec04f1c0f3f" />

## Features

- **`search_ebooks`** — 搜尋書籍並比較各書城價格
- **`list_bookstores`** — 列出所有支援的電子書城及上線狀態
- **`get_search_result`** — 以 ID 取得過去的搜尋紀錄

## Requirements

- Node.js >= 18.0.0

## Setup

### Claude Desktop

編輯 Claude Desktop 設定檔：

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "taiwan-ebook-search": {
      "command": "npx",
      "args": ["-y", "taiwan-ebook-search-mcp"]
    }
  }
}
```

重啟 Claude Desktop 後即可使用。

## Tools

### `search_ebooks`

搜尋書籍並比價，回傳各書城結果。

| 參數 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `keywords` | `string` | ✅ | 搜尋關鍵字（書名、作者等） |
| `bookstores` | `string[]` | ❌ | 指定書城 ID，省略則搜尋全部上線書城 |
| `maxResultsPerBookstore` | `number` | ❌ | 每個書城最多回傳幾筆（預設 3） |

### `list_bookstores`

列出所有支援的電子書城及上線狀態，無需參數。

### `get_search_result`

以 ID 取得過去的搜尋紀錄。

| 參數 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `id` | `string` | ✅ | 搜尋紀錄 ID |
| `maxResultsPerBookstore` | `number` | ❌ | 每個書城最多回傳幾筆（預設 3） |

## Environment Variables

| 變數 | 說明 | 預設值 |
|---|---|---|
| `API_BASE_URL` | API 的 base URL | `https://ebook.yuer.tw` |
| `ALLOW_UNSAFE_API_BASE_URL` | 允許使用非預設的 `API_BASE_URL`（僅限本地開發） | `false` |

## Development

```bash
npm install
npm run build
npm test
```

本機測試方式：

```bash
npx @modelcontextprotocol/inspector node ./dist/index.js
```

<!-- TODO: 如果有想說明的架構或貢獻指南，可以在這裡補充 -->

## License

MIT
