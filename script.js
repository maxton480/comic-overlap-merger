const mergeBtn=document.getElementById("mergeBtn");
mergeBtn.onclick=mergeImages;

async function loadImage(file){
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.src=URL.createObjectURL(file);
  });
}

function findOverlap(img1,img2,ctx){
  let max=250;
  let overlap=0;

  for(let h=30;h<=max;h+=10){

    let d1=ctx.getImageData(
      0,img1.height-h,img1.width,h
    ).data;

    let d2=ctx.getImageData(
      0,0,img2.width,h
    ).data;

    let diff=0;

    for(let i=0;i<d1.length;i+=50){
      diff+=Math.abs(d1[i]-d2[i]);
    }

    if(diff<40000) overlap=h;
  }

  return overlap;
}

async function mergeImages(){

  const files=document.getElementById("images").files;
  if(!files.length) return;

  const bar=document.getElementById("bar");
  const imgs=[];

  for(let i=0;i<files.length;i++){
    imgs.push(await loadImage(files[i]));
    bar.style.width=(i/files.length*25)+"%";
  }

  const temp=document.createElement("canvas");
  const tctx=temp.getContext("2d");

  let overlaps=[0];
  let totalHeight=imgs[0].height;

  for(let i=1;i<imgs.length;i++){

    temp.width=imgs[i-1].width;
    temp.height=imgs[i-1].height;
    tctx.drawImage(imgs[i-1],0,0);

    const overlap=findOverlap(imgs[i-1],imgs[i],tctx);

    overlaps.push(overlap);
    totalHeight+=imgs[i].height-overlap;

    bar.style.width=(25+(i/imgs.length*35))+"%";
  }

  const canvas=document.getElementById("canvas");
  const ctx=canvas.getContext("2d");

  canvas.width=imgs[0].width;
  canvas.height=totalHeight;

  let y=0;

  for(let i=0;i<imgs.length;i++){

    const cut=overlaps[i];

    ctx.drawImage(
      imgs[i],
      0,cut,
      imgs[i].width,
      imgs[i].height-cut,
      0,y,
      imgs[i].width,
      imgs[i].height-cut
    );

    y+=imgs[i].height-cut;

    bar.style.width=(60+(i/imgs.length*40))+"%";
  }

  canvas.toBlob(blob=>{
    const url=URL.createObjectURL(blob);
    const btn=document.getElementById("downloadBtn");
    btn.href=url;
    btn.style.display="inline-block";
  },"image/webp",0.95);

  bar.style.width="100%";
}
