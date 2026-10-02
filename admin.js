const db = window.db;
let data=[], editing=null;
const $=x=>document.getElementById(x);

async function loadItems(){
  const {data:rows,error}=await db.from("menu_items").select("*").order("created_at",{ascending:false});
  if(error){alert(error.message);return;}
  data=rows||[]; render();
}
function rowToItem(x){return {id:x.id,name:x.name,category:x.category,price:Number(x.price||0),description:x.description||"",ingredients:Array.isArray(x.ingredients)?x.ingredients:[],nutrition:{calories:x.calories??"—",protein:x.protein??"—",carbs:x.carbohydrates??"—",fat:x.fat??"—",fiber:x.fiber??"—",vitamins:x.vitamins||"—"},image:x.image_url||"chicken",available:x.available};}
function render(){
  const q=($("search").value||"").toLowerCase();
  $("count").textContent=data.length; $("cats").textContent=new Set(data.map(x=>x.category)).size;
  $("list").innerHTML=data.filter(x=>(x.name+" "+x.category).toLowerCase().includes(q)).map(x=>`<div class="item"><div><b>${x.name}</b><small>${x.category} · ${x.available?"Available":"Hidden"}</small></div><strong>${Number(x.price).toLocaleString()} ETB</strong><button onclick="edit('${x.id}')">Edit</button></div>`).join("");
}
function openEditor(x=null){
  editing=x?.id||null; $("et").textContent=x?"Edit Food":"Add Food"; $("id").value=x?.id||""; $("name").value=x?.name||""; $("category").value=x?.category||""; $("price").value=x?.price||""; $("desc").value=x?.description||""; $("ing").value=(x?.ingredients||[]).join(", "); $("vit").value=x?.vitamins||x?.nutrition?.vitamins||"";
  $("cal").value=x?.calories??x?.nutrition?.calories??""; $("pro").value=x?.protein??x?.nutrition?.protein??""; $("carb").value=x?.carbohydrates??x?.nutrition?.carbs??""; $("fat").value=x?.fat??x?.nutrition?.fat??""; $("fib").value=x?.fiber??x?.nutrition?.fiber??""; $("image").value=x?.image_url||x?.image||"chicken"; $("available").checked=x?.available??true;
  $("del").style.display=x?"inline-block":"none"; $("editor").classList.add("show");
}
function edit(id){openEditor(data.find(x=>x.id===id))}
function closeEditor(){$("editor").classList.remove("show")}
async function saveItem(e){
  e.preventDefault();
  const payload={name:$("name").value.trim(),category:$("category").value.trim(),price:Number($("price").value),description:$("desc").value.trim(),ingredients:$("ing").value.split(",").map(x=>x.trim()).filter(Boolean),calories:$("cal").value||null,protein:$("pro").value||null,carbohydrates:$("carb").value||null,fat:$("fat").value||null,fiber:$("fib").value||null,vitamins:$("vit").value.trim()||null,image_url:$("image").value.trim()||"chicken",available:$("available").checked,updated_at:new Date().toISOString()};
  const result=editing?await db.from("menu_items").update(payload).eq("id",editing):await db.from("menu_items").insert(payload);
  if(result.error){alert(result.error.message);return}
  closeEditor(); await loadItems();
}
async function deleteItem(){if(confirm("Delete this item?")){const {error}=await db.from("menu_items").delete().eq("id",editing);if(error)alert(error.message);else{closeEditor();await loadItems();}}}
async function logout(){await db.auth.signOut();location.reload();}
async function boot(){
  const {data:{session}}=await db.auth.getSession();
  if(!session){$("login").classList.add("show");$("dashboard").style.display="none";return}
  $("login").classList.remove("show");$("dashboard").style.display="block";await loadItems();
}
async function login(e){
  e.preventDefault(); const {error}=await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
  if(error){$("loginError").textContent=error.message;return} boot();
}
$("search").oninput=render;
boot();
