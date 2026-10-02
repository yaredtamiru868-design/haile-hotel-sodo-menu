const KEY="haileMenuV1";
let data=JSON.parse(localStorage.getItem(KEY)||"[]");
let active="All";
const $=id=>document.getElementById(id);

function categories(){return ["All",...new Set(data.map(x=>x.category).filter(Boolean))];}
function setCategory(c){active=c;render();}

function render(){
  data=JSON.parse(localStorage.getItem(KEY)||"[]");
  const q=(($("search")?.value)||"").toLowerCase().trim();
  if($("cats")) $("cats").innerHTML=categories().map(c=>`<button class="${c===active?"on":""}" onclick="setCategory(${JSON.stringify(c)})">${c}</button>`).join("");

  const list=data.filter(x=>
    (active==="All"||x.category===active) &&
    (`${x.name} ${x.category} ${x.description||""}`).toLowerCase().includes(q)
  );
  if($("grid")) $("grid").innerHTML=list.map(x=>`
    <article class="food" onclick="openFood(${x.id})">
      <div class="photo ${x.image||"chicken"}"></div>
      <div>
        <small>${x.category||""}</small>
        <h3>${x.name}</h3>
        <b>${Number(x.price||0).toLocaleString()} ETB</b>
        <p>${x.description||""}</p>
        <footer>${x.nutrition?.protein||"—"} Protein · ${x.nutrition?.carbs||"—"} Carbs</footer>
      </div>
    </article>`).join("")||"<p>No food found.</p>";
}

function openFood(id){
  const x=data.find(y=>y.id===id); if(!x)return;
  if($("mimg")) $("mimg").className="photo "+(x.image||"chicken");
  if($("mcat"))$("mcat").textContent=x.category||"";
  if($("mn"))$("mn").textContent=x.name||"";
  if($("mp"))$("mp").textContent=Number(x.price||0).toLocaleString()+" ETB";
  if($("md"))$("md").textContent=x.description||"";
  if($("mi"))$("mi").innerHTML=(x.ingredients||[]).map(i=>`<span>${i}</span>`).join("");

  const n=x.nutrition||{};
  if($("mt"))$("mt").innerHTML=`
    <span><b>${n.calories||"—"}</b><small>Calories</small></span>
    <span><b>${n.protein||"—"}</b><small>Protein</small></span>
    <span><b>${n.carbs||"—"}</b><small>Carbohydrates</small></span>
    <span><b>${n.fat||"—"}</b><small>Fat</small></span>
    <span><b>${n.fiber||"—"}</b><small>Fiber</small></span>`;

  let vb=$("vitaminsBlock");
  if(!vb){
    vb=document.createElement("div"); vb.id="vitaminsBlock";
    vb.innerHTML='<h3>Vitamins & Minerals</h3><div id="mv"></div>';
    $("modal")?.querySelector("section")?.appendChild(vb);
  }
  $("mv").innerHTML=`<span>${n.vitamins||"Nutrition data to be verified by Haile Hotel."}</span>`;
  $("modal")?.classList.add("show");
}
$("close")?.addEventListener("click",()=>$("modal").classList.remove("show"));
$("modal")?.addEventListener("click",e=>{if(e.target.id==="modal")$("modal").classList.remove("show");});
$("search")?.addEventListener("input",render);
render();
