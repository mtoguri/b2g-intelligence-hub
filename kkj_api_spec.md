# 官公需情報ポータルサイト 検索API仕様

## エンドポイント
- URL: `http://www.kkj.go.jp/api/`
- メソッド: GET または POST（混在不可）
- レスポンス形式: XML

## パラメータ一覧
| パラメータ名 | 形式 | 備考 |
|---|---|---|
| Query | 文字列 | 検索文字列（必須）|
| Project_Name | 文字列 | 件名で絞り込み（前後方一致）|
| Organization_Name | 文字列 | 機関名で検索（前後方一致）|
| Count | 数値 | 最大件数（デフォルト10、最大1000）|
| LG_Code | 数値[,数値...] | 都道府県コード（JIS X0401）複数可（半角カンマ区切り）|
| Category | 数値 | カテゴリー: 1=物品, 2=工事, 3=役務 |
| Procedure_Type | 数値 | 公示種別: 1=競争入札, 2=簡易公募型指名競争入札, 3=簡易公募型指名競争入札 |
| Certification | 英字 | 入札資格: A/B/C/D（複数可、半角カンマ区切り）|
| CFT_Issue_Date | 期間 | 公告日またはデータ取得日で絞り込み |
| Tender_Submission_Deadline | 期間 | 入札開始日で絞り込み |
| Opening_Tenders_Event | 期間 | 開札日で絞り込み |
| Period_End_Time | 期間 | 納入期限日で絞り込み |

## 必須条件
- Query, Project_Name, Organization_Name, LG_Code のいずれか一つは必須
- 複数指定した場合はAND条件

## 注意事項
- 認証不要（APIキー不要）
- HTTPのみ（HTTPSなし）→ バックエンドプロキシ経由で呼び出す必要あり
- レスポンスはXML形式 → サーバー側でJSONに変換して返す
- 文字列にASCII以外を含む場合はUTF-8で指定
