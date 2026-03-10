import { describe, expect, it } from "vitest";
import { PREFECTURE_CODES, parseKkjXml } from "./kkjApi";

// ============================================================
// 都道府県コードのテスト
// ============================================================
describe("PREFECTURE_CODES", () => {
  it("47都道府県が定義されている", () => {
    expect(Object.keys(PREFECTURE_CODES).length).toBe(47);
  });

  it("東京都のコードが13である", () => {
    expect(PREFECTURE_CODES["13"]).toBe("東京都");
  });

  it("北海道のコードが01である", () => {
    expect(PREFECTURE_CODES["01"]).toBe("北海道");
  });

  it("沖縄県のコードが47である", () => {
    expect(PREFECTURE_CODES["47"]).toBe("沖縄県");
  });
});

// ============================================================
// XMLパースのテスト
// ============================================================
describe("parseKkjXml", () => {
  it("正常なXMLをパースできる", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Result>
  <Count>1</Count>
  <Data>
    <Item>
      <CFT_ID>TEST-001</CFT_ID>
      <Title>テスト入札案件</Title>
      <Organization_Name>東京都</Organization_Name>
      <Category>役務</Category>
      <CFT_Issue_Date>2026-03-01</CFT_Issue_Date>
      <Tender_Submission_Deadline>2026-03-31</Tender_Submission_Deadline>
      <URL>https://www.kkj.go.jp/test</URL>
    </Item>
  </Data>
</Result>`;

    const result = parseKkjXml(xml);
    expect(result.hits).toBe(1);
    expect(result.tenders).toHaveLength(1);
    // KkjTenderのkeyフィールドにexternalIdが格納される
    expect(result.tenders[0]?.key).toBe("TEST-001");
    expect(result.tenders[0]?.projectName).toBe("テスト入札案件");
    expect(result.tenders[0]?.category).toBe("役務");
  });

  it("空のXMLを処理できる", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Result>
  <Count>0</Count>
  <Data></Data>
</Result>`;

    const result = parseKkjXml(xml);
    expect(result.hits).toBe(0);
    expect(result.tenders).toHaveLength(0);
  });

  it("不正なXML（タグなし）は空配列を返す", () => {
    const result = parseKkjXml("not xml at all");
    // タグがない場合はエラーなしで空配列を返す（エラーはオプショナル）
    expect(result.tenders).toHaveLength(0);
    expect(result.hits).toBe(0);
  });

  it("カテゴリを正規化する（1→物品、2→工事、3→役務）", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Result>
  <Count>3</Count>
  <Data>
    <Item>
      <CFT_ID>ID-001</CFT_ID>
      <Title>物品テスト</Title>
      <Organization_Name>大阪府</Organization_Name>
      <Category>1</Category>
      <CFT_Issue_Date>2026-03-01</CFT_Issue_Date>
    </Item>
    <Item>
      <CFT_ID>ID-002</CFT_ID>
      <Title>工事テスト</Title>
      <Organization_Name>大阪府</Organization_Name>
      <Category>2</Category>
      <CFT_Issue_Date>2026-03-01</CFT_Issue_Date>
    </Item>
    <Item>
      <CFT_ID>ID-003</CFT_ID>
      <Title>役務テスト</Title>
      <Organization_Name>大阪府</Organization_Name>
      <Category>3</Category>
      <CFT_Issue_Date>2026-03-01</CFT_Issue_Date>
    </Item>
  </Data>
</Result>`;

    const result = parseKkjXml(xml);
    expect(result.tenders[0]?.category).toBe("物品");
    expect(result.tenders[1]?.category).toBe("工事");
    expect(result.tenders[2]?.category).toBe("役務");
  });
});

// ============================================================
// tRPCルーターのテスト
// ============================================================
describe("tenders router", () => {
  it("prefecturesクエリが都道府県一覧を返す", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({
      user: null,
      req: {} as Parameters<typeof appRouter.createCaller>[0]["req"],
      res: {} as Parameters<typeof appRouter.createCaller>[0]["res"],
    });

    const prefectures = await caller.tenders.prefectures();
    expect(prefectures.length).toBe(47);
    const tokyo = prefectures.find(p => p.code === "13");
    expect(tokyo?.name).toBe("東京都");
  });
});
