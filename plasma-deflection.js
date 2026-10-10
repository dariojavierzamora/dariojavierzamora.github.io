(() => {
  const panel=document.querySelector('.solar-visual');
  if(!panel)return;
  const canvas=document.createElement('canvas');
  canvas.className='plasma-deflection';canvas.setAttribute('aria-hidden','true');panel.prepend(canvas);
  const ctx=canvas.getContext('2d'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let width=0,height=0,frame=0,last=0,elapsed=0,visible=false;
  const ribbons=Array.from({length:28},(_,i)=>({side:i%2?1:-1,offset:.018+Math.floor(i/2)*.012,phase:(i*.381)%1}));
  const resize=()=>{
    width=panel.clientWidth;height=panel.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  const draw=time=>{
    frame=0;if(!visible||document.hidden||reduced.matches){last=0;return;}
    elapsed+=last?Math.min((time-last)/1000,.05):0;last=time;
    ctx.clearRect(0,0,width,height);ctx.save();ctx.globalCompositeOperation='screen';
    ribbons.forEach(r=>{
      const head=.28+((elapsed*.085+r.phase)%1)*.85;
      const tail=Math.max(.28,head-.16),fade=Math.min(1,(head-.28)/.08)*Math.max(0,Math.min(1,(1.08-head)/.1));
      const g=ctx.createLinearGradient(tail*width,0,head*width,0);
      g.addColorStop(0,'rgba(255,180,70,0)');g.addColorStop(.6,`rgba(255,202,120,${.48*fade})`);g.addColorStop(1,'rgba(255,225,175,0)');
      ctx.strokeStyle=g;ctx.lineWidth=1.2+width*.001;ctx.shadowColor='rgba(255,165,55,.65)';ctx.shadowBlur=5;
      ctx.beginPath();
      for(let j=0;j<=36;j++){
        const x=tail+(head-tail)*j/36;
        // A smooth sunward compression and diversion around an invisible shield.
        const bow=.16*Math.exp(-Math.pow((x-.82)/.155,2));
        const y=.56+r.side*(r.offset+bow);
        if(j===0)ctx.moveTo(x*width,y*height);else ctx.lineTo(x*width,y*height);
      }
      ctx.stroke();
    });
    ctx.restore();frame=requestAnimationFrame(draw);
  };
  const sync=()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=0;
    if(visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(draw);else ctx.clearRect(0,0,width,height);
  };
  new ResizeObserver(resize).observe(panel);new IntersectionObserver(e=>{visible=e[0].isIntersecting;sync();}).observe(panel);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);resize();
})();
