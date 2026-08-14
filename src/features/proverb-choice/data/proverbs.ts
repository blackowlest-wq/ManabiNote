export const PROVERBS = [
  {
    id: 'ishi-no-ue-ni-mo-sannen',
    proverb: '石の上にも三年',
    explanation: 'じっと がまんして つづければ、いつか じょうずに なるという いみ。',
  },
  {
    id: 'inu-mo-arukeba-boo-ni-ataru',
    proverb: '犬も歩けば棒に当たる',
    explanation: '何かを しようと うごいていると、思いがけない できごとに あうことが あるという いみ。',
  },
  {
    id: 'saru-mo-ki-kara-ochiru',
    proverb: '猿も木から落ちる',
    explanation: 'とても じょうずな人でも、しっぱいすることが あるという いみ。',
  },
  {
    id: 'nana-korobi-ya-oki',
    proverb: '七転び八起き',
    explanation: '何回 しっぱいしても、あきらめずに 立ち上がることが たいせつという いみ。',
  },
  {
    id: 'hana-yori-dango',
    proverb: '花より団子',
    explanation: '見た目の よいものより、じっさいに 役に立つものが だいじという いみ。',
  },
  {
    id: 'hayaoki-wa-sanmon-no-toku',
    proverb: '早起きは三文の徳',
    explanation: '早起きを すると、よいことが あるという いみ。',
  },
  {
    id: 'isogaba-maware',
    proverb: '急がば回れ',
    explanation: '急いでいるときほど、あんぜんな みちを えらぶほうが よいという いみ。',
  },
  {
    id: 'chiri-mo-tsumoreba-yama-to-naru',
    proverb: 'ちりも積もれば山となる',
    explanation: '小さなことでも、つづけていれば 大きな ちからに なるという いみ。',
  },
  {
    id: 'narau-yori-nareyo',
    proverb: '習うより慣れよ',
    explanation: '教わるだけでなく、じっさいに やってみて なれることが たいせつという いみ。',
  },
  {
    id: 'shippai-wa-seikou-no-moto',
    proverb: '失敗は成功のもと',
    explanation: 'しっぱいから 学ぶと、つぎの せいこうに つながるという いみ。',
  },
  {
    id: 'warau-kado-ni-wa-fuku-kitaru',
    proverb: '笑う門には福来る',
    explanation: 'いつも 明るく わらっていると、しあわせが やってくるという いみ。',
  },
  {
    id: 'ame-futte-chi-katamaru',
    proverb: '雨降って地固まる',
    explanation: 'もめごとの あとで、かえって なかが よくなることが あるという いみ。',
  },
  {
    id: 'rui-wa-tomo-wo-yobu',
    proverb: '類は友を呼ぶ',
    explanation: 'にた かんがえや すきなものを もつ人は、しぜんに あつまるという いみ。',
  },
  {
    id: 'nido-aru-koto-wa-sando-aru',
    proverb: '二度あることは三度ある',
    explanation: '同じような ことは、くりかえして おこることが あるという いみ。',
  },
  {
    id: 'neko-ni-koban',
    proverb: '猫に小判',
    explanation: 'ねうちが わからない人に たいせつなものを あげても、いみが ないという いみ。',
  },
  {
    id: 'dai-wa-shou-wo-kaneru',
    proverb: '大は小を兼ねる',
    explanation: '大きなものは、小さなものの かわりにも つかえるという いみ。',
  },
  {
    id: 'en-no-shita-no-chikara-mochi',
    proverb: '縁の下の力持ち',
    explanation: '目立たない ところで、みんなを たすけている人の こと。',
  },
  {
    id: 'kuchi-wa-wazawai-no-moto',
    proverb: '口は災いの元',
    explanation: 'かるい きもちで いった ことばが、もんだいを おこすことが あるという いみ。',
  },
  {
    id: 'ryouyaku-wa-kuchi-ni-nigashi',
    proverb: '良薬は口に苦し',
    explanation: 'ためになる ちゅういは、きくのが つらくても だいじという いみ。',
  },
  {
    id: 'nito-wo-ou-mono-wa-itto-wo-mo-ezu',
    proverb: '二兎を追う者は一兎をも得ず',
    explanation: '二つを いっぺんに ほしがると、どちらも てに はいらないという いみ。',
  },
] as const

export type ProverbId = typeof PROVERBS[number]['id']
