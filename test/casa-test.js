const {JSDOM}=require('jsdom');const fs=require('fs');const util=require('util');const crypto=require('crypto');
const html=fs.readFileSync('../sito/index.html','utf8');
const server={files:{}};
function mockFetch(url,opt){opt=opt||{};const m=(opt.method||'GET');
 const auth=opt.headers&&opt.headers.Authorization;
 const res=(status,body)=>Promise.resolve({status,ok:status>=200&&status<300,json:async()=>body});
 if(auth!=='Bearer good')return res(401,{});
 const rest=url.replace('https://api.github.com/repos/','');
 if(!rest.startsWith('me/data'))return res(404,{});
 const sub=rest.slice('me/data'.length);if(sub==='')return res(200,{});
 const f=sub.replace('/contents/','');
 if(m==='GET'){const x=server.files[f];return x?res(200,{sha:x.sha,content:x.content}):res(404,{});}
 if(m==='PUT'){const b=JSON.parse(opt.body);const x=server.files[f];
   if(x&&b.sha!==x.sha)return res(409,{});if(!x&&b.sha)return res(422,{});
   server.files[f]={sha:crypto.randomBytes(6).toString('hex'),content:b.content};return res(200,{});}
 return res(405,{});}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function device(){
 const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/',pretendToBeVisual:true,beforeParse(w){w.TextEncoder=util.TextEncoder;w.TextDecoder=util.TextDecoder;w.fetch=mockFetch;w.scrollTo=()=>{};}});
 const w=dom.window,d=w.document,errs=[];w.addEventListener('error',e=>errs.push(e.message));
 return {w,d,errs,click:s=>{const e=d.querySelector(s);if(!e)throw new Error('missing '+s);e.click();},
  type:(s,v)=>{const e=d.querySelector(s);if(!e)throw new Error('missing '+s);e.value=v;e.dispatchEvent(new w.Event('input',{bubbles:true}));},
  text:()=>d.body.textContent};
}
let fails=0;const ok=(c,m)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+m);};
(async()=>{
 const A=device(),B=device();
 ok(/Piano pasti/.test(A.text())&&/da comprare/.test(A.text()),'home con tessere');
 A.click('[data-v="shop"]');
 const items=[...A.d.querySelectorAll('.shi .nm')].map(e=>e.textContent);
 ok(items.includes('cavolo viola')&&items.filter(x=>x==='pasta').length===1,'spesa generata, pasta una sola volta: '+items.length+' voci');
 ok(/Lun cena, Mer pranzo, Sab pranzo/.test(A.d.body.textContent),'dove serve la pasta');
 // spunta
 A.click('.shi .cb');ok(A.d.querySelectorAll('.shi.done').length===1,'spunta');
 // cambio piano -> spesa
 A.click('[data-v="meal"]');A.click('[data-s="2c"]');A.type('#sl-t','frittata');A.type('#sl-i','uova, zucchine');A.click('[data-a="slotsave"]');
 A.click('[data-v="shop"]');ok([...A.d.querySelectorAll('.shi .nm')].some(e=>e.textContent==='zucchine'),'nuovo piatto aggiunge ingredienti');
 // ricorda ricetta
 A.click('[data-v="meal"]');A.click('[data-s="3p"]');A.d.getElementById('sl-t').value='frittata';A.d.getElementById('sl-i').value='';
 A.d.getElementById('sl-t').dispatchEvent(new A.w.Event('change',{bubbles:true}));ok(A.d.getElementById('sl-i').value==='uova, zucchine','ricetta ricordata');
 A.click('[data-a="slotextract"]');ok(A.d.getElementById('sl-i').value==='frittata','estrai dal nome');
 A.click('[data-a="slotclear"]');
 // ricette
 A.click('[data-v="meal"]');ok(!A.d.querySelector('.chip'),'piano senza ingredienti');
 A.click('[data-s="4p"]');A.d.getElementById('sl-t').dispatchEvent(new A.w.Event('focusin',{bubbles:true}));ok(A.d.querySelectorAll('.ddi').length===6,'dropdown ricette (max 6)');A.type('#sl-t','udon');ok(A.d.querySelectorAll('.ddi').length===1,'dropdown filtra');A.click('.ddi');ok(A.d.querySelectorAll('.ddi').length===0,'dropdown si chiude');ok(A.d.getElementById('sl-i').value==='udon, zucchine, carote, uova','pick compila');A.click('[data-a="slotsave"]');
 A.click('[data-v="recipes"]');ok(/Pasti e ricette/.test(A.text())&&/udon zucchine carote e uova/.test(A.text()),'vista ricette');
 A.click('[data-a="recipe"][data-k=""]');A.type('#rc-n','Risotto');A.type('#rc-i','riso, zucca');A.click('[data-a="recsave"]');ok(/Risotto/.test(A.text()),'nuova ricetta');
 A.click('[data-a="recipe"][data-k="risotto"]');A.type('#rc-n','Risotto zucca');A.click('[data-a="recsave"]');ok(/Risotto zucca/.test(A.text())&&!/>Risotto</.test(A.d.body.innerHTML),'rinomina ricetta');
 A.click('[data-a="recipe"][data-k="risotto zucca"]');A.click('[data-a="recdel"]');ok(!/Risotto/.test(A.text()),'elimina ricetta');
 // spesa manuale
 A.click('[data-v="shop"]');A.type('#sh-new','carta igienica');A.d.querySelector('form').dispatchEvent(new A.w.Event('submit',{bubbles:true,cancelable:true}));
 ok(/carta igienica/.test(A.text()),'articolo manuale');
 // nota nuova lista
 A.click('[data-v="home"]');A.click('[data-a="fab"]');A.click('[data-a="new-list"]');
 A.type('#n-t','Bagno');A.type('#n-new','shampoo');A.click('[data-a="additem"]');A.type('#n-new','sapone');A.click('[data-a="additem"]');
 ok(A.d.querySelectorAll('.it-in[data-id]').length===2,'2 elementi in lista');
 A.click('[data-a="itchk"]');A.click('[data-a="color"]'.replace('"color"','"palette"'));A.click('[data-a="color"][data-c="5"]');
 A.click('[data-v="home"]');ok(/Bagno/.test(A.text())&&A.d.querySelector('.card.c5'),'nota in home con colore');
 // nota vuota scartata
 A.click('[data-a="fab"]');A.click('[data-a="new-text"]');A.click('[data-v="home"]');
 ok(Object.values(A.w.__casa.state.notes).filter(n=>!n.del).length===3,'nota vuota scartata');
 // ricerca
 A.type('#q','sapone');ok(A.d.querySelectorAll('.card').length===1,'ricerca');A.type('#q','');
 // archivio
 A.click('.card.c5');A.click('[data-a="arch"]');ok(!/Bagno/.test(A.d.querySelector('.grid')?A.d.querySelector('.grid').textContent:''),'archiviata');
 // sync
 A.click('[data-v="sync"]');A.d.getElementById('sy-repo').value='me/data';A.d.getElementById('sy-token').value='good';A.click('[data-a="syncsave"]');await wait(300);
 ok(!!server.files['casa-dati.json'],'file creato su GitHub');
 B.click('[data-v="sync"]');B.d.getElementById('sy-repo').value='me/data';B.d.getElementById('sy-token').value='good';B.click('[data-a="syncsave"]');await wait(300);
 const bs=B.w.__casa.state;
 ok(Object.values(bs.notes).some(n=>n.t==='Bagno'&&n.arch),'B riceve nota archiviata');
 ok(bs.slots['2c'].t==='frittata'&&Object.values(bs.manual).some(x=>x.t==='carta igienica'),'B riceve piano e spesa manuale');
 // B modifica, A riceve
 B.click('[data-v="shop"]');B.click('.shi .cb');await wait(3400);
 A.click('[data-v="shop"]');A.w.__casa.syncNow();await wait(300);
 ok(Object.values(A.w.__casa.state.checked).filter(x=>x.v).length===Object.values(B.w.__casa.state.checked).filter(x=>x.v).length,'spunte allineate A/B');
 // modifiche concorrenti
 A.click('[data-v="meal"]');A.click('[data-s="0p"]');A.type('#sl-t','minestrone');A.click('[data-a="slotsave"]');
 B.click('[data-v="meal"]');B.click('[data-s="1p"]');B.type('#sl-t','riso');B.click('[data-a="slotsave"]');
 await wait(3600);A.w.__casa.syncNow();await wait(400);B.w.__casa.syncNow();await wait(400);A.w.__casa.syncNow();await wait(400);
 ok(A.w.__casa.state.slots['1p'].t==='riso'&&B.w.__casa.state.slots['0p'].t==='minestrone','merge modifiche concorrenti');
 // eliminazione nota si propaga
 A.click('[data-v="home"]');
 ok(A.errs.length+B.errs.length===0,'nessun errore JS '+A.errs.concat(B.errs).join(';'));
 console.log(fails?'FALLITI '+fails:'TUTTO OK');
 process.exit(0);
})();
