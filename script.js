const OVERLAP = 252; // calibrated value

const input = document.getElementById("images");
const button = document.getElementById("mergeBtn");
const bar = document.getElementById("bar");

button.addEventListener("click", mergeImages);

function loadImage(file){
  return new Promise(resolve=>{
    const img = new Image();
    img.onload = ()=>resolve(img);
    img.src = URL.createObjectURL(file);
  });
}

async function mergeImages(){

  const files = input.files;

  if(files.length === 0){
    alert("Select images first");
    return;
  }

  bar.style.width="0%";

  const images=[];

  for(let i=0;i<files.length;i++){
    images.push(await loadImage(files[i]));
    bar.style.width=((i+1)/files.length*30)+"%";
  }

  const width = images[0].width;

  let totalHeight = images[0].height;

  for(let i=1;i<images.length;i++){
    totalHeight += images[i].height - OVERLAP;
  }

  const canvas=document.getElementById("canvas");
  const ctx=canvas.getContext("2d");

  canvas.width = width;
  canvas.height = totalHeight;

  let y=0;

  ctx.drawImage(images[0],0,y);
  y += images[0].height;

  for(let i=1;i<images.length;i++){

    ctx.drawImage(
      images[i],
      0,OVERLAP,
      width,images[i].height-OVERLAP,
      0,y,
      width,images[i].height-OVERLAP
    );

    y += images[i].height-OVERLAP;

    bar.style.width=(30+(i/images.length)*70)+"%";
  }

  const link=document.getElementById("download");

  link.href = canvas.toDataURL("image/png");
  link.download="merged_comic.png";
  link.innerText="⬇ Download Comic";

  bar.style.width="100%";
}
