const products = [
  {id:'blanket', name:'Custom Blanket', category:'blankets', icon:'🧺', desc:'Our #1 seller — personalize it with photos, names, artwork, and more.', badge:'#1 Seller', variants:[['Baby — 30×40 in.',25],['Toddler / Throw — 40×50 in.',35],['Twin / Throw — 50×60 in.',45],['Full / Queen — 60×80 in.',55]], image:'assets/category-blankets.jpg'},
  {id:'onesie', name:'Baby Onesie', category:'clothing', icon:'👶', desc:'Personalized baby onesie for everyday wear, keepsakes, and gifts.', variants:[['0–3 Month',15],['3–6 Month',15],['6–9 Month',15],['9–12 Month',15],['1–2Y',15]], image:'assets/category-clothing.jpg'},
  {id:'kids-shirt', name:'Kids T-Shirt', category:'clothing', icon:'👕', desc:'Custom kids shirt with your photos, names, artwork, or theme.', variants:[['2Y',18],['3Y',18],['4Y',18],['5/6Y',18],['7/8Y',18],['10/12Y',18]], image:'assets/category-clothing.jpg'},
  {id:'adult-shirt', name:'Adult T-Shirt', category:'clothing', icon:'👚', desc:'Custom adult shirt designed around your request.', variants:[['Small',25],['Medium',25],['Large',25],['XL',25],['XXL',25],['XXXL',25]], image:'assets/category-clothing.jpg'},
  {id:'keychain', name:'Keychain', category:'accessories', icon:'🔑', desc:'Small personalized keepsake with your image or design.', variants:[['Standard',10]], image:'assets/category-accessories.jpg'},
  {id:'tumbler', name:'Stainless Steel Tumbler', category:'drinkware', icon:'🥤', desc:'Custom tumbler with optional accessory bundle.', variants:[['20 oz',20],['20 oz + accessories',25],['30 oz',30],['30 oz + accessories',35],['40 oz',40],['40 oz + accessories',45]], image:'assets/category-accessories.jpg'},
  {id:'water-bottle', name:'Water Bottle', category:'drinkware', icon:'💧', desc:'Custom 20–25 oz water bottle.', variants:[['20–25 oz',15]], image:'assets/category-accessories.jpg'},
  {id:'beach-towel', name:'Beach Towel', category:'accessories', icon:'🏖️', desc:'Personalized beach towel for trips, gifts, and family fun.', variants:[['Standard',20]], image:'assets/category-blankets.jpg'},
  {id:'drawstring', name:'Drawstring Bag', category:'bags', icon:'🎒', desc:'Small fits an iPad, medium can hold a football, large can hold a basketball.', variants:[['Small — 10×13 in.',15],['Medium — 13×16 in.',20],['Large — 16×20 in.',25]], image:'assets/category-bags.jpg'},
  {id:'tote', name:'Tote Bag', category:'bags', icon:'👜', desc:'13×15 in. custom tote bag.', variants:[['13×15 in.',20]], image:'assets/category-bags.jpg'},
  {id:'notebook', name:'Notebook', category:'accessories', icon:'📓', desc:'Personalized notebook. Final price confirmed during review.', variants:[['Pocket — 5.5×3.5 in.',null],['Medium Spiral — 5×8 in.',null]], image:'assets/category-office.jpg'},
  {id:'mousepad', name:'Mouse Pad', category:'accessories', icon:'🖱️', desc:'Custom desk and gaming mouse pads in multiple sizes.', variants:[['7×9 in.',15],['9×11 in.',20],['12×28 in.',25],['16×32 in.',28],['16×30 in.',30]], image:'assets/category-office.jpg'}
];

const siteConfig = {
  facebookPageUrl: '', // Paste the Kaji Rose Studio Facebook Page or Messenger URL here.
};

const grid=document.getElementById('productGrid'), modal=document.getElementById('customizerModal'), backdrop=document.getElementById('customizerBackdrop');
const productSelect=document.getElementById('productSelect'), variantSelect=document.getElementById('variantSelect'), estimatedPrice=document.getElementById('estimatedPrice');
const mockupLabel=document.getElementById('mockupLabel'), imageUpload=document.getElementById('imageUpload'), previewImage=document.getElementById('previewImage');
const customText=document.getElementById('customText'), previewText=document.getElementById('previewText'), textColor=document.getElementById('textColor');
const statusBox=document.getElementById('formStatus'), requestForm=document.getElementById('requestForm');

function money(value){return value==null?'Price confirmed after review':`$${Number(value).toFixed(0)}`;}
function renderProducts(filter='all'){
  grid.innerHTML='';
  products.filter(p=>filter==='all'||p.category===filter).forEach(p=>{
    const prices=p.variants.map(v=>v[1]).filter(v=>v!=null), start=prices.length?Math.min(...prices):null;
    const card=document.createElement('article'); card.className='product-card';
    card.innerHTML=`<div class="product-art">${p.badge?`<span class="product-badge">${p.badge}</span>`:''}${p.image?`<img class="product-photo" src="${p.image}" alt="${p.name} example" />`:`${p.image?`<img class=\"product-photo\" src=\"${p.image}\" alt=\"${p.name} example\" />`:`<div class=\"product-emoji\">${p.icon}</div>`}`}</div><div class="product-info"><h3>${p.name}</h3><p>${p.desc}</p><div class="product-bottom"><span class="price">${start==null?'Price TBD':(p.variants.length>1?`From ${money(start)}`:money(start))}</span><button class="customize-btn" data-product-id="${p.id}">Customize</button></div></div>`;
    grid.appendChild(card);
  });
  document.querySelectorAll('[data-product-id]').forEach(btn=>btn.addEventListener('click',()=>openCustomizer(btn.dataset.productId)));
}
function populateProductSelect(){productSelect.innerHTML=products.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');}
function updateVariants(){const p=products.find(p=>p.id===productSelect.value)||products[0];variantSelect.innerHTML=p.variants.map((v,i)=>`<option value="${i}">${v[0]} — ${money(v[1])}</option>`).join('');mockupLabel.textContent=p.name;updatePrice();}
function updatePrice(){const p=products.find(p=>p.id===productSelect.value)||products[0],v=p.variants[Number(variantSelect.value||0)],q=Math.max(1,Number(document.getElementById('quantity').value||1));estimatedPrice.value=v[1]==null?'Price confirmed after review':money(v[1]*q);}
function openCustomizer(productId){if(productId)productSelect.value=productId;updateVariants();modal.hidden=false;backdrop.hidden=false;document.body.style.overflow='hidden';}
function closeCustomizer(){modal.hidden=true;backdrop.hidden=true;document.body.style.overflow='';}
function makeRequestNumber(){const d=new Date();const stamp=`${String(d.getFullYear()).slice(-2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;const rand=Math.floor(1000+Math.random()*9000);return `KRS-${stamp}-${rand}`;}

document.querySelectorAll('[data-open-customizer]').forEach(b=>b.addEventListener('click',()=>openCustomizer()));
document.getElementById('closeCustomizer').addEventListener('click',closeCustomizer);backdrop.addEventListener('click',closeCustomizer);
productSelect.addEventListener('change',updateVariants);variantSelect.addEventListener('change',updatePrice);document.getElementById('quantity').addEventListener('input',updatePrice);
imageUpload.addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(!f){previewImage.hidden=true;return;}const r=new FileReader();r.onload=ev=>{previewImage.src=ev.target.result;previewImage.hidden=false;previewImage.style.left='50%';previewImage.style.top='50%';previewImage.style.transform='translate(-50%,-50%)';};r.readAsDataURL(f);});
customText.addEventListener('input',()=>previewText.textContent=customText.value||'Your text');textColor.addEventListener('input',()=>previewText.style.color=textColor.value);
document.getElementById('clearPreview').addEventListener('click',()=>{imageUpload.value='';previewImage.hidden=true;customText.value='';previewText.textContent='Your text';previewText.style.left='50%';previewText.style.top='65%';previewText.style.transform='translate(-50%,-50%)';});
function makeDraggable(el){let dragging=false,startX=0,startY=0,startL=0,startT=0;el.addEventListener('pointerdown',e=>{dragging=true;el.setPointerCapture(e.pointerId);const parent=el.parentElement.getBoundingClientRect(),r=el.getBoundingClientRect();startX=e.clientX;startY=e.clientY;startL=r.left-parent.left+r.width/2;startT=r.top-parent.top+r.height/2;el.style.transform='translate(-50%,-50%)';});el.addEventListener('pointermove',e=>{if(!dragging)return;const p=el.parentElement.getBoundingClientRect();let x=startL+(e.clientX-startX),y=startT+(e.clientY-startY);x=Math.max(20,Math.min(p.width-20,x));y=Math.max(20,Math.min(p.height-20,y));el.style.left=x+'px';el.style.top=y+'px';});el.addEventListener('pointerup',()=>dragging=false);el.addEventListener('pointercancel',()=>dragging=false);}
makeDraggable(previewImage);makeDraggable(previewText);

requestForm.addEventListener('submit',async e=>{
  e.preventDefault();statusBox.className='form-status';statusBox.textContent='';
  const p=products.find(p=>p.id===productSelect.value),v=p.variants[Number(variantSelect.value||0)],requestNo=makeRequestNumber();
  const summary=`KAJI ROSE STUDIO\nCUSTOM DESIGN REQUEST ${requestNo}\n\nCustomer: ${document.getElementById('customerName').value}\nEmail: ${document.getElementById('customerEmail').value}\nPhone: ${document.getElementById('customerPhone').value||'Not provided'}\n\nProduct: ${p.name}\nOption / Size: ${v[0]}\nQuantity: ${document.getElementById('quantity').value}\nEstimated item price: ${estimatedPrice.value}\n\nCustom text: ${customText.value||'None'}\nDesign notes: ${document.getElementById('designNotes').value||'None'}\n\nI will attach my original photos/artwork to this Messenger conversation.\n\nRights confirmation: Yes\nCustom-order process acknowledged: Yes`;
  try{await navigator.clipboard.writeText(summary);}catch(_){/* Clipboard may be blocked; summary is still shown below. */}
  statusBox.className='form-status success';
  statusBox.innerHTML=`<strong>Request ${requestNo} is ready.</strong><br>Your order summary was prepared${navigator.clipboard?' and copied to your clipboard':''}. Open Messenger, paste the summary, and attach the original photos/artwork.<textarea class="summary-box" readonly>${summary}</textarea>`;
  if(siteConfig.facebookPageUrl){setTimeout(()=>window.open(siteConfig.facebookPageUrl,'_blank','noopener'),250);}else{statusBox.innerHTML+=`<br><strong>Setup needed:</strong> add the Kaji Rose Studio Facebook Page/Messenger URL to <code>siteConfig.facebookPageUrl</code> in <code>script.js</code>.`;}
});

document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');renderProducts(btn.dataset.filter);}));
const menuToggle=document.getElementById('menuToggle'),mainNav=document.getElementById('mainNav');menuToggle.addEventListener('click',()=>{const open=mainNav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));});mainNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mainNav.classList.remove('open')));
document.querySelectorAll('[data-category-jump]').forEach(btn=>btn.addEventListener('click',()=>{
  const category=btn.dataset.categoryJump;
  document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x.dataset.filter===category));
  renderProducts(category);
  document.getElementById('productGrid').scrollIntoView({behavior:'smooth',block:'start'});
}));
document.getElementById('year').textContent=new Date().getFullYear();populateProductSelect();renderProducts();updateVariants();
