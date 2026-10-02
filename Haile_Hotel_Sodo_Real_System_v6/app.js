const KEY="haileMenuV1";
const configured = !!(window.HAILE_SUPABASE_URL && !window.HAILE_SUPABASE_URL.includes("PASTE_YOUR_") && window.HAILE_SUPABASE_ANON_KEY && !window.HAILE_SUPABASE_ANON_KEY.includes("PASTE_YOUR_"));
const db = configured ? window.supabase.createClient(window.HAILE_SUPABASE_URL, window.HAILE_SUPABASE_ANON_KEY) : null;
let data=[]; let active="All";
const $=id=>document.getElementById(id);

function localFallback(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
function categories(){return ["All",...new Set(data.map(x=>x.category).filter(Boolean))]}
function setCategory(c){active=c;render()}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function photoStyle(x){const u=x.image||"";return /^https?:\/\//i.test(u)?`background-image:url('${u.replace(/'/g,"%27")}');background-size:cover;background-position:center`:""}
function showStatus(msg){const s=$("status");if(s){s.textContent=msg;s.hidden=!msg}}

async function loadData(){
  if(!db){data=localFallback();render();return;}
  const {data:rows,error}=await db.from("menu_items").select("*").order("created_at",{ascending:false});
  if(error){console.error(error);data=localFallback();showStatus("Database connection error. Showing saved demo data.")}
  else data=rows||[];
  render();
}

function render(){
  const q=(($("search")?.value)||"").toLowerCase().trim();
  if($("cats")) $("cats").innerHTML=categories().map(c=>`<button class="${c===active?"on":""}" onclick="setCategory(${JSON.stringify(c)})">${esc(c)}</button>`).join("");
  const list=data.filter(x=>(active==="All"||x.category===active)&&(`${x.name} ${x.category} ${x.description||""}`).toLowerCase().includes(q));
  if($("grid")) $("grid").innerHTML=list.map(x=>`
    <article class="food" onclick="openFood(${x.id})">
      <div class="photo ${esc(x.image||"chicken")}" style="${photoStyle(x)}"></div>
      <div><small>${esc(x.category||"")}</small><h3>${esc(x.name)}</h3><b>${Number(x.price||0).toLocaleString()} ETB</b><p>${esc(x.description||"")}</p><footer>${esc(x.nutrition?.protein||"—")} Protein · ${esc(x.nutrition?.carbs||"—")} Carbs</footer></div>
    </article>`).join("")||"<p>No food found.</p>";
}

function openFood(id){
  const x=data.find(y=>String(y.id)===String(id)); if(!x)return;
  if($("mimg")){ $("mimg").className="photo "+(x.image||"chicken"); $("mimg").style=photoStyle(x); }
  $("mcat").textContent=x.category||""; $("mn").textContent=x.name||""; $("mp").textContent=Number(x.price||0).toLocaleString()+" ETB"; $("md").textContent=x.description||"";
  $("mi").innerHTML=(x.ingredients||[]).map(i=>`<span>${esc(i)}</span>`).join("");
  const n=x.nutrition||{};
  $("mt").innerHTML=`<span><b>${esc(n.calories||"—")}</b><small>Calories</small></span><span><b>${esc(n.protein||"—")}</b><small>Protein</small></span><span><b>${esc(n.carbs||"—")}</b><small>Carbohydrates</small></span><span><b>${esc(n.fat||"—")}</b><small>Fat</small></span><span><b>${esc(n.fiber||"—")}</b><small>Fiber</small></span>`;
  let vb=$("vitaminsBlock"); if(!vb){vb=document.createElement("div");vb.id="vitaminsBlock";vb.innerHTML='<h3>Vitamins & Minerals</h3><div id="mv"></div>';$('modal')?.querySelector('section')?.appendChild(vb)}
  $("mv").innerHTML=`<span>${esc(n.vitamins||"Nutrition data to be verified by Haile Hotel.")}</span>`;
  $("modal")?.classList.add("show");
}
$("close")?.addEventListener("click",()=>$("modal").classList.remove("show"));
$("modal")?.addEventListener("click",e=>{if(e.target.id==="modal")$("modal").classList.remove("show")});
$("search")?.addEventListener("input",render);
loadData();
