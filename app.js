// ==========================================
// CRAFT POS PRO
// UPDATE 4.1
// IPAD BARCODE SCANNER FIX
// APP.JS PART 1
// ==========================================


// ===============================
// DATA
// ===============================


let items =
JSON.parse(localStorage.getItem("items")) || [];



let stats =
JSON.parse(localStorage.getItem("stats")) || {

    sales:0,
    sold:0,
    cash:0,
    card:0,
    other:0

};



let cart=[];


let editingID=null;


let imageData="";


let scannerRunning=false;


let selectedBarcodes=[];



let craftShowMode =
JSON.parse(
localStorage.getItem("craftShowMode")
) || false;









// ===============================
// SAVE DATA
// ===============================


function saveData(){


localStorage.setItem(
"items",
JSON.stringify(items)
);



localStorage.setItem(
"stats",
JSON.stringify(stats)
);



localStorage.setItem(
"craftShowMode",
JSON.stringify(craftShowMode)
);



}









// ===============================
// PAGE SWITCH
// ===============================


function showPage(page){



document.querySelectorAll(".page")

.forEach(p=>{

p.classList.add("hidden");

});




let target =
document.getElementById(page);



if(target)

target.classList.remove("hidden");





if(page==="inventory")

renderInventory();



if(page==="checkout")

renderCheckout();



if(page==="barcodes")

renderBarcodes();



if(page==="alerts")

renderAlerts();



if(page==="dashboard")

renderStats();



}









// ===============================
// CRAFT SHOW MODE
// ===============================


function toggleCraftMode(){



craftShowMode =
!craftShowMode;



saveData();



if(craftShowMode){



document.body.classList.add(
"craftMode"
);



alert(
"🎪 Craft Show Mode ON"
);



showPage("checkout");



}

else{



document.body.classList.remove(
"craftMode"
);



alert(
"Craft Show Mode OFF"
);



}



}









// ===============================
// BACKUP EXPORT
// ===============================


function exportBackup(){



let backup={



items:items,


stats:stats,


craftShowMode:craftShowMode,


date:new Date().toISOString()



};



let blob =
new Blob(

[

JSON.stringify(
backup,
null,
2
)

],

{

type:"application/json"

}

);



let link =
document.createElement("a");



link.href =
URL.createObjectURL(blob);



link.download =
"CraftPOS_Backup.json";



link.click();



}









// ===============================
// BACKUP IMPORT
// ===============================


function importBackup(event){



let file =
event.target.files[0];



if(!file)

return;




let reader =
new FileReader();



reader.onload=function(){



let data =
JSON.parse(
reader.result
);



items =
data.items || [];



stats =
data.stats || {

sales:0,
sold:0,
cash:0,
card:0,
other:0

};



craftShowMode =
data.craftShowMode || false;




saveData();



alert(
"Backup Restored"
);



renderInventory();



};



reader.readAsText(file);



}









// ===============================
// CREATE BARCODE
// ===============================


function createBarcode(){


return String(

Math.floor(

1000000000 +

Math.random()*9000000000

)

);


}









// ===============================
// IMAGE UPLOAD
// ===============================


document.addEventListener(

"change",

function(e){



if(e.target.id==="itemImage"){



let file =
e.target.files[0];



if(!file)

return;




let reader =
new FileReader();



reader.onload=function(){



imageData =
reader.result;



let img =
document.getElementById(
"previewImage"
);



img.src=imageData;


img.style.display="block";



};



reader.readAsDataURL(file);



}



});









// ===============================
// OPEN ITEM EDITOR
// ===============================


function openItemEditor(id=null){



editingID=id;



imageData="";



document.getElementById(
"editorPopup"
)
.classList.remove("hidden");



document.getElementById(
"variantEditor"
)
.innerHTML="";



document.getElementById(
"previewImage"
)
.style.display="none";



document.getElementById(
"lowStockLimit"
)
.value=3;





if(id){



let item =
items.find(
i=>i.id===id
);



document.getElementById(
"editorTitle"
)
.innerHTML="Edit Item";



document.getElementById(
"itemName"
)
.value=item.name;



document.getElementById(
"lowStockLimit"
)
.value=item.lowStockLimit ?? 3;



imageData =
item.image || "";



if(imageData){



let img =
document.getElementById(
"previewImage"
);



img.src=imageData;


img.style.display="block";



}



item.variants.forEach(v=>{


addVariantEditor(v);



});



}

else{


document.getElementById(
"editorTitle"
)
.innerHTML="Add Item";



document.getElementById(
"itemName"
)
.value="";



}



}









function closeEditor(){



document.getElementById(
"editorPopup"
)
.classList.add("hidden");


}









// ===============================
// VARIANT EDITOR
// ===============================


function addVariantEditor(v={}){



if(!v.barcode)

v.barcode=createBarcode();





let box =
document.createElement(
"div"
);



box.className="variantEditor";



box.innerHTML=`


<input class="vName"

placeholder="Variant name"

value="${v.name || ""}">



<input class="vPrice"

type="number"

placeholder="Price"

value="${v.price || ""}">



<input class="vStock"

type="number"

placeholder="Stock"

value="${v.stock || 0}">



<input class="vBarcode"

readonly

value="${v.barcode}">



<button class="smallButton"

onclick="this.parentElement.remove()">

Remove Variant

</button>



`;



document.getElementById(
"variantEditor"
)
.appendChild(box);



}
// ===============================
// SAVE ITEM
// ===============================


function saveItem(){


let name =
document.getElementById("itemName").value;



if(!name){

alert("Enter item name");

return;

}



let limit =
Number(
document.getElementById("lowStockLimit").value
);



let variants=[];



document.querySelectorAll(".variantEditor")

.forEach(v=>{


variants.push({


name:v.querySelector(".vName").value,


price:Number(
v.querySelector(".vPrice").value
),


stock:Number(
v.querySelector(".vStock").value
),


barcode:v.querySelector(".vBarcode").value,


sold:0



});


});





if(variants.length===0){

alert("Add a variant");

return;

}





if(editingID){



let item =
items.find(
i=>i.id===editingID
);



item.name=name;

item.image=imageData;

item.lowStockLimit=limit;

item.variants=variants;



}

else{



items.push({


id:Date.now(),


name:name,


image:imageData,


lowStockLimit:limit,


variants:variants



});



}



saveData();


closeEditor();


renderInventory();



}









// ===============================
// INVENTORY
// ===============================


function renderInventory(){



let box =
document.getElementById(
"inventoryList"
);



if(!box)

return;




box.innerHTML="";



let search =
document.getElementById(
"inventorySearch"
)
.value.toLowerCase();






items
.filter(item=>

item.name
.toLowerCase()
.includes(search)

)

.forEach(item=>{


let total=0;


item.variants.forEach(v=>{


total+=v.stock;


});





box.innerHTML +=`


<div class="card">



${item.image ?

`<img src="${item.image}">`

:""}



<h2>
${item.name}
</h2>



<h3>
Total Stock: ${total}
</h3>



${item.variants.map(
(v,i)=>`


<div class="variantEditor">


<h3>
${v.name}
</h3>


Price:
$${v.price}



<br>


Stock:
${v.stock}




<br>



<button class="smallButton"

onclick="quickStock(${item.id},${i},1)">

➕ Add

</button>



<button class="smallButton"

onclick="quickStock(${item.id},${i},-1)">

➖ Remove

</button>



</div>


`

).join("")}



<button class="smallButton"

onclick="openItemEditor(${item.id})">

✏️ Edit

</button>



<button class="smallButton"

onclick="deleteItem(${item.id})">

🗑 Delete

</button>



</div>



`;



});



}









// ===============================
// STOCK BUTTONS
// ===============================


function quickStock(id,variantID,amount){



let item =
items.find(
i=>i.id===id
);



let variant =
item.variants[variantID];



variant.stock += amount;



if(variant.stock < 0)

variant.stock=0;




saveData();


renderInventory();


}









// ===============================
// DELETE ITEM
// ===============================


function deleteItem(id){



if(confirm("Delete item?")){


items =
items.filter(
i=>i.id!==id
);



saveData();


renderInventory();



}



}









// ===============================
// BARCODE MANAGER
// ===============================


function renderBarcodes(){



let box =
document.getElementById(
"barcodeList"
);



if(!box)

return;



box.innerHTML="";



selectedBarcodes=[];



let search =
document.getElementById(
"barcodeSearch"
)
.value.toLowerCase();





items.forEach(item=>{



item.variants.forEach((v,i)=>{



let key =
item.id+"-"+i;



let text =
item.name+" "+v.name;



if(
!text.toLowerCase()
.includes(search)
)

return;




box.innerHTML +=`



<div class="barcodeCard">


<input

class="barcodeCheck"

type="checkbox"

data-id="${key}"

onchange="updateBarcodeSelection('${key}')"

>



<h3>
${item.name}
</h3>



<p>
${v.name}
</p>


<p>
$${v.price}
</p>



<svg

id="barcodeImage-${key}"

class="barcodeImage">

</svg>



<p class="barcodeNumber">

${v.barcode}

</p>



</div>


`;




setTimeout(()=>{


let svg =
document.getElementById(
"barcodeImage-"+key
);



if(svg){


JsBarcode(

svg,

v.barcode,

{

format:"CODE128",

height:70,

displayValue:false

}

);



}


},20);



});



});



}









function updateBarcodeSelection(id){



let box =
document.querySelector(

`input[data-id="${id}"]`

);



if(box.checked){



if(!selectedBarcodes.includes(id))

selectedBarcodes.push(id);



}

else{



selectedBarcodes =
selectedBarcodes.filter(
x=>x!==id
);



}



}









function selectAllBarcodes(){



document
.querySelectorAll(".barcodeCheck")

.forEach(box=>{


box.checked=true;


updateBarcodeSelection(
box.dataset.id
);


});



}








function clearBarcodeSelection(){



selectedBarcodes=[];



document
.querySelectorAll(".barcodeCheck")

.forEach(box=>{


box.checked=false;


});



}









// ===============================
// IPAD BARCODE SCANNER
// ===============================


function startScanner(){



document.getElementById(
"scannerBox"
)
.classList.remove("hidden");



scannerRunning=true;



Quagga.init({


inputStream:{


name:"Live",


type:"LiveStream",


target:
document.querySelector("#scanner"),



constraints:{


facingMode:{
ideal:"environment"
},


width:{
ideal:1280
},


height:{
ideal:720
}



}


},



decoder:{


readers:[


"code_128_reader",

"ean_reader",

"ean_8_reader",

"upc_reader"


]


}



},function(err){



if(err){


console.log(err);


alert(
"Camera could not start"
);


return;


}



Quagga.start();



});





Quagga.offDetected();



Quagga.onDetected(function(result){



if(!scannerRunning)

return;



let code =
result.codeResult.code;



navigator.vibrate?.(100);



findBarcode(code);



stopScanner();



});



}








function stopScanner(){



scannerRunning=false;



try{

Quagga.stop();

}

catch(e){}



document.getElementById(
"scannerBox"
)
.classList.add("hidden");



}
// ===============================
// FIND BARCODE
// ===============================


function findBarcode(code){



for(let item of items){



for(let i=0;i<item.variants.length;i++){



let v =
item.variants[i];



if(v.barcode===code){



addToCart(
item.id,
i
);



alert(
item.name+
" added"
);



return;



}



}



}



alert(
"Barcode not found"
);



}









// ===============================
// PRINT BARCODE LABELS
// ===============================


function printSelectedBarcodes(){



let list=[];



selectedBarcodes.forEach(id=>{



let p =
id.split("-");



let item =
items.find(
x=>x.id==p[0]
);



if(item){



let v =
item.variants[p[1]];



list.push({

name:item.name,

variant:v.name,

price:v.price,

barcode:v.barcode


});



}



});



if(list.length===0){

alert(
"Select barcodes first"
);

return;

}



printBarcodeLabels(list);



}








function printAllBarcodes(){



let list=[];



items.forEach(item=>{



item.variants.forEach(v=>{



list.push({


name:item.name,


variant:v.name,


price:v.price,


barcode:v.barcode



});



});



});



printBarcodeLabels(list);



}









function printBarcodeLabels(list){



let area =
document.createElement("div");



area.id="printArea";



list.forEach(b=>{



let div =
document.createElement("div");



div.className="printLabel";



div.innerHTML=`


<b>
${b.name}
</b>

<br>

${b.variant}

<br>

<svg></svg>

<br>

$${b.price}



`;



area.appendChild(div);



JsBarcode(

div.querySelector("svg"),

b.barcode,

{

format:"CODE128",

height:45,

displayValue:true

}

);



});



document.body.appendChild(area);



window.print();



area.remove();



}









// ===============================
// CHECKOUT
// ===============================


function renderCheckout(){



let box =
document.getElementById(
"productButtons"
);



if(!box)

return;



box.innerHTML="";



items.forEach(item=>{



box.innerHTML+=`


<button class="productButton"

onclick="openVariants(${item.id})">


${item.image ?

`<img src="${item.image}">`

:""}


${item.name}



</button>



`;



});



renderCart();



}









function openVariants(id){



let item =
items.find(
x=>x.id===id
);



let popup =
document.createElement("div");



popup.className="popup";



popup.innerHTML=`


<div class="popupBox">


<h2>
${item.name}
</h2>



${item.variants.map(
(v,i)=>`


<button class="paymentButton"

onclick="addToCart(${id},${i});
this.closest('.popup').remove();">


${v.name}

<br>

$${v.price}

<br>

Stock:
${v.stock}


</button>


`
).join("")}




<button class="bigButton danger"

onclick="this.closest('.popup').remove()">

Close

</button>


</div>


`;



document.body.appendChild(
popup
);



}









// ===============================
// CART
// ===============================


function addToCart(id,variantID){



let item =
items.find(
x=>x.id===id
);



let v =
item.variants[variantID];



if(v.stock<=0){



alert(
"Out of stock"
);



return;

}



let found =
cart.find(c=>

c.id===id &&
c.variant===variantID

);



if(found){


found.qty++;


}

else{


cart.push({


id:id,


variant:variantID,


name:item.name,


variantName:v.name,


price:v.price,


qty:1



});



}



renderCart();



}









function renderCart(){



let box =
document.getElementById(
"cart"
);



if(!box)

return;



box.innerHTML="";



let total=0;



cart.forEach((c,i)=>{



let cost =
c.qty*c.price;



total+=cost;



box.innerHTML+=`


<div class="cartItem">


<b>
${c.name}
</b>


<br>

${c.variantName}


<br>

Qty:
${c.qty}


<br>

$${cost.toFixed(2)}



<button class="smallButton"

onclick="removeCart(${i})">

Remove

</button>


</div>



`;



});



document.getElementById(
"cartTotal"
)
.innerHTML=

"Total: $"+
total.toFixed(2);



}









function removeCart(i){



cart.splice(i,1);



renderCart();



}



function clearCart(){



cart=[];



renderCart();



}









// ===============================
// PAYMENTS
// ===============================


function openPayment(){


if(cart.length===0){


alert(
"Cart empty"
);


return;


}



document.getElementById(
"paymentPopup"
)
.classList.remove("hidden");



}





function closePayment(){



document.getElementById(
"paymentPopup"
)
.classList.add("hidden");



}








function completePayment(method){



let total=0;



cart.forEach(c=>{



let item =
items.find(
x=>x.id===c.id
);



let v =
item.variants[c.variant];



v.stock -= c.qty;



if(v.stock<0)

v.stock=0;



stats.sold += c.qty;



total +=
v.price*c.qty;



});





stats.sales += total;



if(method==="cash")

stats.cash += total;



if(method==="card")

stats.card += total;



if(method==="other")

stats.other += total;



cart=[];



saveData();



closePayment();


renderInventory();

renderCheckout();

renderStats();



}









// ===============================
// ALERTS
// ===============================


function renderAlerts(){



let box =
document.getElementById(
"alertsList"
);



if(!box)

return;



box.innerHTML="";



items.forEach(item=>{



item.variants.forEach(v=>{



let limit =
item.lowStockLimit || 3;



if(v.stock===0){



box.innerHTML+=`

<div class="card out">

🔴 OUT OF STOCK

<br>

${item.name}

<br>

${v.name}

</div>

`;



}

else if(v.stock<=limit){



box.innerHTML+=`

<div class="card low">

🟡 LOW STOCK

<br>

${item.name}

<br>

${v.name}

<br>

Stock:
${v.stock}

</div>

`;



}



});



});



}









// ===============================
// DASHBOARD
// ===============================


function renderStats(){



let remaining=0;



items.forEach(i=>{


i.variants.forEach(v=>{


remaining+=v.stock;


});


});



document.getElementById(
"sales"
).innerHTML=

"$"+
stats.sales.toFixed(2);



document.getElementById(
"sold"
).innerHTML=

stats.sold;



document.getElementById(
"remaining"
).innerHTML=

remaining;



document.getElementById(
"cashSales"
).innerHTML=

"$"+
stats.cash.toFixed(2);



document.getElementById(
"cardSales"
).innerHTML=

"$"+
stats.card.toFixed(2);



document.getElementById(
"otherSales"
).innerHTML=

"$"+
stats.other.toFixed(2);



}









function resetStats(){



stats={


sales:0,

sold:0,

cash:0,

card:0,

other:0


};



saveData();


renderStats();



}









// ===============================
// START APP
// ===============================


showPage(
"inventory"
);



if(craftShowMode){


document.body.classList.add(
"craftMode"
);


}