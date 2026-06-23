import { useState, useEffect, useRef } from "react";

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
// 2026-27シーズン 指名馬データ（指名順No.付き）
// name:null = JRA馬名未登録（名前未定）
// ================================================================
const PLAYERS_2627 = [
  {
    id:"P04", name:"ミリオン厩舎", emoji:"💰",
    horses:[
      { no:1,  name:null,               dam:"サンドクイーン" },
      { no:2,  name:"ミクニブレイブ",     sire:"ナダル",               dam:"アンナミルト" },
      { no:3,  name:null,               dam:"タヒチアンダンス" },
      { no:4,  name:"トゥザファイナル",   sire:"ナダル",               dam:"スパークオンアイス" },
      { no:5,  name:null,               dam:"ラテュロス" },
      { no:6,  name:null,               dam:"Stellar Wind" },
      { no:7,  name:"ソメデイストワール", sire:"マインドユアビスケッツ", dam:"ミラクルレジェンド" },
      { no:8,  name:null,               dam:"エリーズスマイル" },
      { no:9,  name:null,               dam:"レッドアネラ" },
      { no:10, name:null,               dam:"アンデスクイーン" },
      { no:11, name:null,               dam:"ラタンドレス" },
      { no:12, name:null,               dam:"ロッテンマイヤー" },
    ],
  },
  {
    id:"P01", name:"前田厩舎", emoji:"🏇",
    horses:[
      { no:1,  name:null,               dam:"スーブレット" },
      { no:2,  name:"スターフラッシュ",  sire:"Yaupon",          dam:"Shanghai Starlet" },
      { no:3,  name:"ラキアーヴェ",     sire:"ルヴァンスレーヴ", dam:"クラーベセクレタ" },
      { no:4,  name:"ミシェルバローズ", sire:"ナダル",           dam:"メリッサーニ" },
      { no:5,  name:null,               dam:"オーサムウインド" },
      { no:6,  name:null,               dam:"プロミストリープ" },
      { no:7,  name:"レッジェランツァ", sire:"シスキン",         dam:"エレヴァテッツァ" },
      { no:8,  name:"ヴェルバーニア",     sire:"キタサンブラック", dam:"アドマイヤローザ" },
      { no:9,  name:"エスクアドラ",     sire:"レイデオロ",       dam:"ジューヌエコール" },
      { no:10, name:null,               dam:"クインアマランサス" },
      { no:11, name:"コナパームス",     sire:"アドマイヤマーズ", dam:"コナブリュワーズ" },
      { no:12, name:null,               dam:"シンプリーグロリアス" },
    ],
  },
  {
    id:"P02", name:"川村厩舎", emoji:"🐎",
    horses:[
      { no:1,  name:null,                dam:"Champagne Lady" },
      { no:2,  name:"マイクストーリー",    sire:"Flightline",           dam:"シャムロックローズ" },
      { no:3,  name:null,                dam:"ギルデッドミラー" },
      { no:4,  name:"アトミックリーチ",    sire:"コントレイル",         dam:"パリスビキニ" },
      { no:5,  name:"ヤングリッチ",        sire:"レイデオロ",           dam:"フォエヴァーダーリング" },
      { no:6,  name:"ダノンチャンピオン",  sire:"ホットロッドチャーリー", dam:"トップデサイル" },
      { no:7,  name:"コーズダヴィンチ",    sire:"マインドユアビスケッツ", dam:"プリモダヴィンチ" },
      { no:8,  name:null,                dam:"セントリフュージ" },
      { no:9,  name:null,                dam:"ナターレ" },
      { no:10, name:null,                dam:"ゴールデンプルーフ" },
      { no:11, name:"セイルトゥグローリ", sire:"エフフォーリア",       dam:"セイリングホーム" },
      { no:12, name:"デミアン",            sire:"Flightline",           dam:"Mira Alta" },
    ],
  },
  {
    id:"P07", name:"成田厩舎", emoji:"🎯",
    horses:[
      { no:1,  name:null,               dam:"ブランクチェック" },
      { no:2,  name:"ウィンターブリーズ", sire:"ホットロッドチャーリー", dam:"アイスパステル" },
      { no:3,  name:null,               dam:"プリディカメント" },
      { no:4,  name:"ソルテヴェローチェ", sire:"マテラスカイ",          dam:"ミニーアイル" },
      { no:5,  name:"トリプルウィン",     sire:"ドレフォン",            dam:"ラヴェリータ" },
      { no:6,  name:"タクティシアン",     sire:"サリオス",              dam:"モルジアナ" },
      { no:7,  name:null,               dam:"ベッラガンバ" },
      { no:8,  name:"テンブレイクワン",   sire:"Volatile",              dam:"Nothing But Tom" },
      { no:9,  name:null,               dam:"ミスエンパイアメント" },
      { no:10, name:"アンドレバローズ",   sire:"ルヴァンスレーヴ",      dam:"ジェラスキャット" },
      { no:11, name:null,               dam:"アストロロジカル" },
      { no:12, name:"イレイザー",         sire:"ヘニーヒューズ",        dam:"アーサーズシスター" },
    ],
  },
  {
    id:"P06", name:"涼子厩舎", emoji:"🌸",
    horses:[
      { no:1,  name:"ホウオウシュウ",      sire:"レイデオロ",       dam:"スペシャルグルーヴ" },
      { no:2,  name:"オールシティキング",  sire:"Flightline",       dam:"セルフレスリー" },
      { no:3,  name:"デュガピー",          sire:"クリソベリル",     dam:"エスメラルディーナ" },
      { no:4,  name:"ウラノグラフィア",    sire:"ナダル",           dam:"リュラ" },
      { no:5,  name:null,               dam:"パラダイスコーブ" },
      { no:6,  name:null,               dam:"ショウサンウルル" },
      { no:7,  name:null,               dam:"ドリームライター" },
      { no:8,  name:null,               dam:"スターリーウインド" },
      { no:9,  name:"ヴェトロテンペスタ",  sire:"コントレイル",     dam:"シャンパンエニワン" },
      { no:10, name:null,               dam:"フェータルローズ" },
      { no:11, name:"ホーフアイゼン",      sire:"American Pharoah", dam:"Chain of Love" },
      { no:12, name:null,               dam:"シャインガーネット" },
    ],
  },
  {
    id:"P05", name:"田崎厩舎", emoji:"⚡",
    horses:[
      { no:1,  name:null,               dam:"コンパルティシオン" },
      { no:2,  name:"ディーヴァレギオン", sire:"ナダル",               dam:"シャドウディーヴァ" },
      { no:3,  name:null,               dam:"アーモニーズエンジェル" },
      { no:4,  name:"ヴィルダースヴィル", sire:"ドレフォン",           dam:"セラドン" },
      { no:5,  name:"ディルイーヤ",       sire:"コントレイル",         dam:"メメントモリ" },
      { no:6,  name:"ブックオブケルズ",   sire:"リアルスティール",     dam:"シャンブルドット" },
      { no:7,  name:"ケンシロウワールド", sire:"Violence",             dam:"Colby Cakes" },
      { no:8,  name:"ハイウェイワン",     sire:"カリフォルニアクローム", dam:"シルバーポジー" },
      { no:9,  name:null,               dam:"グロリアーナ" },
      { no:10, name:"トルヴァスト",       sire:"スマートファルコン",   dam:"ギュイエンヌ" },
      { no:11, name:"オメガマサヤ",       sire:"オメガパフューム",     dam:"スターズバース" },
      { no:12, name:null,               dam:"リカビトス" },
    ],
  },
  {
    id:"P03", name:"長谷部厩舎", emoji:"🏆",
    horses:[
      { no:1,  name:"クロダテ",           sire:"キタサンブラック",    dam:"ファッショニスタ" },
      { no:2,  name:null,               dam:"オムニプレゼンス" },
      { no:3,  name:"ツキノエ",           sire:"シスターミニスター",  dam:"メイショウトモシビ" },
      { no:4,  name:"マーゴットセレッソ", sire:"ニューイヤーズデイ", dam:"サリネロ" },
      { no:5,  name:null,               dam:"カラフルデイズ" },
      { no:6,  name:"セドゥクトーラ",     sire:"ナダル",             dam:"アンヴァル" },
      { no:7,  name:"ゼットターム",       sire:"ニューイヤーズデイ", dam:"ファシネートゼット" },
      { no:8,  name:"エクレアカミング",   sire:"ドレフォン",          dam:"エクレアサンライズ" },
      { no:9,  name:"オールベット",       sire:"キズナ",              dam:"エスティロタレントーソ" },
      { no:10, name:"ムーンベリル",       sire:"クリソベリル",        dam:"クインズムーン" },
      { no:11, name:null,               dam:"スズカモナミ" },
      { no:12, name:"ボードゥロレーヌ",   sire:"クリソベリル",        dam:"サイモンミラベル" },
    ],
  },
];

const CURRENT_SEASON = {
  id: "2026-27",
  label: "砂遊び 2026-27",
  period: "2026/06/14 〜",
  group_num: "",
  users: [
    { id:"P01", user_num:0, pt:0, diff:0, comment:"" },
    { id:"P02", user_num:0, pt:0, diff:0, comment:"" },
    { id:"P03", user_num:0, pt:0, diff:0, comment:"" },
    { id:"P04", user_num:0, pt:0, diff:0, comment:"" },
    { id:"P05", user_num:0, pt:0, diff:0, comment:"" },
    { id:"P06", user_num:0, pt:0, diff:0, comment:"" },
    { id:"P07", user_num:0, pt:0, diff:0, comment:"" },
  ],
};

// 前田厩舎（P01）
const HORSES_P01 = [
  { no:11, name:"クラッチスラッガー", record:"1-1-0-3", pt:999,  active:false, sire:"キズナ",           dam:"レンブランサ" },
  { no:2,  name:"キンダープンシュ",   record:"1-0-1-4", pt:941,  active:true,  sire:"モーリス",         dam:"グリューヴァイン" },
  { no:12, name:"ゲタリア",           record:"1-1-0-1", pt:830,  active:true,  sire:"クリソベリル",     dam:"リップスポイズン" },
  { no:1,  name:"インシオン",         record:"1-0-1-3", pt:775,  active:false, sire:"ドレフォン",       dam:"プラウドスペル" },
  { no:3,  name:"ウンナターシャ",     record:"0-2-0-4", pt:759,  active:true,  sire:"パイロ",           dam:"インディアマントゥアナ" },
  { no:8,  name:"サントマーレ",       record:"1-0-1-1", pt:730,  active:false, sire:"ロードカナロア",   dam:"リミニ" },
  { no:9,  name:"セヴェロ",           record:"1-0-0-2", pt:670,  active:false, sire:"サトノダイヤモンド",dam:"クインアマランサス" },
  { no:7,  name:"キセログラフィカ",   record:"0-0-4-2", pt:640,  active:true,  sire:"ナダル",           dam:"バニーテール" },
  { no:10, name:"スマイルガーデン",   record:"0-0-3-4", pt:430,  active:false, sire:"ナダル",           dam:"スマイルシャワー" },
  { no:4,  name:"ワンモメンタム",     record:"1-0-0-3", pt:360,  active:false, sire:"ルヴァンスレーヴ", dam:"ワンブレスアウェイ" },
  { no:6,  name:"ネイティヴプライド", record:"0-0-1-5", pt:209,  active:true,  sire:"クリソベリル",     dam:"ビキニブロンド" },
  { no:5,  name:"ブロンザイト",       record:"0-0-0-3", pt:0,    active:true,  sire:"クリソベリル",     dam:"クルークハイト" },
];

// 川村厩舎（P02）
const HORSES_P02 = [
  { no:5,  name:"アニマレイ",        record:"0-5-3-3", pt:1778, active:false, sire:"ニューイヤーズデイ",     dam:"ガルデルスリール" },
  { no:3,  name:"リベッチオ",        record:"2-0-0-2", pt:1380, active:true,  sire:"ルヴァンスレーヴ",       dam:"スーブレット" },
  { no:6,  name:"サンラザール",      record:"1-1-0-2", pt:1242, active:false, sire:"クリソベリル",           dam:"パールデュー" },
  { no:7,  name:"アローメタル",      record:"1-1-0-0", pt:1210, active:false, sire:"キズナ",                 dam:"ミスベジル" },
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
  { no:9,  name:"フィンガー",        record:"4-4-0-0", pt:20780, active:true,  sire:"Gun Runner",        dam:"エスティロタレントーソ" },
  { no:6,  name:"チュウワカーネギー", record:"2-1-0-4", pt:2764,  active:false, sire:"モーリス",          dam:"デックドアウト" },
  { no:3,  name:"ヘリテージブルーム", record:"2-2-3-1", pt:2540,  active:false, sire:"ミスチヴィアスアレック", dam:"オールドパサデナ" },
  { no:11, name:"ゴールドバローズ",  record:"1-2-0-1", pt:1180,  active:false, sire:"ゴールドドリーム",   dam:"アースサウンド" },
  { no:1,  name:"エクストラプッシュ", record:"1-1-0-7", pt:1087,  active:false, sire:"ナダル",            dam:"ヘアケイリー" },
  { no:7,  name:"エコロボルト",      record:"1-1-0-3", pt:889,   active:true,  sire:"Practical Joke",    dam:"In My Time" },
  { no:4,  name:"エジプシャンマウ",  record:"1-0-0-0", pt:750,   active:true,  sire:"American Pharoah",  dam:"ヘヴンハズマイニッキー" },
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
  { no:9,  name:"アクアアイ",         record:"1-2-2-1", pt:1499, active:true,  sire:"ドレフォン",       dam:"アドマイヤセプター" },
  { no:1,  name:"ペトリコール",       record:"1-1-0-1", pt:850,  active:true,  sire:"Justify",          dam:"ナイセスト" },
  { no:10, name:"マルシュボヌール",   record:"0-0-1-3", pt:349,  active:false, sire:"ドレフォン",       dam:"マルシュロレーヌ" },
  { no:5,  name:"フィデリス",         record:"0-1-0-5", pt:329,  active:true,  sire:"オルフェーヴル",   dam:"スイ" },
  { no:8,  name:"アンビエントポップ", record:"0-1-0-1", pt:240,  active:true,  sire:"ヴァンゴッホ",     dam:"フナウタ" },
  { no:2,  name:"ホウオウファラオ",   record:"0-0-0-5", pt:0,    active:true,  sire:"American Pharoah", dam:"マールボロロード" },
  { no:3,  name:"メイショウバンサン", record:"0-0-0-2", pt:0,    active:false, sire:"ドレフォン",       dam:"シニスタークイーン" },
  { no:4,  name:"ヤマニンコルザ",     record:"0-0-0-2", pt:0,    active:true,  sire:"リオンディーズ",   dam:"ヤマニンプチガトー" },
  { no:11, name:"エコロデュラン",     record:"0-0-0-3", pt:0,    active:true,  sire:"Caravaggio",       dam:"クィーンリズ" },
  { no:12, name:"（未登録）",         record:"0-0-0-0", pt:0,    active:false, sire:"",                 dam:"ヤマニンパピオネ" },
];

// 田崎厩舎（P05）
const HORSES_P05 = [
  { no:4,  name:"パントルナイーフ",   record:"2-1-0-1", pt:16660, active:true,  sire:"キズナ",           dam:"アールブリュット" },
  { no:7,  name:"アドマイヤクワッズ", record:"2-0-3-1", pt:11050, active:false, sire:"リアルスティール", dam:"デイトライン" },
  { no:2,  name:"サトノボヤージュ",   record:"4-1-1-0", pt:8570,  active:false, sire:"Into Mischief",    dam:"ジョリーオリンピカ" },
  { no:12, name:"テーオーグレーザー", record:"2-2-2-1", pt:2980,  active:true,  sire:"マテラスカイ",     dam:"マリンブラスト" },
  { no:1,  name:"カットソロ",         record:"1-1-2-1", pt:1290,  active:false, sire:"コントレイル",     dam:"スルターナ" },
  { no:3,  name:"ジャスティンダラス", record:"1-1-0-1", pt:860,   active:false, sire:"Gun Runner",       dam:"ピンクサンズ" },
  { no:10, name:"フリーガー",         record:"1-0-0-2", pt:750,   active:false, sire:"コントレイル",     dam:"ゲットリッドオブワットアイレスユー" },
  { no:9,  name:"エコログロウ",       record:"1-0-1-2", pt:740,   active:false, sire:"ドレフォン",       dam:"ペイザージュ" },
  { no:8,  name:"ミリオンヴォイス",   record:"1-0-0-1", pt:655,   active:true,  sire:"ゴールドドリーム", dam:"ペルシャンジュエル" },
  { no:11, name:"ゾネブルーム",       record:"0-0-2-1", pt:300,   active:true,  sire:"ヴァンゴッホ",     dam:"ブリガアルタ" },
  { no:6,  name:"モンスターラッシュ", record:"0-0-0-1", pt:240,   active:true,  sire:"クリソベリル",     dam:"クラーベセクレタ" },
  { no:5,  name:"レッドフレーザー",   record:"0-0-0-4", pt:59,    active:false, sire:"ドレフォン",       dam:"ラーゴブルー" },
];

// 涼子厩舎（P06）
const HORSES_P06 = [
  { no:10, name:"ロックターミガン",   record:"3-1-0-3", pt:8690, active:true,  sire:"シスキン",           dam:"リリカルホワイト" },
  { no:2,  name:"トリグラフヒル",     record:"2-1-0-1", pt:2220, active:false, sire:"ナダル",             dam:"トリプライト" },
  { no:8,  name:"キッコベッロ",       record:"1-2-0-2", pt:2060, active:false, sire:"Study of Man",       dam:"アマダブラム２" },
  { no:1,  name:"イナズマダイモン",   record:"1-5-0-1", pt:1910, active:false, sire:"クリソベリル",       dam:"パリスビキニ" },
  { no:3,  name:"ペルセア",           record:"2-0-0-0", pt:1860, active:false, sire:"ドレフォン",         dam:"テルモードーサ" },
  { no:11, name:"ムスクレスト",       record:"1-0-1-3", pt:1099, active:true,  sire:"コントレイル",       dam:"ノイーヴァ" },
  { no:5,  name:"リアライズタキオン", record:"1-1-0-6", pt:969,  active:true,  sire:"ルヴァンスレーヴ",   dam:"タイムハンドラー" },
  { no:6,  name:"バートラガッツ",     record:"1-0-0-0", pt:750,  active:false, sire:"リアルスティール",   dam:"ロッテンマイヤー" },
  { no:9,  name:"ライトフライヤー",   record:"0-0-0-3", pt:84,   active:false, sire:"コントレイル",       dam:"ドリームオブジェニー" },
  { no:4,  name:"カフラー",           record:"0-0-0-0", pt:0,    active:false, sire:"",                   dam:"Ononimo" },
  { no:7,  name:"フローズンブーケ",   record:"0-0-0-2", pt:0,    active:true,  sire:"Frosted",            dam:"Floral Hall" },
  { no:12, name:"ブルースプレイヤー", record:"0-0-0-5", pt:0,    active:true,  sire:"マインドユアビスケッツ",dam:"ジェラテリアバール" },
];

// 成田厩舎（P07）
const HORSES_P07 = [
  { no:11, name:"デアヴェローチェ",   record:"2-1-1-2", pt:6880, active:true,  sire:"マテラスカイ",       dam:"ミニーアイル" },
  { no:4,  name:"アーガイルショア",   record:"1-2-2-2", pt:1399, active:true,  sire:"ナダル",             dam:"ベルプラージュ" },
  { no:1,  name:"アルカディアカフェ", record:"1-1-1-1", pt:1260, active:false, sire:"Into Mischief",      dam:"Mary's Follies" },
  { no:12, name:"ホットシート",       record:"1-1-0-1", pt:980,  active:false, sire:"ディスクリートキャット",dam:"ホットミスト" },
  { no:3,  name:"ミティリーニ",       record:"1-1-0-3", pt:974,  active:true,  sire:"Tapit",              dam:"ミッドナイトビズー" },
  { no:9,  name:"リーグナイト",       record:"1-1-0-2", pt:946,  active:false, sire:"キズナ",             dam:"サリエル" },
  { no:2,  name:"ホウオウストライク", record:"1-0-1-2", pt:836,  active:false, sire:"Good Magic",         dam:"Nightlife Baby" },
  { no:8,  name:"リュウカルネ",       record:"1-0-0-1", pt:750,  active:true,  sire:"ドレフォン",         dam:"ゴールドチェイス" },
  { no:6,  name:"アイデアユー",       record:"0-1-2-2", pt:649,  active:true,  sire:"シニスターミニスター",dam:"サンレーン" },
  { no:5,  name:"メイショウコシュウ", record:"1-1-1-1", pt:960,  active:false, sire:"ナダル",             dam:"メイショウササユリ" },
  { no:7,  name:"アイランド",         record:"0-0-0-0", pt:0,    active:true,  sire:"シニスターミニスター",dam:"ツインキャンドル" },
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
// 2026-27シーズン用：PLAYERS_2627から馬リストを取得
const getHorses = (pid) => {
  const p = PLAYERS_2627.find(p => p.id === pid);
  if (!p) return [];
  return p.horses.map(h => ({
    ...h,
    pt: 0,
    record: "0-0-0-0",
    active: true,
  }));
};

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
  { id:"2025-26", label:"2025-26", period:"2025/06/07〜2026/06/11",
    results:[
      {player:"P03",rank:1,pt:29474},{player:"P05",rank:2,pt:16154},
      {player:"P06",rank:3,pt:15823},{player:"P07",rank:4,pt:8170},
      {player:"P02",rank:5,pt:7491},{player:"P01",rank:6,pt:6731},
      {player:"P04",rank:7,pt:5678},
    ]},
];

// ================================================================
// トロフィーデータ（scrape_trophies_v2.py で生成）
// ================================================================
const TROPHIES = [
  // ===== 2025-26シーズン（〜2026/06東京ダービーまで） =====
  { season:"2025-26", player:"P03", grade:"JpnI",   race:"東京ダービー競走",     horse:"フィンガー",       order:1, date:"2026/06/11" },
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
  { season:"2024-25", player:"P05", grade:"GIII",   race:"ユニコーンS",          horse:"カナルビーグル",   order:1, date:"2025/06/09" },
  { season:"2024-25", player:"P01", grade:"GIII",   race:"ユニコーンS",          horse:"クレーキング",     order:2, date:"2025/05/03" },
  { season:"2024-25", player:"P01", grade:"JpnI",   race:"羽田盃競走",           horse:"ジャナドリア",     order:3, date:"2025/04/29" },
  { season:"2024-25", player:"P01", grade:"JpnIII", race:"雲取賞競走",           horse:"ジャナドリア",     order:1, date:"2025/02/19" },
  { season:"2024-25", player:"P01", grade:"JpnIII", race:"雲取賞競走",           horse:"グランジョルノ",   order:2, date:"2025/02/19" },
  { season:"2024-25", player:"P01", grade:"JpnIII", race:"JBC2歳優駿",           horse:"グランジョルノ",   order:2, date:"2024/11/04" },
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
    season: "2025-26",
    items: [
      { title:"最優秀厩舎",   stable:"長谷部厩舎", horse:"",               note:"シーズン優勝" },
      { title:"最優砂遊び馬", stable:"長谷部厩舎", horse:"フィンガー",     note:"JpnI東京ダービー1着" },
      { title:"最優秀中距離", stable:"長谷部厩舎", horse:"フィンガー",     note:"JpnI東京ダービー1着" },
      { title:"最優秀短距離", stable:"田崎厩舎",   horse:"サトノボヤージュ",note:"JpnII兵庫チャンピオンシップ1着" },
      { title:"最優秀牝馬",   stable:"涼子厩舎",   horse:"ペルセア",       note:"" },
      { title:"最優秀芝馬",   stable:"田崎厩舎",   horse:"パントルナイーフ",note:"" },
    ],
  },
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
    }}>
      <span style={COL.venue}>{r.venue}</span>
      <span style={COL.race}>{r.race}{r.grade ? <GradeTag grade={r.grade} local={r.local}/> : ""}</span>
      <span style={COL.course}><SurfaceTag surface={r.surface} dist={r.dist} small /></span>
      <span style={COL.horse}>{r.horse}</span>
      <span style={{...COL.order, color:orderColor}}>{r.order}着</span>
      {showPlayer && <span style={COL.player}>{playerName(r.player)}</span>}
      <span style={{...COL.pt, color: zero ? "#bbb" : "#d33", lineHeight:1.2}}>
        {zero ? "+0" : `+${fmt(dPt)}`}
        {r.surface === "turf" && r.turfPt > 0 && (
          <span style={{ display:"block", fontSize:8, color:"#bbb", fontWeight:400 }}>
            ({fmt(r.turfPt)}pt没収)
          </span>
        )}
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

function RankingScreen({ onSelectPlayer, updated, results }) {
  // 2026-27シーズン合計pt（results.jsonから計算）
  const totalPtMap = (() => {
    const map = {};
    for (const r of results) {
      if (r.surface !== "dirt" || r.rawPt <= 0) continue;
      if (!HORSES_2627_SET.has(r.horse)) continue;
      map[r.player] = (map[r.player] || 0) + r.rawPt;
    }
    return map;
  })();

  // 直近7日間のダート入着ptをプレイヤー別に集計
  const weeklyPt = (() => {
    const today = new Date();
    const cutoff = new Date(today); cutoff.setDate(today.getDate() - 7);
    const mm = (d) => String(d.getMonth()+1).padStart(2,"0");
    const dd = (d) => String(d.getDate()).padStart(2,"0");
    const cutLabel = `${mm(cutoff)}/${dd(cutoff)}`;
    const map = {};
    for (const r of results) {
      if (r.surface !== "dirt" || r.rawPt <= 0) continue;
      if (r.date < cutLabel) continue;
      if (!HORSES_2627_SET.has(r.horse)) continue;
      map[r.player] = (map[r.player] || 0) + r.rawPt;
    }
    return map;
  })();

  const users = CURRENT_SEASON.users.map(u => ({ ...u, pt: totalPtMap[u.id] || 0 }));
  const sorted = [...users].sort((a,b) => b.pt - a.pt);
  const max = sorted[0].pt || 1;
  const topPt = sorted[0].pt;

  // 前週ランキング（週間ptを差し引いた順位）
  const prevSorted = [...users]
    .map(u => ({ ...u, prevPt: u.pt - (weeklyPt[u.id] || 0) }))
    .sort((a,b) => b.prevPt - a.prevPt);
  const prevRankMap = {};
  prevSorted.forEach((u, i) => { prevRankMap[u.id] = i; });

  const handleShare = async () => {
    const text = sorted.map((u, i) => {
      const player = PLAYERS.find(p => p.id === u.id);
      const medal = ["🥇","🥈","🥉"][i] ?? `${i+1}位`;
      return `${medal} ${player?.name} ${fmt(u.pt)}pt`;
    }).join("\n");
    const shareText = `🐴 POG砂遊び 2026-27 現在のランキング\n\n${text}\n\n${window.location.href}`;
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
      {updated && (
        <div style={{ fontSize:10, color:"#bbb", textAlign:"right", marginBottom:8, paddingRight:4 }}>🔄 {updated}</div>
      )}

      {sorted.map((u, i) => {
        const isTop = i === 0;
        const abovePt = i > 0 ? sorted[i-1].pt : 0;
        const aboveRank = i;
        const ptGap = abovePt - u.pt;
        const medal = ["🥇","🥈","🥉"][i];
        const player = PLAYERS.find(p => p.id === u.id);
        const prevRank = prevRankMap[u.id] ?? i;
        const rankChange = prevRank - i;
        const changeBadge = rankChange > 0
          ? { text:`↑${rankChange}`, color:"#22a845", bg:"#e8f7ed" }
          : rankChange < 0
          ? { text:`↓${Math.abs(rankChange)}`, color:"#d33", bg:"#fdecea" }
          : { text:"→", color:"#aaa", bg:"#f0f0f0" };

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
            <div style={{ width:36, textAlign:"center", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
              {isTop ? (
                <div style={{ fontSize:28, lineHeight:1 }}>👑</div>
              ) : (
                <div style={{ fontSize: i<3?22:16, fontWeight:800, color: i<3?"inherit":"#888" }}>
                  {medal ?? `${i+1}`}
                </div>
              )}
              <div style={{
                fontSize:9, fontWeight:700, color:changeBadge.color,
                background:changeBadge.bg, borderRadius:4, padding:"1px 4px", lineHeight:1.3,
              }}>{changeBadge.text}</div>
            </div>
            {/* 名前・バー */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize: isTop?16:15, marginBottom:5 }}>
                {player?.name}
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
                  {aboveRank}位まで <span style={{ fontWeight:700, color:"#888" }}>▲{fmt(ptGap)}</span> pt
                </div>
              )}
            </div>
            {/* pt */}
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontWeight:800, fontSize: isTop?19:17, color: isTop?G.dirtDark:"#222" }}>{fmt(u.pt)}</div>
              <div style={{ fontSize:11, color: isTop?"#b8841e":"#999" }}>pt</div>
              {(weeklyPt[u.id]||0)>0 && <div style={{ fontSize:11, color:"#d33", fontWeight:700 }}>+{fmt(weeklyPt[u.id])}</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PlayerDetailScreen({ userId, onBack, onSelectHorse, kettonums, regist2627 = {} }) {
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
            padding:"4px 10px", display:"flex", alignItems:"center", gap:6,
          }}>
            {/* 番号 */}
            <div style={{
              width:18, height:18, borderRadius:3, background:G.greenDark,
              color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:10, fontWeight:700, flexShrink:0,
            }}>{h.no}</div>
            {/* 馬名・在厩 */}
            <div style={{ flex:1, minWidth:0, cursor:"pointer" }} onClick={() => onSelectHorse(h)}>
              <div style={{ fontWeight:700, fontSize:12, display:"flex", alignItems:"center", gap:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {h.name}
              </div>
              <div style={{ fontSize:9, color:"#aaa", lineHeight:1.2 }}>
                {h.sire && <span>父<span translate="no">{h.sire}</span></span>}
                {h.dam  && <span style={{ marginLeft:3 }}>母<span translate="no">{h.dam}</span></span>}
              </div>
            </div>
            {/* pt */}
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <span style={{ fontWeight:800, fontSize:13 }}>{fmt(h.pt)}</span>
              <span style={{ fontSize:9, color:"#999", marginLeft:2 }}>pt</span>
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

  // record "3-4-0-7" = 1着-2着-3着-着外 → パース
  const [w, p, s, o] = (horse.record || "0-0-0-0").split("-").map(Number);
  const total = w + p + s + o;
  const winRate  = total > 0 ? Math.round((w / total) * 100) : 0;
  const rentaiRate = total > 0 ? Math.round(((w + p) / total) * 100) : 0;

  return (
    <div style={{ padding:12 }}>
      {/* ヘッダーカード */}
      <div style={{ background:"#fff", borderRadius:12, padding:"16px 18px", marginBottom:12, border:"1px solid #e4e9e6" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
          <div>
            <div style={{ fontSize:22, fontWeight:800 }}>{horse.name}</div>
            <div style={{ fontSize:12, color:"#888", marginTop:4 }}>
              {playerEmoji(playerId)} {playerName(playerId)}
              {horse.active && <span style={{ marginLeft:6, fontSize:10, color:G.green, border:`1px solid ${G.green}`, borderRadius:3, padding:"0 3px" }}>在厩</span>}
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

        {/* ポイント + 成績サマリー */}
        <div style={{ display:"flex", gap:0, marginTop:14, background:"#f8f9fa", borderRadius:10, overflow:"hidden" }}>
          {[
            { label:"獲得pt", value:`${fmt(horse.pt)}pt`, big:true },
            { label:"勝率",   value:`${winRate}%` },
            { label:"連対率", value:`${rentaiRate}%` },
            { label:"出走数", value:`${total}戦` },
          ].map((item, idx) => (
            <div key={idx} style={{
              flex:1, textAlign:"center", padding:"10px 4px",
              borderRight: idx < 3 ? "1px solid #eee" : "none",
            }}>
              <div style={{ fontSize:9, color:"#999", marginBottom:2 }}>{item.label}</div>
              <div style={{ fontSize:item.big?16:14, fontWeight:800, color:item.big?G.dirtDark:"#222" }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* 着順ビジュアルバー */}
        {total > 0 && (
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:10, color:"#aaa", marginBottom:4 }}>着順内訳（{total}戦）</div>
            <div style={{ display:"flex", gap:3, alignItems:"center" }}>
              {[
                { count:w, label:"1着", color:G.gold },
                { count:p, label:"2着", color:G.silver },
                { count:s, label:"3着", color:G.bronze },
                { count:o, label:"着外", color:"#ddd" },
              ].map((item, idx) => item.count > 0 && (
                <div key={idx} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                  <div style={{
                    width: Math.max(24, item.count * 20), height:14,
                    background:item.color, borderRadius:3,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:9, fontWeight:700, color: idx < 2 ? "#333" : idx===2?"#fff":"#aaa",
                  }}>{item.count}</div>
                  <div style={{ fontSize:8, color:"#aaa" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 父・母 */}
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
  return (
    <div style={{ padding:12 }}>
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
                      <div style={{ padding:"5px 10px", background:"#e8f0eb", fontSize:11, fontWeight:800, color:"#2d6a4f", borderBottom:"1px solid #c5daca", borderTop:"2px solid #c5daca", letterSpacing:1 }}>
                        {(() => { const [m,d]=g.date.split("/").map(Number); const yr=m>=7?2025:2026; const day=new Date(yr,m-1,d).getDay(); return `📅 ${g.date} (${["日","月","火","水","木","金","土"][day]})`; })()}
                      </div>
                      {g.rows.map((r,i) => <ResultRow key={i} r={r} />)}
                    </div>
                  ))}
                </div>
              );
            })()
        }
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
  const [hallTab, setHallTab] = useState("ranking"); // "ranking" | "awards"
  const stats = PLAYERS.map(p => {
    const mySeasons = SEASONS_ALL.filter(s => s.results.find(r => r.player===p.id));
    const wins = mySeasons.filter(s => s.period.includes("〜") && !s.period.endsWith("〜") && s.results.find(r => r.player===p.id)?.rank===1);
    const totalPt = mySeasons.reduce((sum,s) => {
      const r = s.results.find(r => r.player===p.id);
      return sum + (r?.pt??0);
    },0);
    const trophies = TROPHIES.filter(t => t.player===p.id && t.order===1);
    const ranks = mySeasons.map(s => s.results.find(r => r.player===p.id)?.rank).filter(r => r != null);
    const avgRank = ranks.length ? ranks.reduce((a,b)=>a+b,0)/ranks.length : null;
    return { ...p, seasons:mySeasons.length, wins:wins.length, totalPt, trophies, avgRank };
  }).filter(p => p.seasons>0).sort((a,b)=>
    (a.avgRank??99) - (b.avgRank??99) ||
    b.wins - a.wins ||
    b.totalPt - a.totalPt
  );

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

      {/* サブタブ */}
      <div style={{ display:"flex", gap:4, marginBottom:14 }}>
        {[["ranking","🏟️ 殿堂ランキング"],["history","📅 シーズン成績"],["awards","🏅 シーズン表彰"]].map(([k,l]) => (
          <button key={k} onClick={()=>setHallTab(k)} style={{
            flex:1, padding:"9px 0", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer",
            background: hallTab===k ? G.dirt : G.hallCard,
            color: hallTab===k ? "#fff" : G.hallDim,
            border: `1px solid ${hallTab===k ? G.dirt : G.hallBorder}`,
          }}>{l}</button>
        ))}
      </div>

      {hallTab === "ranking" && (
        <div style={{
          background:G.hallCard, border:`1px solid ${G.hallBorder}`,
          borderRadius:12, overflow:"hidden",
        }}>
          {stats.map((p,i) => (
            <button key={p.id} onClick={() => onSelectHallPlayer(p)}
              style={{
                width:"100%", textAlign:"left", cursor:"pointer",
                background: i===0 ? "rgba(201,162,39,0.12)" : "transparent",
                border:"none",
                borderBottom: i<stats.length-1 ? `1px solid ${G.hallBorder}` : "none",
                padding:"8px 12px",
                display:"flex", alignItems:"center", gap:8,
              }}>
              {/* 順位 */}
              <div style={{ width:24, textAlign:"center", flexShrink:0 }}>
                {i===0 ? <span style={{ fontSize:18 }}>👑</span>
                  : i===1 ? <span style={{ fontSize:16 }}>🥈</span>
                  : i===2 ? <span style={{ fontSize:16 }}>🥉</span>
                  : <span style={{ fontSize:12, color:G.hallDim, fontWeight:700 }}>{i+1}</span>}
              </div>
              {/* 名前・スタッツ */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:800, fontSize:13, color:G.hallText, marginBottom:2 }}>
                  {p.name}
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <span style={{
                    fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:3,
                    background: p.wins>0?"rgba(201,162,39,0.3)":"rgba(255,255,255,0.05)",
                    color: p.wins>0?G.gold:G.hallDim,
                  }}>優勝{p.wins}回</span>
                  <span style={{ fontSize:9, color:G.hallDim }}>重賞{p.trophies.length}勝</span>
                  {p.avgRank != null && (
                    <span style={{ fontSize:9, color:G.hallDim }}>平均{p.avgRank.toFixed(1)}位</span>
                  )}
                </div>
              </div>
              {/* ミニグラフ */}
              <div style={{ flexShrink:0 }}>
                <RankGraph playerId={p.id} playerName={p.name}
                  onTap={() => setGraphModal({ playerId:p.id, playerName:p.name })} />
              </div>
            </button>
          ))}
        </div>
      )}


      {/* グラフ拡大モーダル */}
      {graphModal && (
        <RankGraphModal
          playerId={graphModal.playerId}
          playerName={graphModal.playerName}
          onClose={() => setGraphModal(null)}
        />
      )}

      {/* ===== シーズン成績タブ ===== */}
      {hallTab === "history" && (
        <div>
          {[...SEASONS_ALL].reverse().map(season => (
            <div key={season.id} style={{
              background:G.hallCard, border:`1px solid ${G.hallBorder}`,
              borderRadius:12, padding:"12px 14px", marginBottom:12,
            }}>
              {/* シーズン名 */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
                <div style={{ fontSize:14, fontWeight:900, color:G.dirtLight }}>
                  砂遊び {season.label}
                </div>
                <div style={{ fontSize:10, color:G.hallDim }}>{season.period}</div>
              </div>
              {/* 順位表 */}
              {[...season.results].sort((a,b)=>a.rank-b.rank).map((r,i) => {
                const player = PLAYERS.find(p=>p.id===r.player);
                const rankIcon = i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
                return (
                  <div key={r.player} style={{
                    display:"flex", alignItems:"center", gap:10,
                    padding:"7px 0",
                    borderBottom: i<season.results.length-1 ? `1px solid ${G.hallBorder}` : "none",
                  }}>
                    <div style={{ width:28, textAlign:"center", flexShrink:0 }}>
                      {rankIcon
                        ? <span style={{ fontSize:18 }}>{rankIcon}</span>
                        : <span style={{ fontSize:13, color:G.hallDim, fontWeight:700 }}>{r.rank}</span>
                      }
                    </div>
                    <div style={{ flex:1, fontWeight:700, fontSize:13, color:G.hallText }}>
                      {player?.name ?? r.player}
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <span style={{ fontWeight:800, fontSize:14, color: i===0?G.gold:G.hallText }}>
                        {fmt(r.pt)}
                      </span>
                      <span style={{ fontSize:10, color:G.hallDim, marginLeft:2 }}>pt</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ===== シーズン表彰タブ ===== */}
      {hallTab === "awards" && (
        <div>
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
      )}
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

// 2026-27登録済み馬名セット
const HORSES_2627_SET = new Set(
  PLAYERS_2627.flatMap(p => p.horses.filter(h => h.name).map(h => h.name))
);
// 2025-26の馬名セット（出走予定から除外するため）
const HORSES_2526_SET = new Set(
  Object.values(HORSES_BY_PLAYER).flat().filter(h => h.name).map(h => h.name)
);

function StatusScreen({ data, kettonums = {} }) {
  if (!data) {
    return <div style={{ textAlign:"center", color:"#aaa", marginTop:40, fontSize:14 }}>読み込み中…</div>;
  }

  const pick = (rec, keys) => {
    for (const k of keys) if (rec[k]) return rec[k];
    return "";
  };

  // 2025-26の馬を除外（2026-27のみ表示）
  const filter2627 = (list) => (list || []).filter(r => {
    const name = pick(r, ["馬名"]);
    return !HORSES_2526_SET.has(name);
  });
  const sched  = filter2627(data.schedule_results);
  const regist = filter2627(data.special_regist);
  // グレード等（col* に入りがちな短い値）を拾う
  const grade = (rec) => {
    for (const k of Object.keys(rec)) {
      if (k.startsWith("col") && /^(G[ⅠⅡⅢI123]|JpnI*|OP|L|重賞)/.test(rec[k] || "")) return rec[k];
    }
    return "";
  };

  // 全シーズンの馬名→{sire,dam,player}マップ
  const horseInfoMap = (() => {
    const map = {};
    Object.entries(HORSES_BY_PLAYER).forEach(([pid, horses]) => {
      horses.forEach(h => { if (h.name) map[h.name] = { sire: h.sire, dam: h.dam, pid }; });
    });
    PLAYERS_2627.forEach(p => {
      p.horses.forEach(h => { if (h.name) map[h.name] = { sire: h.sire, dam: h.dam, pid: p.id, no: h.no }; });
    });
    return map;
  })();

  const dayStr = (dateStr) => {
    const [m,d] = (dateStr||"").split("/").map(Number);
    if (isNaN(m)) return "";
    return ["日","月","火","水","木","金","土"][new Date(2026,m-1,d).getDay()];
  };

  const Section = ({ icon, title, note, list, empty, withResult }) => {
    if (list.length === 0) return (
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:800, color:"#444", marginBottom:4 }}>{icon} {title} (0)</div>
        {note && <div style={{ fontSize:11, color:"#999", marginBottom:6 }}>{note}</div>}
        <div style={{ textAlign:"center", color:"#aaa", padding:"12px 0", fontSize:12 }}>{empty}</div>
      </div>
    );

    // 日付 → 競走 でグループ化
    const dateGroups = [];
    const dateMap = {};
    list.forEach(rec => {
      const date = pick(rec, ["日時"]) || "?";
      if (!dateMap[date]) { dateMap[date] = []; dateGroups.push({ date, rows: dateMap[date] }); }
      dateMap[date].push(rec);
    });

    const COL = {
      venue: { flex:"0 0 56px", fontSize:10, color:"#444" },
      race:  { flex:"0 0 40px", fontSize:10, color:"#555" },
      dist:  { flex:"0 0 36px", fontSize:10, fontWeight:700 },
      horse: { flex:1, fontSize:12, fontWeight:800, color:"#111" },
      stable:{ flex:"0 0 58px", fontSize:9, textAlign:"center" },
      jockey:{ flex:"0 0 44px", fontSize:10, color:"#666", textAlign:"right" },
      rank:  { flex:"0 0 26px", fontSize:11, fontWeight:800, textAlign:"right" },
    };

    return (
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:800, color:"#444", marginBottom:4 }}>
          {icon} {title} ({list.length})
        </div>
        {note && <div style={{ fontSize:10, color:"#999", marginBottom:6 }}>{note}</div>}
        <div style={{ background:"#fff", borderRadius:8, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
          {/* ヘッダー */}
          <div style={{ display:"flex", gap:0, padding:"5px 8px", background:"#f5f5f5", borderBottom:"1px solid #e0e0e0" }}>
            <span style={{ flex:"0 0 56px", fontSize:9, color:"#999", fontWeight:700 }}>競走</span>
            <span style={{ flex:"0 0 40px", fontSize:9, color:"#999", fontWeight:700 }}>レース</span>
            <span style={{ flex:"0 0 36px", fontSize:9, color:"#999", fontWeight:700 }}>距離</span>
            <span style={{ flex:1,          fontSize:9, color:"#999", fontWeight:700 }}>馬名</span>
            <span style={{ flex:"0 0 58px", fontSize:9, color:"#999", fontWeight:700, textAlign:"center" }}>厩舎</span>
            <span style={{ flex:"0 0 44px", fontSize:9, color:"#999", fontWeight:700, textAlign:"right" }}>騎手</span>
            {withResult && <span style={{ flex:"0 0 26px", fontSize:9, color:"#999", fontWeight:700, textAlign:"right" }}>着順</span>}
          </div>
          {/* 日付ブロック */}
          {dateGroups.map(({ date, rows }) => (
            <div key={date}>
              {/* 日付セパレーター */}
              <div style={{ padding:"4px 8px", background:"#e8f0eb", borderBottom:"1px solid #d0e4d8", borderTop:"1px solid #d0e4d8" }}>
                <span style={{ fontSize:10, fontWeight:800, color:"#2d6a4f" }}>
                  📅 {date}（{dayStr(date)}）
                </span>
              </div>
              {/* レース行 */}
              {rows.map((rec, i) => {
                const horse  = pick(rec, ["馬名"]);
                const venue  = pick(rec, ["競走"]);
                const race   = pick(rec, ["レース名"]);
                const dist   = pick(rec, ["距離"]);
                const jockey = pick(rec, ["騎手"]);
                const rank   = pick(rec, ["順位"]);
                const info   = horseInfoMap[horse] || {};
                const player = PLAYERS.find(p => p.id === info.pid);
                const color  = info.pid ? (PLAYER_COLORS[info.pid]||G.green) : "#e0e0e0";
                const isDirt = dist && !dist.includes("芝");
                return (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", padding:"5px 8px",
                    borderBottom: i<rows.length-1 ? "1px solid #f0f0f0" : "none",
                    borderLeft:`3px solid ${color}`,
                  }}>
                    <span style={COL.venue}>{venue}</span>
                    <span style={COL.race}>{race}</span>
                    <span style={{ ...COL.dist, color: isDirt?G.dirtDark:"#2a7a3a" }}>{dist}</span>
                    <span style={COL.horse}>
                      {(() => {
                        const url = kettonums[horse]
                          ? `https://db.netkeiba.com/horse/${kettonums[horse]}/`
                          : `https://www.google.com/search?q=netkeiba+${encodeURIComponent(horse)}`;
                        return (
                          <a href={url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ fontWeight:800, fontSize:12, color:"#1a56c4", textDecoration:"none", display:"block" }}>
                            {horse}
                          </a>
                        );
                      })()}
                      {(info.sire||info.dam) && (
                        <span style={{ fontSize:8, color:"#bbb", display:"block", lineHeight:1.3 }}>
                          {[info.sire && `父${info.sire}`, info.dam && `母${info.dam}`].filter(Boolean).join(" ")}
                        </span>
                      )}
                    </span>
                    {/* 厩舎列 */}
                    <span style={COL.stable}>
                      {player ? (
                        <span style={{
                          display:"inline-block", fontSize:8, color:"#fff",
                          background:color, borderRadius:3, padding:"1px 4px",
                          lineHeight:1.5, textAlign:"center",
                        }}>
                          {player.name.replace("厩舎","")}<br/>
                          {info.no != null ? `${info.no}位指名` : ""}
                        </span>
                      ) : "—"}
                    </span>
                    <span style={COL.jockey}>{jockey}</span>
                    {withResult && <span style={{ ...COL.rank, color:rank==="1"?"#c9a227":"#555" }}>{rank?`${rank}着`:""}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ background:"#eef2f0", minHeight:"100%" }}>
      <div style={{ padding:"14px 12px 0" }}>
        <Section
          icon="🏁" title="出走予定・確定" withResult
          note="今週の出走予定と確定情報です（木曜18時ごろ確定）。"
          list={sched}
          empty={<>今週の出走予定はまだありません<br /><span style={{ fontSize:12 }}>（木曜18時ごろに確定情報が出ます）</span></>}
        />
        <Section
          icon="🎯" title="特別登録"
          note="重賞などへの登録状況です。"
          list={regist}
          empty={<>現在、特別登録はありません<br /><span style={{ fontSize:12 }}>（特別レースに登録され次第表示されます）</span></>}
        />
      </div>

      {data.updated && (
        <div style={{ textAlign:"center", color:"#aaa", fontSize:11, padding:"0 0 16px" }}>
          最終取得: {data.updated}
        </div>
      )}
    </div>
  );
}

function NewsScreen({ news }) {
  const [filterPlayer, setFilterPlayer] = useState("ALL");

  const cleanTitle = (title) => title.replace(/\s*[-—]\s*[^-—]+$/, "");

  // 2026-27シーズンのみ表示
  const baseNews = news.filter(n => HORSES_2627_SET.has(n.horse));

  const activePlayers = PLAYERS.filter(p => baseNews.some(n => n.player === p.id));

  const filtered = filterPlayer === "ALL"
    ? baseNews
    : baseNews.filter(n => n.player === filterPlayer);

  return (
    <div style={{ background:"#eef2f0", minHeight:"100%" }}>
      <div style={{ padding:"10px 12px" }}>
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
                <span style={{ fontSize:11, color:"#444", fontWeight:700 }}>{playerName(n.player)}</span>
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
  const [hideShinma, setHideShinma] = useState(true);
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
  const [regist, setRegist] = useState({});

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/regist2627.json`).then(r => r.json()).then(setRegist).catch(() => {});
  }, []);

  // 静的な馬名が無くても、登録情報（母名→馬名）があればそれを使う
  const horseName = (player, h) => {
    const pReg = regist[player.id];
    return h.name || (pReg && pReg.dam_to_name && pReg.dam_to_name[h.dam]) || null;
  };

  // 在厩ステータスをregist2627から取得（"O"=在厩、"—"=不在）
  const horseActive = (player, horseName_) => {
    const pReg = regist[player.id];
    if (!pReg || !pReg.horses) return true; // データなければ在厩とみなす
    const found = pReg.horses.find(h => h.name === horseName_);
    if (!found) return true;
    return found.active;
  };

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
            const registered = player.horses.filter(h => horseName(player, h)).length;
            return (
              <div key={player.id} style={{
                background:"#fff", borderRadius:12, marginBottom:12,
                boxShadow:"0 1px 4px rgba(0,0,0,0.08)", overflow:"hidden",
              }}>
                {/* プレイヤーヘッダー */}
                <div style={{
                  background: G.dirtDark, color:"#fff",
                  padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between",
                }}>
                  <div style={{ fontWeight:800, fontSize:15 }}>{player.name}</div>
                  <div style={{ fontSize:11, opacity:0.85 }}>登録済 {registered}/12頭</div>
                </div>
                {/* 馬リスト（指名順・2列グリッド） */}
                <div style={{ padding:"6px 10px 8px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2px 4px" }}>
                  {player.horses.map(h => {
                    const nm = horseName(player, h);
                    const isNamed = !!nm;
                    return (
                      <div key={h.no} style={{
                        display:"flex", alignItems:"center", gap:5,
                        padding:"4px 2px",
                        borderBottom:"1px solid #f5f5f5",
                      }}>
                        {/* 指名順バッジ */}
                        <div style={{
                          minWidth:26, height:18, borderRadius:4,
                          background: isNamed ? G.dirt : "#e8e8e8",
                          color: isNamed ? "#fff" : "#bbb",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:10, fontWeight:800, flexShrink:0,
                        }}>{h.no}</div>
                        {/* 馬情報 */}
                        <div style={{ flex:1, minWidth:0, overflow:"hidden" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                            {isNamed ? (
                              <span translate="no" style={{ fontWeight:800, fontSize:12, color:"#222", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{nm}</span>
                            ) : (
                              <span style={{ fontWeight:700, fontSize:11, color:"#bbb" }}>名前未定</span>
                            )}
                          </div>
                          <div style={{ fontSize:9, color: isNamed ? "#aaa" : "#ccc", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {h.dam && <span>母{h.dam}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div style={{ fontSize:10, color:"#bbb", textAlign:"center", marginTop:4 }}>
            ※ 名前未定はJRA馬名未登録。血統のみ掲載
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
          {PLAYERS_2627.map((player, idx) => {
            const registered = player.horses.filter(h => h.name).length;
            return (
              <div key={player.id} style={{
                background:"#fff", borderRadius:10, marginBottom:8,
                padding:"12px 14px", display:"flex", alignItems:"center", gap:12,
                boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
              }}>
                <div style={{ fontSize:18, fontWeight:800, color:"#ddd", minWidth:24, textAlign:"center" }}>{idx+1}</div>
                <div style={{ fontSize:20 }}>{player.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#555" }}>{player.name}</div>
                  <div style={{ fontSize:11, color:"#bbb", marginTop:2 }}>登録済 {registered}/12頭</div>
                </div>
                <div style={{ fontSize:18, fontWeight:800, color:"#ddd" }}>0 pt</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ダート種牡馬研究画面
// ================================================================

function StallionScreen({ stallions, results, stallionLeading }) {
  const [selectedId, setSelectedId] = useState(null);
  const [activeSection, setActiveSection] = useState("column"); // column | leading | sire_rank | pog_pt
  const [leadingYear, setLeadingYear] = useState(null); // null = 最新年度

  // 指名馬の父ランキング集計
  const sireCountMap = {};
  PLAYERS_2627.forEach(p => {
    p.horses.forEach(h => {
      if (h.name && h.sire) {
        sireCountMap[h.sire] = (sireCountMap[h.sire] || 0) + 1;
      }
    });
  });
  const sireRanking = Object.entries(sireCountMap)
    .sort((a, b) => b[1] - a[1])
    .map(([sire, count]) => ({ sire, count }));

  // 種牡馬別POGポイント集計
  const horseToSire = {};
  PLAYERS_2627.forEach(p => {
    p.horses.forEach(h => { if (h.name && h.sire) horseToSire[h.name] = h.sire; });
  });
  const sirePtMap = {};
  (results || []).forEach(r => {
    if (r.surface !== "dirt" || r.rawPt <= 0) return;
    const sire = horseToSire[r.horse];
    if (!sire) return;
    sirePtMap[sire] = (sirePtMap[sire] || 0) + r.rawPt;
  });
  const sirePtRanking = Object.entries(sirePtMap)
    .sort((a, b) => b[1] - a[1])
    .map(([sire, pt]) => ({ sire, pt }));

  const maxCount = sireRanking[0]?.count || 1;
  const maxPt = sirePtRanking[0]?.pt || 1;
  const columns = stallions?.columns || [];
  const selected = selectedId ? columns.find(s => s.id === selectedId) : null;

  const sectionTabs = [
    { key:"column",   label:"🔥 注目種牡馬" },
    { key:"leading",  label:"📈 リーディング" },
    { key:"sire_rank",label:"👨‍👧 指名馬の父" },
    { key:"pog_pt",   label:"🏆 POGポイント" },
  ];

  // リーディングデータ
  const leadingYears = Object.keys(stallionLeading?.years || {}).sort((a,b) => b-a);
  const currentLeadingYear = leadingYear || leadingYears[0];
  const leadingRows = stallionLeading?.years?.[currentLeadingYear] || [];

  if (selected) {
    return (
      <div style={{ padding:"12px 14px" }}>
        <button onClick={() => setSelectedId(null)} style={{
          background:"none", border:"none", color:G.green, fontWeight:700, fontSize:13,
          cursor:"pointer", padding:"0 0 10px", display:"flex", alignItems:"center", gap:4,
        }}>← 一覧に戻る</button>
        {/* ヘッダー */}
        <div style={{ background:G.dirtDark, borderRadius:12, padding:"16px", color:"#fff", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:20, fontWeight:900 }} translate="no">{selected.name}</div>
              <div style={{ fontSize:13, opacity:0.8, marginTop:2 }}>{selected.nameJa}</div>
            </div>
            <div style={{ textAlign:"right", fontSize:11, opacity:0.8 }}>
              <div>{selected.country}</div>
              <div>{selected.born}年生</div>
            </div>
          </div>
          <div style={{ marginTop:10, fontSize:11, opacity:0.85, lineHeight:1.6 }}>
            父 <span translate="no" style={{ fontWeight:700 }}>{selected.sire}</span>
            母父 <span translate="no" style={{ fontWeight:700 }}>{selected.damSire}</span>
          </div>
          <div style={{ marginTop:4, display:"flex", gap:6, flexWrap:"wrap" }}>
            {(selected.tags||[]).map(t => (
              <span key={t} style={{ fontSize:10, background:"rgba(255,255,255,0.2)", borderRadius:10, padding:"2px 8px" }}>{t}</span>
            ))}
          </div>
        </div>
        {/* 概要 */}
        <div style={{ background:"#fff", borderRadius:10, padding:"14px", marginBottom:10 }}>
          <div style={{ fontWeight:800, fontSize:13, marginBottom:6, color:G.dirtDark }}>📝 概要</div>
          <div style={{ fontSize:12, lineHeight:1.8, color:"#333" }}>{selected.summary}</div>
        </div>
        {/* 現役成績 */}
        <div style={{ background:"#fff", borderRadius:10, padding:"14px", marginBottom:10 }}>
          <div style={{ fontWeight:800, fontSize:13, marginBottom:6, color:G.dirtDark }}>🏇 現役時代</div>
          <div style={{ fontSize:12, lineHeight:1.8, color:"#333" }}>{selected.career}</div>
        </div>
        {/* 種付け料推移テーブル */}
        {selected.studFeeRows && selected.studFeeRows.length > 0 && (
          <div style={{ background:"#fff", borderRadius:10, marginBottom:10, overflow:"hidden" }}>
            <div style={{ background:G.dirtDark, padding:"10px 14px", fontWeight:800, fontSize:13, color:"#fff" }}>💰 種付け料推移</div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr style={{ background:"#f5f5f5" }}>
                    {["年度","供用年数","種付料","代表産駒"].map(h => (
                      <th key={h} style={{ padding:"7px 10px", textAlign: h==="種付料"?"right":"left", fontWeight:700, fontSize:11, color:"#555", borderBottom:"1px solid #e8e8e8", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selected.studFeeRows.map((row, i) => (
                    <tr key={row.year} style={{ borderBottom:"1px solid #f0f0f0", background: i%2===0?"#fff":"#fafafa" }}>
                      <td style={{ padding:"8px 10px", fontWeight:700, color:"#222" }}>{row.year}</td>
                      <td style={{ padding:"8px 10px", color:"#888", fontSize:11 }}>{row.nth}</td>
                      <td style={{ padding:"8px 10px", textAlign:"right", fontWeight:800, color:G.dirtDark }}>{row.fee}</td>
                      <td style={{ padding:"8px 10px", color:"#2563c4", fontSize:11 }} translate="no">{row.rep || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* 代表産駒 */}
        <div style={{ background:"#fff", borderRadius:10, padding:"14px", marginBottom:10 }}>
          <div style={{ fontWeight:800, fontSize:13, marginBottom:8, color:G.dirtDark }}>🐴 代表産駒</div>
          {(selected.repOffspring||[]).map((horse, i) => {
            const isPog = horse.includes("砂遊び");
            return (
              <div key={i} style={{
                padding:"6px 8px", borderRadius:6, marginBottom:4,
                background: isPog ? "#fff8f0" : "#f8f8f8",
                border: isPog ? `1px solid ${G.dirtLight}` : "1px solid #f0f0f0",
                fontSize:12, display:"flex", alignItems:"center", gap:6,
              }}>
                {isPog && <span style={{ fontSize:10, background:G.dirt, color:"#fff", borderRadius:4, padding:"1px 5px", flexShrink:0 }}>砂遊び</span>}
                <span translate="no">{horse.replace(/（砂遊び.*?）/, "").replace(/（.*?）/, "")}</span>
                {horse.includes("（") && !horse.includes("砂遊び") && (
                  <span style={{ fontSize:10, color:"#999" }}>{horse.match(/（(.+?)）/)?.[1]}</span>
                )}
              </div>
            );
          })}
        </div>
        {/* 供用牧場 */}
        <div style={{ background:"#fff", borderRadius:10, padding:"12px 14px", marginBottom:20 }}>
          <div style={{ fontSize:11, color:"#999" }}>供用牧場</div>
          <div style={{ fontSize:13, fontWeight:700, marginTop:2 }} translate="no">{selected.stud}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:"10px 12px" }}>
      {/* セクションタブ */}
      <div style={{ display:"flex", gap:4, marginBottom:14, flexWrap:"wrap" }}>
        {sectionTabs.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)} style={{
            flex:"1 1 calc(50% - 4px)", minWidth:0, padding:"7px 4px", borderRadius:8, border:"none", cursor:"pointer",
            background: activeSection===s.key ? G.dirtDark : "#fff",
            color: activeSection===s.key ? "#fff" : "#666",
            fontSize:10, fontWeight:700,
            boxShadow: activeSection===s.key ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
          }}>{s.label}</button>
        ))}
      </div>

      {/* 注目種牡馬コラム */}
      {activeSection === "column" && (
        <div>
          <div style={{ fontSize:11, color:"#999", marginBottom:10 }}>砂遊び指名馬の父・世界の注目ダート種牡馬を解説</div>
          {columns.map(s => (
            <div key={s.id} onClick={() => setSelectedId(s.id)} style={{
              background:"#fff", borderRadius:12, marginBottom:10,
              boxShadow:"0 1px 4px rgba(0,0,0,0.08)", overflow:"hidden", cursor:"pointer",
            }}>
              <div style={{ background:G.dirtDark, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ color:"#fff", fontWeight:900, fontSize:15 }} translate="no">{s.name}</div>
                  <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11, marginTop:1 }}>{s.nameJa}　{s.country}　{s.born}年生</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                  {s.pog && <span style={{ fontSize:9, background:G.dirt, color:"#fff", borderRadius:4, padding:"2px 6px" }}>砂遊び指名あり</span>}
                  <span style={{ color:"rgba(255,255,255,0.6)", fontSize:16 }}>›</span>
                </div>
              </div>
              <div style={{ padding:"10px 14px" }}>
                <div style={{ fontSize:11, color:"#555", lineHeight:1.7, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                  {s.summary}
                </div>
                <div style={{ marginTop:8, display:"flex", gap:4, flexWrap:"wrap" }}>
                  {(s.tags||[]).map(t => (
                    <span key={t} style={{ fontSize:9, background:"#f0f0f0", borderRadius:10, padding:"2px 7px", color:"#666" }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {columns.length === 0 && (
            <div style={{ textAlign:"center", color:"#bbb", padding:40, fontSize:13 }}>データ読み込み中...</div>
          )}
        </div>
      )}

      {/* 指名馬の父ランキング */}
      {activeSection === "sire_rank" && (
        <div>
          <div style={{ fontSize:11, color:"#999", marginBottom:10 }}>2026-27シーズン・指名馬の父馬別頭数</div>
          {sireRanking.map(({ sire, count }, i) => (
            <div key={sire} style={{
              background:"#fff", borderRadius:10, padding:"10px 14px", marginBottom:8,
              boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                <div style={{
                  width:24, height:24, borderRadius:6,
                  background: i===0?G.dirtDark : i===1?"#888" : i===2?"#a07040" : "#ddd",
                  color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:800, flexShrink:0,
                }}>{i+1}</div>
                <div style={{ flex:1, fontWeight:800, fontSize:13 }} translate="no">{sire}</div>
                <div style={{ fontWeight:900, fontSize:16, color:G.dirtDark }}>{count}<span style={{ fontSize:11, color:"#999", fontWeight:400 }}>頭</span></div>
              </div>
              <div style={{ height:6, background:"#f0f0f0", borderRadius:3, overflow:"hidden" }}>
                <div style={{ width:`${(count/maxCount)*100}%`, height:"100%", background:G.dirt, borderRadius:3 }} />
              </div>
            </div>
          ))}
          {sireRanking.length === 0 && (
            <div style={{ textAlign:"center", color:"#bbb", padding:40, fontSize:13 }}>データなし</div>
          )}
        </div>
      )}

      {/* ダートリーディング */}
      {activeSection === "leading" && (
        <div>
          {/* 年度切替 */}
          <div style={{ display:"flex", gap:6, marginBottom:12 }}>
            {leadingYears.map(y => (
              <button key={y} onClick={() => setLeadingYear(y)} style={{
                padding:"5px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:700,
                background: currentLeadingYear===y ? G.dirtDark : "#fff",
                color: currentLeadingYear===y ? "#fff" : "#666",
                boxShadow: currentLeadingYear===y ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
              }}>{y}年</button>
            ))}
          </div>
          {leadingRows.length === 0 ? (
            <div style={{ textAlign:"center", color:"#bbb", padding:40, fontSize:13 }}>データ読み込み中...</div>
          ) : (
            <div style={{ background:"#fff", borderRadius:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
              {/* テーブルヘッダー */}
              <div style={{ background:G.dirtDark, display:"grid", gridTemplateColumns:"32px 1fr 44px 44px 44px 44px", padding:"8px 10px", gap:4 }}>
                {["順位","種牡馬","勝率","連対","複勝","単回"].map(h => (
                  <div key={h} style={{ color:"rgba(255,255,255,0.85)", fontSize:10, fontWeight:700, textAlign: h==="種牡馬"?"left":"center" }}>{h}</div>
                ))}
              </div>
              {leadingRows.slice(0, 50).map((row, i) => {
                const isPogSire = PLAYERS_2627.some(p => p.horses.some(h => h.sire === row.name));
                return (
                  <div key={i} style={{
                    display:"grid", gridTemplateColumns:"32px 1fr 44px 44px 44px 44px",
                    padding:"8px 10px", gap:4,
                    borderBottom:"1px solid #f0f0f0",
                    background: isPogSire ? "#fff8f0" : i%2===0?"#fff":"#fafafa",
                  }}>
                    <div style={{ fontSize:11, fontWeight:800, color: i<3?G.dirtDark:"#aaa", textAlign:"center", alignSelf:"center" }}>{row.rank}</div>
                    <div style={{ fontSize:12, fontWeight: isPogSire?800:600, color:"#222", alignSelf:"center", display:"flex", alignItems:"center", gap:4 }}>
                      <span translate="no">{row.name}</span>
                      {isPogSire && <span style={{ fontSize:8, background:G.dirt, color:"#fff", borderRadius:3, padding:"1px 4px", flexShrink:0 }}>砂遊び</span>}
                    </div>
                    <div style={{ fontSize:11, textAlign:"center", color:"#333", alignSelf:"center" }}>{row.winRate}%</div>
                    <div style={{ fontSize:11, textAlign:"center", color:"#555", alignSelf:"center" }}>{row.top2Rate}%</div>
                    <div style={{ fontSize:11, textAlign:"center", color:"#555", alignSelf:"center" }}>{row.top3Rate}%</div>
                    <div style={{ fontSize:11, textAlign:"center", color: Number(row.singleRet)>=100?"#d33":"#555", fontWeight: Number(row.singleRet)>=100?700:400, alignSelf:"center" }}>{row.singleRet}</div>
                  </div>
                );
              })}
              <div style={{ padding:"8px 10px", fontSize:10, color:"#bbb", textAlign:"center" }}>
                上位50頭表示 / 全{leadingRows.length}頭　更新：毎週月曜
              </div>
            </div>
          )}
        </div>
      )}

      {/* 種牡馬別POGポイント */}
      {activeSection === "pog_pt" && (
        <div>
          <div style={{ fontSize:11, color:"#999", marginBottom:10 }}>2026-27シーズン・父馬別獲得POGポイント（ダートのみ）</div>
          {sirePtRanking.length === 0 && (
            <div style={{ background:"#fff", borderRadius:10, padding:30, textAlign:"center", color:"#bbb", fontSize:13 }}>
              まだポイント獲得馬なし
            </div>
          )}
          {sirePtRanking.map(({ sire, pt }, i) => (
            <div key={sire} style={{
              background:"#fff", borderRadius:10, padding:"10px 14px", marginBottom:8,
              boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                <div style={{
                  width:24, height:24, borderRadius:6,
                  background: i===0?G.dirtDark : i===1?"#888" : i===2?"#a07040" : "#ddd",
                  color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:800, flexShrink:0,
                }}>{i+1}</div>
                <div style={{ flex:1, fontWeight:800, fontSize:13 }} translate="no">{sire}</div>
                <div style={{ fontWeight:900, fontSize:16, color:G.dirtDark }}>{fmt(pt)}<span style={{ fontSize:11, color:"#999", fontWeight:400 }}>万円</span></div>
              </div>
              <div style={{ height:6, background:"#f0f0f0", borderRadius:3, overflow:"hidden" }}>
                <div style={{ width:`${(pt/maxPt)*100}%`, height:"100%", background:G.dirt, borderRadius:3 }} />
              </div>
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
// タブ: ミニゲーム
// ================================================================

function GameScreen() {
  return (
    <div style={{ padding:12 }}>
      <BettingGame />
    </div>
  );
}

// ── 砂遊び馬券ゲーム ───────────────────────────────────────
// 過去〜現在の砂遊び指名馬を集めて、獲得ポイント（賞金）を強さにレースさせる

// 全シーズンの馬プールを構築（pt>0の馬のみ）
function buildHorsePool() {
  const pool = [];
  // 現役（2025-26）
  for (const pid of Object.keys(HORSES_BY_PLAYER)) {
    for (const h of HORSES_BY_PLAYER[pid]) {
      if (h.pt > 0) pool.push({ name: h.name, pt: h.pt, stable: playerName(pid), season: "2025-26" });
    }
  }
  // 過去シーズン
  for (const season of Object.keys(PAST_HORSES)) {
    for (const pid of Object.keys(PAST_HORSES[season])) {
      for (const h of PAST_HORSES[season][pid]) {
        if (h.pt > 0) pool.push({ name: h.name, pt: h.pt, stable: playerName(pid), season });
      }
    }
  }
  return pool;
}

const HORSE_POOL = buildHorsePool();

function makeRace() {
  // プールからランダムに5頭を抽出（重複馬名は除外・なるべく別厩舎）
  const shuffled = [...HORSE_POOL].sort(() => Math.random() - 0.5);
  const picked = [];
  const usedNames = new Set();
  const usedStables = new Set();
  // 1周目：厩舎が重ならないように選ぶ
  for (const h of shuffled) {
    if (usedNames.has(h.name) || usedStables.has(h.stable)) continue;
    usedNames.add(h.name); usedStables.add(h.stable);
    picked.push(h);
    if (picked.length >= 5) break;
  }
  // 2周目：頭数が足りなければ厩舎重複を許して補充
  if (picked.length < 5) {
    for (const h of shuffled) {
      if (usedNames.has(h.name)) continue;
      usedNames.add(h.name);
      picked.push(h);
      if (picked.length >= 5) break;
    }
  }

  // 強さ＝獲得pt（賞金）ベース。差を強調するため累乗で広げる
  const horses = picked.map((h, i) => ({
    no: i + 1,
    name: h.name,
    stable: h.stable,
    season: h.season,
    pt: h.pt,
    strength: Math.pow(h.pt + 1, 1.5), // ptが大きいほど一気に強く
  }));

  // 勝つ確率 ∝ 強さ。確率からオッズを算出（控除率0.8込み）
  const totalStr = horses.reduce((a, h) => a + h.strength, 0);
  for (const h of horses) {
    h.winProb = h.strength / totalStr;
    h.odds = Math.max(1.1, Math.round((1 / h.winProb) * 0.8 * 10) / 10);
  }
  return horses;
}

// winProbに従って勝ち馬を事前抽選（＝オッズどおりの確率で当たる）
function drawWinner(race) {
  const r = Math.random();
  let acc = 0;
  for (const h of race) {
    acc += h.winProb;
    if (r <= acc) return h.no;
  }
  return race[race.length - 1].no;
}

function BettingGame() {
  const FINISH = 480;
  const [coins, setCoins] = useState(() => Number(localStorage.getItem("pog_bet_coins") || 1000));
  const [race, setRace] = useState(() => makeRace());
  const [pick, setPick] = useState(null);
  const [bet, setBet] = useState(100);
  const [phase, setPhase] = useState("bet"); // bet / racing / result
  const [pos, setPos] = useState([]); // 各馬の進行位置
  const [result, setResult] = useState(null); // {winner, payout, upset}
  const [call, setCall] = useState(""); // 実況テロップ
  const [fx, setFx] = useState([]); // 各馬のアクシデント状態 {label, fallen}
  const rafRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("pog_bet_coins", String(coins));
  }, [coins]);

  const startRace = () => {
    if (pick == null || bet > coins || bet <= 0) return;
    setCoins(c => c - bet);
    setPhase("racing");
    setResult(null);
    setCall("🏁 ゲートが開いた！");

    // 勝ち馬を事前抽選（オッズどおりの確率）
    const winnerNo = drawWinner(race);
    const winner = race.find(h => h.no === winnerNo);
    const upset = winner.odds >= 10; // 二桁オッズなら穴馬

    const positions = race.map(() => 0);
    setPos(positions);

    // ── アクシデント抽選 ──────────────────────────
    // acc[i] = { delay, fallAt, stumbleAt, surge, fallen, stumbled, surged, label }
    const acc = race.map(() => ({ delay:0, fallAt:0, stumbleAt:0, surge:false,
                                  fallen:false, stumbled:false, stumbleUntil:0, label:"" }));
    race.forEach((h, i) => {
      if (h.no === winnerNo) {
        // 勝ち馬は軽い出遅れ程度（回復して差してくる演出）
        if (Math.random() < 0.3) acc[i].delay = 12 + Math.random() * 14;
        return;
      }
      const roll = Math.random();
      if (roll < 0.07)      acc[i].fallAt    = FINISH * (0.2 + Math.random() * 0.45); // 落馬 7%
      else if (roll < 0.22) acc[i].delay     = 22 + Math.random() * 34;              // 出遅れ
      else if (roll < 0.40) acc[i].stumbleAt = FINISH * (0.3 + Math.random() * 0.4); // 躓き
      else if (roll < 0.50) acc[i].surge     = true;                                 // 一気に好スタート
    });
    setFx(acc.map(() => ({ label:"", fallen:false })));

    let frame = 0;
    let calledMid = false, calledLast = false;
    const announce = (msg) => setCall(msg);

    const run = () => {
      frame++;
      let fxChanged = false;
      for (let i = 0; i < race.length; i++) {
        const h = race[i];
        const a = acc[i];

        if (a.fallen) continue; // 落馬した馬は止まる

        // 出遅れ：ゲートで足踏み
        if (frame < a.delay) {
          if (frame === 1) { a.label = "出遅れ…"; fxChanged = true;
            if (h.no !== winnerNo) announce(`⚠️ ${h.no}番 ${h.name} 出遅れた！`); }
          continue;
        }
        if (a.label === "出遅れ…" && frame >= a.delay) { a.label = ""; fxChanged = true; }

        // 基本ペース（ばらつきあり）。勝率で少しだけ差をつける
        let step = 0.8 + Math.random() * 1.8 + h.winProb * 1.2;
        if (a.surge && positions[i] < FINISH * 0.4) step *= 1.7; // 好スタートでハナを切る
        if (a.stumbleUntil > frame) step *= 0.2;                 // 躓き中は失速

        if (h.no === winnerNo) {
          const progress = positions[i] / FINISH;
          if (upset && progress < 0.55) step *= 0.7;
          else if (progress > 0.7) step *= upset ? 2.2 : 1.5;
        }
        positions[i] += step;

        // 落馬発生
        if (a.fallAt && positions[i] >= a.fallAt && !a.fallen) {
          a.fallen = true; a.label = "落馬！"; fxChanged = true;
          announce(`💥 ${h.no}番 ${h.name} 落馬ーっ！！`);
        }
        // 躓き発生
        if (a.stumbleAt && positions[i] >= a.stumbleAt && !a.stumbled) {
          a.stumbled = true; a.stumbleUntil = frame + 16; a.label = "躓いた"; fxChanged = true;
          announce(`😵 ${h.no}番 ${h.name} 躓いた！`);
        }
        if (a.label === "躓いた" && a.stumbleUntil <= frame) { a.label = ""; fxChanged = true; }
      }
      if (fxChanged) setFx(acc.map(a => ({ label:a.label, fallen:a.fallen })));

      // 勝ち馬を確実に最後だけ先頭へ
      const sorted = [...positions.keys()]
        .filter(i => !acc[i].fallen)
        .sort((a, b) => positions[b] - positions[a]);
      const winnerIdx = race.findIndex(h => h.no === winnerNo);
      const leadIdx = sorted[0];
      if (positions[winnerIdx] >= FINISH * 0.85 && leadIdx !== winnerIdx) {
        positions[winnerIdx] = Math.max(positions[winnerIdx], positions[leadIdx] + 0.5);
      }

      // 実況テロップ
      const lead = race[sorted[0]];
      if (!calledMid && positions[winnerIdx] > FINISH * 0.5) {
        calledMid = true;
        announce(`先頭は ${lead.no}番 ${lead.name}！`);
      }
      if (!calledLast && positions[winnerIdx] > FINISH * 0.78) {
        calledLast = true;
        announce(upset ? `🔥 外から ${winner.no}番 ${winner.name} が強襲ーっ！！` : `🏇 ${winner.name} 先頭！残り少ない！`);
      }

      // ゴール判定（勝ち馬がゴールしたら確定）
      if (positions[winnerIdx] >= FINISH) {
        positions[winnerIdx] = FINISH;
        setPos([...positions]);
        const won = winnerNo === pick;
        const payout = won ? Math.round(bet * winner.odds) : 0;
        if (payout > 0) setCoins(c => c + payout);
        setResult({ winner, won, payout, upset });
        setCall("");
        setPhase("result");
        return;
      }
      setPos([...positions]);
      rafRef.current = requestAnimationFrame(run);
    };
    rafRef.current = requestAnimationFrame(run);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const nextRace = () => {
    setRace(makeRace());
    setPick(null);
    setPhase("bet");
    setResult(null);
    setPos([]);
    setFx([]);
  };

  const refill = () => setCoins(1000);

  return (
    <div>
      {/* コイン残高 */}
      <div style={{
        background:G.green, color:"#fff", borderRadius:12, padding:"12px 16px",
        marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ fontSize:12, opacity:0.9 }}>🪙 所持コイン</div>
        <div style={{ fontSize:24, fontWeight:900 }}>{fmt(coins)}</div>
      </div>

      {/* 出走表／レース */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e4e9e6", overflow:"hidden", marginBottom:12 }}>
        <div style={{ background:G.dirtDark, color:"#fff", padding:"8px 12px", fontSize:13, fontWeight:800 }}>
          🏟️ 砂遊びオールスター {race.length}頭立て
        </div>
        {race.map((h, i) => {
          const selected = pick === h.no;
          const isWinner = result && result.winner.no === h.no;
          return (
            <div key={h.no}
              onClick={() => phase === "bet" && setPick(h.no)}
              style={{
                padding:"8px 12px", borderBottom:"1px solid #f0f0f0",
                cursor: phase === "bet" ? "pointer" : "default",
                background: isWinner ? "#fff7e0" : selected ? "#eafaf4" : "#fff",
              }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{
                  width:22, height:22, borderRadius:4, flexShrink:0,
                  background: selected ? G.green : "#e8e8e8",
                  color: selected ? "#fff" : "#888",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:800,
                }}>{h.no}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700 }}>{h.name} {isWinner && "👑"}</div>
                  <div style={{ fontSize:10, color:"#999" }}>{h.stable}・{h.season}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:12, color: h.odds>=10 ? G.gi : G.dirt, fontWeight:800 }}>{h.odds.toFixed(1)}倍</div>
                  {h.odds>=10 && <div style={{ fontSize:9, color:G.gi, fontWeight:700 }}>穴</div>}
                </div>
              </div>
              {/* レーン */}
              {phase !== "bet" && (() => {
                const st = fx[i] || { label:"", fallen:false };
                return (
                  <div style={{ position:"relative", height:18, marginTop:4, background: st.fallen ? "#f3e1e1" : "#f5efe4", borderRadius:9, overflow:"hidden" }}>
                    <div style={{ position:"absolute", right:0, top:0, bottom:0, width:3, background:G.gi }} />
                    <div style={{
                      position:"absolute", top:0, fontSize:15, lineHeight:"18px",
                      left:`${Math.min(100, ((pos[i] || 0) / FINISH) * 100)}%`,
                      transform: st.fallen ? "translateX(-50%) scaleX(-1) rotate(70deg)" : "translateX(-50%) scaleX(-1)",
                      filter: st.fallen ? "grayscale(1)" : "none",
                    }}>{st.fallen ? "💥" : "🏇"}</div>
                    {st.label && (
                      <div style={{
                        position:"absolute", right:6, top:0, lineHeight:"18px",
                        fontSize:9, fontWeight:800, color:G.gi,
                      }}>{st.label}</div>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* 操作エリア */}
      {phase === "bet" && (
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e4e9e6", padding:"12px 14px" }}>
          <div style={{ fontSize:12, color:"#666", marginBottom:8 }}>
            {pick ? `${race.find(h=>h.no===pick).name} に賭ける` : "👆 馬を選んでください"}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ fontSize:12, color:"#888" }}>賭け金</span>
            <div style={{ fontSize:20, fontWeight:900, flex:1 }}>{fmt(bet)} <span style={{ fontSize:11, fontWeight:600 }}>コイン</span></div>
          </div>
          <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
            {[100, 500, 1000].map(v => (
              <button key={v} onClick={() => setBet(Math.min(coins, v))} style={{
                flex:1, padding:"6px 0", borderRadius:8, border:"1px solid #ddd",
                background:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", minWidth:60,
              }}>{v}</button>
            ))}
            <button onClick={() => setBet(coins)} style={{
              flex:1, padding:"6px 0", borderRadius:8, border:`1px solid ${G.dirt}`,
              background:"#fff", color:G.dirt, fontSize:12, fontWeight:700, cursor:"pointer", minWidth:60,
            }}>全額</button>
          </div>
          <button
            onClick={startRace}
            disabled={pick == null || bet <= 0 || bet > coins}
            style={{
              width:"100%", padding:"12px 0", borderRadius:10, border:"none",
              background: (pick != null && bet > 0 && bet <= coins) ? G.green : "#ccc",
              color:"#fff", fontSize:15, fontWeight:800,
              cursor: (pick != null && bet > 0 && bet <= coins) ? "pointer" : "default",
            }}>
            🎫 馬券を買ってスタート
          </button>
          {coins <= 0 && (
            <button onClick={refill} style={{
              width:"100%", marginTop:8, padding:"10px 0", borderRadius:10,
              border:`1px solid ${G.dirt}`, background:"#fff", color:G.dirt,
              fontSize:13, fontWeight:700, cursor:"pointer",
            }}>コインを1000まで補充する</button>
          )}
        </div>
      )}

      {phase === "racing" && (
        <div style={{
          textAlign:"center", fontSize:14, fontWeight:800, color:"#fff",
          padding:"10px 12px", borderRadius:10, background:G.dirtDark,
        }}>
          {call || "🏁 レース中..."}
        </div>
      )}

      {phase === "result" && result && (
        <div style={{
          background: result.upset ? "#2a1810" : result.won ? "#fff7e0" : "#fff", borderRadius:12,
          border:`1px solid ${result.upset ? G.gold : result.won ? G.gold : "#e4e9e6"}`,
          padding:"16px 14px", textAlign:"center",
        }}>
          {result.upset && (
            <div style={{ fontSize:20, fontWeight:900, color:G.gold, marginBottom:6, letterSpacing:1 }}>
              ⚡ 大 波 乱 ！！ ⚡
            </div>
          )}
          <div style={{ fontSize:18, fontWeight:900, color: result.upset ? "#fff" : result.won ? G.gold : "#666" }}>
            {result.won
              ? `🎉 的中！ +${fmt(result.payout)}コイン`
              : (result.upset ? "🌪️ 穴馬が突っ込んだ…！" : "😢 ハズレ…")}
          </div>
          <div style={{ fontSize:13, color: result.upset ? "#f0e6d3" : "#888", marginTop:6, fontWeight:700 }}>
            🥇 {result.winner.no}番 {result.winner.name}（{result.winner.odds.toFixed(1)}倍）
          </div>
          <div style={{ fontSize:11, color: result.upset ? "#c9a227" : "#aaa", marginTop:2 }}>
            {result.winner.stable}・{result.winner.season}
          </div>
          <button onClick={nextRace} style={{
            width:"100%", marginTop:12, padding:"12px 0", borderRadius:10, border:"none",
            background:G.green, color:"#fff", fontSize:15, fontWeight:800, cursor:"pointer",
          }}>次のレースへ ▶</button>
          {coins <= 0 && (
            <button onClick={refill} style={{
              width:"100%", marginTop:8, padding:"10px 0", borderRadius:10,
              border:`1px solid ${G.dirt}`, background:"#fff", color:G.dirt,
              fontSize:13, fontWeight:700, cursor:"pointer",
            }}>コインを1000まで補充する</button>
          )}
        </div>
      )}
    </div>
  );
}

// ================================================================
// App本体
// ================================================================

export default function App() {
  const [tab, setTab]               = useState(() => sessionStorage.getItem("pog_tab") || "ranking");
  const [selectedPlayerId, setSPId] = useState(null);
  const [selectedHorse, setSHorse]  = useState(null);
  const [selectedHallP, setSHallP]  = useState(null);
  const [results,  setResults]  = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const [kettonums, setKettonums] = useState({});
  const [news, setNews] = useState([]);
  const [updated, setUpdated] = useState("");
  const [statusData, setStatusData] = useState(null);
  const [regist2627, setRegist2627] = useState({});
  const [stallions, setStallions] = useState({ columns: [] });
  const [stallionLeading, setStallionLeading] = useState({ years: {} });
  const [ptr, setPtr] = useState({ active:false, y:0, pulling:false }); // pull-to-refresh

  const loadAll = (bust = false) => {
    const q = bust ? `?t=${Date.now()}` : "";
    const base = import.meta.env.BASE_URL;
    fetch(`${base}data/results.json${q}`).then(r => r.json()).then(d => { setResults(d); setResultsLoaded(true); }).catch(() => setResultsLoaded(true));
    fetch(`${base}data/upcoming.json${q}`).then(r => r.json()).then(setUpcoming).catch(() => {});
    fetch(`${base}data/kettonums.json${q}`).then(r => r.json()).then(setKettonums).catch(() => {});
    fetch(`${base}data/news.json${q}`).then(r => r.json()).then(setNews).catch(() => {});
    fetch(`${base}data/updated.json${q}`).then(r => r.json()).then(d => setUpdated(d.updated || "")).catch(() => {});
    fetch(`${base}data/pogstarion.json${q}`).then(r => r.json()).then(setStatusData).catch(() => {});
    fetch(`${base}data/regist2627.json${q}`).then(r => r.json()).then(setRegist2627).catch(() => {});
    fetch(`${base}data/stallions.json${q}`).then(r => r.json()).then(setStallions).catch(() => {});
    fetch(`${base}data/stallion_leading.json${q}`).then(r => r.json()).then(setStallionLeading).catch(() => {});
  };

  useEffect(() => { loadAll(); }, []);

  const THRESHOLD = 65; // px 引っ張る量
  const contentRef = useRef(null);

  const onTouchStart = (e) => {
    if (contentRef.current?.scrollTop === 0) {
      setPtr(p => ({ ...p, active:true, y: e.touches[0].clientY }));
    }
  };
  const onTouchMove = (e) => {
    if (!ptr.active) return;
    const dy = e.touches[0].clientY - ptr.y;
    if (dy > 0) setPtr(p => ({ ...p, pulling: dy > THRESHOLD }));
  };
  const onTouchEnd = () => {
    if (ptr.pulling) {
      loadAll(true);
    }
    setPtr({ active:false, y:0, pulling:false });
  };

  const switchTab = (t) => {
    sessionStorage.setItem("pog_tab", t);
    setTab(t); setSPId(null); setSHorse(null); setSHallP(null);
  };

  // タイトルとバック
  let title = "POG砂遊び 2026-27";
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
                  onSelectHorse={h => { setSHorse(h); }} kettonums={kettonums} regist2627={regist2627} />;
    } else {
      content = <RankingScreen onSelectPlayer={u => setSPId(u.id)} updated={updated} results={results} />;
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
  } else if (tab === "status") {
    title = "出走予定・登録";
    content = <StatusScreen data={statusData} kettonums={kettonums} />;
  } else if (tab === "stallion") {
    title = "ダート種牡馬研究";
    content = <StallionScreen stallions={stallions} results={results} stallionLeading={stallionLeading} />;
  } else if (tab === "game") {
    title = "砂遊びゲーム";
    content = <GameScreen />;
  } else {
    title = "砂遊びルール";
    content = <RulesScreen />;
  }

  const headerBg = darkHeader ? G.dirtDark : G.green;

  const navItems = [
    { key:"ranking",  label:"順位",   icon:"🏆" },
    { key:"results",  label:"結果",   icon:"📋" },
    { key:"news",     label:"ニュース",icon:"📰" },
    { key:"status",   label:"出走",   icon:"🏁" },
    { key:"calendar", label:"日程",   icon:"📅" },
    { key:"stallion", label:"種牡馬", icon:"🐎" },
    { key:"hall",     label:"殿堂",   icon:"🏟️" },
    { key:"game",     label:"ゲーム", icon:"🎮" },
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

      {/* テロップ */}
      <div style={{
        background: "linear-gradient(90deg,#7a4a1e,#b06a2c,#7a4a1e)",
        color:"#fff", overflow:"hidden", whiteSpace:"nowrap",
        position:"sticky", top:62, zIndex:9,
        borderTop:"1px solid rgba(255,255,255,0.2)",
        borderBottom:"1px solid rgba(0,0,0,0.25)",
        height:34,
      }}>
        <style>{`
          @keyframes pogTelopScroll {
            0%   { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
        <div style={{
          display:"inline-block", lineHeight:"34px", fontSize:13, fontWeight:800,
          paddingLeft:"100%",
          animation:"pogTelopScroll 28s linear infinite",
          willChange:"transform",
        }}>
          🏆 フィンガーが東京ダービー制覇（2冠達成）で長谷部厩舎が優勝！！おめでとうございます🎉　　　　　🆕 砂遊び２０２６－２７シーズンも開幕でアプリがリニューアルしました🐴✨
        </div>
      </div>

      {/* コンテンツ */}
      <div
        ref={contentRef}
        style={{ flex:1, overflowY:"auto" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* pull-to-refresh インジケーター */}
        {ptr.pulling && (
          <div style={{
            textAlign:"center", padding:"10px 0", fontSize:13, fontWeight:700,
            color:G.green, background:"#e8f7ed",
          }}>
            🔄 はなして更新
          </div>
        )}
        {content}
      </div>

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
