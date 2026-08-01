// ==========================================
// CRAFT POS PRO
// UPDATE 4.2
// MULTI ITEM + OPTIONAL VARIANTS FIX
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


let selectedBarcodes=[];


let scannerRunning=false;


let craftShowMode =
JSON.parse(
localStorage.getItem("craftShowMode")
) || false;







// ===============================
// SAVE
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



let selected =
document.getElementById(page);



if(selected)

selected.classList.remove("hidden");





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
// BARCODE GENERATOR
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
"itemName"
)
.value="";



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
.value=item.lowStockLimit || 3;



imageData=item.image || "";



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



}



}









function closeEditor(){


document.getElementById(
"editorPopup"
)
.classList.add("hidden");


}









// ===============================
// ADD VARIANT BOX
// ===============================


function addVariantEditor(v={}){



let box =
document.createElement(
"div"
);



box.className="variantEditor";



box.innerHTML=`


<input class="vName"

placeholder="Variant name (optional)"

value="${v.name || ""}">



<input class="vPrice"

type="number"

placeholder="Price"

value="${v.price || 0}">



<input class="vStock"

type="number"

placeholder="Stock"

value="${v.stock || 0}">



<input class="vBarcode"

readonly

value="${v.barcode || createBarcode()}">



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
document.getElementById(
"itemName"
)
.value.trim();



if(!name){


alert(
"Enter item name"
);


return;


}



let variants=[];



document.querySelectorAll(
".variantEditor"
)

.forEach(v=>{



variants.push({



name:
v.querySelector(".vName").value || "Default",



price:
Number(
v.querySelector(".vPrice").value
),



stock:
Number(
v.querySelector(".vStock").value
),



barcode:
v.querySelector(".vBarcode").value,



sold:0



});



});








// NO VARIANT FIX


if(variants.length===0){



variants.push({



name:"Default",


price:0,


stock:0,


barcode:createBarcode(),


sold:0



});



}







if(editingID){



let item =
items.find(
i=>i.id===editingID
);



item.name=name;


item.image=imageData;


item.lowStockLimit=

Number(
document.getElementById(
"lowStockLimit"
).value
);



item.variants=variants;



}

else{



items.push({



id:Date.now(),


name:name,


image:imageData,


lowStockLimit:

Number(
document.getElementById(
"lowStockLimit"
).value
),



variants:variants



});



}



saveData();


closeEditor();


renderInventory();



}
// ===============================
// INVENTORY DISPLAY
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
(document.getElementById(
"inventorySearch"
)?.value || "")
.toLowerCase();





items
.filter(item=>

item.name
.toLowerCase()
.includes(search)

)

.forEach(item=>{



let total=0;



item.variants.forEach(v=>{


total += v.stock;


});





let html=`


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



`;





item.variants.forEach((v,index)=>{



html +=`


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

onclick="quickStock(${item.id},${index},1)">

➕ Add Stock

</button>



<button class="smallButton"

onclick="quickStock(${item.id},${index},-1)">

➖ Remove Stock

</button>



</div>



`;



});





html +=`



<button class="smallButton"

onclick="openItemEditor(${item.id})">

✏️ Edit Item

</button>




<button class="smallButton"

onclick="deleteItem(${item.id})">

🗑 Delete

</button>



</div>



`;




box.innerHTML += html;



});



}









// ===============================
// STOCK CONTROL
// ===============================


function quickStock(id,index,amount){



let item =
items.find(
x=>x.id===id
);



if(!item)

return;



let variant =
item.variants[index];



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



if(confirm(
"Delete this item?"
)){



items =
items.filter(
x=>x.id!==id
);



saveData();


renderInventory();



}



}









// ===============================
// BARCODE PAGE
// ===============================


function renderBarcodes(){



let box =
document.getElementById(
"barcodeList"
);



if(!box)

return;



box.innerHTML="";




let search =
(document.getElementById(
"barcodeSearch"
)?.value || "")
.toLowerCase();





items.forEach(item=>{



item.variants.forEach((v,index)=>{



let key =
item.id+"-"+index;




let text =
(
item.name+
" "+
v.name
)
.toLowerCase();





if(
!text.includes(search)
)

return;





box.innerHTML +=`



<div class="barcodeCard">



<label>


<input

class="barcodeCheck"

type="checkbox"

data-id="${key}"

onchange="updateBarcodeSelection('${key}')">


☑ Select



</label>





<h2>
${item.name}
</h2>




<h3>
${v.name}
</h3>



<p>
Price:
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


width:2,


height:70,


displayValue:true


}



);



}



},100);



});



});



}









// ===============================
// BARCODE SELECT
// ===============================


function updateBarcodeSelection(id){



let checkbox =
document.querySelector(

`input[data-id="${id}"]`

);



if(!checkbox)

return;





if(checkbox.checked){



if(
!selectedBarcodes.includes(id)
)

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



selectedBarcodes=[];



document
.querySelectorAll(
".barcodeCheck"
)

.forEach(box=>{


box.checked=true;



selectedBarcodes.push(
box.dataset.id
);



});



}








function clearBarcodeSelection(){



selectedBarcodes=[];



document
.querySelectorAll(
".barcodeCheck"
)

.forEach(box=>{


box.checked=false;


});



}
// ===============================
// BARCODE SCANNER
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


alert(
"Camera error"
);


console.log(err);


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



navigator.vibrate?.(150);



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
// PRINT BARCODES
// ===============================


function printSelectedBarcodes(){



let list=[];



selectedBarcodes.forEach(id=>{



let parts =
id.split("-");



let item =
items.find(
x=>x.id==parts[0]
);



if(item){



let v =
item.variants[parts[1]];



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



area.className="printArea";



list.forEach(b=>{



let label =
document.createElement("div");



label.className="printLabel";



label.innerHTML=`

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



area.appendChild(label);



JsBarcode(

label.querySelector("svg"),

b.barcode,

{


format:"CODE128",

width:2,

height:60,

displayValue:true


}



);



});





document.body.appendChild(area);




// iPad Safari needs time

setTimeout(()=>{


window.print();



setTimeout(()=>{


area.remove();



},1000);



},700);



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



document.body.appendChild(popup);



}









function addToCart(id,index){



let item =
items.find(
x=>x.id===id
);



let v =
item.variants[index];



if(v.stock<=0){


alert(
"Out of stock"
);


return;


}



let found =
cart.find(c=>

c.id===id &&
c.variant===index

);



if(found){


found.qty++;


}

else{


cart.push({



id:id,


variant:index,


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


<b>${c.name}</b>


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



v.stock-=c.qty;



if(v.stock<0)

v.stock=0;



stats.sold+=c.qty;



total +=
c.qty*v.price;



});



stats.sales+=total;



if(method==="cash")
stats.cash+=total;


if(method==="card")
stats.card+=total;


if(method==="other")
stats.other+=total;



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

<div class="out">

🔴 OUT OF STOCK

<br>

${item.name}

${v.name}

</div>

`;



}

else if(v.stock<=limit){



box.innerHTML+=`

<div class="low">

🟡 LOW STOCK

<br>

${item.name}

${v.name}

<br>

${v.stock}

</div>

`;



}



});



});



}









// ===============================
// STATS
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
)
.innerHTML=

"$"+
stats.sales.toFixed(2);



document.getElementById(
"sold"
)
.innerHTML=

stats.sold;



document.getElementById(
"remaining"
)
.innerHTML=

remaining;



document.getElementById(
"cashSales"
)
.innerHTML=

"$"+
stats.cash.toFixed(2);



document.getElementById(
"cardSales"
)
.innerHTML=

"$"+
stats.card.toFixed(2);



document.getElementById(
"otherSales"
)
.innerHTML=

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
// START
// ===============================


showPage(
"inventory"
);



renderInventory();

