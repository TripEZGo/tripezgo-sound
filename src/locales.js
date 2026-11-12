export const origin='https://sound.tripezgo.com';
export const locales={
 'zh-TW':{name:'繁體中文',path:'/',html:'zh-Hant',title:'TripEZGo x 旅行 x 音樂',description:'免費 Spotify 播放記錄分析工具。在瀏覽器本機匯入 ZIP，查看年度與月份聆聽時數、播放次數、歌曲與歌手排行，分享專屬聆聽圖片。',og:'zh_TW'},
 en:{name:'English',path:'/en/',html:'en',title:'TripEZGo x Travel x Music — Spotify Listening Stats',description:'Analyze your Spotify streaming history privately in your browser. Explore yearly and monthly listening time, play counts, top tracks and artists, and share your listening story.',og:'en_US'},
 'zh-CN':{name:'简体中文',path:'/zh-cn/',html:'zh-Hans',title:'TripEZGo x 旅行 x 音乐',description:'免费 Spotify 播放记录分析工具。在浏览器本地导入 ZIP，查看年度与月份收听时长、播放次数、歌曲与歌手排行，分享专属收听图片。',og:'zh_CN'},
 ja:{name:'日本語',path:'/ja/',html:'ja',title:'TripEZGo x 旅行 x 音楽 — Spotify 再生履歴分析',description:'Spotify の再生履歴をブラウザ内だけで分析。年別・月別の再生時間、再生回数、よく聴く曲やアーティストを確認し、リスニング画像を共有できます。',og:'ja_JP'},
 ko:{name:'한국어',path:'/ko/',html:'ko',title:'TripEZGo x 여행 x 음악 — Spotify 재생 기록 분석',description:'Spotify 재생 기록을 브라우저에서 안전하게 분석하세요. 연도별·월별 감상 시간, 재생 횟수, 인기 곡과 아티스트를 확인하고 감상 이미지를 공유하세요.',og:'ko_KR'}
};
export function resolveLocale(languages=[]){for(const language of languages){const code=String(language).toLowerCase();if(code==='zh-cn'||code==='zh-sg'||code.startsWith('zh-hans'))return 'zh-CN';if(code.startsWith('zh'))return 'zh-TW';if(code.startsWith('ja'))return 'ja';if(code.startsWith('ko'))return 'ko';if(code.startsWith('en'))return 'en';}return 'en';}
export function localeFromPath(path){return Object.entries(locales).find(([,value])=>value.path!=='/'&&path.toLowerCase().startsWith(value.path))?.[0]||null;}
