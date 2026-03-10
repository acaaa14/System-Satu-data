function searchDataset(){

let input=document.getElementById("search").value.toLowerCase()

let items=document.getElementsByClassName("dataset-item")

for(let i=0;i<items.length;i++){

let text=items[i].innerText.toLowerCase()

if(text.includes(input)){

items[i].style.display="block"

}else{

items[i].style.display="none"

}

}

}