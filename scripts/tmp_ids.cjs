const sqlite3=require('sqlite3').verbose();
const db=new sqlite3.Database('server/database.sqlite');
const all=(q,p=[])=>new Promise((res,rej)=>db.all(q,p,(e,r)=>e?rej(e):res(r||[])));
(async()=>{
 const rows=await all("SELECT id,bhk,type FROM packages ORDER BY id");
 const byBhk={};
 for(const r of rows){byBhk[r.bhk]=byBhk[r.bhk]||[];byBhk[r.bhk].push(r.id)}
 console.log(JSON.stringify({count:rows.length,bhk1:byBhk[1]?.slice(0,8),bhk2:byBhk[2]?.slice(0,8),bhk3:byBhk[3]?.slice(0,12),bhk4:byBhk[4]?.slice(0,12)},null,2));
})();
