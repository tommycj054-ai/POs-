let products = JSON.parse(localStorage.getItem("products")) || [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [];

let cart = [];
let editingID = null;
let currentCategory = "All";





function saveData(){

localStorage.setItem(
"products",
JSON.stringify(products)
);

localStorage.setItem(
"sales",
JSON.stringify(sales)
);

localStorage.setItem(
"todos",
JSON.stringify(todos)
);

localStorage.setItem(
"categories",
JSON.stringify(categories)
);

}








// PAGE SWITCH


function showPage(page){


document.querySelectorAll(".page")
.forEach(p=>{
p.classList.remove("active");
});


document.getElementById(page)
.classList.add("active");



if(page==="dashboard"){

updateDashboard();
displayTodos();

}



if(page==="checkout"){

displayCategoryButtons();
displayProducts();

}



if(page==="inventory")
displayInventory();



if(page==="categories"){

displayCategories();

}



if(page==="sales")
displaySales();


}









// DASHBOARD


function updateDashboard(){


document.getElementById("productCount")
.innerText=products.length;



document.getElementById("inventoryCount")
.innerText=
products.reduce(
(a,p)=>a+p.stock,
0
);



document.getElementById("lowStock")
.innerText=
products.filter(
p=>p.stock<=2
).length;



document.getElementById("itemsSold")
.innerText=
sales.reduce(
(t,s)=>
t+
s.items.reduce(
(a,i)=>a+i.qty,
0
),
0
);



displayLowStock();

displayBestSellers();

displayCategoryStock();


}








// CATEGORY STOCK


function displayCategoryStock(){


let box =
document.getElementById("categoryStock");


if(!box)
return;


box.innerHTML="";


categories.forEach(c=>{


let total =
products
.filter(p=>p.category===c)
.reduce(
(a,p)=>a+p.stock,
0
);



box.innerHTML +=`

<div class="sales-item">

📦 ${c}

<br>

${total} items

</div>

`;


});


}









// CATEGORY MANAGEMENT


function addCategory(){


let input =
document.getElementById("categoryName");


let name =
input.value.trim();



if(!name)
return;



if(!categories.includes(name)){

categories.push(name);

saveData();

}



input.value="";


displayCategories();

updateCategoryDropdowns();

displayCategoryButtons();


}







function displayCategories(){


let box =
document.getElementById("categoryList");


if(!box)
return;



box.innerHTML="";



categories.forEach((c,i)=>{


box.innerHTML +=`

<div class="category-card">


<span>

${c}

</span>


<button onclick="deleteCategory(${i})">

Delete

</button>


</div>

`;



});


}







function deleteCategory(index){


let name =
categories[index];



products.forEach(p=>{

if(p.category===name)

p.category="";

});



categories.splice(index,1);


saveData();


displayCategories();

updateCategoryDropdowns();

displayProducts();


}








// DROPDOWN UPDATE


function updateCategoryDropdowns(){


let selects=[

document.getElementById("productCategory"),

document.getElementById("editCategory")

];



selects.forEach(select=>{


if(!select)
return;


select.innerHTML="";


categories.forEach(c=>{


select.innerHTML +=`

<option>

${c}

</option>

`;

});


});


}









// CHECKOUT CATEGORY BUTTONS


function displayCategoryButtons(){


let box =
document.getElementById("categoryButtons");


if(!box)
return;


box.innerHTML="";



box.innerHTML +=`

<button onclick="filterCategory('All')">

All

</button>

`;



categories.forEach(c=>{


box.innerHTML +=`

<button onclick="filterCategory('${c}')">

${c}

</button>

`;


});


}







function filterCategory(category){

currentCategory=category;

displayProducts();

}









// PRODUCTS


function displayProducts(){


let box =
document.getElementById("products");


if(!box)
return;


box.innerHTML="";



products
.filter(p=>{

if(currentCategory==="All")
return true;


return p.category===currentCategory;


})
.forEach(p=>{


box.innerHTML +=`

<div class="product"
onclick="addToCart(${p.id})">


${p.image
?
`<img src="${p.image}">`
:
"📦"
}



<h3>

${p.name}

</h3>


<p>

$${p.price}

</p>


<small>

${p.category}

</small>


</div>


`;


});


}








function searchProducts(){


let text =
document.getElementById("search")
.value.toLowerCase();



let box =
document.getElementById("products");



box.innerHTML="";



products
.filter(p=>
p.name.toLowerCase()
.includes(text)
)
.forEach(p=>{


box.innerHTML+=`

<div class="product"
onclick="addToCart(${p.id})">


${p.image
?
`<img src="${p.image}">`
:
"📦"
}


<h3>${p.name}</h3>


<p>$${p.price}</p>


</div>

`;


});


}









// ADD PRODUCT


function saveProduct(){


let product={


id:Date.now(),

name:
productName.value,


price:
Number(productPrice.value),


stock:
Number(productStock.value),


category:
productCategory.value,


image:""


};



let file =
productImage.files[0];



if(file){


let reader =
new FileReader();


reader.onload=e=>{


product.image=e.target.result;


products.push(product);


saveData();


};


reader.readAsDataURL(file);



}else{


products.push(product);

saveData();


}



showPage("inventory");


}









// EDIT PRODUCT


function editProduct(id){


let p =
products.find(
x=>x.id===id
);


editingID=id;


editName.value=p.name;

editPrice.value=p.price;

editStock.value=p.stock;

editCategory.value=p.category;



showPage("editProduct");


}





function updateProduct(){


let p =
products.find(
x=>x.id===editingID
);



p.name=editName.value;

p.price=Number(editPrice.value);

p.stock=Number(editStock.value);

p.category=editCategory.value;



saveData();


showPage("inventory");


}









// INVENTORY


function displayInventory(){


let box =
document.getElementById("inventoryList");


box.innerHTML="";



products.forEach(p=>{


box.innerHTML+=`

<div class="inventory-item">


${p.image
?
`<img src="${p.image}">`
:
""}



<h3>${p.name}</h3>


Category:
${p.category}


<br>


Stock:
${p.stock}



<br>


<button onclick="editProduct(${p.id})">

✏️ Edit

</button>


<button onclick="addStock(${p.id})">

+

</button>


<button onclick="removeStock(${p.id})">

-

</button>


<button onclick="deleteProduct(${p.id})">

Delete

</button>



</div>


`;


});


}






function addStock(id){

let p=products.find(x=>x.id===id);

p.stock++;

saveData();

displayInventory();

}





function removeStock(id){

let p=products.find(x=>x.id===id);


if(p.stock>0)
p.stock--;


saveData();

displayInventory();


}





function deleteProduct(id){


products =
products.filter(
p=>p.id!==id
);


saveData();

displayInventory();


}









// CART


function addToCart(id){


let p =
products.find(
x=>x.id===id
);



let item =
cart.find(
x=>x.id===id
);



if(item)

item.qty++;


else

cart.push({

id:p.id,

name:p.name,

price:p.price,

qty:1

});


updateCart();


}





function updateCart(){


let box =
document.getElementById("cartItems");


box.innerHTML="";


let total=0;



cart.forEach(i=>{


total+=i.price*i.qty;


box.innerHTML+=`

<div class="cart-item">

${i.name}

x${i.qty}

</div>

`;


});



document.getElementById("total")
.innerText=total.toFixed(2);


}







function clearCart(){

cart=[];

updateCart();

}








// PAYMENT


function pay(type){


cart.forEach(i=>{


let p =
products.find(
x=>x.id===i.id
);


p.stock-=i.qty;


});



sales.push({

date:new Date()
.toLocaleString(),

payment:type,

items:[...cart]

});



saveData();


clearCart();

updateDashboard();

displayProducts();


}









// SALES


function displaySales(){


let box=
document.getElementById("salesList");


box.innerHTML="";



sales.forEach(s=>{


box.innerHTML+=`

<div class="sales-item">

${s.date}

<br>

${s.payment}

</div>

`;


});


}





function clearSales(){

sales=[];

saveData();

displaySales();

}









// TODO


function addTodo(){

let input=todoInput;


if(!input.value)
return;


todos.push({

text:input.value

});


input.value="";


saveData();

displayTodos();

}



function displayTodos(){


let box=
document.getElementById("todoList");


if(!box)
return;


box.innerHTML="";


todos.forEach((t,i)=>{


box.innerHTML+=`

<div class="todo-item">

${t.text}


<button onclick="todos.splice(${i},1);saveData();displayTodos();">

X

</button>


</div>

`;


});


}








updateCategoryDropdowns();

updateDashboard();

displayProducts();

displayTodos();