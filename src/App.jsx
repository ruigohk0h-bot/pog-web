import { useState } from "react";

// ============================================================
// POG砂遊び 統合アプリ
// ランキング / 最新結果 / 殿堂DB の3タブ
// ============================================================

const G = {
  // 砂遊びカラー（JRA緑ベース）
  green:     "#0a7a5c",
  greenDark: "#076449",
  dirt:      "#b06a2c",
  dirtLight: "#e8c99a",
  dirtDark:  "#7a4a1e",
  gold:      "#c9a227",
  silver:    "#9aa0a6",
  bronze:    "#cd7f32",
  // 殿堂テーマ
  hallBg:    "#1a1208",
  hallCard:  "#231a0e",
  hallBorder:"#3d2e18",
  hallText:  "#f0e6d3",
  hallDim:   "#9a8a76",
  // グレード
  gi:    "#c0392b",
  g2:    "#8e44ad",
  g3:    "#2471a3",
  local: "#6b5b95",
};

// ================================================================
// マスターデータ
// ================================================================

const PLAYERS = [
  { id:"P01", name:"前田厩舎",   emoji:"🏇" },
  { id:"P02", name:"川村厩舎",   emoji:"🐎" },
  { id:"P03", name:"長谷部厩舎", emoji:"🏆" },
  { id:"P04", name:"ミリオン厩舎",emoji:"💰" },
  { id:"P05", name:"田崎厩舎",   emoji:"⚡" },
  { id:"P06", name:"涼子厩舎",   emoji:"🌸" },
  { id:"P07", name:"成田厩舎",   emoji:"🎯" },
];

const CURRENT_SEASON = {
  id: "2025-26",
  label: "砂遊び 2025-26",
  period: "2025/06/07 〜 2026/06/12",
  group_num: "0601142541",
  users: [
    { id:"P03", user_num:380045, pt:19474, diff:0,     comment:"10000ポイントいった(>_<)" },
    { id:"P05", user_num:380048, pt:16154, diff:12240, comment:"芝走ってる場合じゃねぇ！" },
    { id:"P06", user_num:380050, pt:14493, diff:210,   comment:"" },
    { id:"P07", user_num:380051, pt:7590,  diff:4100,  comment:"" },
    { id:"P02", user_num:380044, pt:7251,  diff:0,     comment:"" },
    { id:"P01", user_num:380046, pt:6673,  diff:240,   comment:"" },
    { id:"P04", user_num:380049, pt:5098,  diff:0,     comment:"" },
  ],
};

// 前田厩舎（P01）
const HORSES_P01 = [
  { no:11, name:"クラッチスラッガー", record:"1-1-0-3", pt:999,  active:false, sire:"キズナ",           dam:"レンブランサ" },
  { no:2,  name:"キンダーブンシュ",   record:"1-0-1-4", pt:941,  active:true,  sire:"モーリス",         dam:"グリューヴァイン" },
  { no:12, name:"ゲタリア",           record:"1-1-0-1", pt:830,  active:true,  sire:"クリソベリル",     dam:"リップスポイズン" },
  { no:1,  name:"インシオン",         record:"1-0-1-3", pt:775,  active:false, sire:"ドレフォン",       dam:"ブラウドスペル" },
  { no:3,  name:"ウンナターシャ",     record:"0-2-0-4", pt:759,  active:true,  sire:"パイロ",           dam:"インディアマントゥアナ" },
  { no:8,  name:"サントマーレ",       record:"1-0-1-1", pt:730,  active:false, sire:"ロードカナロア",   dam:"リミニ" },
  { no:9,  name:"セヴェロ",           record:"1-0-0-2", pt:670,  active:false, sire:"サトノダイヤモンド",dam:"クインアマランサス" },
  { no:7,  name:"キセログラフィカ",   record:"0-0-4-2", pt:640,  active:true,  sire:"ナダル",           dam:"バニーテール" },
  { no:10, name:"スマイルガーデン",   record:"0-0-3-4", pt:430,  active:false, sire:"ナダル",           dam:"スマイルシャワー" },
  { no:4,  name:"ワンモメンタム",     record:"1-0-0-3", pt:360,  active:false, sire:"ルヴァンスレーヴ", dam:"ワンプレスアウェイ" },
  { no:6,  name:"ネイティヴプライド", record:"0-0-1-5", pt:209,  active:true,  sire:"クリソベリル",     dam:"ビキニブロンド" },
  { no:5,  name:"ブロンザイト",       record:"0-0-0-3", pt:0,    active:true,  sire:"クリソベリル",     dam:"クルークハイト" },
];

// 川村厩舎（P02）
const HORSES_P02 = [
  { no:5,  name:"アニマレイ",        record:"0-5-3-3", pt:1778, active:false, sire:"ニューイヤーズデイ",     dam:"ガルデルスリール" },
  { no:3,  name:"リベッチオ",        record:"2-0-0-2", pt:1380, active:true,  sire:"ルヴァンスレーヴ",       dam:"スープレット" },
  { no:6,  name:"サンラザール",      record:"1-1-0-2", pt:1242, active:false, sire:"クリソベリル",           dam:"バールデュー" },
  { no:7,  name:"アローメタル",      record:"1-1-0-0", pt:1210, active:false, sire:"キズナ",                 dam:"ミスペジル" },
  { no:8,  name:"ブームバップビート", record:"1-0-2-2", pt:992,  active:false, sire:"Into Mischief",          dam:"Point of Honor" },
  { no:10, name:"ハイライトニング",  record:"1-0-0-6", pt:700,  active:false, sire:"リアルスティール",       dam:"マニクール" },
  { no:4,  name:"パドゼフィール",    record:"1-0-0-4", pt:646,  active:false, sire:"ルヴァンスレーヴ",       dam:"ソロダンサー" },
  { no:9,  name:"ダンジョンヒーロー", record:"1-0-0-4", pt:225,  active:false, sire:"バンブーエール",         dam:"タマモキラメキ" },
  { no:2,  name:"アリハム",          record:"0-0-0-2", pt:98,   active:true,  sire:"ナダル",                 dam:"ジルダ" },
  { no:1,  name:"グラムエッジ",      record:"0-0-0-3", pt:0,    active:false, sire:"ナダル",                 dam:"ランズエッジ" },
  { no:11, name:"ウェンロック",      record:"0-0-0-0", pt:0,    active:false, sire:"アメリカンペイトリオット",dam:"サマリーズ" },
  { no:12, name:"ヒットホーム",      record:"0-0-0-0", pt:0,    active:false, sire:"American Pharoah",       dam:"Amour Briller" },
];

// 長谷部厩舎（P03）
const HORSES_P03 = [
  { no:9,  name:"フィンガー",        record:"3-4-0-0", pt:10780, active:true,  sire:"", dam:"" },
  { no:6,  name:"チュウワカーネギー", record:"2-1-0-4", pt:2764,  active:false, sire:"", dam:"" },
  { no:3,  name:"ヘリテージブルーム", record:"2-2-3-1", pt:2540,  active:false, sire:"", dam:"" },
  { no:11, name:"ゴールドバローズ",  record:"1-2-0-1", pt:1180,  active:false, sire:"", dam:"" },
  { no:1,  name:"エクストラプッシュ", record:"1-1-0-7", pt:1087,  active:false, sire:"", dam:"" },
  { no:7,  name:"エコロボルト",      record:"1-1-0-3", pt:889,   active:true,  sire:"", dam:"" },
  { no:4,  name:"エジプシャンマウ",  record:"1-0-0-0", pt:750,   active:true,  sire:"", dam:"" },
  { no:12, name:"アメリカンコール",  record:"1-0-0-1", pt:750,   active:false, sire:"", dam:"" },
  { no:2,  name:"セスティーナ",      record:"0-1-1-1", pt:430,   active:true,  sire:"", dam:"" },
  { no:8,  name:"ゲレイロ",          record:"0-0-0-7", pt:148,   active:false, sire:"", dam:"" },
  { no:5,  name:"サンライズメジェド", record:"0-0-0-0", pt:0,     active:true,  sire:"", dam:"" },
  { no:10, name:"ワンインザスカイ",  record:"0-0-0-5", pt:0,     active:true,  sire:"", dam:"" },
];

// ミリオン厩舎（P04）
const HORSES_P04 = [
  { no:6,  name:"アルデトップガン",   record:"2-0-0-5", pt:2740, active:false, sire:"ナダル",           dam:"フクシア" },
  { no:7,  name:"クラウトロック",     record:"2-0-0-0", pt:1570, active:false, sire:"ナダル",           dam:"スミレ" },
  { no:9,  name:"アクアアイ",         record:"0-2-2-1", pt:909,  active:true,  sire:"ドレフォン",       dam:"アドマイヤセプター" },
  { no:1,  name:"ペトリコール",       record:"1-1-0-1", pt:850,  active:true,  sire:"Justify",          dam:"ナイセスト" },
  { no:10, name:"マルシュボヌール",   record:"0-0-1-3", pt:349,  active:false, sire:"ドレフォン",       dam:"マルシュロレーヌ" },
  { no:5,  name:"フィデリス",         record:"0-1-0-5", pt:329,  active:true,  sire:"オルフェーヴル",   dam:"スイ" },
  { no:8,  name:"アンビエントポップ", record:"0-1-0-1", pt:240,  active:true,  sire:"ヴァンゴッホ",     dam:"フナウタ" },
  { no:2,  name:"ホウオウファラオ",   record:"0-0-0-4", pt:0,    active:true,  sire:"American Pharoah", dam:"マールボロロード" },
  { no:3,  name:"メイショウバンサン", record:"0-0-0-2", pt:0,    active:false, sire:"ドレフォン",       dam:"シニスタークイーン" },
  { no:4,  name:"ヤマニンコルザ",     record:"0-0-0-1", pt:0,    active:true,  sire:"リオンディーズ",   dam:"ヤマニンチガトー" },
  { no:11, name:"エコロデュラン",     record:"0-0-0-3", pt:0,    active:true,  sire:"Caravaggio",       dam:"クイーンリス" },
  { no:12, name:"（未登録）",         record:"0-0-0-0", pt:0,    active:false, sire:"",                 dam:"" },
];

// 田崎厩舎（P05）
const HORSES_P05 = [
  { no:4,  name:"パントルナイーフ",   record:"2-1-0-1", pt:16660, active:true,  sire:"", dam:"" },
  { no:7,  name:"アドマイヤクワッズ", record:"2-0-3-1", pt:11050, active:false, sire:"", dam:"" },
  { no:2,  name:"サトノボヤージュ",   record:"4-1-1-0", pt:8570,  active:false, sire:"", dam:"" },
  { no:12, name:"テーオーグレーザー", record:"2-2-2-1", pt:2980,  active:true,  sire:"", dam:"" },
  { no:1,  name:"カットソロ",         record:"1-1-2-1", pt:1290,  active:false, sire:"", dam:"" },
  { no:3,  name:"ジャスティンダラス", record:"1-1-0-1", pt:860,   active:false, sire:"", dam:"" },
  { no:10, name:"フリーガー",         record:"1-0-0-2", pt:750,   active:false, sire:"", dam:"" },
  { no:9,  name:"エコログロウ",       record:"1-0-1-2", pt:740,   active:false, sire:"", dam:"" },
  { no:8,  name:"ミリオンヴォイス",   record:"1-0-0-1", pt:655,   active:true,  sire:"", dam:"" },
  { no:11, name:"ゾネブルーム",       record:"0-0-2-1", pt:300,   active:true,  sire:"", dam:"" },
  { no:6,  name:"ローズスマッシュ",   record:"0-0-0-1", pt:240,   active:true,  sire:"", dam:"" },
  { no:5,  name:"レッドフレーザー",   record:"0-0-0-4", pt:59,    active:false, sire:"", dam:"" },
];

// 涼子厩舎（P06）
const HORSES_P06 = [
  { no:10, name:"ロックターミガン",   record:"3-1-0-2", pt:7690, active:true,  sire:"シスキン",           dam:"リリカルホワイト" },
  { no:2,  name:"トリグラフヒル",     record:"2-1-0-1", pt:2220, active:false, sire:"ナダル",             dam:"トリプライト" },
  { no:8,  name:"キッコベッロ",       record:"1-2-0-2", pt:2060, active:false, sire:"Study of Man",       dam:"アマダブラム" },
  { no:1,  name:"イナズマダイモン",   record:"1-5-0-1", pt:1910, active:false, sire:"クリソベリル",       dam:"バリスビキニ" },
  { no:3,  name:"ペルセア",           record:"2-0-0-0", pt:1860, active:false, sire:"ドレフォン",         dam:"テルモードーサ" },
  { no:11, name:"ムスクレスト",       record:"1-0-1-3", pt:1099, active:true,  sire:"コントレイル",       dam:"ノイーヴァ" },
  { no:5,  name:"リアライズタキオン", record:"1-1-0-6", pt:969,  active:true,  sire:"ルヴァンスレーヴ",   dam:"タイムハンドラー" },
  { no:6,  name:"バートラガッツ",     record:"1-0-0-0", pt:750,  active:false, sire:"リアルスティール",   dam:"ロッテンマイヤー" },
  { no:9,  name:"ライトフライヤー",   record:"0-0-0-3", pt:84,   active:false, sire:"コントレイル",       dam:"ドリームオブジェニー" },
  { no:4,  name:"（未登録）",         record:"0-0-0-0", pt:0,    active:false, sire:"",                   dam:"" },
  { no:7,  name:"フローズンブーケ",   record:"0-0-0-2", pt:0,    active:true,  sire:"Frosted",            dam:"Floral Hall" },
  { no:12, name:"ブルースプレイヤー", record:"0-0-0-5", pt:0,    active:true,  sire:"マインドユアビスケッツ",dam:"ジェラテリアバール" },
];

// 成田厩舎（P07）
const HORSES_P07 = [
  { no:11, name:"デアヴェローチェ",   record:"2-1-1-2", pt:6880, active:true,  sire:"マテラスカイ",       dam:"ミニーアイル" },
  { no:4,  name:"アーガイルショア",   record:"1-2-2-2", pt:1399, active:true,  sire:"ナダル",             dam:"ペルブラージュ" },
  { no:1,  name:"アルカディアカフェ", record:"1-1-1-1", pt:1260, active:false, sire:"Into Mischief",      dam:"Mary's Follies" },
  { no:12, name:"ホットシート",       record:"1-1-0-1", pt:980,  active:false, sire:"ディスクリートキャット",dam:"ホットミスト" },
  { no:3,  name:"ミティリーニ",       record:"1-1-0-3", pt:974,  active:true,  sire:"Tapit",              dam:"ミッドナイトビズー" },
  { no:9,  name:"リーグナイト",       record:"1-1-0-2", pt:946,  active:false, sire:"キズナ",             dam:"サリエル" },
  { no:2,  name:"ホウオウストライク", record:"1-0-1-2", pt:836,  active:false, sire:"Good Magic",         dam:"Nightlife Baby" },
  { no:8,  name:"リュウカルネ",       record:"1-0-0-1", pt:750,  active:true,  sire:"ドレフォン",         dam:"ゴールドチェイス" },
  { no:6,  name:"アイデアユー",       record:"0-1-2-2", pt:649,  active:true,  sire:"シニスターミニスター",dam:"サンレーン" },
  { no:5,  name:"メイショウコシュウ", record:"0-1-1-1", pt:370,  active:false, sire:"ナダル",             dam:"メイショウササユリ" },
  { no:7,  name:"アイランド",         record:"0-0-0-0", pt:0,    active:true,  sire:"シニスターミニスター",dam:"インキャンドル" },
  { no:10, name:"ジュピターバローズ", record:"0-0-0-0", pt:0,    active:true,  sire:"ドレフォン",         dam:"キャレモンショコラ" },
];

const HORSES_BY_PLAYER = {
  P01: HORSES_P01,
  P02: HORSES_P02,
  P03: HORSES_P03,
  P04: HORSES_P04,
  P05: HORSES_P05,
  P06: HORSES_P06,
  P07: HORSES_P07,
};
const getHorses = (pid) => HORSES_BY_PLAYER[pid] ?? [];

// 最新結果
const RESULTS = [
  { date:"05/31", venue:"船橋11R", grade:"GⅡ", local:true,  race:"東京湾盃",      surface:"dirt", dist:2400, horse:"パントルナイーフ",   order:2,  rawPt:12000, player:"P05" },
  { date:"05/31", venue:"東京11R", grade:"",    local:false, race:"むらさきステークス", surface:"turf", dist:1800, horse:"ヴェスクライスト",   order:5,  rawPt:210,   player:"P06" },
  { date:"05/31", venue:"東京01R", grade:"",    local:false, race:"３歳未勝利",    surface:"dirt", dist:1800, horse:"ウンナターシャ",     order:2,  rawPt:240,   player:"P01" },
  { date:"05/31", venue:"東京01R", grade:"",    local:false, race:"３歳未勝利",    surface:"dirt", dist:1800, horse:"ラインザスカイ",     order:8,  rawPt:0,     player:"P03" },
  { date:"05/31", venue:"京都03R", grade:"",    local:false, race:"３歳未勝利",    surface:"dirt", dist:1600, horse:"ローズスマッシュ",   order:2,  rawPt:240,   player:"P05" },
  { date:"05/31", venue:"東京06R", grade:"",    local:false, race:"500万円以下",   surface:"dirt", dist:1400, horse:"エコロボルト",       order:12, rawPt:0,     player:"P03" },
  { date:"05/30", venue:"浦和01R", grade:"",    local:true,  race:"３歳未勝利",    surface:"dirt", dist:1400, horse:"ジュピターバローズ", order:10, rawPt:0,     player:"P07" },
  { date:"05/30", venue:"東京11R", grade:"GⅢ", local:false, race:"葵ステークス",  surface:"turf", dist:1200, horse:"デアヴェローチェ",   order:1,  rawPt:4100,  player:"P07" },
];
const UPCOMING = [
  { date:"06/07", venue:"京都12R", grade:"重賞", local:false, race:"東海賞", surface:"dirt", dist:1600, horse:"メベッチオ", player:"P02" },
];

// 殿堂データ
const SEASONS_ALL = [
  { id:"2022-23", label:"2022-23", period:"2022/06/01〜2023/07/17",
    results:[
      {player:"P01",rank:1,pt:9645},{player:"P02",rank:2,pt:8492},
      {player:"P03",rank:3,pt:7925},{player:"P04",rank:4,pt:6013},
      {player:"P05",rank:5,pt:5888},
    ]},
  { id:"2023-24", label:"2023-24", period:"2023/06/01〜2024/05/31",
    results:[
      {player:"P02",rank:1,pt:10017},{player:"P01",rank:2,pt:7762},
      {player:"P04",rank:3,pt:6099},{player:"P07",rank:4,pt:5724},
      {player:"P05",rank:5,pt:5678},{player:"P03",rank:6,pt:3473},
    ]},
  { id:"2024-25", label:"2024-25", period:"2024/06/01〜2025/06/12",
    results:[
      {player:"P01",rank:1,pt:20506},{player:"P04",rank:2,pt:12400},
      {player:"P05",rank:3,pt:12330},{player:"P02",rank:4,pt:7991},
      {player:"P03",rank:5,pt:6649},{player:"P07",rank:6,pt:6182},
    ]},
  { id:"2025-26", label:"2025-26（進行中）", period:"2025/06/07〜",
    results:[
      {player:"P03",rank:1,pt:19474},{player:"P05",rank:2,pt:16154},
      {player:"P06",rank:3,pt:14493},{player:"P07",rank:4,pt:7590},
      {player:"P02",rank:5,pt:7251},{player:"P01",rank:6,pt:6673},
      {player:"P04",rank:7,pt:5098},
    ]},
];

// ================================================================
// トロフィーデータ（scrape_trophies_v2.py で生成）
// ================================================================
const TROPHIES = [
  { season:"2025-26", player:"P03", grade:"JpnI",   race:"羽田盃競走",           horse:"フィンガー",       order:1, date:"2026/04/29" },
  { season:"2025-26", player:"P03", grade:"JpnII",  race:"京浜盃競走",           horse:"フィンガー",       order:2, date:"2026/03/25" },
  { season:"2025-26", player:"P03", grade:"JpnIII", race:"ブルーバードC",        horse:"フィンガー",       order:1, date:"2026/01/21" },
  { season:"2025-26", player:"P05", grade:"JpnII",  race:"兵庫チャンピオンシッ", horse:"サトノボヤージュ", order:1, date:"2026/05/06" },
  { season:"2025-26", player:"P05", grade:"GIII",   race:"サウジダービー",        horse:"サトノボヤージュ", order:3, date:"2026/02/14" },
  { season:"2025-26", player:"P06", grade:"JpnI",   race:"羽田盃競走",           horse:"ロックターミガン", order:2, date:"2026/04/29" },
  { season:"2025-26", player:"P06", grade:"JpnII",  race:"京浜盃競走",           horse:"ロックターミガン", order:1, date:"2026/03/25" },
  { season:"2025-26", player:"P06", grade:"JpnIII", race:"雲取賞競走",           horse:"トリグラフヒル",   order:2, date:"2026/02/18" },
  { season:"2024-25", player:"P01", grade:"JpnI",   race:"東京ダービー競走",     horse:"クレーキング",     order:2, date:"2025/06/11" },
  { season:"2024-25", player:"P01", grade:"GIII",   race:"ユニコーンS",          horse:"クレーキング",     order:2, date:"2025/05/03" },
  { season:"2024-25", player:"P01", grade:"JpnI",   race:"羽田盃競走",           horse:"ジャナドリア",     order:3, date:"2025/04/29" },
  { season:"2024-25", player:"P01", grade:"JpnIII", race:"雲取賞競走",           horse:"ジャナドリア",     order:1, date:"2025/02/19" },
  { season:"2024-25", player:"P01", grade:"JpnIII", race:"雲取賞競走",           horse:"グランジョルノ",   order:2, date:"2025/02/19" },
  { season:"2024-25", player:"P01", grade:"JpnIII", race:"JBC2歳優駿",           horse:"グランジョルノ",   order:2, date:"2024/11/04" },
  { season:"2024-25", player:"P04", grade:"GIII",   race:"武蔵野S",              horse:"ルクソールカフェ", order:1, date:"2025/11/15" },
  { season:"2024-25", player:"P04", grade:"JpnI",   race:"ジャパンダートクラシ", horse:"ルクソールカフェ", order:3, date:"2025/10/08" },
  { season:"2024-25", player:"P04", grade:"JpnIII", race:"兵庫女王盃",           horse:"(確認中)",         order:2, date:"2026/04/01" },
  { season:"2024-25", player:"P04", grade:"JpnIII", race:"マリーンC",            horse:"(確認中)",         order:3, date:"2025/10/02" },
  { season:"2024-25", player:"P05", grade:"GIII",   race:"ユニコーンS",          horse:"パントルナイーフ", order:1, date:"2025/05/03" },
  { season:"2024-25", player:"P03", grade:"JpnII",  race:"エンプレス杯キヨフジ", horse:"(確認中)",         order:3, date:"2026/05/13" },
  { season:"2024-25", player:"P07", grade:"JpnIII", race:"黒船賞[指定交流]",     horse:"かきつばた記念馬", order:2, date:"2026/03/24" },
  { season:"2024-25", player:"P07", grade:"JpnIII", race:"かきつばた記念",       horse:"かきつばた記念馬", order:1, date:"2026/02/23" },
  { season:"2024-25", player:"P07", grade:"GIII",   race:"根岸S",                horse:"かきつばた記念馬", order:3, date:"2026/02/01" },
  { season:"2023-24", player:"P02", grade:"JpnIII", race:"ブルーバードC",        horse:"(確認中)",         order:2, date:"2024/01/17" },
  { season:"2023-24", player:"P01", grade:"JpnII",  race:"不来方賞",             horse:"(確認中)",         order:3, date:"2024/09/03" },
  { season:"2023-24", player:"P01", grade:"GIII",   race:"レパードS",            horse:"(確認中)",         order:2, date:"2024/08/04" },
  { season:"2023-24", player:"P01", grade:"JpnII",  race:"兵庫ジュニアグランプ", horse:"(確認中)",         order:2, date:"2023/11/22" },
  { season:"2023-24", player:"P04", grade:"JpnII",  race:"関東オークス[指定交]", horse:"(確認中)",         order:1, date:"2024/06/12" },
];

// ================================================================
// ユーティリティ
// ================================================================
const fmt = (n) => n.toLocaleString("ja-JP");
const playerName = (id) => PLAYERS.find(p => p.id === id)?.name ?? id;
const playerEmoji = (id) => PLAYERS.find(p => p.id === id)?.emoji ?? "🐎";

function displayPt(r) {
  return r.surface === "turf" ? 0 : r.rawPt;
}

// ================================================================
// 共通コンポーネント
// ================================================================

function SurfaceTag({ surface, dist }) {
  return (
    <span style={{
      display:"inline-block", fontSize:11, fontWeight:700, color:"#fff",
      background: surface==="dirt" ? G.dirt : G.green,
      borderRadius:4, padding:"2px 6px", marginRight:6,
    }}>
      {surface==="dirt" ? "ダ" : "芝"}{dist}
    </span>
  );
}

function GradeTag({ grade, local }) {
  if (!grade && !local) return null;
  const bg = grade==="GⅠ"||grade==="GI"||grade==="JpnI" ? G.gi
    : grade==="GⅡ"||grade==="GII"||grade==="JpnII" ? G.g2
    : grade==="GⅢ"||grade==="GIII"||grade==="JpnIII" ? G.g3
    : local ? G.local : "#888";
  const label = local && !grade ? "地方" : grade;
  return (
    <span style={{
      fontSize:10, fontWeight:800, color:"#fff",
      background:bg, borderRadius:4, padding:"1px 5px", marginRight:4,
    }}>{label}</span>
  );
}

function ResultCard({ r, showPlayer=true }) {
  const dPt = displayPt(r);
  const zero = dPt === 0;
  return (
    <div style={{
      background:"#fff", border:"1px solid #e4e9e6",
      borderRadius:10, padding:"10px 12px", marginBottom:8,
      opacity: zero ? 0.72 : 1,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, flexWrap:"wrap" }}>
        <span style={{ fontSize:12, color:"#888", fontWeight:600 }}>{r.date}</span>
        <span style={{ fontSize:12, fontWeight:700 }}>{r.venue}</span>
        <GradeTag grade={r.grade} local={r.local} />
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <SurfaceTag surface={r.surface} dist={r.dist} />
        <span style={{ fontSize:14, fontWeight:700, flex:1 }}>{r.horse}</span>
        <span style={{ fontSize:13, fontWeight:800, color: r.order<=3 ? G.green : "#666" }}>
          {r.order}着
        </span>
      </div>
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        marginTop:8, paddingTop:8, borderTop:"1px dashed #eee",
      }}>
        <span style={{ fontSize:11, color:"#999" }}>
          {r.race}{showPlayer && ` ／ ${playerEmoji(r.player)} ${playerName(r.player)}`}
        </span>
        {zero
          ? <span style={{ fontSize:12, fontWeight:700, color:"#bbb" }}>
              0 pt{r.surface==="turf" ? "（芝）" : ""}
            </span>
          : <span style={{ fontSize:14, fontWeight:800, color:"#d33" }}>
              +{fmt(dPt)} pt
            </span>
        }
      </div>
    </div>
  );
}

// ================================================================
// タブ1: ランキング
// ================================================================

function RankingScreen({ onSelectPlayer }) {
  const sorted = [...CURRENT_SEASON.users].sort((a,b) => b.pt - a.pt);
  const max = sorted[0].pt;
  return (
    <div style={{ padding:12 }}>
      <div style={{
        background:"#fff", borderRadius:12, padding:"10px 14px",
        marginBottom:12, fontSize:12, color:"#555", border:"1px solid #e4e9e6",
      }}>
        🏁 {CURRENT_SEASON.period} ／ {sorted.length}名参加
      </div>
      {sorted.map((u, i) => {
        const medal = ["🥇","🥈","🥉"][i];
        const player = PLAYERS.find(p => p.id === u.id);
        return (
          <button key={u.id} onClick={() => onSelectPlayer(u)}
            style={{
              width:"100%", textAlign:"left", background:"#fff",
              border:"1px solid #e4e9e6", borderRadius:12,
              padding:"12px 14px", marginBottom:10, cursor:"pointer",
              display:"flex", alignItems:"center", gap:12,
              boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
            }}>
            <div style={{ width:34, textAlign:"center", fontSize: i<3?22:16, fontWeight:800, color: i<3?"inherit":"#888" }}>
              {medal ?? `${i+1}`}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:5 }}>
                {player?.emoji} {player?.name}
              </div>
              <div style={{ height:6, background:"#eef2f0", borderRadius:3, overflow:"hidden" }}>
                <div style={{ width:`${(u.pt/max)*100}%`, height:"100%", background:G.green }} />
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontWeight:800, fontSize:17 }}>{fmt(u.pt)}</div>
              <div style={{ fontSize:11, color:"#999" }}>pt</div>
              {u.diff>0 && <div style={{ fontSize:11, color:"#d33", fontWeight:700 }}>+{fmt(u.diff)}</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PlayerDetailScreen({ userId, onBack, onSelectHorse }) {
  const user = CURRENT_SEASON.users.find(u => u.id === userId);
  const horses = getHorses(userId);
  const player = PLAYERS.find(p => p.id === userId);
  const total = user?.pt ?? 0;
  return (
    <div style={{ padding:12 }}>
      <div style={{ background:G.green, color:"#fff", borderRadius:12, padding:"16px 18px", marginBottom:14 }}>
        <div style={{ fontSize:13, opacity:0.85 }}>{player?.emoji} {player?.name}</div>
        <div style={{ fontSize:30, fontWeight:800, marginTop:2 }}>
          {fmt(total)} <span style={{ fontSize:14, fontWeight:600 }}>pt</span>
        </div>
        {user?.comment && (
          <div style={{ marginTop:10, fontSize:13, background:"rgba(255,255,255,0.15)", padding:"6px 10px", borderRadius:8 }}>
            💬 {user.comment}
          </div>
        )}
      </div>
      {horses.map(h => (
        <button key={h.no} onClick={() => onSelectHorse(h)}
          style={{
            width:"100%", textAlign:"left", background:"#fff",
            border:"1px solid #e4e9e6", borderRadius:10,
            padding:"10px 12px", marginBottom:8, cursor:"pointer",
            display:"flex", alignItems:"center", gap:10,
          }}>
          <div style={{
            width:26, height:26, borderRadius:6, background:G.greenDark,
            color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:700, flexShrink:0,
          }}>{h.no}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:14, display:"flex", alignItems:"center", gap:6 }}>
              {h.name}
              <span style={{ fontSize:10, color: h.active?G.green:"#bbb", border:`1px solid ${h.active?G.green:"#ccc"}`, borderRadius:4, padding:"0 4px" }}>
                {h.active?"在厩":"抹消"}
              </span>
            </div>
            <div style={{ fontSize:11, color:"#888", marginTop:2 }}>成績 {h.record}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontWeight:800, fontSize:15 }}>{fmt(h.pt)}</div>
            <div style={{ fontSize:10, color:"#999" }}>pt</div>
          </div>
        </button>
      ))}
    </div>
  );
}

function HorseDetailScreen({ horse, playerId }) {
  const horseResults = RESULTS.filter(r => r.horse === horse.name);
  const netkeibaUrl = `https://db.netkeiba.com/?pid=horse_search_list&word=${encodeURIComponent(horse.name)}`;
  return (
    <div style={{ padding:12 }}>
      <div style={{ background:"#fff", borderRadius:12, padding:"16px 18px", marginBottom:14, border:"1px solid #e4e9e6" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
          <div>
            <div style={{ fontSize:22, fontWeight:800 }}>{horse.name}</div>
            <div style={{ fontSize:12, color:"#888", marginTop:4 }}>
              {playerEmoji(playerId)} {playerName(playerId)}
            </div>
          </div>
          <a href={netkeibaUrl} target="_blank" rel="noopener noreferrer"
            style={{
              display:"inline-flex", alignItems:"center", gap:4,
              background:"#1a56c4", color:"#fff", borderRadius:8,
              padding:"6px 12px", fontSize:12, fontWeight:700,
              textDecoration:"none", whiteSpace:"nowrap", flexShrink:0,
            }}>
            🔍 netkeiba
          </a>
        </div>
        <div style={{ display:"flex", gap:16, marginTop:14 }}>
          <div>
            <div style={{ fontSize:11, color:"#999" }}>獲得pt</div>
            <div style={{ fontSize:22, fontWeight:800 }}>{fmt(horse.pt)}</div>
          </div>
          <div>
            <div style={{ fontSize:11, color:"#999" }}>成績</div>
            <div style={{ fontSize:22, fontWeight:800 }}>{horse.record}</div>
          </div>
        </div>
        {(horse.sire || horse.dam) && (
          <div style={{ marginTop:12, paddingTop:12, borderTop:"1px dashed #eee", display:"flex", gap:16 }}>
            {horse.sire && (
              <div>
                <div style={{ fontSize:10, color:"#999" }}>父</div>
                <div style={{ fontSize:13, fontWeight:700 }}>{horse.sire}</div>
              </div>
            )}
            {horse.dam && (
              <div>
                <div style={{ fontSize:10, color:"#999" }}>母</div>
                <div style={{ fontSize:13, fontWeight:700 }}>{horse.dam}</div>
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ fontSize:13, fontWeight:700, color:"#555", margin:"4px 4px 8px" }}>レース履歴</div>
      {horseResults.length === 0
        ? <div style={{ background:"#fff", borderRadius:10, padding:20, textAlign:"center", color:"#aaa", fontSize:13, border:"1px solid #e4e9e6" }}>
            直近の対象レース履歴はありません
          </div>
        : horseResults.map((r,i) => <ResultCard key={i} r={r} showPlayer={false} />)
      }
    </div>
  );
}

// ================================================================
// タブ2: 最新結果
// ================================================================

function ResultsScreen() {
  return (
    <div style={{ padding:12 }}>
      {UPCOMING.length > 0 && (
        <>
          <div style={{ fontSize:13, fontWeight:700, color:"#555", margin:"2px 4px 8px" }}>出走予定</div>
          {UPCOMING.map((u,i) => (
            <div key={i} style={{
              background:"#f0f6f3", border:`1px dashed ${G.green}`,
              borderRadius:10, padding:"10px 12px", marginBottom:8,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, flexWrap:"wrap" }}>
                <span style={{ fontSize:12, color:"#888", fontWeight:600 }}>{u.date}</span>
                <span style={{ fontSize:12, fontWeight:700 }}>{u.venue}</span>
                <GradeTag grade={u.grade} local={u.local} />
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <SurfaceTag surface={u.surface} dist={u.dist} />
                <span style={{ fontSize:14, fontWeight:700, flex:1 }}>{u.horse}</span>
                <span style={{ fontSize:11, color:"#999" }}>{playerEmoji(u.player)} {playerName(u.player)}</span>
              </div>
            </div>
          ))}
        </>
      )}
      <div style={{ fontSize:13, fontWeight:700, color:"#555", margin:"14px 4px 8px" }}>確定・結果</div>
      {RESULTS.map((r,i) => <ResultCard key={i} r={r} />)}
    </div>
  );
}

// ================================================================
// タブ3: 殿堂DB
// ================================================================

function HallScreen({ onSelectHallPlayer }) {
  const stats = PLAYERS.map(p => {
    const mySeasons = SEASONS_ALL.filter(s => s.results.find(r => r.player===p.id));
    const wins = mySeasons.filter(s => s.results.find(r => r.player===p.id)?.rank===1);
    const totalPt = mySeasons.reduce((sum,s) => {
      const r = s.results.find(r => r.player===p.id);
      return sum + (r?.pt??0);
    },0);
    const trophies = TROPHIES.filter(t => t.player===p.id && t.order===1);
    return { ...p, seasons:mySeasons.length, wins:wins.length, totalPt, trophies };
  }).filter(p => p.seasons>0).sort((a,b)=>b.wins-a.wins||b.totalPt-a.totalPt);

  return (
    <div style={{ padding:12, background:G.hallBg, minHeight:"100%" }}>
      <div style={{
        background:`linear-gradient(135deg, ${G.dirtDark}, ${G.hallBg})`,
        border:`1px solid ${G.gold}`, borderRadius:12, padding:"16px 18px",
        marginBottom:16, textAlign:"center",
      }}>
        <div style={{ fontSize:28 }}>🏟️</div>
        <div style={{ fontSize:18, fontWeight:900, color:G.gold, letterSpacing:2, marginTop:4 }}>砂遊び殿堂</div>
        <div style={{ fontSize:12, color:G.hallDim, marginTop:4 }}>2022-23〜2025-26 全4シーズン</div>
      </div>
      {stats.map((p,i) => (
        <button key={p.id} onClick={() => onSelectHallPlayer(p)}
          style={{
            width:"100%", textAlign:"left",
            background:G.hallCard, border:`1px solid ${G.hallBorder}`,
            borderRadius:12, padding:"12px 14px", marginBottom:10, cursor:"pointer",
            display:"flex", alignItems:"center", gap:12,
          }}>
          <div style={{ fontSize:24, width:32, textAlign:"center" }}>
            {i===0?"👑":i===1?"🥈":i===2?"🥉":
              <span style={{ fontSize:14, color:G.hallDim, fontWeight:700 }}>{i+1}</span>}
          </div>
          <div style={{ fontSize:22 }}>{p.emoji}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:15, color:G.hallText }}>{p.name}</div>
            <div style={{ fontSize:11, color:G.hallDim, marginTop:3, display:"flex", gap:10 }}>
              <span>出場 {p.seasons}S</span>
              <span style={{ color: p.wins>0?G.gold:G.hallDim }}>優勝 {p.wins}回{p.wins>=2?" 👑":""}</span>
              <span>重賞 {p.trophies.length}勝</span>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:16, fontWeight:900, color:G.dirtLight }}>{fmt(p.totalPt)}</div>
            <div style={{ fontSize:10, color:G.hallDim }}>通算pt</div>
          </div>
        </button>
      ))}
    </div>
  );
}

function HallPlayerScreen({ player, onBack }) {
  const mySeasons = SEASONS_ALL
    .map(s => ({ s, r: s.results.find(r => r.player===player.id) }))
    .filter(x => x.r).reverse();
  const myTrophies = TROPHIES.filter(t => t.player===player.id);
  const [tab, setTab] = useState("seasons");
  const rankLabel = r => r===1?"🥇":r===2?"🥈":r===3?"🥉":`${r}位`;

  return (
    <div style={{ background:G.hallBg, minHeight:"100%" }}>
      {/* ヘッダー */}
      <div style={{
        background:`linear-gradient(160deg, ${G.dirtDark} 0%, ${G.hallBg} 100%)`,
        border:`1px solid ${G.hallBorder}`, padding:"16px 16px 0",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div style={{ fontSize:40 }}>{player.emoji}</div>
          <div>
            <div style={{ fontSize:20, fontWeight:900, color:G.hallText }}>{player.name}</div>
            <div style={{ fontSize:12, color:G.hallDim, marginTop:2 }}>
              {player.wins>0 ? `${player.wins}回優勝 👑` : "参戦中"}
            </div>
          </div>
        </div>
        {/* 数字バー */}
        <div style={{ display:"flex", borderTop:`1px solid ${G.hallBorder}` }}>
          {[
            { label:"出場", val:`${player.seasons}S` },
            { label:"優勝", val:`${player.wins}回`, gold:player.wins>0 },
            { label:"通算pt", val:fmt(player.totalPt) },
          ].map((item,i) => (
            <div key={i} style={{
              flex:1, textAlign:"center", padding:"10px 4px",
              borderRight: i<2 ? `1px solid ${G.hallBorder}` : "none",
            }}>
              <div style={{ fontSize:15, fontWeight:900, color:item.gold?G.gold:G.dirtLight }}>{item.val}</div>
              <div style={{ fontSize:10, color:G.hallDim, marginTop:2 }}>{item.label}</div>
            </div>
          ))}
        </div>
        {/* タブ */}
        <div style={{ display:"flex", marginTop:8, gap:4 }}>
          {[["seasons","シーズン"],["trophies","🏆 トロフィー"]].map(([k,l]) => (
            <button key={k} onClick={()=>setTab(k)} style={{
              flex:1, background:tab===k?G.dirt:"transparent",
              border:`1px solid ${tab===k?G.dirt:G.hallBorder}`,
              color:tab===k?"#fff":G.hallDim,
              borderRadius:"6px 6px 0 0", padding:"8px 0",
              fontSize:12, fontWeight:700, cursor:"pointer",
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:12 }}>
        {tab==="seasons" && mySeasons.map(({s,r}) => (
          <div key={s.id} style={{
            background:G.hallCard, border:`1px solid ${r.rank===1?G.gold:G.hallBorder}`,
            borderRadius:10, padding:"12px 14px", marginBottom:8,
            display:"flex", alignItems:"center", gap:12,
          }}>
            <div style={{
              fontSize:r.rank<=3?22:14, fontWeight:800, width:36, textAlign:"center",
              color:r.rank===1?G.gold:r.rank===2?G.silver:r.rank===3?G.bronze:G.hallDim,
            }}>{rankLabel(r.rank)}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:14, color:G.hallText }}>砂遊び {s.label}</div>
              <div style={{ fontSize:11, color:G.hallDim, marginTop:2 }}>{s.period}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:16, fontWeight:900, color:r.rank===1?G.gold:G.dirtLight }}>{fmt(r.pt)}</div>
              <div style={{ fontSize:10, color:G.hallDim }}>pt</div>
            </div>
          </div>
        ))}

        {tab==="trophies" && (
          myTrophies.length===0
            ? <div style={{ background:G.hallCard, borderRadius:10, padding:24, textAlign:"center", color:G.hallDim, fontSize:13 }}>
                重賞成績はまだ確認中です🐴
              </div>
            : myTrophies.map((t,i) => {
                const g = t.grade;
                const isG1 = g==="GI"||g==="GⅠ"||g==="JpnI";
                const isG2 = g==="GII"||g==="GⅡ"||g==="JpnII";
                const gColor = isG1 ? G.gold : isG2 ? G.silver : G.bronze;
                const icon = isG1 ? "🏆" : isG2 ? "🥈" : "🥉";
                const orderLabel = t.order===1?"1着":t.order===2?"2着":"3着";
                return (
                  <div key={i} style={{
                    background:G.hallCard, border:`1px solid ${gColor}`,
                    borderRadius:8, padding:"10px 12px", marginBottom:8,
                    display:"flex", alignItems:"center", gap:8,
                  }}>
                    <span style={{ fontSize:20 }}>{icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                        <span style={{ fontSize:10, fontWeight:800, color:"#fff", background:gColor, borderRadius:3, padding:"1px 5px" }}>{t.grade}</span>
                        <span style={{ fontSize:13, color:G.hallText, fontWeight:700 }}>{t.race}</span>
                        <span style={{ fontSize:10, color:G.hallDim }}>{orderLabel}</span>
                      </div>
                      <div style={{ fontSize:11, color:G.hallDim, marginTop:2 }}>
                        🐴 {t.horse} ／ {t.season} ／ {t.date}
                        {t.note && <span style={{ color:G.dirt, marginLeft:6 }}>{t.note}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
        )}
      </div>
    </div>
  );
}

// ================================================================
// ルール画面
// ================================================================

function RulesScreen() {
  const rules = [
    "芝レースの賞金はカウントしない（0pt）",
    "持ち馬は1人12頭",
    "中央所属馬以外の賞金加算はなし",
    "地方→中央移籍は移籍以降のレースのみ加算",
    "シーズン対象期間: 2026/06/02〜2027年・東京ダービーまで",
    "地方（交流戦）・海外ダート重賞の賞金もカウント",
    "ポイントは5着までの本賞金の1万分の1",
    "海外遠征も5着まで対象。現地レートで円換算し10万円単位で概算",
  ];
  return (
    <div style={{ padding:12 }}>
      <div style={{ background:G.green, color:"#fff", borderRadius:12, padding:"18px", marginBottom:14, textAlign:"center" }}>
        <div style={{ fontSize:26 }}>🐴</div>
        <div style={{ fontSize:18, fontWeight:800, marginTop:4 }}>ダート馬専門POG</div>
        <div style={{ fontSize:13, opacity:0.9, marginTop:2 }}>砂遊びルール</div>
      </div>
      {rules.map((r,i) => (
        <div key={i} style={{
          background:"#fff", border:"1px solid #e4e9e6", borderRadius:10,
          padding:"12px 14px", marginBottom:8, display:"flex", gap:12, alignItems:"flex-start",
        }}>
          <div style={{
            width:24, height:24, borderRadius:"50%", background:G.dirt,
            color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:12, fontWeight:700, flexShrink:0,
          }}>{i+1}</div>
          <div style={{ fontSize:14, lineHeight:1.5 }}>{r}</div>
        </div>
      ))}
    </div>
  );
}

// ================================================================
// App本体
// ================================================================

export default function App() {
  const [tab, setTab]               = useState("ranking");
  const [selectedPlayerId, setSPId] = useState(null);
  const [selectedHorse, setSHorse]  = useState(null);
  const [selectedHallP, setSHallP]  = useState(null);

  const switchTab = (t) => {
    setTab(t); setSPId(null); setSHorse(null); setSHallP(null);
  };

  // タイトルとバック
  let title = "POG砂遊び 2025-26";
  let onBack = null;
  let content = null;
  let darkHeader = false;

  if (tab === "ranking") {
    if (selectedHorse) {
      title = "馬詳細";
      onBack = () => setSHorse(null);
      content = <HorseDetailScreen horse={selectedHorse} playerId={selectedPlayerId} />;
    } else if (selectedPlayerId) {
      title = playerName(selectedPlayerId);
      onBack = () => setSPId(null);
      content = <PlayerDetailScreen userId={selectedPlayerId} onBack={()=>setSPId(null)}
                  onSelectHorse={h => { setSHorse(h); }} />;
    } else {
      content = <RankingScreen onSelectPlayer={u => setSPId(u.id)} />;
    }
  } else if (tab === "results") {
    title = "最新結果";
    content = <ResultsScreen />;
  } else if (tab === "hall") {
    if (selectedHallP) {
      title = selectedHallP.name;
      onBack = () => setSHallP(null);
      darkHeader = true;
      content = <HallPlayerScreen player={selectedHallP} onBack={()=>setSHallP(null)} />;
    } else {
      title = "砂遊び殿堂";
      darkHeader = true;
      content = <HallScreen onSelectHallPlayer={setSHallP} />;
    }
  } else {
    title = "砂遊びルール";
    content = <RulesScreen />;
  }

  const headerBg = darkHeader ? G.dirtDark : G.green;

  const navItems = [
    { key:"ranking", label:"ランキング", icon:"🏆" },
    { key:"results", label:"最新結果",   icon:"📋" },
    { key:"hall",    label:"殿堂DB",     icon:"🏟️" },
    { key:"rules",   label:"ルール",     icon:"📖" },
  ];

  return (
    <div style={{
      maxWidth:430, margin:"0 auto", minHeight:"100vh",
      background: darkHeader||tab==="hall" ? G.hallBg : "#eef2f0",
      fontFamily:"'Hiragino Sans','Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif",
      display:"flex", flexDirection:"column",
    }}>
      {/* ヘッダー */}
      <div style={{
        background:headerBg, color:"#fff", padding:"14px 16px",
        display:"flex", alignItems:"center", gap:12,
        position:"sticky", top:0, zIndex:10,
        boxShadow:"0 2px 8px rgba(0,0,0,0.15)",
      }}>
        {onBack && (
          <button onClick={onBack} style={{ background:"transparent", border:"none", color:"#fff", fontSize:22, cursor:"pointer", lineHeight:1 }}>
            ‹
          </button>
        )}
        <div style={{ display:"flex", flexDirection:"column" }}>
          <span style={{ fontSize:10, opacity:0.85, letterSpacing:1 }}>POG SUNAASOBI</span>
          <span style={{ fontSize:17, fontWeight:800 }}>{title}</span>
        </div>
        <div style={{ marginLeft:"auto", fontSize:22 }}>🐴</div>
      </div>

      {/* コンテンツ */}
      <div style={{ flex:1, overflowY:"auto" }}>{content}</div>

      {/* ボトムナビ */}
      <div style={{
        position:"sticky", bottom:0, display:"flex",
        background: darkHeader||tab==="hall" ? G.dirtDark : G.green,
        borderTop:`1px solid rgba(0,0,0,0.15)`,
      }}>
        {navItems.map(it => (
          <button key={it.key} onClick={() => switchTab(it.key)} style={{
            flex:1, background: tab===it.key ? "rgba(0,0,0,0.2)" : "transparent",
            border:"none", color:"#fff",
            padding:"10px 0 8px", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:3,
            opacity: tab===it.key ? 1 : 0.7,
          }}>
            <span style={{ fontSize:18 }}>{it.icon}</span>
            <span style={{ fontSize:10, fontWeight:600 }}>{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
