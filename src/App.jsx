import { useState, useEffect } from "react";

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

// ================================================================
// 2026-27シーズン 指名馬データ
// ================================================================
const PLAYERS_2627 = [
  {
    id:"P04", name:"ミリオン厩舎", emoji:"💰",
    named:[
      { name:"ミクニプレイブ",     sire:"ナダル",               dam:"アンティミルト" },
      { name:"トゥザファイナル",   sire:"ナダル",               dam:"スパークオンアイス" },
      { name:"ソメデイストワール", sire:"マインドユアビスケッツ", dam:"ミラクルレジェンド" },
    ],
    unnamed:[
      { dam:"ブリディカメント" }, { dam:"タヒチアンダンス" }, { dam:"ラテュロス" },
      { dam:"Stellar Wind" },   { dam:"エリーズスマイル" }, { dam:"レッドアネラ" },
      { dam:"アンデスクイーン" }, { dam:"ラタンドレス" },    { dam:"ロッテンマイヤー" },
    ],
  },
  {
    id:"P01", name:"前田厩舎", emoji:"🏇",
    named:[
      { name:"スターフラッシュ",  sire:"Yaupon",          dam:"Shanghai Starlet" },
      { name:"ラキアーヴェ",     sire:"ルヴァンスレーヴ", dam:"クラーベセクレタ" },
      { name:"ミシェルバローズ", sire:"ナダル",           dam:"メリッサーニ" },
      { name:"レッジェランツァ", sire:"シスキン",         dam:"エレヴァテッツァ" },
      { name:"ヴェルバニア",     sire:"キタサンブラック", dam:"アドマイヤローザ" },
      { name:"エスクアドラ",     sire:"レイデオロ",       dam:"ジューニャエコール" },
      { name:"コナバームス",     sire:"アドマイヤマーズ", dam:"コナプリュウーズ" },
    ],
    unnamed:[
      { dam:"スープレット" }, { dam:"オーサムウィンド" }, { sire:"プロミストリーブ" },
      { dam:"クインアマランサス" }, { dam:"シンプリーグロリアス" },
    ],
  },
  {
    id:"P02", name:"川村厩舎", emoji:"🐎",
    named:[
      { name:"マイクストーリー",    sire:"Flightline",           dam:"シャムロックローズ" },
      { name:"アトミックリーチ",    sire:"コントレイル",         dam:"バリスビキニ" },
      { name:"ヤングリッチ",        sire:"レイデオロ",           dam:"フォエヴァーダーリング" },
      { name:"ダノンチャンピオン",  sire:"ホットロッドチャーリー", dam:"トップデザイル" },
      { name:"コーズダヴィンチ",    sire:"マインドユアビスケッツ", dam:"プリモダヴィンチ" },
      { name:"セイルトゥグローリー", sire:"エフフォーリア",       dam:"セイリングホーム" },
      { name:"デミアン",            sire:"Flightline",           dam:"Mira Alta" },
    ],
    unnamed:[
      { dam:"Champagne Lady" }, { dam:"ギルデッドミラー" }, { dam:"セントリフュージ" },
      { dam:"ナターレ" }, { dam:"フェータルローズ" },
    ],
  },
  {
    id:"P07", name:"成田厩舎", emoji:"🎯",
    named:[
      { name:"ウィンタープリーズ", sire:"ホットロッドチャーリー", dam:"アイスバスティル" },
      { name:"ソルテヴェローチェ", sire:"マテラスカイ",          dam:"ミニーアイル" },
      { name:"トリプルウィン",     sire:"ドレフォン",            dam:"ラヴェリータ" },
      { name:"タクティシアン",     sire:"サリオス",              dam:"モルシアナ" },
      { name:"テンブレイクワン",   sire:"Volatile",              dam:"Nothing But Tom" },
      { name:"アンドレバローズ",   sire:"ルヴァンスレーヴ",      dam:"ジェラスキャット" },
      { name:"イレイザー",         sire:"ヘニーヒューズ",        dam:"アーサーズシスター" },
    ],
    unnamed:[
      { dam:"ブランクチェック" }, { dam:"アーモーニーズエンジェル" },
      { dam:"ミスエンパイアメント" }, { dam:"アストロロジカル" }, { dam:"スターリーウィンド" },
    ],
  },
  {
    id:"P06", name:"涼子厩舎", emoji:"🌸",
    named:[
      { name:"ホウオウシュウ",      sire:"レイデオロ",       dam:"スペシャルグルーヴ" },
      { name:"オールシティキング",  sire:"Flightline",       dam:"セルフレスリー" },
      { name:"デュガビー",          sire:"クリソベリル",     dam:"エスメラルディーナ" },
      { name:"ウラノグラフィア",    sire:"ナダル",           dam:"リュラ" },
      { name:"ヴェトロテンペスタ",  sire:"コントレイル",     dam:"シャンパンエイワン" },
      { name:"ホーフアイゼン",      sire:"American Pharoah", dam:"Chain of Love" },
    ],
    unnamed:[
      { dam:"パラダイスコープ" }, { dam:"ショウサンウルル" }, { dam:"ドリームライター" },
      { dam:"スターリーウィンド" }, { dam:"シャイナーネット" }, { dam:"フェータルローズ" },
    ],
  },
  {
    id:"P05", name:"田崎厩舎", emoji:"⚡",
    named:[
      { name:"ディーヴァレギオン", sire:"ナダル",               dam:"シャドウディーヴァ" },
      { name:"ヴィルダースヴィル", sire:"ドレフォン",           dam:"セラドン" },
      { name:"ディルイーヤ",       sire:"コントレイル",         dam:"メントモリ" },
      { name:"ブックオブケルズ",   sire:"リアルスティール",     dam:"シャンブルドット" },
      { name:"ケンシロウワールド", sire:"Violence",             dam:"Colby Cakes" },
      { name:"ハイウェイワン",     sire:"カリフォルニアクローム", dam:"シルバーポジー" },
      { name:"トルヴァスト",       sire:"スマートファルコン",   dam:"コントレイルイン" },
      { name:"オメガマサヤ",       sire:"オメガパフューム",     dam:"スターズパース" },
    ],
    unnamed:[
      { dam:"コンバルティシオン" }, { dam:"アーモーニーズエンジェル" },
      { dam:"グロリアーナ" }, { dam:"カピトス" },
    ],
  },
  {
    id:"P03", name:"長谷部厩舎", emoji:"🏆",
    named:[
      { name:"クロダテ",           sire:"キタサンブラック",    dam:"ファッションスタ" },
      { name:"ツキノエ",           sire:"シスターミニスター",  dam:"メイショウトモビ" },
      { name:"マーゴットセレッツォ", sire:"ニューイヤーズデイ", dam:"サリネロ" },
      { name:"セドゥクトーラ",     sire:"ナダル",             dam:"アンヴァル" },
      { name:"ゼットターム",       sire:"ニューイヤーズデイ", dam:"アンヴァルゼット" },
      { name:"エクレアカミング",   sire:"ドレフォン",          dam:"エクレアサンライズ" },
      { name:"オールベット",       sire:"キズナ",              dam:"エスティロタレントーソ" },
      { name:"ムーンベリル",       sire:"クリソベリル",        dam:"クインズムーン" },
      { name:"ボードゥロレーヌ",   sire:"クリソベリル",        dam:"サイモンミラベル" },
    ],
    unnamed:[
      { dam:"オムニプレゼンス" }, { dam:"カラルデイズ" }, { dam:"スズカモナミ" },
    ],
  },
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
  { no:9,  name:"フィンガー",        record:"3-4-0-0", pt:10780, active:true,  sire:"Gun Runner",        dam:"エスティロタレントーソ" },
  { no:6,  name:"チュウワカーネギー", record:"2-1-0-4", pt:2764,  active:false, sire:"モーリス",          dam:"デックドアウト" },
  { no:3,  name:"ヘリテージブルーム", record:"2-2-3-1", pt:2540,  active:false, sire:"ミスチヴィアスアレック", dam:"オールドパサデナ" },
  { no:11, name:"ゴールドバローズ",  record:"1-2-0-1", pt:1180,  active:false, sire:"ゴールドドリーム",   dam:"アースサウンド" },
  { no:1,  name:"エクストラプッシュ", record:"1-1-0-7", pt:1087,  active:false, sire:"ナダル",            dam:"ヘアケイリー" },
  { no:7,  name:"エコロボルト",      record:"1-1-0-3", pt:889,   active:true,  sire:"Practical Joke",    dam:"In My Time" },
  { no:4,  name:"エジプシャンマウ",  record:"1-0-0-0", pt:750,   active:true,  sire:"American Pharoah",  dam:"ヘウンハズマイニッキー" },
  { no:12, name:"アメリカンコール",  record:"1-0-0-1", pt:750,   active:false, sire:"American Pharoah",  dam:"イヴニングコール" },
  { no:2,  name:"セスティーナ",      record:"0-1-1-1", pt:430,   active:true,  sire:"マインドユアビスケッツ", dam:"アムールポエジー" },
  { no:8,  name:"ゲレイロ",          record:"0-0-0-7", pt:148,   active:false, sire:"ミスターメロディ",   dam:"キタサンテンビー" },
  { no:5,  name:"サンライズメジェド", record:"0-0-0-0", pt:0,     active:true,  sire:"リアルスティール",   dam:"ラサルダン" },
  { no:10, name:"ワンインザスカイ",  record:"0-0-0-5", pt:0,     active:true,  sire:"デクラレーションオブウォー", dam:"サンドクイーン" },
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
  { no:4,  name:"パントルナイーフ",   record:"2-1-0-1", pt:16660, active:true,  sire:"キズナ",           dam:"アールブリュット" },
  { no:7,  name:"アドマイヤクワッズ", record:"2-0-3-1", pt:11050, active:false, sire:"リアルスティール", dam:"デイトライン" },
  { no:2,  name:"サトノボヤージュ",   record:"4-1-1-0", pt:8570,  active:false, sire:"Into Mischief",    dam:"ジョリーオリンピア" },
  { no:12, name:"テーオーグレーザー", record:"2-2-2-1", pt:2980,  active:true,  sire:"マテラスカイ",     dam:"マリンブラスト" },
  { no:1,  name:"カットソロ",         record:"1-1-2-1", pt:1290,  active:false, sire:"コントレイル",     dam:"スルターナ" },
  { no:3,  name:"ジャスティンダラス", record:"1-1-0-1", pt:860,   active:false, sire:"Gun Runner",       dam:"ピンクサンズ" },
  { no:10, name:"フリーガー",         record:"1-0-0-2", pt:750,   active:false, sire:"コントレイル",     dam:"ゲットリッドオブ" },
  { no:9,  name:"エコログロウ",       record:"1-0-1-2", pt:740,   active:false, sire:"ドレフォン",       dam:"ペイザージュ" },
  { no:8,  name:"ミリオンヴォイス",   record:"1-0-0-1", pt:655,   active:true,  sire:"ゴールドドリーム", dam:"ペルシャンジュエル" },
  { no:11, name:"ゾネブルーム",       record:"0-0-2-1", pt:300,   active:true,  sire:"ヴァンゴッホ",     dam:"プリガアルタ" },
  { no:6,  name:"モンスターラッシュ", record:"0-0-0-1", pt:240,   active:true,  sire:"クリソベリル",     dam:"クラーベセクレタ" },
  { no:5,  name:"レッドフレーザー",   record:"0-0-0-4", pt:59,    active:false, sire:"ドレフォン",       dam:"ラーゴブルー" },
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

// 最新結果・出走予定はJSONから動的取得（useResultsで管理）

// 過去シーズン馬データ
const PAST_HORSES = {
  "2022-23": {
    "P01": [
      { no:1,  name:"ユディタム",      record:"4-1-2-10", pt:3950, sire:"Justify",          dam:"ジベッサ" },
      { no:8,  name:"エクロジャイト",  record:"3-0-2-12", pt:3860, sire:"ヘニーヒューズ",   dam:"オージャイト" },
      { no:2,  name:"ジュドー",        record:"3-3-3-13", pt:1320, sire:"スモーリス",        dam:"バンデア" },
      { no:4,  name:"サンデュエル",    record:"1-0-1-5",  pt:728,  sire:"ロードカナロア",    dam:"サンドクイーン" },
      { no:7,  name:"イエルバブエナ",  record:"1-0-0-12", pt:700,  sire:"マジェスティックウォリアー", dam:"ミンディアー" },
      { no:6,  name:"ルージュイストリア",record:"2-0-1-13",pt:550, sire:"ドレフォン",        dam:"レッドクラウディア" },
      { no:5,  name:"ヴォーハンマー",  record:"4-2-1-8",  pt:220,  sire:"リアルインパクト",  dam:"フラーティシャスミス" },
      { no:3,  name:"ヴァンビスタ",    record:"0-0-0-3",  pt:0,    sire:"Justify",           dam:"Vanquished" },
      { no:9,  name:"エンブレム",      record:"0-0-0-1",  pt:0,    sire:"シニスターミニスター",dam:"ラグジャリークラス" },
      { no:10, name:"ランドオブサンド",record:"0-0-0-3",  pt:0,    sire:"American Pharoah",  dam:"Slow Sand" },
    ],
    "P02": [
      { no:6,  name:"スクーパー",      record:"3-3-3-6",  pt:3050, sire:"ヘニーヒューズ",   dam:"ソロダンサー" },
      { no:1,  name:"ミスティックロア",record:"4-4-2-2",  pt:1570, sire:"Arrogate",          dam:"Folklore" },
      { no:8,  name:"カレンアルカンタラ",record:"4-1-0-9",pt:1410, sire:"エスポワールシティー",dam:"ラセレシオン" },
      { no:2,  name:"モズアカボス",    record:"2-0-1-17", pt:698,  sire:"Quality Road",      dam:"India" },
      { no:5,  name:"バイリヴレ",      record:"1-0-0-9",  pt:620,  sire:"ヘニーヒューズ",   dam:"バイクニャン" },
      { no:3,  name:"ワインワインレッド",record:"0-0-4-8",pt:548,  sire:"Justify",           dam:"Streaming" },
      { no:9,  name:"ダグフォース",    record:"0-2-1-10", pt:463,  sire:"ドレフォン",        dam:"アレスウィスバー" },
      { no:4,  name:"ゴールデンマイク",record:"0-0-2-8",  pt:247,  sire:"Justify",           dam:"Sambuca Classica" },
      { no:10, name:"カミノモラド",    record:"0-0-0-9",  pt:83,   sire:"ロードカナロア",    dam:"クリスプ" },
      { no:7,  name:"メガラニカ",      record:"0-0-0-0",  pt:0,    sire:"イスラボニータ",    dam:"リリウム" },
    ],
    "P03": [
      { no:1,  name:"メイクザビート",  record:"3-4-2-11", pt:2320, sire:"マインドユアビスケッツ",dam:"カシノブギ" },
      { no:5,  name:"メジェド",        record:"2-1-2-10", pt:1798, sire:"キズナ",            dam:"ラヴェリータ" },
      { no:3,  name:"レイズカイザー",  record:"3-3-0-10", pt:1300, sire:"ヘニーヒューズ",   dam:"バイカータキン" },
      { no:8,  name:"ナムラテディー",  record:"1-2-1-15", pt:1251, sire:"レッドファルクス",  dam:"ナムラココロ" },
      { no:7,  name:"サクセスハチハチ",record:"0-5-1-3",  pt:1183, sire:"バイロ",           dam:"カリビアンロマンス" },
      { no:10, name:"メイショウノブカ",record:"2-3-0-14", pt:890,  sire:"シルバーステート",  dam:"ラッシュカッター" },
      { no:9,  name:"コバノスタンリー",record:"0-0-1-13", pt:213,  sire:"コバノリッキー",    dam:"ソフィアルージュ" },
      { no:6,  name:"デュアルモーション",record:"0-0-1-3",pt:140,  sire:"ドレフォン",        dam:"クロフォード" },
      { no:2,  name:"カーメルビーチ",  record:"0-0-0-11", pt:0,    sire:"サトノアラジン",    dam:"ヴァルタルサイビーチ" },
      { no:4,  name:"ロジザキア",      record:"0-0-0-1",  pt:0,    sire:"キズナ",            dam:"ザキア" },
    ],
    "P04": [
      { no:5,  name:"ミラクルティアラ",record:"4-6-3-6",  pt:2230, sire:"ヘニーヒューズ",   dam:"ミラクルレジェンド" },
      { no:7,  name:"ルルシュシュ",    record:"1-1-2-9",  pt:1083, sire:"リオンディーズ",    dam:"マダムチエコキー" },
      { no:2,  name:"ミラクルキャッツ",record:"2-0-2-11", pt:770,  sire:"キンシャサノキセキ",dam:"ランニングポップキャッツ" },
      { no:10, name:"ヴァレンティヌス",record:"1-0-0-4",  pt:750,  sire:"レッドファルクス",  dam:"ササンスピード" },
      { no:6,  name:"スターグロウ",    record:"1-4-1-9",  pt:676,  sire:"アメリカンペイトリオット",dam:"スターライト" },
      { no:1,  name:"マスグラバイト",  record:"2-1-2-11", pt:660,  sire:"キンシャサノキセキ",dam:"トリプライト" },
      { no:3,  name:"ジャスティンカプリ",record:"2-2-1-6",pt:515,  sire:"フォンタネットポー",dam:"" },
      { no:4,  name:"キュビドン",      record:"2-1-0-12", pt:100,  sire:"American Pharoah",  dam:"Chocolate Pop" },
      { no:8,  name:"ノルドウェスト",  record:"3-2-0-9",  pt:0,    sire:"ロードカナロア",    dam:"マエストラレー" },
      { no:9,  name:"オンクルヨリ",    record:"0-0-0-0",  pt:0,    sire:"ホコータルマエ",    dam:"コバノニキータ" },
    ],
  },
  "2023-24": {
    "P01": [
      { no:6,  name:"サトノフェニックス", record:"2-3-1-8",  pt:3200, sire:"ヘニーヒューズ",   dam:"サトノメイドティアラ" },
      { no:12, name:"ベンナヴェローチェ", record:"3-10-9-6", pt:1760, sire:"キズナ",            dam:"エンパイアブレイク" },
      { no:2,  name:"オコタンペ",         record:"2-3-5-16", pt:1757, sire:"ニューイヤーズデイ", dam:"ラーゴブルー" },
      { no:5,  name:"ノットイナフ",       record:"3-1-3-13", pt:1470, sire:"マジェスティックウォリアー",dam:"クライミングローズ" },
      { no:8,  name:"ソニックライン",     record:"1-2-6-9",  pt:1380, sire:"オルフェーヴル",    dam:"ルミナスパレード" },
      { no:4,  name:"アルシミスト",       record:"1-1-0-8",  pt:770,  sire:"オルフェーヴル",    dam:"ミセスワタナベ" },
      { no:10, name:"フルレゾン",         record:"2-3-2-10", pt:730,  sire:"オルフェーヴル",    dam:"カイカヨソウ" },
      { no:1,  name:"クラリファイ",       record:"0-1-0-4",  pt:238,  sire:"Justify",           dam:"Quote" },
      { no:11, name:"ジャンドル",         record:"0-0-1-3",  pt:180,  sire:"エピファネイア",    dam:"ラーブライド" },
      { no:9,  name:"メネラオス",         record:"0-0-1-12", pt:96,   sire:"アジアエクスプレス", dam:"ラトーナ" },
      { no:3,  name:"クセノポン",         record:"0-0-0-4",  pt:55,   sire:"ハーツクライ",      dam:"アレイヴィングビューティ" },
      { no:7,  name:"レイヌドサーブル",   record:"2-2-0-6",  pt:55,   sire:"ヘニーヒューズ",   dam:"レイヌドネージュ" },
    ],
    "P02": [
      { no:2,  name:"エコロガイア",     record:"3-5-2-14", pt:2762, sire:"Speightstown",      dam:"Charge of Angels" },
      { no:4,  name:"ルディック",       record:"4-11-1-6", pt:1940, sire:"Into Mischief",     dam:"Miss Besilu" },
      { no:12, name:"メイショウホウレン",record:"5-1-1-6",  pt:1500, sire:"エスポワールシティー",dam:"キンゲンショウ" },
      { no:9,  name:"エスカル",         record:"4-2-2-13", pt:1460, sire:"American Pharoah",  dam:"Pretty Girl" },
      { no:7,  name:"ダンツティアラ",   record:"1-4-2-3",  pt:990,  sire:"シニスターミニスター",dam:"ディアレストリックスキ" },
      { no:3,  name:"インテルメディオ", record:"1-2-1-8",  pt:960,  sire:"ドレフォン",        dam:"メリーウィドウ" },
      { no:11, name:"ボンピエ",         record:"1-1-3-17", pt:905,  sire:"レッドファルクス",  dam:"アルティメイトラブ" },
      { no:1,  name:"バリッドキャリア", record:"3-1-0-3",  pt:0,    sire:"ヘニーヒューズ",   dam:"サンライズシェル" },
      { no:5,  name:"ワインダモ",       record:"0-0-0-0",  pt:0,    sire:"Into Mischief",     dam:"Shopit" },
      { no:6,  name:"モッドフレイム",   record:"2-0-1-2",  pt:0,    sire:"Uncle Mo",          dam:"インフレイムド" },
      { no:8,  name:"リムショット",     record:"0-2-1-3",  pt:0,    sire:"ヘニーヒューズ",   dam:"ティンパレス" },
      { no:10, name:"シングマイブルース",record:"0-0-0-3",  pt:0,    sire:"War Front",         dam:"Solo Piano" },
    ],
    "P03": [
      { no:8,  name:"ビューロマジック",  record:"5-2-1-10", pt:6800, sire:"アジアエクスプレス", dam:"メジェルダ" },
      { no:7,  name:"カラフルメロディー",record:"1-4-0-6",  pt:1280, sire:"ジェンハイポピー",   dam:"カラフルメロディー" },
      { no:11, name:"ナファロア",        record:"2-1-0-13", pt:840,  sire:"イスラボニータ",    dam:"ナレラ" },
      { no:6,  name:"サンダーアラート",  record:"3-3-1-10", pt:690,  sire:"サンダースノー",    dam:"テイクウォーニング" },
      { no:9,  name:"サウンドアレグリア",record:"4-2-0-10", pt:550,  sire:"キズナ",            dam:"サウンドリアーナ" },
      { no:1,  name:"メイショウソウタ",  record:"3-4-3-10", pt:523,  sire:"ドレフォン",        dam:"メイショウオウヒ" },
      { no:4,  name:"ヘニーズネフュー",  record:"0-2-2-11", pt:385,  sire:"キズナ",            dam:"クローバーナイト" },
      { no:10, name:"リアルモハメド",    record:"1-2-0-6",  pt:155,  sire:"リオンディーズ",    dam:"ジュエルクイーン" },
      { no:5,  name:"アショカ",          record:"0-0-2-5",  pt:140,  sire:"ドゥラメンテ",      dam:"アメイジングライト" },
      { no:2,  name:"ハードタック",      record:"0-0-0-0",  pt:0,    sire:"マインドユアビスケッツ",dam:"サトノバーキン" },
      { no:3,  name:"ソングライター",    record:"0-1-1-4",  pt:0,    sire:"バイロ",            dam:"ギフトオブソング" },
      { no:12, name:"ウインクリード",    record:"2-2-0-4",  pt:0,    sire:"サンダースノー",    dam:"ベリーフ" },
    ],
    "P04": [
      { no:4,  name:"アンデスビエント",  record:"3-1-1-8",  pt:1940, sire:"ドレフォン",        dam:"アンデスクイーン" },
      { no:6,  name:"テーオードラッカー",record:"2-4-3-9",  pt:1310, sire:"コバノリッキー",    dam:"マキシムカフェ" },
      { no:1,  name:"ダノンスウィッチ",  record:"3-3-1-15", pt:1240, sire:"American Pharoah",  dam:"スウィッチインタイム" },
      { no:11, name:"マックスセレナーデ",record:"1-1-4-12", pt:1016, sire:"ドゥラメンテ",      dam:"シェイクスセレナーデ" },
      { no:9,  name:"ミッキードラマー",  record:"1-1-0-8",  pt:770,  sire:"ニューイヤーズデイ", dam:"プリオレット" },
      { no:8,  name:"アタラヨ",          record:"0-1-0-5",  pt:428,  sire:"Justify",           dam:"Magic Fountain" },
      { no:2,  name:"リルフロスト",      record:"0-0-2-12", pt:306,  sire:"スノードラゴン",    dam:"リルティングインク" },
      { no:12, name:"キツネノヨメイリ",  record:"0-0-1-4",  pt:140,  sire:"Justify",           dam:"Aloof" },
      { no:10, name:"タイセイマーシャル",record:"1-0-0-8",  pt:83,   sire:"ヘニーヒューズ",   dam:"ファーストチェア" },
      { no:3,  name:"プラストパローズ",  record:"0-3-0-2",  pt:0,    sire:"エピファネイア",    dam:"ゴッドフェニックス" },
      { no:5,  name:"ホウオウラムセス",  record:"3-0-1-9",  pt:0,    sire:"オメガフレグランス", dam:"" },
      { no:7,  name:"コヴィーニャ",      record:"1-1-1-5",  pt:0,    sire:"マインドユアビスケッツ",dam:"エミーズスマイル" },
    ],
    "P05": [
      { no:10, name:"エルフストラック",  record:"3-5-5-10", pt:1910, sire:"カリフォルニアクローム",dam:"スペルオンミー" },
      { no:6,  name:"センチュリボンド",  record:"2-0-1-3",  pt:1800, sire:"キズナ",            dam:"マークール" },
      { no:1,  name:"リューデスハイム",  record:"3-5-0-9",  pt:1353, sire:"ニューイヤーズデイ", dam:"グリューヴァイン" },
      { no:7,  name:"ヴェルトラウム",    record:"2-0-2-11", pt:1120, sire:"ミッキーロケット",  dam:"ヒルダ" },
      { no:9,  name:"ケイアイアルタイル",record:"2-2-2-6",  pt:832,  sire:"ニューイヤーズデイ", dam:"カーディナルコーヴ" },
      { no:12, name:"ウインイメル",      record:"1-1-2-15", pt:803,  sire:"サンダースノー",    dam:"コスモキシン" },
      { no:2,  name:"アセレラシオン",    record:"2-1-2-11", pt:720,  sire:"ドレフォン",        dam:"クレアドール" },
      { no:8,  name:"トニーテソーロ",    record:"2-0-0-5",  pt:720,  sire:"ヘニーヒューズ",   dam:"アイライン" },
      { no:3,  name:"フェリーニ",        record:"1-0-2-14", pt:670,  sire:"ドレフォン",        dam:"リミニ" },
      { no:5,  name:"リベルテ",          record:"0-1-3-11", pt:407,  sire:"エピカリス",        dam:"クイックステップ" },
      { no:11, name:"テトラード",        record:"0-2-3-15", pt:378,  sire:"マインドユアビスケッツ",dam:"カラフルマーメイド" },
      { no:4,  name:"アウトドライブ",    record:"3-0-1-8",  pt:72,   sire:"デクラレーションオブウォー",dam:"キティ" },
    ],
    "P07": [
      { no:4,  name:"アンクエンチャブル",record:"2-5-1-8",  pt:2092, sire:"ディスクリートキャット",dam:"スモーダリング" },
      { no:10, name:"タンゴバイラリン",  record:"3-2-4-13", pt:1450, sire:"イスラボニータ",    dam:"リベルタンゴ" },
      { no:7,  name:"ウェットシーズン",  record:"5-1-1-4",  pt:762,  sire:"Mendelssohn",       dam:"Season Maker" },
      { no:2,  name:"ダノンケイツー",    record:"1-0-0-6",  pt:620,  sire:"Justify",           dam:"エンタイスド" },
      { no:1,  name:"オペラブラージュ",  record:"3-0-1-6",  pt:550,  sire:"ニューイヤーズデイ", dam:"ベルプラージュ" },
      { no:12, name:"クリティカルヒット",record:"0-1-0-4",  pt:275,  sire:"American Pharoah",  dam:"Mythical Mission" },
      { no:9,  name:"ダイシンバースディ",record:"8-2-3-16", pt:245,  sire:"マインドユアビスケッツ",dam:"ルージュエアー" },
      { no:11, name:"ビスクウィザード",  record:"0-0-1-6",  pt:215,  sire:"マインドユアビスケッツ",dam:"ララベル" },
      { no:6,  name:"ディフェリ",        record:"0-0-0-3",  pt:72,   sire:"Mendelssohn",       dam:"Heavenly Romance" },
      { no:8,  name:"ウェイトウゴー",    record:"3-2-2-11", pt:55,   sire:"サンダースノー",    dam:"テラリ" },
      { no:3,  name:"パルログ",          record:"0-0-0-1",  pt:0,    sire:"ドレフォン",        dam:"アイトマコト" },
      { no:5,  name:"アイウィル",        record:"3-2-1-14", pt:0,    sire:"ドレフォン",        dam:"ジュリーハーツ" },
    ],
  },
  "2024-25": {
    "P01": [
      { no:2,  name:"クレーキング",      record:"2-3-1-1",  pt:7430, sire:"ナイル",            dam:"クインアマランサス" },
      { no:6,  name:"ジャナドリア",      record:"3-0-1-1",  pt:4900, sire:"ゴールドドリーム",  dam:"ターシャズスター" },
      { no:7,  name:"グランジョルノ",    record:"1-2-0-5",  pt:2785, sire:"ゴールドドリーム",  dam:"ヴィータアレグリア" },
      { no:11, name:"アローオブライト",  record:"2-0-0-3",  pt:1502, sire:"ヘニーヒューズ",   dam:"アドマイヤアロー" },
      { no:3,  name:"ソリスクラヴィス",  record:"2-1-0-4",  pt:1444, sire:"ヘニーヒューズ",   dam:"クローバーセクレタ" },
      { no:8,  name:"ヤノマスティーロ",  record:"1-1-0-2",  pt:810,  sire:"ロードカナロア",    dam:"スペシャルグルーヴ" },
      { no:4,  name:"ボヌールキャッツ",  record:"0-1-1-8",  pt:661,  sire:"ニューイヤーズデイ", dam:"ランニングポップキャッツ" },
      { no:5,  name:"フォンデネージュ",  record:"1-1-2-5",  pt:610,  sire:"ドレフォン",        dam:"コキチャン" },
      { no:12, name:"ラピッドグロウス",  record:"0-1-1-4",  pt:470,  sire:"キズナ",            dam:"ジベッサ" },
      { no:1,  name:"エンジェルラダー",  record:"1-2-1-4",  pt:236,  sire:"Nyquist",           dam:"Tiz Miz Sue" },
      { no:10, name:"ジャスティンロング",record:"0-0-0-7",  pt:128,  sire:"ルヴァンスレーヴ",  dam:"アドマイヤアロング" },
      { no:9,  name:"フランシュフック",  record:"0-0-1-2",  pt:0,    sire:"ヘニーヒューズ",   dam:"ブルークランス" },
    ],
    "P02": [
      { no:10, name:"ニューファウンド",   record:"2-1-1-8",  pt:1912, sire:"ニューイヤーズデイ", dam:"イルシンヴァゴールド" },
      { no:6,  name:"シホノベルフェット", record:"2-1-0-11", pt:1748, sire:"マジェスティックウォリアー",dam:"アンソロジー" },
      { no:4,  name:"クニノハッピー",     record:"1-3-4-8",  pt:1372, sire:"ヘニーヒューズ",   dam:"ルミナスハッピー" },
      { no:5,  name:"バタール",           record:"2-2-1-2",  pt:1040, sire:"ナダル",            dam:"アデレードヒル" },
      { no:9,  name:"モレポブラーノ",     record:"2-2-1-6",  pt:975,  sire:"マインドユアビスケッツ",dam:"ハラベーニョペベル" },
      { no:7,  name:"マーキュリーダイム", record:"1-0-0-3",  pt:560,  sire:"Medaglia d'Oro",   dam:"ラッキーダイム" },
      { no:11, name:"ホウオウアンジュ",   record:"0-0-2-0",  pt:320,  sire:"オルフェーヴル",    dam:"アンジョシュエット" },
      { no:3,  name:"タンテドヴィーヴル", record:"2-1-1-7",  pt:80,   sire:"ルヴァンスレーヴ",  dam:"レネットグルーヴ" },
      { no:1,  name:"ジャスティントレノ", record:"0-0-1-5",  pt:56,   sire:"Into Mischief",     dam:"Pink Sands" },
      { no:2,  name:"レジェンダイズ",     record:"0-0-0-5",  pt:0,    sire:"マインドユアビスケッツ",dam:"ミラクルレジェンド" },
      { no:8,  name:"テイエムライダー",   record:"0-0-0-1",  pt:0,    sire:"ルヴァンスレーヴ",  dam:"ドリームライダー" },
      { no:12, name:"アーロッタレット",   record:"3-1-0-6",  pt:0,    sire:"Practical Joke",    dam:"Folklore" },
    ],
    "P03": [
      { no:10, name:"ミストレス",        record:"2-1-0-13", pt:2160, sire:"キズナ",            dam:"チェロキーメイドン" },
      { no:2,  name:"レイナデアルシェラ",record:"4-2-1-7",  pt:1242, sire:"ナダル",            dam:"アンデスクイーン" },
      { no:4,  name:"イガッチ",          record:"4-0-2-4",  pt:1172, sire:"リアルスティール",  dam:"クリーミーボイス" },
      { no:3,  name:"サンダーロード",    record:"2-1-2-12", pt:1145, sire:"Authentic",          dam:"ダファカモーレ" },
      { no:5,  name:"チムニートップス",  record:"2-1-0-8",  pt:960,  sire:"Tapit",              dam:"Speedinthruthecity" },
      { no:12, name:"サニーサルサ",      record:"1-0-0-10", pt:960,  sire:"マインドユアビスケッツ",dam:"チカレグレ" },
      { no:11, name:"シルフズミスチーフ",record:"2-1-2-10", pt:900,  sire:"Into Mischief",      dam:"Heavenhasmynikki" },
      { no:7,  name:"ビービーバザーク",  record:"0-5-1-7",  pt:666,  sire:"シニスターミニスター",dam:"カリビアンロマンス" },
      { no:9,  name:"カルデライト",      record:"0-2-0-6",  pt:593,  sire:"ナダル",             dam:"コーディエライト" },
      { no:1,  name:"パルジール",        record:"2-3-3-3",  pt:180,  sire:"オルフェーヴル",     dam:"ソロダンサー" },
      { no:6,  name:"グレインワーク",    record:"0-0-0-2",  pt:72,   sire:"イスラボニータ",     dam:"エスメラルディーナ" },
      { no:8,  name:"メムエクラ",        record:"0-0-0-4",  pt:0,    sire:"イスラボニータ",     dam:"ディアコメット" },
    ],
    "P04": [
      { no:1,  name:"ルクソールカフェ",  record:"5-1-1-4",  pt:5690, sire:"American Pharoah",  dam:"Mary's Follies" },
      { no:11, name:"モズナナスター",    record:"3-4-2-11", pt:3600, sire:"モズアスコット",    dam:"グランプリエンゼル" },
      { no:12, name:"プロミストジーン",  record:"4-3-1-2",  pt:3270, sire:"ナダル",            dam:"プロミストリーブ" },
      { no:5,  name:"マイネルフーガ",    record:"2-5-2-5",  pt:1400, sire:"ダノンバラード",    dam:"マイネノノ" },
      { no:7,  name:"マリアイリダータ",  record:"3-3-1-0",  pt:1360, sire:"ドゥラメンテ",      dam:"マルケッサ" },
      { no:2,  name:"ダノンヴェステル",  record:"1-4-3-1",  pt:1300, sire:"American Pharoah",  dam:"マダムヴェステル" },
      { no:9,  name:"グレイテストソング",record:"3-2-0-4",  pt:1030, sire:"モズアスコット",    dam:"シネマソングス" },
      { no:10, name:"ヴィンブルレー",    record:"2-2-0-3",  pt:923,  sire:"グリューヴァイン",  dam:"" },
      { no:8,  name:"スマートカイロス",  record:"3-1-0-8",  pt:560,  sire:"シニスターミニスター",dam:"スマートバベル" },
      { no:6,  name:"コスモガラニカ",    record:"0-1-1-7",  pt:429,  sire:"ダノンバラード",    dam:"サウンズスピード" },
      { no:3,  name:"マリアディオーサ",  record:"1-1-0-4",  pt:0,    sire:"スマートファルコン", dam:"マリアージュ" },
      { no:4,  name:"ランフォザブライド",record:"0-0-0-3",  pt:0,    sire:"ナダル",            dam:"エミーズブライド" },
    ],
    "P05": [
      { no:2,  name:"カナルビーグル",    record:"3-0-1-2",  pt:5850, sire:"リアルスティール",  dam:"ソプラドリンク" },
      { no:1,  name:"トリポリタニア",    record:"4-1-1-5",  pt:2560, sire:"ルヴァンスレーヴ",  dam:"トリプライト" },
      { no:5,  name:"アートレスマインド",record:"2-4-2-6",  pt:1600, sire:"マインドユアビスケッツ",dam:"リチュアルローズ" },
      { no:9,  name:"ポルトテソーロ",    record:"1-1-1-7",  pt:1160, sire:"サンダースノー",    dam:"カメリアローズ2" },
      { no:10, name:"ステイクオール",    record:"1-0-2-7",  pt:1000, sire:"ナダル",            dam:"ボールドアテンプト" },
      { no:11, name:"グレイスザクラウン",record:"2-1-1-10", pt:820,  sire:"リーチザクラウン",  dam:"キトウンズグレイス" },
      { no:7,  name:"レッドソニード",    record:"0-1-1-4",  pt:483,  sire:"イスラボニータ",    dam:"ダンスグルーヴィ" },
      { no:3,  name:"ソーツアウト",      record:"0-0-0-0",  pt:0,    sire:"ナダル",            dam:"ブリームス" },
      { no:4,  name:"パレアレス",        record:"0-0-0-4",  pt:0,    sire:"ナダル",            dam:"チャームザワールド" },
      { no:6,  name:"ツァイトガイスト",  record:"0-0-0-4",  pt:0,    sire:"シスキン",          dam:"オージャイト" },
      { no:8,  name:"グランダイト",      record:"0-0-0-4",  pt:0,    sire:"ドレフォン",        dam:"ガーネットチャーム" },
      { no:12, name:"レッドエソール",    record:"0-0-0-3",  pt:0,    sire:"シスキン",          dam:"アッフェルマーレ" },
    ],
    "P07": [
      { no:5,  name:"ダノンフィーゴ",    record:"6-2-2-2",  pt:1640, sire:"Into Mischief",     dam:"オリーズキャンディ" },
      { no:1,  name:"グランドプラージュ",record:"4-2-0-0",  pt:1520, sire:"シニスターミニスター",dam:"ベルプラージュ" },
      { no:3,  name:"ベンヌ",            record:"3-0-1-4",  pt:1520, sire:"バイロ",            dam:"レッドフェザー" },
      { no:6,  name:"ダニエルバローズ",  record:"1-0-0-9",  pt:688,  sire:"American Pharoah",  dam:"ターフウォー" },
      { no:8,  name:"オンクラウドナイン",record:"0-1-4-6",  pt:584,  sire:"ラニ",              dam:"シアージュ" },
      { no:9,  name:"サルタール",        record:"2-1-3-8",  pt:540,  sire:"マジェスティックウォリアー",dam:"イグレット" },
      { no:10, name:"スキュア",          record:"0-0-0-1",  pt:110,  sire:"トランセンド",      dam:"ランキュラス" },
      { no:12, name:"ケイアイブイスリー",record:"1-0-0-11", pt:84,   sire:"ルヴァンスレーヴ",  dam:"ケイアイガーベラ" },
      { no:2,  name:"アインブレーゲン",  record:"0-0-0-2",  pt:56,   sire:"Mendelssohn",       dam:"Heavenly Romance" },
      { no:4,  name:"チェインズモーカー",record:"0-0-0-4",  pt:0,    sire:"ヘニーヒューズ",   dam:"パワースポット" },
      { no:7,  name:"チームビルディング",record:"0-0-0-1",  pt:0,    sire:"サトノアラジン",    dam:"サリエル" },
      { no:11, name:"ブランクシート",    record:"0-1-0-2",  pt:0,    sire:"ディスクリートキャット",dam:"ニューチャプター2" },
    ],
  },
};

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
  // ===== 2025-26シーズン（〜2026/06東京ダービーまで） =====
  { season:"2025-26", player:"P03", grade:"JpnI",   race:"羽田盃競走",           horse:"フィンガー",       order:1, date:"2026/04/29" },
  { season:"2025-26", player:"P03", grade:"JpnII",  race:"京浜盃競走",           horse:"フィンガー",       order:2, date:"2026/03/25" },
  { season:"2025-26", player:"P03", grade:"JpnIII", race:"ブルーバードC",        horse:"フィンガー",       order:1, date:"2026/01/21" },
  { season:"2025-26", player:"P05", grade:"JpnII",  race:"兵庫チャンピオンシップ",horse:"サトノボヤージュ", order:1, date:"2026/05/06" },
  { season:"2025-26", player:"P05", grade:"GIII",   race:"サウジダービー",        horse:"サトノボヤージュ", order:3, date:"2026/02/14" },
  { season:"2025-26", player:"P06", grade:"JpnI",   race:"羽田盃競走",           horse:"ロックターミガン", order:2, date:"2026/04/29" },
  { season:"2025-26", player:"P06", grade:"JpnII",  race:"京浜盃競走",           horse:"ロックターミガン", order:1, date:"2026/03/25" },
  { season:"2025-26", player:"P06", grade:"JpnIII", race:"雲取賞競走",           horse:"トリグラフヒル",   order:2, date:"2026/02/18" },
  // ===== 2024-25シーズン（〜2025/06東京ダービーまで） =====
  { season:"2024-25", player:"P01", grade:"JpnI",   race:"東京ダービー競走",     horse:"クレーキング",     order:2, date:"2025/06/11" },
  { season:"2024-25", player:"P01", grade:"GIII",   race:"ユニコーンS",          horse:"クレーキング",     order:2, date:"2025/05/03" },
  { season:"2024-25", player:"P01", grade:"JpnI",   race:"羽田盃競走",           horse:"ジャナドリア",     order:3, date:"2025/04/29" },
  { season:"2024-25", player:"P01", grade:"JpnIII", race:"雲取賞競走",           horse:"ジャナドリア",     order:1, date:"2025/02/19" },
  { season:"2024-25", player:"P01", grade:"JpnIII", race:"雲取賞競走",           horse:"グランジョルノ",   order:2, date:"2025/02/19" },
  { season:"2024-25", player:"P01", grade:"JpnIII", race:"JBC2歳優駿",           horse:"グランジョルノ",   order:2, date:"2024/11/04" },
  { season:"2024-25", player:"P05", grade:"GIII",   race:"ユニコーンS",          horse:"パントルナイーフ", order:1, date:"2025/05/03" },
  // ===== 2023-24シーズン（〜2024/06東京ダービーまで） =====
  // ※ レパードS(8月)・不来方賞(9月)・関東オークス(6/12)はPOG期間外のため除外
  { season:"2023-24", player:"P02", grade:"JpnIII", race:"ブルーバードC",         horse:"エコロガイア",     order:2, date:"2024/01/17" },
  { season:"2023-24", player:"P01", grade:"JpnII",  race:"兵庫ジュニアグランプリ",horse:"サトノフェニックス",order:2, date:"2023/11/22" },
];

// ================================================================
// シーズン表彰データ
// ================================================================
const SEASON_AWARDS = [
  {
    season: "2024-25",
    items: [
      { title:"最優秀厩舎",   stable:"前田厩舎",   horse:"",                 note:"シーズン優勝" },
      { title:"最優砂遊び馬", stable:"前田厩舎",   horse:"クレーキング",     note:"G1東京ダービー2着" },
      { title:"最優秀牝馬",   stable:"ミリオン厩舎", horse:"フロミストジーン", note:"OPヒヤシンス2着" },
      { title:"最優秀短距離", stable:"ミリオン厩舎", horse:"ルクソールカフェ", note:"OPヒヤシンス1着" },
      { title:"最優秀中距離", stable:"田崎厩舎",    horse:"カナルビーグル",   note:"G3ユニコーン1着" },
      { title:"最優秀芝馬",   stable:"ミリオン厩舎", horse:"モズナナスター",   note:"G3ファンタジー2着" },
    ],
  },
  {
    season: "2023-24",
    items: [
      { title:"最優秀厩舎",   stable:"川村厩舎",    horse:"",                  note:"シーズン優勝" },
      { title:"最優砂遊び馬", stable:"前田厩舎",    horse:"サトノフェニックス", note:"" },
      { title:"最優秀短距離", stable:"前田厩舎",    horse:"サトノフェニックス", note:"" },
      { title:"最優秀中距離", stable:"川村厩舎",    horse:"エコロガイア",      note:"" },
      { title:"最優秀牝馬",   stable:"ミリオン厩舎", horse:"アンデスビエント",   note:"" },
      { title:"最優秀芝馬",   stable:"長谷部厩舎",   horse:"ピューロマジック",   note:"" },
    ],
  },
  {
    season: "2022-23",
    items: [
      { title:"最優秀厩舎",   stable:"前田厩舎",    horse:"",                  note:"シーズン優勝" },
      { title:"最優砂遊び馬", stable:"前田厩舎",    horse:"ユティタム",         note:"" },
      { title:"最優秀中距離", stable:"前田厩舎",    horse:"ユティタム",         note:"" },
      { title:"最優秀短距離", stable:"山田厩舎",    horse:"サンライズフレイム",  note:"" },
      { title:"最優秀牝馬",   stable:"ミリオン厩舎", horse:"ミラクルティアラ",   note:"" },
      { title:"最優秀芝馬",   stable:"じゃが厩舎",  horse:"フルメタルボディー", note:"" },
    ],
  },
];

// ================================================================
// レーシングカレンダー（2025-26シーズン ダート2歳・3歳全日程）
// grade: "JpnI"|"JpnII"|"JpnIII"|"GⅢ"|"L"|"OP"|"1勝"|"未勝利"|"新馬"
// type: "race" | "meeting"（開催開始マーカー）
// exchange: 交流重賞フラグ
// age: "2歳"|"3歳"|"3歳牝"|"3歳以上"|"3歳以上牝"
// ================================================================
const RACE_CALENDAR_2526 = [
  // ── 2025年6月 ── 東京・阪神で2歳新馬戦解禁（シーズン開幕）──────────────
  { date:"2025/06/07", name:"2歳新馬戦", grade:"新馬", venue:"東京", dist:null, dists:"ダ1400・1600・1800m", age:"2歳", exchange:false, type:"meeting", winner:"", note:"2歳新馬戦シーズン開幕（東京・阪神）" },
  { date:"2025/06/07", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/06/14", name:"2歳新馬戦", grade:"新馬", venue:"東京", dist:null, dists:"ダ1400・1600・1800m", age:"2歳", exchange:false, type:"meeting", winner:"", note:"福島も開幕" },
  { date:"2025/06/14", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/06/14", name:"2歳新馬戦", grade:"新馬", venue:"福島", dist:null, dists:"ダ1150m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/06/21", name:"2歳新馬戦", grade:"新馬", venue:"東京", dist:null, dists:"ダ1400・1600・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/06/21", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/06/21", name:"2歳新馬戦", grade:"新馬", venue:"福島", dist:null, dists:"ダ1150m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/06/28", name:"2歳新馬戦", grade:"新馬", venue:"東京", dist:null, dists:"ダ1400・1600・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/06/28", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/06/28", name:"2歳新馬戦", grade:"新馬", venue:"福島", dist:null, dists:"ダ1150m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  // ── 2025年7月 ── 函館・小倉で2歳ダート新馬解禁 ──────────────
  { date:"2025/07/05", name:"2歳新馬戦", grade:"新馬", venue:"函館", dist:null, dists:"ダ1000m", age:"2歳", exchange:false, type:"meeting", winner:"", note:"函館・小倉開幕" },
  { date:"2025/07/05", name:"2歳新馬戦", grade:"新馬", venue:"小倉", dist:null, dists:"ダ1000・1700m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/07/12", name:"2歳新馬戦", grade:"新馬", venue:"函館", dist:null, dists:"ダ1000m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/07/12", name:"2歳新馬戦", grade:"新馬", venue:"小倉", dist:null, dists:"ダ1000・1700m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/07/19", name:"2歳新馬戦", grade:"新馬", venue:"函館", dist:null, dists:"ダ1000m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/07/19", name:"2歳新馬戦", grade:"新馬", venue:"小倉", dist:null, dists:"ダ1000・1700m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/07/26", name:"2歳新馬戦", grade:"新馬", venue:"函館", dist:null, dists:"ダ1000m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/07/26", name:"2歳新馬戦", grade:"新馬", venue:"小倉", dist:null, dists:"ダ1000・1700m", age:"2歳", exchange:false, type:"meeting", winner:"" },

  // ── 2025年8月 ── 新潟・小倉・札幌 ──────────────────────────
  { date:"2025/08/02", name:"2歳新馬戦", grade:"新馬", venue:"新潟", dist:null, dists:"ダ1200m", age:"2歳", exchange:false, type:"meeting", winner:"", note:"新潟・小倉・札幌で2歳ダート開幕" },
  { date:"2025/08/02", name:"2歳新馬戦", grade:"新馬", venue:"小倉", dist:null, dists:"ダ1000・1700m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/08/02", name:"2歳新馬戦", grade:"新馬", venue:"札幌", dist:null, dists:"ダ1000m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/08/09", name:"2歳新馬戦", grade:"新馬", venue:"新潟", dist:null, dists:"ダ1200m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/08/09", name:"2歳新馬戦", grade:"新馬", venue:"小倉", dist:null, dists:"ダ1000・1700m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/08/09", name:"2歳新馬戦", grade:"新馬", venue:"札幌", dist:null, dists:"ダ1000m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/08/16", name:"2歳新馬戦", grade:"新馬", venue:"新潟", dist:null, dists:"ダ1200m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/08/16", name:"2歳新馬戦", grade:"新馬", venue:"小倉", dist:null, dists:"ダ1000・1700m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/08/16", name:"2歳新馬戦", grade:"新馬", venue:"札幌", dist:null, dists:"ダ1000m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/08/23", name:"2歳新馬戦", grade:"新馬", venue:"新潟", dist:null, dists:"ダ1200m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/08/23", name:"2歳新馬戦", grade:"新馬", venue:"小倉", dist:null, dists:"ダ1000・1700m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/08/23", name:"2歳新馬戦", grade:"新馬", venue:"札幌", dist:null, dists:"ダ1000m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/08/30", name:"2歳新馬戦", grade:"新馬", venue:"新潟", dist:null, dists:"ダ1200m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/08/30", name:"2歳新馬戦", grade:"新馬", venue:"小倉", dist:null, dists:"ダ1000・1700m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/08/30", name:"2歳新馬戦", grade:"新馬", venue:"札幌", dist:null, dists:"ダ1000m", age:"2歳", exchange:false, type:"meeting", winner:"" },

  // ── 2025年9月 ── 中山・中京・阪神・新潟・札幌 ───────────────
  { date:"2025/09/03", name:"北海道2歳優駿", grade:"JpnII", venue:"門別", dist:1800, age:"2歳", exchange:true, type:"race", winner:"" },
  { date:"2025/09/06", name:"2歳新馬戦", grade:"新馬", venue:"中山", dist:null, dists:"ダ1200・1800m", age:"2歳", exchange:false, type:"meeting", winner:"", note:"中山・中京で2歳ダート開幕" },
  { date:"2025/09/06", name:"2歳新馬戦", grade:"新馬", venue:"中京", dist:null, dists:"ダ1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/09/06", name:"2歳新馬戦", grade:"新馬", venue:"新潟", dist:null, dists:"ダ1200m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/09/06", name:"2歳新馬戦", grade:"新馬", venue:"札幌", dist:null, dists:"ダ1000m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/09/13", name:"2歳新馬戦", grade:"新馬", venue:"中山", dist:null, dists:"ダ1200・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/09/13", name:"2歳新馬戦", grade:"新馬", venue:"中京", dist:null, dists:"ダ1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/09/13", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"", note:"阪神で2歳ダート開幕" },
  { date:"2025/09/20", name:"2歳新馬戦", grade:"新馬", venue:"中山", dist:null, dists:"ダ1200・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/09/20", name:"2歳新馬戦", grade:"新馬", venue:"中京", dist:null, dists:"ダ1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/09/20", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/09/27", name:"2歳新馬戦", grade:"新馬", venue:"中山", dist:null, dists:"ダ1200・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/09/27", name:"2歳新馬戦", grade:"新馬", venue:"中京", dist:null, dists:"ダ1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/09/27", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },

  // ── 2025年10月 ── 東京・京都開幕 ────────────────────────────
  { date:"2025/10/04", name:"2歳新馬戦", grade:"新馬", venue:"東京", dist:null, dists:"ダ1400・1600・1800m", age:"2歳", exchange:false, type:"meeting", winner:"", note:"東京で2歳ダート開幕" },
  { date:"2025/10/04", name:"2歳新馬戦", grade:"新馬", venue:"中京", dist:null, dists:"ダ1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/10/04", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/10/11", name:"2歳新馬戦", grade:"新馬", venue:"京都", dist:null, dists:"ダ1200・1400・1900m", age:"2歳", exchange:false, type:"meeting", winner:"", note:"京都で2歳ダート開幕" },
  { date:"2025/10/11", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/10/13", name:"プラタナス賞", grade:"OP", venue:"東京", dist:1800, age:"2歳", exchange:false, type:"race", winner:"" },
  { date:"2025/10/18", name:"2歳新馬戦", grade:"新馬", venue:"東京", dist:null, dists:"ダ1400・1600・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/10/18", name:"2歳新馬戦", grade:"新馬", venue:"京都", dist:null, dists:"ダ1200・1400・1900m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/10/18", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/10/25", name:"2歳新馬戦", grade:"新馬", venue:"東京", dist:null, dists:"ダ1400・1600・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/10/25", name:"2歳新馬戦", grade:"新馬", venue:"京都", dist:null, dists:"ダ1200・1400・1900m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/10/25", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },

  // ── 2025年11月 ── 東京・阪神・中京・重賞集中 ────────────────
  { date:"2025/11/01", name:"2歳新馬戦", grade:"新馬", venue:"東京", dist:null, dists:"ダ1400・1600・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/11/01", name:"2歳新馬戦", grade:"新馬", venue:"京都", dist:null, dists:"ダ1200・1400・1900m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/11/01", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/11/02", name:"百日草特別", grade:"1勝", venue:"東京", dist:1800, age:"2歳", exchange:false, type:"race", winner:"" },
  { date:"2025/11/08", name:"カトレアステークス", grade:"OP", venue:"東京", dist:1600, age:"2歳", exchange:false, type:"race", winner:"" },
  { date:"2025/11/08", name:"2歳新馬戦", grade:"新馬", venue:"中京", dist:null, dists:"ダ1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/11/08", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/11/15", name:"2歳新馬戦", grade:"新馬", venue:"東京", dist:null, dists:"ダ1400・1600・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/11/15", name:"2歳新馬戦", grade:"新馬", venue:"中京", dist:null, dists:"ダ1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/11/15", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/11/19", name:"兵庫ジュニアグランプリ", grade:"JpnII", venue:"園田", dist:1400, age:"2歳", exchange:true, type:"race", winner:"" },
  { date:"2025/11/22", name:"2歳新馬戦", grade:"新馬", venue:"東京", dist:null, dists:"ダ1400・1600・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/11/22", name:"2歳新馬戦", grade:"新馬", venue:"中京", dist:null, dists:"ダ1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/11/22", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/11/29", name:"2歳新馬戦", grade:"新馬", venue:"中山", dist:null, dists:"ダ1200・1800m", age:"2歳", exchange:false, type:"meeting", winner:"", note:"冬・中山開幕" },
  { date:"2025/11/29", name:"2歳新馬戦", grade:"新馬", venue:"中京", dist:null, dists:"ダ1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },

  // ── 2025年12月 ── 中山・阪神・中京＋主要重賞 ────────────────
  { date:"2025/12/06", name:"2歳新馬戦", grade:"新馬", venue:"中山", dist:null, dists:"ダ1200・1800m", age:"2歳", exchange:false, type:"meeting", winner:"", note:"冬・阪神・中京開幕" },
  { date:"2025/12/06", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/12/06", name:"2歳新馬戦", grade:"新馬", venue:"中京", dist:null, dists:"ダ1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/12/10", name:"全日本2歳優駿", grade:"JpnI", venue:"川崎", dist:1600, age:"2歳", exchange:true, type:"race", winner:"" },
  { date:"2025/12/13", name:"2歳新馬戦", grade:"新馬", venue:"中山", dist:null, dists:"ダ1200・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/12/13", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/12/13", name:"2歳新馬戦", grade:"新馬", venue:"中京", dist:null, dists:"ダ1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/12/17", name:"東京2歳優駿牝馬", grade:"JpnII", venue:"大井", dist:1600, age:"2歳牝", exchange:true, type:"race", winner:"" },
  { date:"2025/12/20", name:"ポインセチアステークス", grade:"OP", venue:"阪神", dist:1800, age:"2歳", exchange:false, type:"race", winner:"", note:"2025年新設" },
  { date:"2025/12/20", name:"2歳新馬戦", grade:"新馬", venue:"中山", dist:null, dists:"ダ1200・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/12/20", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/12/27", name:"2歳新馬戦", grade:"新馬", venue:"中山", dist:null, dists:"ダ1200・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },
  { date:"2025/12/27", name:"2歳新馬戦", grade:"新馬", venue:"阪神", dist:null, dists:"ダ1200・1400・1800m", age:"2歳", exchange:false, type:"meeting", winner:"" },

  // ── 2026年1月 ── 3歳本格化 ──────────────────────────────────
  { date:"2026/01/04", name:"3歳ダート1勝クラス", grade:"1勝", venue:"中山・中京・京都", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"", note:"年明け初日から3歳条件戦スタート" },
  { date:"2026/01/10", name:"3歳ダート1勝クラス", grade:"1勝", venue:"中山・中京・京都", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },
  { date:"2026/01/17", name:"3歳ダート1勝クラス", grade:"1勝", venue:"中山・中京・京都", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },
  { date:"2026/01/21", name:"ブルーバードカップ", grade:"L", venue:"中山", dist:1200, age:"3歳", exchange:false, type:"race", winner:"" },
  { date:"2026/01/24", name:"3歳ダート1勝クラス", grade:"1勝", venue:"中山・中京・京都", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },
  { date:"2026/01/31", name:"3歳ダート1勝クラス", grade:"1勝", venue:"中山・中京・京都", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },

  // ── 2026年2月 ─────────────────────────────────────────────
  { date:"2026/02/07", name:"ヒヤシンスステークス", grade:"L", venue:"東京", dist:1600, age:"3歳", exchange:false, type:"race", winner:"" },
  { date:"2026/02/07", name:"3歳ダート1勝クラス", grade:"1勝", venue:"小倉・中山・阪神", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },
  { date:"2026/02/14", name:"3歳ダート1勝クラス", grade:"1勝", venue:"東京・小倉・阪神", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },
  { date:"2026/02/18", name:"雲取賞", grade:"JpnIII", venue:"大井", dist:2100, age:"3歳", exchange:true, type:"race", winner:"" },
  { date:"2026/02/21", name:"3歳ダート1勝クラス", grade:"1勝", venue:"東京・小倉・阪神", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },
  { date:"2026/02/28", name:"3歳ダート1勝クラス", grade:"1勝", venue:"東京・阪神", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },

  // ── 2026年3月 ─────────────────────────────────────────────
  { date:"2026/03/04", name:"伏竜S", grade:"L", venue:"中山", dist:1800, age:"3歳", exchange:false, type:"race", winner:"" },
  { date:"2026/03/07", name:"3歳ダート1勝クラス", grade:"1勝", venue:"中山・阪神・中京", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },
  { date:"2026/03/14", name:"バイオレットステークス", grade:"OP", venue:"阪神", dist:1400, age:"3歳", exchange:false, type:"race", winner:"" },
  { date:"2026/03/14", name:"3歳ダート1勝クラス", grade:"1勝", venue:"中山・阪神・中京", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },
  { date:"2026/03/21", name:"3歳ダート1勝クラス", grade:"1勝", venue:"中山・阪神・中京", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },
  { date:"2026/03/25", name:"京浜盃", grade:"JpnII", venue:"大井", dist:1800, age:"3歳", exchange:true, type:"race", winner:"" },
  { date:"2026/03/28", name:"昇竜ステークス", grade:"L", venue:"中京", dist:1400, age:"3歳", exchange:false, type:"race", winner:"" },
  { date:"2026/03/28", name:"3歳ダート1勝クラス", grade:"1勝", venue:"中山・阪神", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },

  // ── 2026年4月 ── 東京・京都・阪神 春競馬 ────────────────────
  { date:"2026/04/04", name:"3歳ダート1勝クラス", grade:"1勝", venue:"東京・京都・阪神", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"", note:"東京・京都春開催スタート" },
  { date:"2026/04/11", name:"3歳ダート1勝クラス", grade:"1勝", venue:"東京・京都・阪神", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },
  { date:"2026/04/15", name:"東京プリンセス賞", grade:"JpnII", venue:"大井", dist:1800, age:"3歳牝", exchange:true, type:"race", winner:"" },
  { date:"2026/04/18", name:"3歳ダート1勝クラス", grade:"1勝", venue:"東京・京都", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },
  { date:"2026/04/25", name:"鳳雛ステークス", grade:"L", venue:"京都", dist:1800, age:"3歳", exchange:false, type:"race", winner:"" },
  { date:"2026/04/25", name:"3歳ダート1勝クラス", grade:"1勝", venue:"東京・京都", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },
  { date:"2026/04/29", name:"羽田盃", grade:"JpnI", venue:"大井", dist:2000, age:"3歳", exchange:true, type:"race", winner:"" },

  // ── 2026年5月 ── シーズン佳境 ──────────────────────────────
  { date:"2026/05/02", name:"3歳ダート1勝クラス", grade:"1勝", venue:"東京・京都", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },
  { date:"2026/05/03", name:"ユニコーンS", grade:"GⅢ", venue:"京都", dist:1900, age:"3歳", exchange:false, type:"race", winner:"", note:"2025年より京都移設・ダ1900m" },
  { date:"2026/05/06", name:"兵庫チャンピオンシップ", grade:"JpnII", venue:"園田", dist:1870, age:"3歳", exchange:true, type:"race", winner:"" },
  { date:"2026/05/09", name:"3歳ダート1勝クラス", grade:"1勝", venue:"東京・京都", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },
  { date:"2026/05/16", name:"青竜ステークス", grade:"OP", venue:"東京", dist:1600, age:"3歳", exchange:false, type:"race", winner:"" },
  { date:"2026/05/16", name:"端午ステークス", grade:"OP", venue:"京都", dist:1400, age:"3歳", exchange:false, type:"race", winner:"" },
  { date:"2026/05/23", name:"3歳ダート1勝クラス", grade:"1勝", venue:"東京・京都", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },
  { date:"2026/05/30", name:"3歳ダート1勝クラス", grade:"1勝", venue:"東京・京都", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"" },

  // ── 2026年6月 ── シーズン最終章 ─────────────────────────────
  { date:"2026/06/03", name:"関東オークス", grade:"JpnII", venue:"川崎", dist:2100, age:"3歳牝", exchange:true, type:"race", winner:"" },
  { date:"2026/06/06", name:"3歳ダート1勝クラス", grade:"1勝", venue:"東京・阪神・中京", dist:null, age:"3歳", exchange:false, type:"meeting", winner:"", note:"東京ダービー週前・未勝利馬の最後の機会" },
  { date:"2026/06/11", name:"東京ダービー 🏆", grade:"JpnI", venue:"大井", dist:2000, age:"3歳", exchange:true, type:"race", winner:"", goal:true },
];

// 2026-27シーズン用カレンダー（日付を1年ずらして自動生成）
// ※ 開催日は例年のスケジュール基準の目安です。公式発表で変わる場合があります
const RACE_CALENDAR_2627 = RACE_CALENDAR_2526.map(r => ({
  ...r,
  date: `${parseInt(r.date.slice(0, 4)) + 1}${r.date.slice(4)}`,
  winner: "",  // 未来のレースはリセット
}));

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

function SurfaceTag({ surface, dist, small=false }) {
  return (
    <span style={{
      display:"inline-block", fontWeight:700, color:"#fff",
      background: surface==="dirt" ? G.dirt : G.green,
      borderRadius:4,
      fontSize: small ? 9 : 11,
      padding: small ? "1px 4px" : "2px 6px",
      marginRight: small ? 0 : 6,
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
    <span translate="no" style={{
      fontSize:10, fontWeight:800, color:"#fff",
      background:bg, borderRadius:4, padding:"1px 5px", marginRight:4,
    }}>{label}</span>
  );
}

// テーブル行スタイル（スタリオン風）
const COL = {
  venue:  { flex:"0 0 52px",  fontSize:9,  color:"#666" },
  race:   { flex:"0 0 55px",  fontSize:9,  color:"#888", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  course: { flex:"0 0 42px" },
  horse:  { flex:1,           fontSize:11, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  order:  { flex:"0 0 24px",  textAlign:"center", fontWeight:800, fontSize:11 },
  player: { flex:"0 0 46px",  fontSize:9,  color:"#888", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  pt:     { flex:"0 0 44px",  textAlign:"right", fontWeight:800, fontSize:11 },
};

function ResultRow({ r, showPlayer=true }) {
  const dPt = displayPt(r);
  const zero = dPt === 0;
  const orderColor = r.order===1?"#c9a227":r.order===2?"#9aa0a6":r.order===3?"#cd7f32":"inherit";
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:4,
      padding:"4px 8px", borderBottom:"1px solid #f0f0f0",
      opacity: zero ? 0.5 : 1,
    }}>
      <span style={COL.venue}>{r.venue}</span>
      <span style={COL.race}>{r.race}{r.grade ? <GradeTag grade={r.grade} local={r.local}/> : ""}</span>
      <span style={COL.course}><SurfaceTag surface={r.surface} dist={r.dist} small /></span>
      <span style={COL.horse}>{r.horse}</span>
      <span style={{...COL.order, color:orderColor}}>{r.order}着</span>
      {showPlayer && <span style={COL.player}>{playerName(r.player)}</span>}
      <span style={{...COL.pt, color: zero?"#ccc":"#d33"}}>
        {zero ? (r.surface==="turf"?"芝":"-") : `+${fmt(dPt)}`}
      </span>
    </div>
  );
}

function ResultCard({ r, showPlayer=true }) {
  return <ResultRow r={r} showPlayer={showPlayer} />;
}

// ================================================================
// タブ1: ランキング
// ================================================================

function RankingScreen({ onSelectPlayer, updated }) {
  const sorted = [...CURRENT_SEASON.users].sort((a,b) => b.pt - a.pt);
  const max = sorted[0].pt;
  const topPt = sorted[0].pt;

  const handleShare = async () => {
    const text = sorted.map((u, i) => {
      const player = PLAYERS.find(p => p.id === u.id);
      const medal = ["🥇","🥈","🥉"][i] ?? `${i+1}位`;
      return `${medal} ${player?.name} ${fmt(u.pt)}pt`;
    }).join("\n");
    const shareText = `🐴 POG砂遊び 2025-26 現在のランキング\n\n${text}\n\n${window.location.href}`;
    if (navigator.share) {
      try { await navigator.share({ text: shareText }); } catch {}
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("ランキングをコピーしました！");
    }
  };

  return (
    <div style={{ padding:12 }}>
      {/* 期間・更新バー */}
      <div style={{
        background:"#fff", borderRadius:12, padding:"10px 14px",
        marginBottom:12, border:"1px solid #e4e9e6",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ fontSize:12, color:"#555" }}>
          🏁 {CURRENT_SEASON.period} ／ {sorted.length}名参加
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {updated && (
            <div style={{ fontSize:10, color:"#bbb" }}>🔄 {updated}</div>
          )}
          <button onClick={handleShare} style={{
            background:G.green, color:"#fff", border:"none",
            borderRadius:16, padding:"4px 12px", fontSize:11,
            fontWeight:700, cursor:"pointer",
          }}>シェア</button>
        </div>
      </div>

      {sorted.map((u, i) => {
        const isTop = i === 0;
        const ptGap = topPt - u.pt;
        const medal = ["🥇","🥈","🥉"][i];
        const player = PLAYERS.find(p => p.id === u.id);

        const cardStyle = isTop ? {
          background:"linear-gradient(135deg, #fffbe6 0%, #fff3b0 60%, #ffe066 100%)",
          border:"2px solid #c9a227",
          boxShadow:"0 4px 16px rgba(201,162,39,0.25)",
        } : {
          background:"#fff",
          border:"1px solid #e4e9e6",
          boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
        };

        return (
          <button key={u.id} onClick={() => onSelectPlayer(u)}
            style={{
              width:"100%", textAlign:"left", borderRadius:12,
              padding:"12px 14px", marginBottom:10, cursor:"pointer",
              display:"flex", alignItems:"center", gap:12,
              ...cardStyle,
            }}>
            {/* 順位 */}
            <div style={{ width:36, textAlign:"center", flexShrink:0 }}>
              {isTop ? (
                <div style={{ fontSize:28, lineHeight:1 }}>👑</div>
              ) : (
                <div style={{ fontSize: i<3?22:16, fontWeight:800, color: i<3?"inherit":"#888" }}>
                  {medal ?? `${i+1}`}
                </div>
              )}
            </div>
            {/* 名前・バー */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize: isTop?16:15, marginBottom:5 }}>
                {player?.emoji} {player?.name}
              </div>
              <div style={{ height:6, background:"#eef2f0", borderRadius:3, overflow:"hidden" }}>
                <div style={{
                  width:`${(u.pt/max)*100}%`, height:"100%",
                  background: isTop ? "linear-gradient(90deg, #c9a227, #f5d060)" : G.green,
                }} />
              </div>
              {/* ポイント差 */}
              {!isTop && (
                <div style={{ fontSize:10, color:"#aaa", marginTop:3 }}>
                  1位まで <span style={{ fontWeight:700, color:"#888" }}>▲{fmt(ptGap)}</span> pt
                </div>
              )}
            </div>
            {/* pt */}
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontWeight:800, fontSize: isTop?19:17, color: isTop?G.dirtDark:"#222" }}>{fmt(u.pt)}</div>
              <div style={{ fontSize:11, color: isTop?"#b8841e":"#999" }}>pt</div>
              {u.diff>0 && <div style={{ fontSize:11, color:"#d33", fontWeight:700 }}>+{fmt(u.diff)}</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PlayerDetailScreen({ userId, onBack, onSelectHorse, kettonums }) {
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
      <div style={{ background:"#fff", borderRadius:10, overflow:"hidden", border:"1px solid #e4e9e6" }}>
      {horses.map(h => {
        const netkeibaUrl = kettonums[h.name]
          ? `https://db.netkeiba.com/horse/${kettonums[h.name]}/`
          : `https://www.google.com/search?q=netkeiba+${encodeURIComponent(h.name)}`;
        return (
          <div key={h.no} style={{
            background:"#fff", borderBottom:"1px solid #f0f0f0",
            padding:"7px 10px", display:"flex", alignItems:"center", gap:8,
          }}>
            {/* 番号 */}
            <div style={{
              width:20, height:20, borderRadius:4, background:G.greenDark,
              color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, fontWeight:700, flexShrink:0,
            }}>{h.no}</div>
            {/* 馬名・在厩 */}
            <div style={{ flex:1, minWidth:0, cursor:"pointer" }} onClick={() => onSelectHorse(h)}>
              <div style={{ fontWeight:700, fontSize:13, display:"flex", alignItems:"center", gap:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {h.name}
                {h.active && (
                  <span style={{ fontSize:9, color:G.green, border:`1px solid ${G.green}`, borderRadius:3, padding:"0 3px", flexShrink:0 }}>
                    在厩
                  </span>
                )}
              </div>
              <div style={{ fontSize:10, color:"#aaa" }}>
                {h.record}
                {h.sire && <span style={{ marginLeft:6 }}>父<span translate="no">{h.sire}</span></span>}
                {h.dam  && <span style={{ marginLeft:4 }}>母<span translate="no">{h.dam}</span></span>}
              </div>
            </div>
            {/* pt */}
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <span style={{ fontWeight:800, fontSize:14 }}>{fmt(h.pt)}</span>
              <span style={{ fontSize:10, color:"#999", marginLeft:2 }}>pt</span>
            </div>
            {/* netkeiba */}
            <a href={netkeibaUrl} target="_blank" rel="noopener noreferrer"
              style={{
                fontSize:10, fontWeight:700, color:"#1a56c4",
                textDecoration:"none", whiteSpace:"nowrap", flexShrink:0,
              }}>
              KB
            </a>
          </div>
        );
      })}
      </div>
    </div>
  );
}

function HorseDetailScreen({ horse, playerId, results, kettonums }) {
  const horseResults = results.filter(r => r.horse === horse.name);
  const netkeibaUrl = kettonums[horse.name]
    ? `https://db.netkeiba.com/horse/${kettonums[horse.name]}/`
    : `https://www.google.com/search?q=netkeiba+${encodeURIComponent(horse.name)}`;
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
                <div style={{ fontSize:13, fontWeight:700 }} translate="no">{horse.sire}</div>
              </div>
            )}
            {horse.dam && (
              <div>
                <div style={{ fontSize:10, color:"#999" }}>母</div>
                <div style={{ fontSize:13, fontWeight:700 }} translate="no">{horse.dam}</div>
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ fontSize:13, fontWeight:700, color:"#555", margin:"4px 4px 8px" }}>レース履歴（直近60日）</div>
      {horseResults.length === 0
        ? <div style={{ background:"#fff", borderRadius:10, padding:20, textAlign:"center", color:"#aaa", fontSize:13 }}>
            直近60日間の出走記録はありません
          </div>
        : horseResults.map((r,i) => <ResultCard key={i} r={r} showPlayer={false} />)
      }
    </div>
  );
}

// ================================================================
// タブ2: 最新結果
// ================================================================


function ResultsScreen({ results, upcoming, loaded, news }) {
  const [subTab, setSubTab] = useState("upcoming");

  // 出走予定：日付グループ
  const upGroups = (() => {
    const groups = [];
    let cur = null;
    for (const u of upcoming) {
      if (!cur || cur.date !== u.date) { cur = { date: u.date, rows: [] }; groups.push(cur); }
      cur.rows.push(u);
    }
    return groups;
  })();

  return (
    <div style={{ padding:12 }}>
      {/* サブタブ */}
      <div style={{ display:"flex", gap:6, marginBottom:12 }}>
        {[
          { key:"upcoming", label:`🏁 出走予定`, count: upcoming.length },
          { key:"results",  label:`📋 確定結果`, count: null },
        ].map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)} style={{
            flex:1, padding:"8px 0", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13,
            background: subTab===t.key ? G.green : "#fff",
            color: subTab===t.key ? "#fff" : "#666",
            border: `1.5px solid ${subTab===t.key ? G.green : "#ddd"}`,
          }}>
            {t.label}
            {t.count !== null && <span style={{
              marginLeft:6, fontSize:11, background: subTab===t.key?"rgba(255,255,255,0.3)":"#eee",
              borderRadius:8, padding:"1px 6px",
            }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* 出走予定タブ */}
      {subTab === "upcoming" && (
        <>
          {upGroups.length === 0 ? (
            <div style={{ textAlign:"center", color:"#aaa", marginTop:40, fontSize:14 }}>
              出走予定はありません<br/>
              <span style={{ fontSize:12, marginTop:8, display:"block" }}>📰 ニュースタブで最新情報をチェック</span>
            </div>
          ) : upGroups.map(g => (
            <div key={g.date} style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:800, color:G.green, marginBottom:5, paddingLeft:2 }}>📅 {g.date}</div>
              {g.rows.map((u, i) => (
                <div key={i} style={{
                  background:"#f0f8f4", border:`1.5px solid ${G.green}`,
                  borderRadius:10, padding:"10px 12px", marginBottom:6,
                  display:"flex", alignItems:"center", gap:8,
                }}>
                  <SurfaceTag surface={u.surface} dist={u.dist} small />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight:800, color:"#222" }}>{u.horse}</div>
                    <div style={{ fontSize:10, color:"#888", marginTop:3, display:"flex", alignItems:"center", gap:4 }}>
                      <span>{u.venue}</span><GradeTag grade={u.grade} local={u.local} />
                    </div>
                  </div>
                  <div style={{ fontSize:10, color:"#777", textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:14 }}>{playerEmoji(u.player)}</div>
                    <div>{playerName(u.player)}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* 確定結果タブ */}
      {subTab === "results" && (
        <>
        <div style={{ fontSize:13, fontWeight:700, color:"#555", margin:"4px 4px 8px" }}>確定・結果</div>
      {!loaded
        ? <div style={{ background:"#fff", borderRadius:10, padding:24, textAlign:"center", color:"#aaa", fontSize:13, border:"1px solid #e4e9e6" }}>読み込み中...</div>
        : results.length === 0
          ? <div style={{ background:"#fff", borderRadius:10, padding:24, textAlign:"center", color:"#aaa", fontSize:13, border:"1px solid #e4e9e6" }}>まだ結果がありません</div>
          : (() => {
              // 日付でグループ化
              const groups = [];
              let cur = null;
              for (const r of results) {
                if (!cur || cur.date !== r.date) {
                  cur = { date: r.date, rows: [] };
                  groups.push(cur);
                }
                cur.rows.push(r);
              }
              return (
                <div style={{ background:"#fff", border:"1px solid #e4e9e6", borderRadius:10, overflow:"hidden" }}>
                  {/* ヘッダー */}
                  <div translate="no" style={{ display:"flex", gap:4, padding:"4px 8px", background:"#f0f0f0", borderBottom:"2px solid #ddd", fontSize:9, fontWeight:700, color:"#888" }}>
                    <span style={{ flex:"0 0 52px" }}>競走</span>
                    <span style={{ flex:"0 0 55px" }}>レース名</span>
                    <span style={{ flex:"0 0 42px" }}>コース</span>
                    <span style={{ flex:1 }}>馬名</span>
                    <span style={{ flex:"0 0 24px", textAlign:"center" }}>着順</span>
                    <span style={{ flex:"0 0 46px" }}>厩舎</span>
                    <span style={{ flex:"0 0 44px", textAlign:"right" }}>獲得pt</span>
                  </div>
                  {groups.map(g => (
                    <div key={g.date}>
                      <div style={{ padding:"3px 8px", background:"#fafafa", fontSize:10, fontWeight:700, color:"#aaa", borderBottom:"1px solid #eee", borderTop:"1px solid #eee" }}>
                        {g.date}
                      </div>
                      {g.rows.map((r,i) => <ResultRow key={i} r={r} />)}
                    </div>
                  ))}
                </div>
              );
            })()
        }
        </>
      )}
    </div>
  );
}

// ================================================================
// タブ3: 殿堂DB
// ================================================================

function RankGraphSvg({ playerId, W, H, PAD, bg }) {
  const maxRank = 7;
  const seasons = SEASONS_ALL.filter(s => !s.period.endsWith("〜")).map(s => {
    const r = s.results.find(r => r.player===playerId);
    return r ? { label:s.label, rank:r.rank } : null;
  }).filter(Boolean);
  if (seasons.length === 0) return null;

  const xStep = (W - PAD*2) / Math.max(seasons.length - 1, 1);
  const yFor = rank => PAD + (rank - 1) / (maxRank - 1) * (H - PAD*2);
  const rankColor = r => r===1?G.gold:r===2?G.silver:r===3?G.bronze:"#888";

  const pts = seasons.map((s,i) => ({
    x: seasons.length===1 ? W/2 : PAD + i*xStep,
    y: yFor(s.rank),
    rank: s.rank,
    label: s.label,
  }));
  const polyline = pts.map(p=>`${p.x},${p.y}`).join(" ");

  return (
    <svg width={W} height={H} style={{ display:"block", overflow:"visible" }}>
      <line x1={PAD} y1={yFor(1)} x2={W-PAD} y2={yFor(1)} stroke="#ffffff18" strokeWidth={1} strokeDasharray="3,3"/>
      {pts.length > 1 && (
        <polyline points={polyline} fill="none" stroke={G.dirtLight} strokeWidth={1.5} strokeOpacity={0.6}/>
      )}
      {pts.map((p,i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={W>200?9:5} fill={rankColor(p.rank)} stroke={bg||G.hallBg} strokeWidth={1.5}/>
          <text x={p.x} y={p.y-(W>200?14:8)} textAnchor="middle" fontSize={W>200?13:9} fill={rankColor(p.rank)} fontWeight="800">
            {p.rank===1?"🥇":p.rank===2?"🥈":p.rank===3?"🥉":`${p.rank}位`}
          </text>
        </g>
      ))}
      {pts.map((p,i) => (
        <text key={`l${i}`} x={p.x} y={H+(W>200?4:2)} textAnchor="middle" fontSize={W>200?12:8} fill={G.hallDim}>
          {seasons[i].label.replace("2022-23","22").replace("2023-24","23").replace("2024-25","24").replace("2025-26","25↑")}
        </text>
      ))}
    </svg>
  );
}

function RankGraph({ playerId, playerName: pname, onTap }) {
  const W = 88, H = 36, PAD = 6;
  const seasons = SEASONS_ALL.filter(s => !s.period.endsWith("〜")).map(s => {
    const r = s.results.find(r => r.player===playerId);
    return r ? r : null;
  }).filter(Boolean);
  if (seasons.length === 0) return null;

  return (
    <div onClick={e => { e.stopPropagation(); onTap && onTap(); }} style={{ cursor:"pointer" }}>
      <RankGraphSvg playerId={playerId} W={W} H={H} PAD={PAD} />
    </div>
  );
}

function RankGraphModal({ playerId, playerName: pname, onClose }) {
  const W = 300, H = 130, PAD = 20;
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:100,
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:G.hallCard, border:`1px solid ${G.hallBorder}`,
        borderRadius:16, padding:"20px 20px 32px", minWidth:340,
      }}>
        <div style={{ fontSize:13, fontWeight:800, color:G.dirtLight, marginBottom:16 }}>
          📈 {pname} 順位推移
        </div>
        <RankGraphSvg playerId={playerId} W={W} H={H} PAD={PAD} bg={G.hallCard} />
        <button onClick={onClose} style={{
          marginTop:20, width:"100%", padding:"10px 0", borderRadius:10,
          background:G.dirt, border:"none", color:"#fff",
          fontSize:13, fontWeight:700, cursor:"pointer",
        }}>閉じる</button>
      </div>
    </div>
  );
}

function HallScreen({ onSelectHallPlayer }) {
  const [graphModal, setGraphModal] = useState(null); // { playerId, playerName }
  const stats = PLAYERS.map(p => {
    const mySeasons = SEASONS_ALL.filter(s => s.results.find(r => r.player===p.id));
    const wins = mySeasons.filter(s => s.period.includes("〜") && !s.period.endsWith("〜") && s.results.find(r => r.player===p.id)?.rank===1);
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
            display:"flex", alignItems:"center", gap:10,
          }}>
          <div style={{ fontSize:22, width:28, textAlign:"center", flexShrink:0 }}>
            {i===0?"👑":i===1?"🥈":i===2?"🥉":
              <span style={{ fontSize:14, color:G.hallDim, fontWeight:700 }}>{i+1}</span>}
          </div>
          <div style={{ fontSize:20, flexShrink:0 }}>{p.emoji}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:800, fontSize:14, color:G.hallText }}>{p.name}</div>
            <div style={{ fontSize:11, color:G.hallDim, marginTop:2, display:"flex", gap:8 }}>
              <span style={{ color: p.wins>0?G.gold:G.hallDim }}>優勝{p.wins}回{p.wins>=2?"👑":""}</span>
              <span>重賞{p.trophies.length}勝</span>
            </div>
          </div>
          {/* 順位グラフ */}
          <div style={{ flexShrink:0, paddingBottom:12 }}>
            <RankGraph playerId={p.id} playerName={p.name}
              onTap={() => setGraphModal({ playerId:p.id, playerName:p.name })} />
          </div>
        </button>
      ))}

      {/* グラフ拡大モーダル */}
      {graphModal && (
        <RankGraphModal
          playerId={graphModal.playerId}
          playerName={graphModal.playerName}
          onClose={() => setGraphModal(null)}
        />
      )}

      {/* ===== シーズン表彰 ===== */}
      <div style={{ marginTop:20 }}>
        <div style={{
          fontSize:14, fontWeight:900, color:G.gold, letterSpacing:1,
          marginBottom:10, paddingBottom:6, borderBottom:`1px solid ${G.hallBorder}`,
        }}>🏅 シーズン表彰</div>
        {SEASON_AWARDS.map(sa => (
          <div key={sa.season} style={{
            background:G.hallCard, border:`1px solid ${G.hallBorder}`,
            borderRadius:10, padding:"12px 14px", marginBottom:10,
          }}>
            <div style={{ fontSize:12, fontWeight:900, color:G.dirtLight, marginBottom:8 }}>
              砂遊び {sa.season}シーズン
            </div>
            {sa.items.map((item, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"baseline", gap:8,
                padding:"5px 0", borderBottom: i<sa.items.length-1 ? `1px solid ${G.hallBorder}` : "none",
              }}>
                <div style={{ flex:"0 0 90px", fontSize:10, color:G.gold, fontWeight:700 }}>{item.title}</div>
                <div style={{ flex:"0 0 70px", fontSize:10, color:G.hallDim }}>{item.stable}</div>
                <div style={{ flex:1, fontSize:13, fontWeight:800, color: item.horse ? G.hallText : G.dirtLight }}>
                  {item.horse || item.stable}
                </div>
                {item.note ? <div style={{ fontSize:9, color:G.hallDim }}>{item.note}</div> : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function HallPlayerScreen({ player, onBack, kettonums }) {
  const mySeasons = SEASONS_ALL
    .map(s => ({ s, r: s.results.find(r => r.player===player.id) }))
    .filter(x => x.r).reverse();
  const myTrophies = TROPHIES.filter(t => t.player===player.id);
  const [tab, setTab] = useState("seasons");
  const [openSeason, setOpenSeason] = useState(null);
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
        {tab==="seasons" && mySeasons.map(({s,r}) => {
          const seasonHorses = (PAST_HORSES[s.id]?.[player.id] || []).sort((a,b)=>b.pt-a.pt);
          const isOpen = openSeason === s.id;
          return (
            <div key={s.id} style={{ marginBottom:8 }}>
              {/* シーズンカード（タップで開閉） */}
              <div onClick={()=>setOpenSeason(isOpen?null:s.id)} style={{
                background:G.hallCard, border:`1px solid ${r.rank===1?G.gold:G.hallBorder}`,
                borderRadius:isOpen?"10px 10px 0 0":10, padding:"12px 14px",
                display:"flex", alignItems:"center", gap:12, cursor:"pointer",
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
                <div style={{ fontSize:12, color:G.hallDim }}>{isOpen?"▲":"▼"}</div>
              </div>
              {/* 馬一覧（展開時） */}
              {isOpen && (
                <div style={{ background:G.hallBg, border:`1px solid ${G.hallBorder}`, borderTop:"none", borderRadius:"0 0 10px 10px", overflow:"hidden" }}>
                  {seasonHorses.length===0
                    ? <div style={{ padding:12, textAlign:"center", color:G.hallDim, fontSize:12 }}>馬データなし</div>
                    : seasonHorses.map(h => {
                        const kId = kettonums?.[h.name];
                        const url = kId ? `https://db.netkeiba.com/horse/${kId}/` : null;
                        return (
                          <div key={h.no} style={{
                            display:"flex", alignItems:"center", gap:8,
                            padding:"7px 12px", borderBottom:`1px solid ${G.hallBorder}`,
                          }}>
                            <div style={{ width:18, height:18, borderRadius:3, background:G.greenDark, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>{h.no}</div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontWeight:700, fontSize:13, color:G.hallText }}>{h.name}</div>
                              <div style={{ fontSize:10, color:G.hallDim }}>
                                {h.record}
                                {h.sire && <span style={{ marginLeft:6 }}><span translate="no">父{h.sire}</span></span>}
                                {h.dam  && <span style={{ marginLeft:4 }}><span translate="no">母{h.dam}</span></span>}
                              </div>
                            </div>
                            <div style={{ fontSize:13, fontWeight:800, color:G.dirtLight, flexShrink:0 }}>{fmt(h.pt)}</div>
                            {url
                              ? <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize:10, fontWeight:700, color:"#1a56c4", textDecoration:"none", flexShrink:0 }}>KB</a>
                              : <span style={{ fontSize:10, color:G.hallDim, flexShrink:0 }}>—</span>
                            }
                          </div>
                        );
                      })
                  }
                </div>
              )}
            </div>
          );
        })}

        {tab==="trophies" && (() => {
          // ダート重賞勝ち馬（order===1・馬名確定・芝除外）をまとめる
          const gradeWins = myTrophies.filter(t=>t.order===1 && !t.horse.includes("確認中") && !t.turf);
          const horseNames = [...new Set(gradeWins.map(t=>t.horse))];
          const gradeRank = g => g.includes("I")&&!g.includes("II")&&!g.includes("III")?1:g.includes("II")&&!g.includes("III")?2:3;
          const gradeColor = g => gradeRank(g)===1?G.gold:gradeRank(g)===2?G.silver:G.bronze;
          return (<>
            {horseNames.length>0 && (
              <div style={{ background:G.hallCard, border:`1px solid ${G.gold}`, borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
                <div style={{ fontSize:11, color:G.gold, fontWeight:800, marginBottom:10 }}>🐴 主な活躍指名馬</div>
                {horseNames.map(name => {
                  const wins = gradeWins.filter(t=>t.horse===name).sort((a,b)=>gradeRank(a.grade)-gradeRank(b.grade));
                  return (
                    <div key={name} style={{ marginBottom:10, paddingBottom:10, borderBottom:`1px solid ${G.hallBorder}` }}>
                      <div style={{ fontWeight:800, fontSize:14, color:G.hallText, marginBottom:5 }}>
                        🏆 <span translate="no">{name}</span>
                        <span style={{ fontSize:11, color:G.hallDim, fontWeight:400, marginLeft:8 }}>ダート重賞{wins.length}勝</span>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                        {wins.map((t,i) => (
                          <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <span translate="no" style={{ fontSize:9, fontWeight:800, color:"#fff", background:gradeColor(t.grade), borderRadius:3, padding:"1px 5px", flexShrink:0 }}>{t.grade}</span>
                            <span style={{ fontSize:12, color:G.hallText }}>{t.race}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          <div style={{ fontSize:11, color:G.hallDim, marginBottom:8, fontWeight:700 }}>全重賞成績</div>
          {myTrophies.length===0
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
                        <span translate="no" style={{ fontSize:10, fontWeight:800, color:"#fff", background:gColor, borderRadius:3, padding:"1px 5px" }}>{t.grade}</span>
                        <span style={{ fontSize:13, color:G.hallText, fontWeight:700 }}>{t.race}</span>
                        <span style={{ fontSize:10, color:G.hallDim }}>{orderLabel}</span>
                      </div>
                      <div style={{ fontSize:11, color:G.hallDim, marginTop:2 }}>
                        🐴 <span translate="no">{t.horse}</span> ／ {t.season} ／ {t.date}
                        {t.note && <span style={{ color:G.dirt, marginLeft:6 }}>{t.note}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
          </>);
        })()}
      </div>
    </div>
  );
}

// ================================================================
// ================================================================
// ニュース画面
// ================================================================

const PLAYER_COLORS = {
  P01:"#c0392b", P02:"#2471a3", P03:"#0a7a5c",
  P04:"#8e44ad", P05:"#d68910", P06:"#e91e8c", P07:"#555",
};

function NewsScreen({ news }) {
  const [filterPlayer, setFilterPlayer] = useState("ALL");

  const cleanTitle = (title) => title.replace(/\s*[-—]\s*[^-—]+$/, "");
  const activePlayers = PLAYERS.filter(p => news.some(n => n.player === p.id));

  const filtered = filterPlayer === "ALL"
    ? news
    : news.filter(n => n.player === filterPlayer);

  return (
    <div style={{ background:"#eef2f0", minHeight:"100%", padding:12 }}>
      {/* 厩舎フィルター */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
        <button onClick={() => setFilterPlayer("ALL")} style={{
          fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20, cursor:"pointer",
          background: filterPlayer==="ALL" ? G.green : "#fff",
          color: filterPlayer==="ALL" ? "#fff" : "#555",
          border: `1px solid ${filterPlayer==="ALL" ? G.green : "#ddd"}`,
        }}>すべて</button>
        {activePlayers.map(p => (
          <button key={p.id} onClick={() => setFilterPlayer(p.id)} style={{
            fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20, cursor:"pointer",
            background: filterPlayer===p.id ? PLAYER_COLORS[p.id] : "#fff",
            color: filterPlayer===p.id ? "#fff" : "#555",
            border: `1px solid ${filterPlayer===p.id ? PLAYER_COLORS[p.id] : "#ddd"}`,
          }}>{p.name}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", color:"#aaa", marginTop:40, fontSize:14 }}>ニュースがありません</div>
      ) : filtered.map((n, i) => (
        <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
          style={{ textDecoration:"none", display:"block", marginBottom:8 }}>
          <div style={{
            background:"#fff", borderRadius:10, padding:"10px 12px",
            borderLeft:`4px solid ${PLAYER_COLORS[n.player] || "#999"}`,
            boxShadow:"0 1px 3px rgba(0,0,0,0.07)",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
              <span style={{ fontSize:10, fontWeight:800, color:"#fff", background:PLAYER_COLORS[n.player]||"#999", borderRadius:4, padding:"1px 6px" }}>{n.horse}</span>
              <span style={{ fontSize:10, color:"#aaa" }}>{playerName(n.player)}</span>
              <span style={{ fontSize:10, color:"#bbb", marginLeft:"auto" }}>{n.date}</span>
            </div>
            <div style={{ fontSize:13, fontWeight:600, color:"#222", lineHeight:1.4 }}>{cleanTitle(n.title)}</div>
            <div style={{ fontSize:10, color:"#aaa", marginTop:4 }}>{n.source} ↗</div>
          </div>
        </a>
      ))}
      <div style={{ textAlign:"center", fontSize:10, color:"#bbb", marginTop:8 }}>
        毎日複数回自動更新（直近30日分）
      </div>
    </div>
  );
}

// ================================================================
// タブ5: レーシングカレンダー
// ================================================================

function CalendarScreen({ pogHorses = new Set() }) {
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`;
  })();
  const [season, setSeason] = useState("2627");
  const [filters, setFilters] = useState(new Set());
  const [hideShinma, setHideShinma] = useState(false);
  const BASE_CALENDAR = season === "2526" ? RACE_CALENDAR_2526 : RACE_CALENDAR_2627;

  const toggleFilter = (key) => {
    setFilters(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const gradeColor = (g) =>
    g==="JpnI"||g==="GⅠ"  ? G.gi  :
    g==="JpnII"||g==="GⅡ" ? G.g2  :
    g==="JpnIII"||g==="GⅢ"? G.g3  :
    g==="L"                ? "#2e86ab" :
    g==="OP"               ? G.dirt :
    g==="1勝"              ? "#5c7a6e" :
    "#999";

  const gradeWeight = (g) =>
    ["JpnI","GⅠ","JpnII","GⅡ","JpnIII","GⅢ","L","OP","1勝"].includes(g) ? "race" : "cond";

  const filtered = BASE_CALENDAR.filter(r => {
    if (hideShinma && r.grade === "新馬") return false;
    if (filters.size === 0) return true;
    // 複数フィルターは OR 条件
    if (filters.has("age2")     && r.age.includes("2歳"))            return true;
    if (filters.has("age3")     && r.age.includes("3歳"))            return true;
    if (filters.has("exchange") && r.exchange)                        return true;
    if (filters.has("race")     && gradeWeight(r.grade) === "race")   return true;
    return false;
  });

  // 月ごとにグループ化
  const months = [];
  let cur = null;
  for (const r of filtered) {
    const m = r.date.slice(0, 7);
    if (!cur || cur.month !== m) {
      const [y, mo] = m.split("/");
      cur = { month:m, label:`${y}年 ${parseInt(mo)}月`, rows:[] };
      months.push(cur);
    }
    cur.rows.push(r);
  }

  const isPast  = d => d < todayStr;
  const isToday = d => d === todayStr;

  return (
    <div style={{ background:"#eef2f0", minHeight:"100%" }}>
      {/* シーズン切り替え */}
      <div style={{ display:"flex", gap:0, padding:"10px 12px 0" }}>
        {[
          { key:"2526", label:"2025-26" },
          { key:"2627", label:"2026-27" },
        ].map((s, i) => (
          <button key={s.key} onClick={() => { setSeason(s.key); setFilters(new Set()); }} style={{
            flex:1, padding:"7px 0", cursor:"pointer", fontWeight:800, fontSize:12,
            background: season===s.key ? G.dirtDark : "#ddd",
            color: season===s.key ? "#fff" : "#888",
            border:"none",
            borderRadius: i===0 ? "8px 0 0 8px" : "0 8px 8px 0",
          }}>{s.label} シーズン</button>
        ))}
      </div>
      {season === "2627" && (
        <div style={{ fontSize:10, color:"#bbb", padding:"4px 14px", textAlign:"right" }}>
          ※ 2026-27の日程は例年スケジュール基準の目安です。正確な日程はJRA公式サイトをご確認ください
        </div>
      )}
      {/* フィルター */}
      <div style={{ display:"flex", gap:5, padding:"8px 12px 0", flexWrap:"wrap", alignItems:"center" }}>
        {[
          { key:"race",     label:"🏆 重賞・OP" },
          { key:"exchange", label:"🤝 交流" },
          { key:"age2",     label:"2歳" },
          { key:"age3",     label:"3歳" },
        ].map(f => (
          <button key={f.key} onClick={() => toggleFilter(f.key)} style={{
            padding:"5px 12px", borderRadius:16, cursor:"pointer",
            background: filters.has(f.key) ? G.dirt : "#fff",
            color: filters.has(f.key) ? "#fff" : "#555",
            border: `1px solid ${filters.has(f.key) ? G.dirt : "#ddd"}`,
            fontSize:11, fontWeight:700,
          }}>{f.label}</button>
        ))}
        {filters.size > 0 && (
          <button onClick={() => setFilters(new Set())} style={{
            padding:"5px 10px", borderRadius:16, cursor:"pointer",
            background:"transparent", color:"#aaa",
            border:"1px solid #ddd", fontSize:11,
          }}>✕ リセット</button>
        )}
        <button onClick={() => setHideShinma(h => !h)} style={{
          padding:"5px 12px", borderRadius:16, cursor:"pointer",
          background: hideShinma ? "#555" : "#fff",
          color: hideShinma ? "#fff" : "#aaa",
          border: `1px solid ${hideShinma ? "#555" : "#ddd"}`,
          fontSize:11, fontWeight:700, marginLeft:"auto",
        }}>{hideShinma ? "新馬: 非表示" : "新馬: 表示"}</button>
      </div>

      <div style={{ padding:"10px 12px 24px" }}>
        {months.map(m => (
          <div key={m.month} style={{ marginBottom:16 }}>
            {/* 月ヘッダー */}
            <div style={{
              fontSize:13, fontWeight:900, color:G.dirtDark,
              borderBottom:`2px solid ${G.dirt}`, paddingBottom:5,
              marginBottom:8, display:"flex", alignItems:"center", gap:6,
            }}>
              📅 {m.label}
            </div>

            {m.rows.map((r, i) => {
              const past = isPast(r.date);
              const today = isToday(r.date);
              const isCond = gradeWeight(r.grade) === "cond";
              const gc = gradeColor(r.grade);
              const isPOGWinner = r.winner && pogHorses.has(r.winner);

              if (isCond) {
                // 新馬戦・1勝クラス週末：コンパクトな帯
                return (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", gap:8,
                    padding:"5px 10px", marginBottom:3,
                    background: past ? "#f5f5f5" : "#fff",
                    borderRadius:8, borderLeft:`3px solid ${past?"#ddd": r.grade==="新馬"?"#e67e22":"#5c7a6e"}`,
                    opacity: past ? 0.5 : 1,
                  }}>
                    <div style={{ fontSize:10, color:"#aaa", flexShrink:0, width:40 }}>
                      {r.date.slice(5).replace("/","/")}
                    </div>
                    <span style={{
                      fontSize:9, fontWeight:700, color:"#fff",
                      background: r.grade==="新馬" ? "#e67e22" : "#5c7a6e",
                      borderRadius:3, padding:"1px 5px", flexShrink:0,
                    }}>{r.grade}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <span translate="no" style={{ fontSize:11, color: past?"#aaa":"#444", fontWeight:600 }}>
                        {r.name}
                      </span>
                      {r.note && <span style={{ fontSize:9, color:"#bbb", marginLeft:6 }}>{r.note}</span>}
                    </div>
                    <div style={{ fontSize:9, color:"#bbb", flexShrink:0, textAlign:"right" }}>
                      <div>{r.venue}</div>
                      {r.dists && <div style={{ color:"#aaa" }}>{r.dists}</div>}
                    </div>
                  </div>
                );
              }

              // 重賞・OP・L・1勝クラス特別：メインカード
              return (
                <div key={i} style={{
                  background: r.goal ? `linear-gradient(135deg,#fffbe6,#fff3b0)` : past ? "#f0f0f0" : "#fff",
                  border: r.goal ? `2px solid ${G.gold}` : today ? `2px solid ${G.green}` : `1px solid ${past?"#ddd":"#e4e9e6"}`,
                  borderRadius:10, padding:"10px 12px", marginBottom:6,
                  opacity: past ? 0.7 : 1,
                  boxShadow: r.goal ? "0 2px 12px rgba(201,162,39,0.2)" : "none",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    {/* 日付 */}
                    <div style={{ fontSize:11, color: past?"#bbb":"#777", flexShrink:0, width:38, fontWeight:700 }}>
                      {r.date.slice(5)}
                    </div>
                    {/* グレードバッジ */}
                    <span translate="no" style={{
                      fontSize:10, fontWeight:800, color:"#fff",
                      background: gc, borderRadius:4, padding:"2px 7px", flexShrink:0,
                    }}>{r.grade}</span>
                    {/* 交流マーク */}
                    {r.exchange && (
                      <span style={{ fontSize:9, color:G.local, fontWeight:800, border:`1px solid ${G.local}`, borderRadius:3, padding:"1px 4px", flexShrink:0 }}>交流</span>
                    )}
                    {/* レース名 */}
                    <div translate="no" style={{ flex:1, minWidth:0, fontWeight:800, fontSize:14, color: r.goal?G.dirtDark: past?"#999":"#222", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {r.name}
                    </div>
                    {/* 状態 */}
                    {today && <span style={{ fontSize:10, color:G.green, fontWeight:800 }}>▶ 本日</span>}
                    {past && !r.winner && <span style={{ fontSize:10, color:"#ccc" }}>終了</span>}
                  </div>
                  {/* 詳細行 */}
                  <div style={{ display:"flex", gap:12, marginTop:4, paddingLeft:46, fontSize:11, color:"#999", flexWrap:"wrap" }}>
                    <span>🏟 {r.venue}</span>
                    {r.dist && <span>ダ{r.dist}m</span>}
                    <span style={{ color: r.age.includes("牝")?"#e91e8c":"#999" }}>{r.age}</span>
                    {r.note && <span style={{ color:"#bbb" }}>{r.note}</span>}
                  </div>
                  {/* 勝馬表示（終了レースのみ） */}
                  {past && r.winner && (
                    <div style={{
                      marginTop:5, paddingLeft:46,
                      display:"flex", alignItems:"center", gap:6,
                    }}>
                      <span style={{ fontSize:10, color:"#bbb" }}>🏇 勝馬</span>
                      <span style={{
                        fontSize:13, fontWeight:800,
                        color: isPOGWinner ? "#d35400" : "#555",
                        background: isPOGWinner ? "#fff3e0" : "transparent",
                        borderRadius: isPOGWinner ? 6 : 0,
                        padding: isPOGWinner ? "1px 8px" : 0,
                      }}>
                        {r.winner}
                      </span>
                      {isPOGWinner && (
                        <span style={{ fontSize:10, fontWeight:800, color:"#d35400" }}>🎯 POG指名馬!</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{ textAlign:"center", fontSize:10, color:"#bbb", marginTop:8, lineHeight:1.6 }}>
          ※ 未勝利戦は割愛しています<br/>
          ※ 日程は目安。交流重賞の開催日は主催者発表を確認してください
        </div>
      </div>
    </div>
  );
}

// 2026-27シーズン画面
// ================================================================

function Season2627Screen() {
  const [view, setView] = useState("roster"); // "roster" | "ranking"

  return (
    <div style={{ paddingBottom:16 }}>
      {/* ヘッダーバナー */}
      <div style={{ background:"linear-gradient(135deg,#7a4a1e,#b06a2c)", color:"#fff", padding:"16px", textAlign:"center" }}>
        <div style={{ fontSize:11, opacity:0.8, letterSpacing:1 }}>NEXT SEASON</div>
        <div style={{ fontSize:20, fontWeight:800, marginTop:2 }}>砂遊び 2026-27</div>
        <div style={{ fontSize:11, opacity:0.8, marginTop:2 }}>2026/06/07 〜 2027年・東京ダービーまで</div>
      </div>

      {/* ビュー切替 */}
      <div style={{ display:"flex", gap:0, padding:"10px 12px 0" }}>
        {[
          { key:"roster",  label:"🐴 指名馬一覧" },
          { key:"ranking", label:"🏆 ランキング" },
        ].map((v,i) => (
          <button key={v.key} onClick={() => setView(v.key)} style={{
            flex:1, padding:"8px 0", cursor:"pointer", fontWeight:800, fontSize:12,
            background: view===v.key ? G.dirtDark : "#ddd",
            color: view===v.key ? "#fff" : "#888",
            border:"none",
            borderRadius: i===0 ? "8px 0 0 8px" : "0 8px 8px 0",
          }}>{v.label}</button>
        ))}
      </div>

      {view === "roster" && (
        <div style={{ padding:"10px 12px" }}>
          {PLAYERS_2627.map(player => {
            const total = player.named.length + player.unnamed.length;
            const registered = player.named.length;
            return (
              <div key={player.id} style={{
                background:"#fff", borderRadius:12, marginBottom:12,
                boxShadow:"0 1px 4px rgba(0,0,0,0.08)",
                overflow:"hidden",
              }}>
                {/* プレイヤーヘッダー */}
                <div style={{
                  background: G.dirtDark, color:"#fff",
                  padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between",
                }}>
                  <div style={{ fontWeight:800, fontSize:15 }}>
                    {player.emoji} {player.name}
                  </div>
                  <div style={{ fontSize:11, opacity:0.85 }}>
                    登録済 {registered}/{total}頭
                  </div>
                </div>
                {/* 馬リスト */}
                <div style={{ padding:"10px 12px", display:"flex", flexDirection:"column", gap:6 }}>
                  {/* 登録済み馬 */}
                  {player.named.map((h,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:10, color:G.dirtDark, fontWeight:800, minWidth:16 }}>▶</span>
                      <div style={{ flex:1 }}>
                        <div translate="no" style={{ fontWeight:800, fontSize:14, color:"#222" }}>{h.name}</div>
                        <div style={{ fontSize:10, color:"#aaa", marginTop:1 }}>
                          {h.sire && <span>父{h.sire}</span>}
                          {h.sire && h.dam && <span>　</span>}
                          {h.dam && <span>母{h.dam}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* 名前未定馬 */}
                  {player.unnamed.map((h,i) => (
                    <div key={`u${i}`} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:10, color:"#ccc", fontWeight:800, minWidth:16 }}>—</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:13, color:"#bbb" }}>名前未定</div>
                        <div style={{ fontSize:10, color:"#ccc", marginTop:1 }}>
                          {h.sire && <span>父{h.sire}</span>}
                          {h.sire && h.dam && <span>　</span>}
                          {h.dam && <span>母{h.dam}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div style={{ fontSize:10, color:"#bbb", textAlign:"center", marginTop:4 }}>
            ※ グレーアウトの馬はJRA馬名未登録。血統のみ掲載
          </div>
        </div>
      )}

      {view === "ranking" && (
        <div style={{ padding:"10px 12px" }}>
          {/* 開幕前ノーティス */}
          <div style={{
            background:"#fff8f0", border:`1px solid ${G.dirtLight}`, borderRadius:10,
            padding:"14px", textAlign:"center", marginBottom:14,
          }}>
            <div style={{ fontSize:22 }}>🏁</div>
            <div style={{ fontWeight:800, fontSize:14, color:G.dirtDark, marginTop:4 }}>シーズン開幕前</div>
            <div style={{ fontSize:11, color:"#999", marginTop:4 }}>
              開幕は 2026年6月7日（予定）<br/>ランキングは開幕後に更新されます
            </div>
          </div>
          {/* プレイヤー一覧（0pt） */}
          {PLAYERS_2627.map((player, idx) => (
            <div key={player.id} style={{
              background:"#fff", borderRadius:10, marginBottom:8,
              padding:"12px 14px", display:"flex", alignItems:"center", gap:12,
              boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontSize:18, fontWeight:800, color:"#ddd", minWidth:24, textAlign:"center" }}>{idx+1}</div>
              <div style={{ fontSize:20 }}>{player.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:14, color:"#555" }}>{player.name}</div>
                <div style={{ fontSize:11, color:"#bbb", marginTop:2 }}>
                  {player.named.length}頭登録済（全{player.named.length + player.unnamed.length}頭）
                </div>
              </div>
              <div style={{ fontSize:18, fontWeight:800, color:"#ddd" }}>0 pt</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [results,  setResults]  = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const [kettonums, setKettonums] = useState({});
  const [news, setNews] = useState([]);
  const [updated, setUpdated] = useState("");

  useEffect(() => {
    fetch("/data/results.json").then(r => r.json()).then(d => { setResults(d); setResultsLoaded(true); }).catch(() => setResultsLoaded(true));
    fetch("/data/upcoming.json").then(r => r.json()).then(setUpcoming).catch(() => {});
    fetch("/data/kettonums.json").then(r => r.json()).then(setKettonums).catch(() => {});
    fetch("/data/news.json").then(r => r.json()).then(setNews).catch(() => {});
    fetch("/data/updated.json").then(r => r.json()).then(d => setUpdated(d.updated || "")).catch(() => {});
  }, []);

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
      content = <HorseDetailScreen horse={selectedHorse} playerId={selectedPlayerId} results={results} kettonums={kettonums} />;
    } else if (selectedPlayerId) {
      title = playerName(selectedPlayerId);
      onBack = () => setSPId(null);
      content = <PlayerDetailScreen userId={selectedPlayerId} onBack={()=>setSPId(null)}
                  onSelectHorse={h => { setSHorse(h); }} kettonums={kettonums} />;
    } else {
      content = <RankingScreen onSelectPlayer={u => setSPId(u.id)} updated={updated} />;
    }
  } else if (tab === "results") {
    title = "最新結果";
    content = <ResultsScreen results={results} upcoming={upcoming} loaded={resultsLoaded} news={news} />;
  } else if (tab === "news") {
    title = "砂遊びニュース";
    content = <NewsScreen news={news} />;
  } else if (tab === "hall") {
    if (selectedHallP) {
      title = selectedHallP.name;
      onBack = () => setSHallP(null);
      darkHeader = true;
      content = <HallPlayerScreen player={selectedHallP} onBack={()=>setSHallP(null)} kettonums={kettonums} />;
    } else {
      title = "砂遊び殿堂";
      darkHeader = true;
      content = <HallScreen onSelectHallPlayer={setSHallP} />;
    }
  } else if (tab === "calendar") {
    title = "砂遊びカレンダー";
    const pogHorses = new Set(results.map(r => r.horse));
    content = <CalendarScreen pogHorses={pogHorses} />;
  } else if (tab === "next") {
    title = "2026-27 指名馬";
    content = <Season2627Screen />;
  } else {
    title = "砂遊びルール";
    content = <RulesScreen />;
  }

  const headerBg = darkHeader ? G.dirtDark : G.green;

  const navItems = [
    { key:"ranking",  label:"順位",   icon:"🏆" },
    { key:"results",  label:"結果",   icon:"📋" },
    { key:"next",     label:"次季",   icon:"🆕" },
    { key:"calendar", label:"日程",   icon:"📅" },
    { key:"hall",     label:"殿堂",   icon:"🏟️" },
    { key:"rules",    label:"ルール", icon:"📖" },
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
            <span style={{ fontSize:16 }}>{it.icon}</span>
            <span style={{ fontSize:9, fontWeight:600 }}>{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
