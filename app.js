const db = window.db;
let data = [], active = "All";
const $ = id => document.getElementById(id);

function categories(){ return ["All", ...new Set(data.map(x=>x.category).filter(Boolean))]; }
function setCategory(c){ active=c; render(); }

async function loadMenu(){
  const {data: rows, error} = await db.from("menu_items").select("*").eq("available", true).order("created_at",{ascending:false});
  if(error){ console.error(error); if($("grid")) $("grid").innerHTML="<p>Menu could not be loaded. Please try again.</p>"; return; }
  data = (rows||[]).map(x=>({
    ...x,
    price:Number(x.price||0),
    image:x.image_url||"chicken",
    nutrition:{calories:x.calories??"—",protein:x.protein??"—",carbs:x.carbohydrates??"—",fat:x.fat??"—",fiber:x.fiber??"—",vitamins:x.vitamins||"—"}
  }));
  render();
}
function render(){
  const q=(($("search")?.value)||"").toLowerCase().trim();
  if($("cats")) $("cats").innerHTML=categories().map(c=>`<button class="${c===active?"on":""}" onclick="setCategory(${JSON.stringify(c)})">${c}</button>`).join("");
  const list=data.filter(x=>(active==="All"||x.category===active)&&(`${x.name} ${x.category} ${x.description||""}`).toLowerCase().includes(q));
  if($("grid")) $("grid").innerHTML=list.map(x=>`
    <article class="food" onclick="openFood('${x.id}')">
      <div class="photo ${x.image||"chicken"}"></div>
      <div><small>${x.category||""}</small><h3>${x.name}</h3><b>${Number(x.price||0).toLocaleString()} ETB</b><p>${x.description||""}</p><footer>${x.nutrition.protein||"—"} Protein · ${x.nutrition.carbs||"—"} Carbs</footer></div>
    </article>`).join("")||"<p>No food found.</p>";
}
function openFood(id){
  const x=data.find(y=>y.id===id); if(!x)return;
  $("mimg").className="photo "+(x.image||"chicken"); $("mcat").textContent=x.category||""; $("mn").textContent=x.name||"";
  $("mp").textContent=Number(x.price||0).toLocaleString()+" ETB"; $("md").textContent=x.description||"";
  $("mi").innerHTML=(Array.isArray(x.ingredients)?x.ingredients:[]).map(i=>`<span>${i}</span>`).join("");
  const n=x.nutrition||{}; $("mt").innerHTML=`<span><b>${n.calories||"—"}</b><small>Calories</small></span><span><b>${n.protein||"—"}</b><small>Protein</small></span><span><b>${n.carbs||"—"}</b><small>Carbohydrates</small></span><span><b>${n.fat||"—"}</b><small>Fat</small></span><span><b>${n.fiber||"—"}</b><small>Fiber</small></span>`;
  let vb=$("vitaminsBlock"); if(!vb){vb=document.createElement("div");vb.id="vitaminsBlock";vb.innerHTML='<h3>Vitamins & Minerals</h3><div id="mv"></div>';$("modal")?.querySelector("section")?.appendChild(vb);}
  $("mv").innerHTML=`<span>${n.vitamins||"—"}</span>`; $("modal")?.classList.add("show");
}
$("close")?.addEventListener("click",()=>$("modal").classList.remove("show"));
$("modal")?.addEventListener("click",e=>{if(e.target.id==="modal")$("modal").classList.remove("show");});
$("search")?.addEventListener("input",render);
loadMenu();
