const input=document.getElementById("images");
const list=document.getElementById("imageList");

let images=[];
let crops=[];

input.onchange=async()=>{

list.innerHTML="";
images=[];
crops=[];

for(let file of input.files){

const img=new Image();
img.src=URL.createObjectURL(file);
await new Promise(r=>img.onload=r);

images.push(img);
crops.push(0);

createCard(img,images.length-1);

}
};

function createCard(img,index){

const div=document.createElement("div");
div.className="card";

div.innerHTML=`
<img src="${img.src}">
<label>Crop repeated top part</label>
<input type="range" min="0" max="${img.height/2}" value="0"
oninput="updateCrop(${index},this.value)">
`;

list.appendChild(div);
}

function updateCrop(i,val){
crops[i]=parseInt(val);
}

function merge(){

if(!images.length)return;

let width=images[0].width;
let height=0;

images.forEach((img,i)=>{
height+=img.height-crops[i];
});

const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");

canvas.width=width;
canvas.height=height;

let y=0;

images.forEach((img,i)=>{

ctx.drawImage(
img,
0,crops[i],
img.width,
img.height-crops[i],
0,y,
img.width,
img.height-crops[i]
);

y+=img.height-crops[i];

});

canvas.toBlob(blob=>{
const url=URL.createObjectURL(blob);
const d=document.getElementById("download");
d.href=url;
d.style.display="block";
},"image/webp",0.95);

}
