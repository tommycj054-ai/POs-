// =====================================
// CRAFT POS V5.2
// APP.JS PART 1
// DATA + INVENTORY
// =====================================



// =====================
// DATABASE
// =====================


let items =
JSON.parse(
localStorage.getItem("craftItems")
) || [];



let salesData =
JSON.parse(
localStorage.getItem("craftSales")
) || {

sales:0,
itemsSold:0,
cash:0,
card:0,
other:0

};



let cart=[];


let editingItem=null;


let imageData="";


let selectedBarcodes=[];








// =====================
// SAVE
// =====================


function saveData(){


localStorage.setItem(

"craftItems",

JSON.stringify(items)

);



localStorage.setItem(

"craftSales",

JSON.stringify(salesData)

);


}









// =====================
// PAGE SWITCHING
// =====================


function showPage(page){



document
.querySelectorAll(".page")
.forEach(section=>{


section.classList.add("hidden");


});





let open =
document.getElementById(page);



if(open){

open.classList.remove("hidden");


}




if(page==="inventory")

renderInventory();



if(page==="checkout")

renderCheckout();



if(page==="barcodes")

renderBarcodes();



if(page==="alerts")

renderAlerts();



if(page==="dashboard")

renderDashboard();



}









// =====================
// CREATE IDS
// =====================


function generateSKU(){


return "SKU-" +

Math.floor(

100000+

Math.random()*900000

);


}




function generateBarcode(){


return String(

Math.floor(

100000000000+

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



if(event.target.id==="itemPicture"){



let file =
event.target.files[0];



if(!file)

return;



let reader =
new FileReader();



reader.onload=function(){



imageData =
reader.result;



let preview =
document.getElementById(
"itemPreview"
);



preview.src=imageData;



preview.style.display="block";



};



reader.readAsDataURL(file);



}



}

);









// =====================
// OPEN ITEM EDITOR
// =====================


function openItemEditor(id=null){



editingItem=id;



imageData="";



document
.getElementById("itemPopup")
.classList.remove("hidden");





document
.getElementById("itemName")
.value="";



document
.getElementById("itemPrice")
.value="";



document
.getElementById("itemStock")
.value="";



document
.getElementById("itemLowStock")
.value=3;



document
.getElementById("itemPreview")
.style.display="none";







if(id){



let item =
items.find(
x=>x.id===id
);



document
.getElementById("itemName")
.value=item.name;



document
.getElementById("itemPrice")
.value=item.price;



document
.getElementById("itemStock")
.value=item.stock;



document
.getElementById("itemLowStock")
.value=item.lowStock;



imageData=item.image;



if(item.image){



let img =
document.getElementById(
"itemPreview"
);



img.src=item.image;



img.style.display="block";


}



}


}









function closeItemEditor(){



document
.getElementById("itemPopup")
.classList.add("hidden");


}









// =====================
// SAVE ITEM
// =====================


function saveItem(){



let name =
document
.getElementById("itemName")
.value
.trim();



let price =
Number(
document
.getElementById("itemPrice")
.value
);



let stock =
Number(
document
.getElementById("itemStock")
.value
);



let lowStock =
Number(
document
.getElementById("itemLowStock")
.value
);





if(name===""){


alert(
"Enter item name"
);


return;


}









if(editingItem){



let item =
items.find(
x=>x.id===editingItem
);



item.name=name;

item.price=price;

item.stock=stock;

item.lowStock=lowStock;

item.image=imageData;



}

else{



items.push({



id:Date.now(),



sku:generateSKU(),



barcode:generateBarcode(),



name:name,



price:price,



stock:stock,



lowStock:lowStock,



image:imageData,



sold:0



});



}







saveData();



closeItemEditor();



renderInventory();



}









// =====================
// INVENTORY DISPLAY
// =====================


function renderInventory(){



let list =
document.getElementById(
"inventoryList"
);



if(!list)

return;



list.innerHTML="";



let search =
(
document.getElementById(
"inventorySearch"
)?.value || ""

)
.toLowerCase();





items

.filter(item=>

item.name
.toLowerCase()
.includes(search)

)

.forEach(item=>{



list.innerHTML += `


<div class="card">



${item.image ?

`<img src="${item.image}">`

:

""

}



<h2>

${item.name}

</h2>



<h3>

$${item.price.toFixed(2)}

</h3>



<p>

Stock:
${item.stock}

</p>





<button class="smallButton"

onclick="changeStock(${item.id},1)">

+ Stock

</button>



<button class="smallButton"

onclick="changeStock(${item.id},-1)">

- Stock

</button>




<button class="smallButton"

onclick="openItemEditor(${item.id})">

Edit

</button>




<button class="smallButton"

onclick="deleteItem(${item.id})">

Delete

</button>



</div>



`;



});


}









// =====================
// STOCK CHANGE
// =====================


function changeStock(id,amount){



let item =
items.find(
x=>x.id===id
);



if(!item)

return;



item.stock += amount;



if(item.stock<0)

item.stock=0;



saveData();



renderInventory();



}








// =====================
// DELETE ITEM
// =====================


function deleteItem(id){



if(confirm("Delete this item?")){



items =
items.filter(
x=>x.id!==id
);



saveData();



renderInventory();



}



}
// =====================================
// CRAFT POS V5.2
// APP.JS PART 2
// CHECKOUT + PAYMENT
// =====================================



// =====================
// CHECKOUT DISPLAY
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





items

.filter(item =>

item.name
.toLowerCase()
.includes(search)

)

.forEach(item=>{



grid.innerHTML += `


<button class="productButton"

onclick="addToCart(${item.id})">



${item.image ?

`<img src="${item.image}">`

:

""

}



<br>


${item.name}



<br>


$${item.price.toFixed(2)}



<br>


Stock:
${item.stock}



</button>


`;



});





renderCart();



}









// =====================
// ADD TO CART
// =====================


function addToCart(id){



let item =
items.find(
x=>x.id===id
);



if(!item)

return;





if(item.stock<=0){


alert(
"Item is out of stock"
);


return;


}





let existing =
cart.find(
x=>x.id===id
);





if(existing){



if(existing.qty < item.stock){


existing.qty++;


}



}

else{



cart.push({



id:item.id,


name:item.name,


price:item.price,


qty:1



});



}



renderCart();



}









// =====================
// SHOW CART
// =====================


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



let cost =
item.price *
item.qty;



total += cost;





box.innerHTML += `


<div class="cartItem">



<h3>

${item.name}

</h3>



<p>

Qty:
${item.qty}

</p>



<p>

$${cost.toFixed(2)}

</p>





<button class="smallButton"

onclick="changeCartQuantity(${index},1)">

+

</button>





<button class="smallButton"

onclick="changeCartQuantity(${index},-1)">

-

</button>





<button class="smallButton"

onclick="removeCartItem(${index})">

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









// =====================
// CART CONTROLS
// =====================


function changeCartQuantity(index,amount){



let cartItem =
cart[index];



let product =
items.find(
x=>x.id===cartItem.id
);





cartItem.qty += amount;





if(cartItem.qty<=0){



cart.splice(index,1);



}



if(cartItem.qty > product.stock){



cartItem.qty =
product.stock;



}



renderCart();



}









function removeCartItem(index){



cart.splice(index,1);



renderCart();



}









function clearCart(){



cart=[];



renderCart();



}









// =====================
// PAYMENT POPUP
// =====================


function openPayment(){



if(cart.length===0){


alert(
"Cart is empty"
);


return;


}





document

.getElementById(
"paymentPopup"
)

.classList.remove(
"hidden"
);



}









function closePayment(){



document

.getElementById(
"paymentPopup"
)

.classList.add(
"hidden"
);



}









// =====================
// COMPLETE PAYMENT
// =====================


function completePayment(type){



let total=0;



cart.forEach(cartItem=>{



let item =
items.find(
x=>x.id===cartItem.id
);





item.stock -= cartItem.qty;



if(item.stock<0)

item.stock=0;





item.sold += cartItem.qty;



salesData.itemsSold += cartItem.qty;



total +=

cartItem.qty *

cartItem.price;



});









salesData.sales += total;






if(type==="cash"){


salesData.cash += total;


}



if(type==="card"){


salesData.card += total;


}



if(type==="other"){


salesData.other += total;


}







saveData();



cart=[];



closePayment();



renderInventory();


renderCheckout();


renderDashboard();



}
// =====================================
// CRAFT POS V5.2
// APP.JS PART 3
// BARCODES + SCANNER + DASHBOARD
// =====================================



// =====================
// BARCODE TAB
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





items

.filter(item =>

item.name
.toLowerCase()
.includes(search)

)

.forEach(item=>{



box.innerHTML += `


<div class="barcodeCard">


<label>


<input

type="checkbox"

class="barcodeCheck"

data-id="${item.id}"

onchange="toggleBarcode(${item.id})">


Select


</label>




<h2>

${item.name}

</h2>




<canvas

class="barcodeCanvas"

id="barcode-${item.id}">

</canvas>



</div>



`;







setTimeout(()=>{


let canvas =
document.getElementById(
"barcode-"+item.id
);



if(canvas){



JsBarcode(

canvas,

item.barcode,

{

format:"CODE128",

width:2,

height:80,

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
.querySelectorAll(
".barcodeCheck"
)

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
.querySelectorAll(
".barcodeCheck"
)

.forEach(box=>{


box.checked=false;


});



}









// =====================
// PRINT BARCODE LABELS
// =====================


function printSelectedBarcodes(){



let list =
items.filter(item=>

selectedBarcodes.includes(item.id)

);



printBarcodePage(list);



}







function printAllBarcodes(){



printBarcodePage(items);



}








function printBarcodePage(list){



let area =
document.getElementById(
"printArea"
);



if(!area)

return;



area.innerHTML="";





list.forEach(item=>{



let label =
document.createElement(
"div"
);



label.className=
"printLabel";



label.innerHTML=`

<h3>

${item.name}

</h3>


<canvas></canvas>


`;



area.appendChild(label);



let canvas =
label.querySelector(
"canvas"
);



JsBarcode(

canvas,

item.barcode,

{

format:"CODE128",

width:2,

height:70,

displayValue:true

}

);



});





// temporarily show ONLY for printing

area.style.display="block";

area.style.position="absolute";

area.style.left="0";

area.style.top="0";





setTimeout(()=>{


window.print();



setTimeout(()=>{



area.style.display="none";

area.innerHTML="";

area.style.left="-99999px";



},1000);



},500);



}









// =====================
// CAMERA SCANNER
// =====================


function startScanner(){



document

.getElementById(
"scannerBox"
)

.classList.remove(
"hidden"
);





Quagga.init({



inputStream:{



name:"Live",


type:"LiveStream",



target:

document.querySelector(
"#scanner"
),



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
"Camera permission error"
);


return;


}



Quagga.start();



});






Quagga.onDetected(function(result){



let code =
result.codeResult.code;




let item =
items.find(
x=>x.barcode===code
);





if(item){



addToCart(item.id);



}

else{


alert(
"Barcode not found"
);


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

.getElementById(
"scannerBox"
)

.classList.add(
"hidden"
);



}









// =====================
// ALERTS
// =====================


function renderAlerts(){



let box =
document.getElementById(
"alertsList"
);



if(!box)

return;



box.innerHTML="";



items.forEach(item=>{



if(item.stock===0){



box.innerHTML += `


<div class="alertBox outStock">


🔴 ${item.name}

<br>

Out of Stock


</div>



`;



}

else if(item.stock<=item.lowStock){



box.innerHTML += `


<div class="alertBox lowStock">


🟡 ${item.name}


<br>


${item.stock} left


</div>



`;



}



});



}









// =====================
// DASHBOARD
// =====================


function renderDashboard(){



if(!document.getElementById(
"totalSales"
))

return;





document.getElementById(
"totalSales"
)

.innerHTML =

"$"+salesData.sales.toFixed(2);





document.getElementById(
"itemsSold"
)

.innerHTML =

salesData.itemsSold;





document.getElementById(
"cashTotal"
)

.innerHTML =

"$"+salesData.cash.toFixed(2);





document.getElementById(
"cardTotal"
)

.innerHTML =

"$"+salesData.card.toFixed(2);





document.getElementById(
"otherTotal"
)

.innerHTML =

"$"+salesData.other.toFixed(2);







let count=0;



items.forEach(item=>{


count+=item.stock;


});





document.getElementById(
"inventoryCount"
)

.innerHTML=count;



}









// =====================
// RESET EVENT
// =====================


function resetEvent(){



salesData={


sales:0,


itemsSold:0,


cash:0,


card:0,


other:0


};



saveData();



renderDashboard();



}









// =====================
// BACKUP
// =====================


function exportBackup(){



let backup={


items:items,


sales:salesData


};





let file =
new Blob(

[

JSON.stringify(backup)

],

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



link.download =
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



items =
data.items || [];



salesData =
data.sales || salesData;



saveData();



renderInventory();



};



reader.readAsText(file);



}









// =====================
// START APP
// =====================


window.onload=function(){



showPage(
"inventory"
);



renderInventory();



};