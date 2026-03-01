const mergeBtn = document.getElementById("mergeBtn");
mergeBtn.onclick = mergeImages;

async function loadImage(file){
  return new Promise(resolve=>{
    const img = new Image();
    img.onload = ()=>resolve(img);
    img.src = URL.createObjectURL(file);
  });
}

/* -------- SMART OVERLAP DETECTOR -------- */

function getRowData(ctx,y,width){
  return ctx.getImageData(0,y,width,1).data;
}

function rowDifference(a,b){
  let diff = 0;
  for(let i=0;i<a.length;i+=16){
    diff += Math.abs(a[i]-b[i]);
  }
  return diff;
}

function detectOverlap(img1,img2){

  const c1=document.createElement("canvas");
  const c2=document.createElement("canvas");

  c1.width=img1.width;
  c1.height=img1.height;

  c2.width=img2.width;
  c2.height=img2.height;

  const ctx1=c1.getContext("2d");
  const ctx2=c2.getContext("2d");

  ctx1.drawImage(img1,0,0);
  ctx2.drawImage(img2,0,0);

  const maxCheck = Math.min(400,img1.height,img2.height);

  let bestOverlap = 0;
  let bestScore = Infinity;

  // try many overlap heights
  for(let overlap=40; overlap<=maxCheck; overlap+=4){

    let score=0;
    let samples=8;

    for(let s=0;s<samples;s++){

      let y1 = img1.height-overlap + Math.floor(s*(overlap/samples));
      let y2 = Math.floor(s*(overlap/samples));

      let row1=getRowData(ctx1,y1,img1.width);
      let row2=getRowData(ctx2,y2,img2.width);

      score += rowDifference(row1,row2);
    }

    if(score < bestScore){
      bestScore = score;
      bestOverlap = overlap;
    }
  }

  // safety threshold
  if(bestScore > 200000) return 0;

  return bestOverlap;
}

/* -------- MERGE ENGINE -------- */

async function mergeImages(){

  const files=document.getElementById("images").files;
  if(!files.length) return;

  const bar=document.getElementById("bar");
  const imgs=[];

  for(let i=0;i<files.length;i++){
    imgs.push(await loadImage(files[i]));
    bar.style.width=(i/files.length*20)+"%";
  }

  let overlaps=[0];
  let totalHeight=imgs[0].height;

  for(let i=1;i<imgs.length;i++){

    const overlap = detectOverlap(imgs[i-1],imgs[i]);

    console.log("Overlap found:",overlap);

    overlaps.push(overlap);
    totalHeight += imgs[i].height - overlap;

    bar.style.width=(20+(i/imgs.length*30))+"%";
  }

  const canvas=document.getElementById("canvas");
  const ctx=canvas.getContext("2d");

  canvas.width=imgs[0].width;
  canvas.height=totalHeight;

  let y=0;

  for(let i=0;i<imgs.length;i++){

    const cut = overlaps[i];

    ctx.drawImage(
      imgs[i],
      0,cut,
      imgs[i].width,
      imgs[i].height-cut,
      0,y,
      imgs[i].width,
      imgs[i].height-cut
    );

    y += imgs[i].height-cut;

    bar.style.width=(50+(i/imgs.length*40))+"%";
  }

  canvas.toBlob(blob=>{
    const url=URL.createObjectURL(blob);
    const btn=document.getElementById("downloadBtn");
    btn.href=url;
    btn.style.display="inline-block";
  },"image/webp",0.95);

  bar.style.width="100%";
}
