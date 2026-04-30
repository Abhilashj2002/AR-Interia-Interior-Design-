const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/database.sqlite');
const all=(q,p=[])=>new Promise((res,rej)=>db.all(q,p,(e,r)=>e?rej(e):res(r||[])));
(async()=>{
  const tables = await all("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name");
  const refs=[];
  for(const t of tables){
    const cols = await all(`PRAGMA table_info(${t.name})`);
    const likely = cols.filter(c=>/package/i.test(c.name));
    if(likely.length) refs.push({table:t.name, cols: likely.map(c=>c.name)});
  }
  console.log(JSON.stringify({tables:tables.map(t=>t.name), packageLikeColumns:refs},null,2));
})();
