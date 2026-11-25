  function detect(data,w,h){
    // Otsu threshold followed by connected dark borders and corner sampling.
    const gray=new Uint8Array(w*h),hist=new Uint32Array(256);
    let total=0;
    for(let i=0;i<gray.length;i++){const v=(data[i*4]*77+data[i*4+1]*150+data[i*4+2]*29)>>8;gray[i]=v;hist[v]++;total+=v}
    let count=0,sum=0,best=0,t=0;
    for(let k=0;k<255;k++){count+=hist[k];sum+=hist[k]*k;if(!count||count===gray.length)continue;
      const score=(sum/count-(total-sum)/(gray.length-count))**2*count*(gray.length-count);
      if(score>best){best=score;t=k}}
    if(!best)return [];
    const seen=new Uint8Array(w*h),queue=new Int32Array(w*h),found=[];
    for(let start=0;start<gray.length;start++){
      if(seen[start]||gray[start]>t)continue;
      let end=1, tl=start,tr=start,br=start,bl=start,lo=Infinity,hi=-Infinity,ld=Infinity,hd=-Infinity;
      queue[0]=start;seen[start]=1;
      function push(j){if(!seen[j]&&gray[j]<=t){seen[j]=1;queue[end++]=j}}
      for(let p=0;p<end;p++){
        const i=queue[p],x=i%w,y=Math.floor(i/w),s=x+y,d=x-y;
        if(s<lo){lo=s;tl=i} if(s>hi){hi=s;br=i} if(d<ld){ld=d;bl=i} if(d>hd){hd=d;tr=i}
        if(x)push(i-1);if(x+1<w)push(i+1);if(y)push(i-w);if(y+1<h)push(i+w);
      }
      if(end<150)continue;
      const corners=[tl,tr,br,bl].map(i=>[i%w,Math.floor(i/w)]);
      const lengths=corners.map(([x,y],i)=>Math.hypot(x-corners[(i+1)%4][0],y-corners[(i+1)%4][1]));
      if(Math.min(...lengths)<24||Math.max(...lengths)>2*Math.min(...lengths))continue;
      const [[ax,ay],[bx,by],[cx,cy],[dx,dy]]=corners;
      const ex=bx-cx,ey=by-cy,fx=dx-cx,fy=dy-cy,sx=ax-bx+cx-dx,sy=ay-by+cy-dy,det=ex*fy-fx*ey;
      if(!det)continue;
      const g=(sx*fy-fx*sy)/det,j=(ex*sy-sx*ey)/det;
      let bits="",ok=true;
      for(let y=0;y<6&&ok;y++)for(let x=0;x<6;x++){
        const u=(x+.5)/6,v=(y+.5)/6,z=g*u+j*v+1;
        const px=Math.round((ax+(bx-ax+g*bx)*u+(dx-ax+j*dx)*v)/z);
        const py=Math.round((ay+(by-ay+g*by)*u+(dy-ay+j*dy)*v)/z);
        const light=gray[py*w+px]>t;
        if(x===0||x===5||y===0||y===5){if(light){ok=false;break}}else bits+=light?"1":"0";
      }
      const match=ok&&variants.get(bits);
      const angle=Math.atan2(by-ay,bx-ax)*180/Math.PI;
      if(match && Math.abs(angle)<45-cardDictionary.margin)found.push({...match,corners});
    }
    return found;
  }
