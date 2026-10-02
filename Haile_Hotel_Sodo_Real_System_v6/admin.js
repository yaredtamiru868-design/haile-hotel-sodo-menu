const configured=!!(window.HAILE_SUPABASE_URL&&!window.HAILE_SUPABASE_URL.includes("PASTE_YOUR_")&&window.HAILE_SUPABASE_ANON_KEY&&!window.HAILE_SUPABASE_ANON_KEY.includes("PASTE_YOUR_"));
const db=configured?window.supabase.createClient(window.HAILE_SUPABASE_URL,window.HAILE_SUPABASE_ANON_KEY):null;
let data=[],editing=null;const $=x=>document.getElementById(x);

function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function setMsg(m){$("msg").textContent=m||""}
function showLogin(show){$("login").style.display=show?"flex":"none";$("dashboard").style.display=show?"none":"block"}

async function init(){
  if(!db){showLogin(false);$("setup").hidden=false;return}
  const {data:{session}}=await db.auth.getSession();
  if(session){showLogin(false);await loadData();}else showLogin(true);
}
async function login(e){e.preventDefault();setMsg("Signing in…");const {error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){setMsg(error.message);return}setMsg("");showLogin(false);await loadData()}
async function logout(){await db.auth.signOut();location.reload()}
async function loadData(){const {data:rows,error}=await db.from("menu_items").select("*").order("created_at",{ascending:false});if(error){setMsg(error.message);return}data=rows||[];render()}
function render(){const q=$("search").value.toLowerCase();$("count").textContent=data.length;$("cats").textContent=new Set(data.map(x=>x.category)).size;$("list").innerHTML=data.filter(x=>(x.name+" "+x.category).toLowerCase().includes(q)).map(x=>`<div class="item"><div><b>${esc(x.name)}</b><small>${esc(x.category)}</small></div><strong>${Number(x.price||0).toLocaleString()} ETB</strong><button onclick="edit(${JSON.stringify(x.id)})">Edit</button></div>`).join("")||"<p>No menu items yet.</p>"}
function openEditor(x=null){editing=x?.id||null;$("et").textContent=x?"Edit Food":"Add Food";$("id").value=x?.id||"";$("name").value=x?.name||"";$("category").value=x?.category||"";$("price").value=x?.price||"";$("desc").value=x?.description||"";$("ing").value=(x?.ingredients||[]).join(", ");$("vit").value=x?.nutrition?.vitamins||"";$("cal").value=x?.nutrition?.calories||"";$("pro").value=x?.nutrition?.protein||"";$("carb").value=x?.nutrition?.carbs||"";$("fat").value=x?.nutrition?.fat||"";$("fib").value=x?.nutrition?.fiber||"";$("image").value=x?.image||"chicken";$("del").style.display=x?"inline-block":"none";$("editor").classList.add("show")}
function edit(id){openEditor(data.find(x=>String(x.id)===String(id)))}
function closeEditor(){$("editor").classList.remove("show")}
async function saveItem(e){e.preventDefault();const item={name:$('name').value.trim(),category:$('category').value.trim(),price:Number($('price').value),description:$('desc').value.trim(),ingredients:$('ing').value.split(",").map(x=>x.trim()).filter(Boolean),nutrition:{calories:$('cal').value||"—",protein:$('pro').value||"—",carbs:$('carb').value||"—",fat:$('fat').value||"—",fiber:$('fib').value||"—",vitamins:$('vit').value||"—"},image:$('image').value.trim()||"chicken"};
  setMsg("Saving…");let result;if(editing)result=await db.from("menu_items").update(item).eq("id",editing);else result=await db.from("menu_items").insert(item);if(result.error){setMsg(result.error.message);return}setMsg("");closeEditor();await loadData()}
async function deleteItem(){if(!confirm("Delete this item?"))return;setMsg("Deleting…");const {error}=await db.from("menu_items").delete().eq("id",editing);if(error){setMsg(error.message);return}closeEditor();await loadData()}
$("search").oninput=render;$("loginForm").addEventListener("submit",login);init();
