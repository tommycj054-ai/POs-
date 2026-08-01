/* =====================================
CRAFT POS V6.1
APP.JS PART 1

DATABASE + PRODUCTS + VARIATIONS
===================================== */



// =====================
// DATA
// =====================


let products =
JSON.parse(
localStorage.getItem("craftProducts")
) || [];



let salesHistory =
JSON.parse(
localStorage.getItem("craftHistory")
) || [];



let salesData =
JSON.parse(
localStorage.getItem("craftSales")
) || {


itemsSold:0,

cash:0,

card:0,

other:0


};



let cart=[];


let selectedBarcodes=[];


let editingProduct=null;


let productImage="";


let currentVariations=[];







// =====================
// SAVE
// =====================


function saveData(){


localStorage.setItem(

"craftProducts",

JSON.stringify(products)

);



localStorage.setItem(

"craftHistory",

JSON.stringify(salesHistory)

);



localStorage.setItem(

"craftSales",

JSON.stringify(salesData)

);



}









// =====================
// PAGE SWITCH
// =====================


function showPage(page){



document

.querySelectorAll(".page")

.forEach(section=>{


section.classList.add("hidden");


});





let target =
document.getElementById(page);



if(target){

target.classList.remove("hidden");

}





if(page==="checkout")

renderCheckout();



if(page==="inventory")

renderInventory();



if(page==="barcodes")

renderBarcodes();



if(page==="dashboard")

renderDashboard();



if(page==="history")

renderHistory();



if(page==="craftShow")

renderCraftShow();



}









// =====================
// GENERATE BARCODE
// =====================


function generateBarcode(){



return String(

Math.floor(

100000000000 +

Math.random()*900000000000

)

);


}









// =====================
// IMAGE UPLOAD
// =====================


document.addEventListener(

"change",

function(event){



if(
event.target.id==="productImage"
){



let file =
event.target.files[0];



if(!file)

return;



let reader =
new FileReader();




reader.onload=function(){



productImage =
reader.result;



let preview =
document.getElementById(
"productPreview"
);



preview.src =
productImage;



preview.style.display="block";



};




reader.readAsDataURL(file);



}



}

);









// =====================
// OPEN PRODUCT EDITOR
// =====================


function openProductEditor(id=null){



editingProduct=id;



currentVariations=[];



productImage="";



document

.getElementById("productPopup")

.classList.remove("hidden");





document.getElementById(
"productName"
).value="";



document.getElementById(
"productPrice"
).value="";



document.getElementById(
"productStock"
).value="";



document.getElementById(
"productCategory"
).value="";



document.getElementById(
"variationList"
).innerHTML="";



document.getElementById(
"productPreview"
).style.display="none";








if(id){



let product =
products.find(
p=>p.id===id
);





editingProduct=id;



document.getElementById(
"productName"
).value =
product.name;



document.getElementById(
"productPrice"
).value =
product.price;



document.getElementById(
"productStock"
).value =
product.stock;



document.getElementById(
"productCategory"
).value =
product.category;



productImage =
product.image || "";



currentVariations =
product.variations || [];



renderVariationList();





if(product.image){



let img =
document.getElementById(
"productPreview"
);



img.src =
product.image;



img.style.display="block";



}



}



}









function closeProductEditor(){



document

.getElementById("productPopup")

.classList.add("hidden");



}









// =====================
// VARIATIONS
// =====================


function addVariation(){



let name =
document.getElementById(
"variationName"
).value.trim();




let options =
document.getElementById(
"variationOptions"
)

.value

.split(",")

.map(x=>x.trim())

.filter(x=>x);





if(!name || options.length===0){


alert(
"Enter variation and options"
);


return;


}





currentVariations.push({


name:name,


options:options


});





document.getElementById(
"variationName"
).value="";



document.getElementById(
"variationOptions"
).value="";



renderVariationList();



}









function renderVariationList(){



let box =
document.getElementById(
"variationList"
);



box.innerHTML="";



currentVariations.forEach(
(v,index)=>{



box.innerHTML += `


<div class="variationCard">


<b>${v.name}</b>


<br>


${v.options.join(", ")}


<br>


<button class="smallButton"

onclick="removeVariation(${index})">

Delete

</button>


</div>


`;



});



}









function removeVariation(index){



currentVariations.splice(
index,
1
);



renderVariationList();



}









// =====================
// SAVE PRODUCT
// =====================


function saveProduct(){



let name =
document.getElementById(
"productName"
).value.trim();




if(!name){


alert(
"Product name required"
);


return;


}





let data={



name:name,


price:Number(
document.getElementById(
"productPrice"
).value
),


stock:Number(
document.getElementById(
"productStock"
).value
),


category:
document.getElementById(
"productCategory"
).value,


image:productImage,


variations:currentVariations



};







if(editingProduct){



let product =
products.find(
p=>p.id===editingProduct
);



Object.assign(
product,
data
);



}

else{



products.push({


id:Date.now(),


barcode:generateBarcode(),


sold:0,


...data


});



}






saveData();



closeProductEditor();



renderInventory();



}
/* =====================================
CRAFT POS V6.1
APP.JS PART 2

INVENTORY + CHECKOUT + CART + PAYMENT
===================================== */



// =====================
// INVENTORY
// =====================


function renderInventory(){


let box =
document.getElementById(
"inventoryList"
);



if(!box)

return;



box.innerHTML="";



let search =
(
document.getElementById(
"inventorySearch"
)?.value || ""

)
.toLowerCase();





products

.filter(product =>

product.name
.toLowerCase()
.includes(search)

)

.forEach(product=>{



box.innerHTML += `


<div class="card">


${product.image ?

`<img src="${product.image}">`

:

""

}



<h2>

${product.name}

</h2>



<p>

Category:
${product.category || "None"}

</p>



<p>

Stock:
${product.stock}

</p>




<p>

Barcode:
Hidden

</p>




<button class="smallButton"

onclick="changeStock(${product.id},1)">

+ Stock

</button>




<button class="smallButton"

onclick="changeStock(${product.id},-1)">

- Stock

</button>




<button class="smallButton"

onclick="openProductEditor(${product.id})">

Edit

</button>




<button class="smallButton"

onclick="deleteProduct(${product.id})">

Delete

</button>



</div>


`;



});



}









function changeStock(id,amount){



let product =
products.find(
p=>p.id===id
);



if(!product)

return;



product.stock += amount;



if(product.stock < 0)

product.stock=0;



saveData();



renderInventory();



}









function deleteProduct(id){



if(confirm(
"Delete this product?"
)){



products =
products.filter(
p=>p.id!==id
);



saveData();



renderInventory();



}



}









// =====================
// CHECKOUT PRODUCTS
// =====================


function renderCheckout(){



let grid =
document.getElementById(
"productGrid"
);



if(!grid)

return;



grid.innerHTML="";



let search =
(
document.getElementById(
"checkoutSearch"
)?.value || ""

)
.toLowerCase();





products

.filter(product=>

product.name
.toLowerCase()
.includes(search)

)

.forEach(product=>{



grid.innerHTML += `


<button class="productButton"

onclick="selectProduct(${product.id})">


${product.image ?

`<img src="${product.image}">`

:

""

}



<br>


${product.name}



<br>


$${product.price.toFixed(2)}


</button>


`;



});



}









let selectedProduct=null;






function selectProduct(id){



let product =
products.find(
p=>p.id===id
);



if(!product)

return;



selectedProduct=product;






if(

!product.variations ||

product.variations.length===0

){



addToCart(product,{});

return;


}





let choices={};



product.variations.forEach(v=>{



let choice =
prompt(

v.name +

"\n" +

v.options.join(", ")

);



choices[v.name]=choice;



});





addToCart(product,choices);



}









// =====================
// CART
// =====================


function addToCart(product,choices){



if(product.stock<=0){



alert(
"Out of stock"
);



return;



}






let item =
cart.find(x=>

x.id===product.id

&&

JSON.stringify(x.choices)

===

JSON.stringify(choices)

);





if(item){



item.qty++;



}

else{



cart.push({


id:product.id,


name:product.name,


price:product.price,


choices:choices,


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



cart.forEach((item,index)=>{



let itemTotal =
item.price *
item.qty;



total+=itemTotal;




let options="";



Object.keys(item.choices)

.forEach(key=>{


options +=

key +

": " +

item.choices[key]

+

"<br>";



});





box.innerHTML += `


<div class="cartItem">


<h3>

${item.name}

</h3>


${options}



<p>

Qty:
${item.qty}

</p>


<p>

$${itemTotal.toFixed(2)}

</p>




<button class="smallButton"

onclick="changeCart(${index},1)">

+

</button>



<button class="smallButton"

onclick="changeCart(${index},-1)">

-

</button>



<button class="smallButton"

onclick="removeCart(${index})">

Remove

</button>


</div>


`;



});





document.getElementById(
"cartTotal"
)

.innerHTML =

"Total: $" +

total.toFixed(2);



}









function changeCart(index,amount){



cart[index].qty += amount;



if(cart[index].qty<=0){



cart.splice(index,1);



}



renderCart();



}








function removeCart(index){



cart.splice(index,1);



renderCart();



}








function clearCart(){



cart=[];



renderCart();



}









// =====================
// PAYMENT
// =====================


function openPayment(){



if(cart.length===0){


alert(
"Cart is empty"
);


return;


}



document

.getElementById("paymentPopup")

.classList.remove("hidden");



}








function closePayment(){



document

.getElementById("paymentPopup")

.classList.add("hidden");



}









function completePayment(type){



let total=0;

let items=0;





cart.forEach(item=>{



let product =
products.find(
p=>p.id===item.id
);





if(product){



product.stock -= item.qty;



product.sold += item.qty;



}





total +=

item.price *

item.qty;



items += item.qty;



});







salesData.itemsSold += items;



if(type==="cash")

salesData.cash += total;



if(type==="card")

salesData.card += total;



if(type==="other")

salesData.other += total;






salesHistory.push({



date:
new Date()
.toLocaleString(),


items:[...cart],


total:total,


payment:type



});







saveData();





// AUTO CLEAR CART

clearCart();





closePayment();



renderCheckout();



renderInventory();



renderDashboard();



}
/* =====================================
CRAFT POS V6.1
APP.JS PART 3

BARCODES + DASHBOARD + HISTORY + BACKUP
===================================== */



// =====================
// BARCODE CENTER
// =====================


function renderBarcodes(){


let box =
document.getElementById(
"barcodeList"
);



if(!box)

return;



box.innerHTML="";



let search =
(
document.getElementById(
"barcodeSearch"
)?.value || ""

)
.toLowerCase();





products

.filter(product=>

product.name
.toLowerCase()
.includes(search)

)

.forEach(product=>{



box.innerHTML += `


<div class="barcodeCard">


<label>


<input

class="barcodeCheck"

type="checkbox"

data-id="${product.id}"

onchange="toggleBarcode(${product.id})">


Select


</label>




<h2>

${product.name}

</h2>




<canvas

id="barcode-${product.id}">

</canvas>



</div>


`;






setTimeout(()=>{


let canvas =
document.getElementById(
"barcode-"+product.id
);



if(canvas){


JsBarcode(

canvas,

product.barcode,

{

format:"CODE128",

width:3,

height:90,

displayValue:true

}

);



}



},100);



});



}









function toggleBarcode(id){



if(selectedBarcodes.includes(id)){



selectedBarcodes =

selectedBarcodes.filter(

x=>x!==id

);



}

else{


selectedBarcodes.push(id);


}



}








function selectAllBarcodes(){



selectedBarcodes=[];



document

.querySelectorAll(".barcodeCheck")

.forEach(box=>{



box.checked=true;



selectedBarcodes.push(

Number(box.dataset.id)

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









// =====================
// PRINT BARCODES
// IPAD FIX
// =====================


function printSelectedBarcodes(){



let list =

products.filter(product=>

selectedBarcodes.includes(product.id)

);



printBarcodePage(list);



}








function printAllBarcodes(){



printBarcodePage(products);



}








function printBarcodePage(list){



let area =
document.getElementById(
"printArea"
);



area.innerHTML="";





list.forEach(product=>{



let canvas =
document.createElement(
"canvas"
);



JsBarcode(

canvas,

product.barcode,

{

format:"CODE128",

width:3,

height:90,

displayValue:true

}

);





let image =
document.createElement(
"img"
);



image.src =
canvas.toDataURL(
"image/png"
);



image.style.width="250px";





let label =
document.createElement(
"div"
);



label.className="printLabel";



label.innerHTML=

"<h2>"+

product.name+

"</h2>";



label.appendChild(image);



area.appendChild(label);



});





area.style.display="block";





setTimeout(()=>{


window.print();


},500);



}







window.onafterprint=function(){



let area =
document.getElementById(
"printArea"
);



area.innerHTML="";



area.style.display="none";



};









// =====================
// BARCODE SCANNER
// =====================


function startScanner(){



document

.getElementById("scannerBox")

.classList.remove("hidden");





Quagga.init({


inputStream:{


name:"camera",


type:"LiveStream",


target:

document.querySelector("#scanner"),


constraints:{


facingMode:"environment"


}


},



decoder:{


readers:[


"code_128_reader",

"ean_reader",

"upc_reader"


]


}



},function(error){



if(error){



alert(
"Camera error"
);



return;


}



Quagga.start();



});







Quagga.onDetected(function(result){



let code =
result.codeResult.code;





let product =
products.find(
p=>p.barcode===code
);





if(product){



addToCart(product,{});



}



Quagga.stop();



});



}








function stopScanner(){



try{


Quagga.stop();


}

catch(e){}





document

.getElementById("scannerBox")

.classList.add("hidden");



}









// =====================
// DASHBOARD
// =====================


function renderDashboard(){



if(!document.getElementById(
"itemsSold"
))

return;





document.getElementById(
"itemsSold"
)

.innerHTML=

salesData.itemsSold;





let count=0;



products.forEach(product=>{


count += product.stock;


});





document.getElementById(
"inventoryCount"
)

.innerHTML=count;





document.getElementById(
"cashTotal"
)

.innerHTML=

"$"+salesData.cash.toFixed(2);





document.getElementById(
"cardTotal"
)

.innerHTML=

"$"+salesData.card.toFixed(2);





document.getElementById(
"otherTotal"
)

.innerHTML=

"$"+salesData.other.toFixed(2);



}








function clearDashboard(){



if(confirm(
"Clear dashboard totals?"
)){



salesData={


itemsSold:0,

cash:0,

card:0,

other:0


};



saveData();



renderDashboard();



}



}









// =====================
// SALES HISTORY
// =====================


function renderHistory(){



let box =
document.getElementById(
"historyList"
);



if(!box)

return;



box.innerHTML="";



salesHistory
.slice()
.reverse()
.forEach(sale=>{



box.innerHTML += `


<div class="card">


<h3>

${sale.date}

</h3>


<p>

Total:
$${sale.total.toFixed(2)}

</p>


<p>

Payment:
${sale.payment}

</p>


</div>


`;



});



}








function clearSalesHistory(){



if(confirm(
"Delete all sales history?"
)){



salesHistory=[];



saveData();



renderHistory();



}



}









// =====================
// CRAFT SHOW MODE
// =====================


let currentShow=null;



function startCraftShow(){



currentShow={


name:

"Craft Show "+

new Date()
.toLocaleDateString(),


start:

new Date()
.toLocaleString()


};





document.getElementById(
"showName"
)

.innerHTML=

currentShow.name;



}








function endCraftShow(){



if(!currentShow)

return;





document.getElementById(
"showSummary"
)

.innerHTML=

"Show Finished<br>"+

currentShow.name;



}








function renderCraftShow(){



if(currentShow){



document.getElementById(
"showName"
)

.innerHTML=

currentShow.name;



}



}









// =====================
// BACKUP
// =====================


function exportBackup(){



let data={


products:products,


salesHistory:salesHistory,


salesData:salesData


};





let file =
new Blob(

[JSON.stringify(data)],

{

type:"application/json"

}

);





let link =
document.createElement(
"a"
);



link.href =
URL.createObjectURL(file);



link.download=
"craft-pos-backup.json";



link.click();



}









function importBackup(event){



let file =
event.target.files[0];



let reader =
new FileReader();



reader.onload=function(){



let data =
JSON.parse(
reader.result
);



products =
data.products || [];



salesHistory =
data.salesHistory || [];



salesData =
data.salesData || salesData;



saveData();



renderInventory();



};



reader.readAsText(file);



}









// =====================
// RESET SALES
// =====================


function resetEvent(){



salesData={


itemsSold:0,

cash:0,

card:0,

other:0


};



saveData();



renderDashboard();



}









// =====================
// START APP
// =====================


window.onload=function(){



showPage(
"checkout"
);



renderCheckout();



};