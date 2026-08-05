
// ==============================
// POS V12 DATA
// ==============================


let products =

JSON.parse(
localStorage.getItem("products")
) || [];



let categories =

JSON.parse(
localStorage.getItem("categories")
) || [];



let sales =

JSON.parse(
localStorage.getItem("sales")
) || [];



let todos =

JSON.parse(
localStorage.getItem("todos")
) || [];





let cart = [];



let editingProduct = null;



let currentCategory = "All";



let selectedLabels = [];



let scannerActive = false;



let lastScan = "";

let lastScanTime = 0;









// ==============================
// SAVE DATA
// ==============================


function saveData(){


localStorage.setItem(

"products",

JSON.stringify(products)

);



localStorage.setItem(

"categories",

JSON.stringify(categories)

);



localStorage.setItem(

"sales",

JSON.stringify(sales)

);



localStorage.setItem(

"todos",

JSON.stringify(todos)

);



}









// ==============================
// PAGE CONTROL
// ==============================


function openPage(page){



document

.querySelectorAll(".page")

.forEach(p=>{


p.classList.remove("active");


});





document

.getElementById(page)

.classList.add("active");







if(page==="dashboard")

updateDashboard();





if(page==="checkout"){

displayCheckoutProducts();

updateCheckoutCategories();

}





if(page==="products")

displayProducts();





if(page==="inventory")

displayInventory();





if(page==="barcode")

displayBarcodeProducts();





if(page==="categories")

displayCategories();





if(page==="sales")

displaySales();



}









// ==============================
// DASHBOARD
// ==============================



function updateDashboard(){



let totalProducts =

document.getElementById(
"totalProducts"
);



if(totalProducts)

totalProducts.innerText =

products.length;







let inventory =

products.reduce(

(total,p)=>


total + Number(p.stock),

0

);



let inventoryBox =

document.getElementById(
"totalInventory"
);



if(inventoryBox)

inventoryBox.innerText =

inventory;








let low =

products.filter(

p=>p.stock<=2

);



let lowBox =

document.getElementById(
"lowStockCount"
);



if(lowBox)

lowBox.innerText =

low.length;







let salesBox =

document.getElementById(
"salesCount"
);



if(salesBox)

salesBox.innerText =

sales.length;





displayLowStock();

displayBestSelling();

displayTodos();



}









// ==============================
// LOW STOCK LIST
// ==============================



function displayLowStock(){



let box =

document.getElementById(
"lowStockList"
);



if(!box)

return;



box.innerHTML="";





products

.filter(p=>p.stock<=2)

.forEach(p=>{


box.innerHTML += `


<div>

⚠️ ${p.name}

<br>

Stock: ${p.stock}

</div>


`;



});



}









// ==============================
// BEST SELLING
// ==============================


function displayBestSelling(){



let box =

document.getElementById(
"bestSellingList"
);



if(!box)

return;




let sold = {};





sales.forEach(s=>{


s.items.forEach(i=>{


if(!sold[i.name])

sold[i.name]=0;



sold[i.name]+=i.qty;



});


});






box.innerHTML="";





Object.entries(sold)

.sort(

(a,b)=>b[1]-a[1]

)

.slice(0,5)

.forEach(i=>{


box.innerHTML += `


<div>

⭐ ${i[0]}

<br>

Sold: ${i[1]}

</div>


`;



});



}









// ==============================
// TO DO LIST
// ==============================


function addTodo(){



let input =

document.getElementById(
"todoInput"
);



let text =

input.value.trim();





if(!text)

return;





todos.push({

text:text,

done:false

});





saveData();



input.value="";



displayTodos();



}








function displayTodos(){



let box =

document.getElementById(
"todoList"
);



if(!box)

return;




box.innerHTML="";





todos.forEach((t,i)=>{


box.innerHTML += `


<div>


<input

type="checkbox"

${t.done?"checked":""}

onchange="toggleTodo(${i})"

>


${t.text}



</div>


`;



});



}







function toggleTodo(i){


todos[i].done =

!todos[i].done;


saveData();


displayTodos();



}

// ==============================
// PRODUCT EDITOR
// ==============================


function openAddProduct(){


editingProduct = null;


document.getElementById(
"editorTitle"
).innerText =

"Add Product";



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
"productBarcode"
).value="";



openPage("productEditor");



}









// ==============================
// CREATE BARCODE
// ==============================


function createBarcode(){



document.getElementById(
"productBarcode"
).value =


Date.now()

.toString()

.slice(-12);



}









// ==============================
// SAVE PRODUCT
// ==============================


function saveProduct(){



let name =

document.getElementById(
"productName"
).value;



let price =

Number(

document.getElementById(
"productPrice"
).value

);



let stock =

Number(

document.getElementById(
"productStock"
).value

);



let category =

document.getElementById(
"productCategory"
).value;





let barcode =

document.getElementById(
"productBarcode"
).value;



let imageInput =

document.getElementById(
"productImage"
);






let image = "";







function finishSave(img){



let product = {



id:

editingProduct ?

editingProduct.id :

Date.now(),



name:name,



price:price,



stock:stock,



category:category,



barcode:

barcode || Date.now().toString().slice(-12),



image:img,



copies:

editingProduct ?

editingProduct.copies :

1



};








if(editingProduct){



let index =

products.findIndex(

p=>p.id===editingProduct.id

);



products[index]=product;



}

else{


products.push(product);



}






saveData();



displayProducts();



displayInventory();



openPage("products");



}









if(imageInput.files[0]){


let reader =

new FileReader();



reader.onload=function(e){



finishSave(e.target.result);



};



reader.readAsDataURL(

imageInput.files[0]

);



}

else{


finishSave(

editingProduct ?

editingProduct.image :

""

);



}




}









// ==============================
// DISPLAY PRODUCTS
// ==============================


function displayProducts(){



let box =

document.getElementById(
"productList"
);



if(!box)

return;




box.innerHTML="";





products.forEach(p=>{


box.innerHTML += `



<div class="product-row">



${p.image ?

`<img src="${p.image}">`

:

""

}





<h3>

${p.name}

</h3>



Price:

$${p.price.toFixed(2)}



<br>


Stock:

${p.stock}



<br>


Barcode:

${p.barcode}



<br>





<button onclick="editProduct(${p.id})">

✏️ Edit

</button>





<button onclick="deleteProduct(${p.id})">

🗑 Delete

</button>




</div>



`;



});



}









// ==============================
// EDIT PRODUCT
// ==============================


function editProduct(id){



let p =

products.find(

x=>x.id===id

);



editingProduct = p;



document.getElementById(
"editorTitle"
).innerText =

"Edit Product";



document.getElementById(
"productName"
).value=p.name;



document.getElementById(
"productPrice"
).value=p.price;



document.getElementById(
"productStock"
).value=p.stock;



document.getElementById(
"productBarcode"
).value=p.barcode;



openPage("productEditor");



}









// ==============================
// DELETE PRODUCT
// ==============================


function deleteProduct(id){



products =

products.filter(

p=>p.id!==id

);



saveData();



displayProducts();



displayInventory();



displayCheckoutProducts();



displayBarcodeProducts();



updateDashboard();



}









// ==============================
// INVENTORY
// ==============================


function displayInventory(){



let box =

document.getElementById(
"inventoryList"
);



if(!box)

return;



box.innerHTML="";





products.forEach(p=>{


box.innerHTML += `



<div class="inventory-row">



${p.image ?

`<img src="${p.image}">`

:

""

}




<h3>

${p.name}

</h3>



Stock:

${p.stock}



<br>




<button onclick="changeStock(${p.id},1)">

+1

</button>





<button onclick="changeStock(${p.id},-1)">

-1

</button>




<button onclick="editProduct(${p.id})">

✏️ Edit

</button>



</div>



`;



});



}









function changeStock(id,amount){



let p =

products.find(

x=>x.id===id

);



if(!p)

return;





p.stock += amount;



if(p.stock<0)

p.stock=0;



saveData();



displayInventory();



updateDashboard();



}









// ==============================
// CATEGORY DROPDOWNS
// ==============================


function updateCategoryDropdowns(){



let selects = [


document.getElementById(
"productCategory"
),



document.getElementById(
"checkoutCategory"
),



document.getElementById(
"barcodeCategory"
)


];





selects.forEach(select=>{


if(!select)

return;




select.innerHTML="";





let all =

document.createElement("option");


all.value="All";

all.innerText="All";


select.appendChild(all);







categories.forEach(c=>{


let option =

document.createElement("option");



option.value=c;


option.innerText=c;



select.appendChild(option);



});



});



}

// ==============================
// CHECKOUT PRODUCTS
// ==============================


function displayCheckoutProducts(){


let box =

document.getElementById(
"checkoutProducts"
);



if(!box)

return;




box.innerHTML="";





let search =

document.getElementById(
"productSearch"
)?.value.toLowerCase() || "";





let category =

document.getElementById(
"checkoutCategory"
)?.value || "All";







products

.filter(p=>{


let matchName =

p.name.toLowerCase()

.includes(search);



let matchCategory =

category==="All" ||

p.category===category;



return matchName && matchCategory;



})

.forEach(p=>{



box.innerHTML += `


<div class="product-card"



onclick="addToCart(${p.id})">


${p.image ?

`

<img src="${p.image}">

`

:

""

}



<h3>

${p.name}

</h3>



<p>

$${p.price.toFixed(2)}

</p>



<p>

Stock:

${p.stock}

</p>



</div>



`;



});



}









// ==============================
// SEARCH CHECKOUT
// ==============================


function searchCheckout(){


displayCheckoutProducts();



}









// ==============================
// CATEGORY FILTER
// ==============================


function updateCheckoutCategories(){


updateCategoryDropdowns();



}









// ==============================
// ADD TO CART
// ==============================


function addToCart(id){



let product =

products.find(

p=>p.id===id

);



if(!product)

return;





if(product.stock<=0){


alert(
"Out of stock"
);


return;


}





let item =

cart.find(

i=>i.id===id

);





if(item){


item.qty++;


}

else{


cart.push({


id:product.id,


name:product.name,


price:product.price,


qty:1



});



}





updateCart();



}









// ==============================
// UPDATE CART DISPLAY
// ==============================


function updateCart(){



let box =

document.getElementById(
"cartItems"
);



if(!box)

return;





box.innerHTML="";





let total=0;






cart.forEach(item=>{


total +=

item.price *

item.qty;






box.innerHTML += `



<div class="cart-item">


<div>


<b>

${item.name}

</b>


<br>


$${item.price.toFixed(2)}


</div>





<div>


<button onclick="changeCartQty(${item.id},-1)">

-

</button>




${item.qty}





<button onclick="changeCartQty(${item.id},1)">

+

</button>




<button onclick="removeCartItem(${item.id})">

🗑

</button>



</div>


</div>



`;




});







let totalBox =

document.getElementById(
"cartTotal"
);



if(totalBox)

totalBox.innerText =

total.toFixed(2);



}









// ==============================
// CHANGE CART QUANTITY
// ==============================


function changeCartQty(id,amount){



let item =

cart.find(

i=>i.id===id

);



if(!item)

return;





item.qty += amount;





if(item.qty<=0){


removeCartItem(id);


return;


}





updateCart();



}









// ==============================
// REMOVE FROM CART
// ==============================


function removeCartItem(id){



cart =

cart.filter(

i=>i.id!==id

);



updateCart();



}









// ==============================
// CLEAR CART
// ==============================


function clearCart(){


cart=[];


updateCart();


}









// ==============================
// CASH / CARD CHECKOUT
// ==============================


function checkoutPayment(type){



if(cart.length===0)

return;







cart.forEach(item=>{


let product =

products.find(

p=>p.id===item.id

);



if(product){


product.stock -= item.qty;



if(product.stock<0)

product.stock=0;



}



});









sales.push({



id:Date.now(),



date:

new Date()

.toLocaleString(),



payment:type,



items:[...cart],



total:

cart.reduce(

(a,b)=>

a+(b.price*b.qty),

0

)



});







cart=[];



saveData();



updateCart();



displayInventory();



displayProducts();



updateDashboard();



}









// ==============================
// INIT CHECKOUT
// ==============================


function refreshCheckout(){


displayCheckoutProducts();


updateCart();



}

// ==============================
// BARCODE CENTER
// ==============================


function displayBarcodeProducts(){


let box =

document.getElementById(
"barcodeProducts"
);



if(!box)

return;




box.innerHTML="";





let search =

document.getElementById(
"barcodeSearch"
)?.value.toLowerCase() || "";






let category =

document.getElementById(
"barcodeCategory"
)?.value || "All";







products

.filter(p=>{


let nameMatch =

p.name.toLowerCase()

.includes(search);



let catMatch =

category==="All" ||

p.category===category;



return nameMatch && catMatch;



})

.forEach(p=>{





box.innerHTML += `



<div class="barcode-card">



<input

type="checkbox"

${selectedLabels.includes(p.id) ? "checked":""}

onchange="toggleLabel(${p.id})"

>





<h3>

${p.name}

</h3>



<p>

$${p.price.toFixed(2)}

</p>





<svg id="barcode-${p.id}"></svg>






<div class="copy-box">


<label>

Copies:

</label>



<input

type="number"

min="1"

value="${p.copies || 1}"

onchange="changeCopies(${p.id},this.value)"

>



</div>





</div>



`;



});







// Generate preview barcodes

products.forEach(p=>{


let code =

document.getElementById(

"barcode-"+p.id

);



if(code){


JsBarcode(

code,

p.barcode,

{


format:"CODE128",

width:2,

height:60,

displayValue:true


}



);



}



});



}









// ==============================
// SELECT LABELS
// ==============================


function toggleLabel(id){



if(selectedLabels.includes(id)){



selectedLabels =

selectedLabels.filter(

x=>x!==id

);



}

else{


selectedLabels.push(id);



}



}







function selectAllLabels(){



selectedLabels =

products.map(

p=>p.id

);



displayBarcodeProducts();



}





function clearLabels(){



selectedLabels=[];


displayBarcodeProducts();



}









// ==============================
// SAVE COPY NUMBER
// ==============================


function changeCopies(id,value){



let product =

products.find(

p=>p.id===id

);



if(product){



product.copies =

Number(value);



saveData();



}



}









// ==============================
// SEARCH BARCODE PAGE
// ==============================


function searchBarcodes(){


displayBarcodeProducts();



}









// ==============================
// PRINT SELECTED
// ==============================


function printSelectedLabels(){



let items =

products.filter(

p=>

selectedLabels.includes(p.id)

);



printBarcodeLabels(items);



}









// ==============================
// PRINT ALL
// ==============================


function printAllLabels(){



printBarcodeLabels(products);



}









// ==============================
// CREATE PRINT PAGE
// ==============================


function printBarcodeLabels(items){



let area =

document.getElementById(
"printArea"
);



area.innerHTML="";







items.forEach(product=>{



let copies =

product.copies || 1;







for(let i=0;i<copies;i++){





let label =

document.createElement("div");



label.className=

"print-label";





label.innerHTML = `



<h3>

${product.name}

</h3>



<div class="price">

$${product.price.toFixed(2)}

</div>





<svg id="print-${product.id}-${i}"></svg>



`;





area.appendChild(label);







setTimeout(()=>{



JsBarcode(

"#print-"+product.id+"-"+i,

product.barcode,

{


format:"CODE128",

width:2,

height:45,

displayValue:true



}



);



},50);





}



});







setTimeout(()=>{


window.print();



},300);



}









// ==============================
// LABEL SIZE
// ==============================


function applyLabelSize(){



let size =

document.getElementById(
"labelSize"
).value;





let labels =

document.querySelectorAll(
".print-label"
);






labels.forEach(label=>{



if(size==="2x1"){



label.style.width="2in";

label.style.height="1in";

}



if(size==="2.625x1"){


label.style.width="2.625in";

label.style.height="1in";


}




if(size==="3.33x2"){


label.style.width="3.33in";

label.style.height="2in";


}



});



}

// ==============================
// BARCODE SCANNER SYSTEM
// ==============================


function scannerInputScan(){


let input =

document.getElementById(
"scannerInput"
);



let code =

input.value.trim();




if(code){


processScan(code);



}



input.value="";



}









function processScan(code){



let now = Date.now();



// Stop duplicate scans

if(

code===lastScan &&

now-lastScanTime<1200

){


return;


}



lastScan = code;

lastScanTime = now;






let product =

products.find(

p=>p.barcode===code

);





let message =

document.getElementById(
"scannerMessage"
);





if(!product){



message.innerHTML =

"❌ Product not found";



return;


}





let action =

document.getElementById(
"scanAction"
).value;








// ADD TO CART

if(action==="cart"){



addToCart(product.id);



message.innerHTML =

`

✅ Added

<br>

${product.name}

`;



}








// ADD STOCK

if(action==="add"){



product.stock += 1;



saveData();



displayInventory();



updateDashboard();



message.innerHTML =

`

➕

${product.name}

<br>

Stock:

${product.stock}

`;



}








// REMOVE STOCK

if(action==="remove"){



if(product.stock>0){


product.stock -= 1;


}



saveData();



displayInventory();



updateDashboard();



message.innerHTML =

`

➖

${product.name}

<br>

Stock:

${product.stock}

`;



}



}









// ==============================
// IPAD CAMERA SCANNER
// ==============================


function startCameraScanner(){



if(scannerActive)

return;




scannerActive=true;





Quagga.init({



inputStream:{


name:"camera",


type:"LiveStream",



target:

document.querySelector(
"#cameraBox"
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



console.log(error);



return;


}



Quagga.start();



});








Quagga.onDetected(function(result){



let code =

result.codeResult.code;



processScan(code);



setTimeout(()=>{


stopCameraScanner();


},500);



});



}









function stopCameraScanner(){



if(scannerActive){



Quagga.stop();



scannerActive=false;



}



}









// ==============================
// CATEGORIES
// ==============================


function addCategory(){



let input =

document.getElementById(
"newCategory"
);



let name =

input.value.trim();





if(!name)

return;





if(!categories.includes(name)){



categories.push(name);



saveData();



}





input.value="";



updateCategoryDropdowns();



displayCategories();



}









function displayCategories(){



let box =

document.getElementById(
"categoryList"
);



if(!box)

return;




box.innerHTML="";





categories.forEach(c=>{


box.innerHTML += `



<div class="category-card">


${c}



<button onclick="deleteCategory('${c}')">

🗑

</button>



</div>



`;



});



}









function deleteCategory(name){



categories =

categories.filter(

c=>c!==name

);



saveData();



updateCategoryDropdowns();



displayCategories();



}









// ==============================
// SALES HISTORY
// ==============================


function displaySales(){



let box =

document.getElementById(
"salesList"
);



if(!box)

return;



box.innerHTML="";





sales.forEach(s=>{


box.innerHTML += `



<div class="sale-card">


<h3>

${s.payment}

</h3>



${s.date}



<br>



Total:

$${s.total.toFixed(2)}



<br>



${s.items.map(

i=>i.name+" x"+i.qty

).join("<br>")}



</div>



`;



});



}









function clearSales(){



sales=[];



saveData();



displaySales();



updateDashboard();



}









// ==============================
// START APP
// ==============================


window.onload=function(){



updateCategoryDropdowns();



displayProducts();



displayInventory();



displayCheckoutProducts();



displayBarcodeProducts();



displayCategories();



displaySales();



updateDashboard();



updateCart();



};