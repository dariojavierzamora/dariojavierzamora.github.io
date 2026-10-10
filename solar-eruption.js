(() => {
  const panel = document.querySelector('.solar-visual');
  if (!panel) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'solar-wind-particles';
  canvas.setAttribute('aria-hidden', 'true');
  panel.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width=0, height=0, frame=0, visible=false, last=0, elapsed=0;
  const sparks=Array.from({length:95},()=>({offset:Math.random(),spread:Math.random()*2-1,size:.7+Math.random()*1.4}));
  const resize=()=>{
    width=panel.clientWidth;height=panel.clientHeight;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=width*dpr;canvas.height=height*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  const glow=(x,y,r,color,alpha)=>{
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,`rgba(${color},${alpha})`);g.addColorStop(1,`rgba(${color},0)`);
    ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
  };
  const paint=phase=>{
    ctx.clearRect(0,0,width,height);ctx.save();ctx.globalCompositeOperation='screen';
    const cy=height*.48, travel=Math.max(0,Math.min(1,(phase-.8)/4.5));
    const impact=Math.max(0,1-Math.abs(phase-6)/1.7);
    glow(width*.14,cy,height*.22,'255,137,26',.16+Math.max(0,1-Math.abs(phase-1)/1.2)*.7);
    if(phase>.8&&phase<5.8){
      const x=width*(.16+.43*travel),spread=height*(.07+.16*travel);
      glow(x,cy,spread*1.5,'255,147,40',.5);
      ctx.shadowColor='#ffb54d';ctx.shadowBlur=20;
      for(let j=0;j<3;j++){
        ctx.strokeStyle=`rgba(255,${190+j*18},${70+j*40},${.7-j*.15})`;ctx.lineWidth=3-j*.6;
        ctx.beginPath();ctx.ellipse(x-width*j*.015,cy,width*.03,spread,0,-Math.PI/2,Math.PI/2);ctx.stroke();
      }
      sparks.forEach(p=>{
        const px=x-width*.12*p.offset,py=cy+p.spread*spread*(1-.3*p.offset);
        ctx.strokeStyle=`rgba(255,210,120,${.8*(1-p.offset)})`;ctx.lineWidth=p.size;
        ctx.beginPath();ctx.moveTo(px-width*.012,py);ctx.lineTo(px,py);ctx.stroke();
      });
    }
    if(impact>0){
      glow(width*.59,cy,height*.25,'80,211,255',impact*.85);
      ctx.shadowColor='#74e9ff';ctx.shadowBlur=24;
      ctx.strokeStyle=`rgba(135,240,255,${impact})`;ctx.lineWidth=3+impact*3;
      ctx.beginPath();ctx.ellipse(width*.795,cy,width*(.205-impact*.012),height*.31,0,Math.PI*.62,Math.PI*1.38);ctx.stroke();
      // Plasma is deflected around the magnetic shield.
      for(const sign of [-1,1]){
        ctx.lineWidth=2;ctx.strokeStyle=`rgba(85,213,255,${impact*.7})`;
        ctx.beginPath();ctx.moveTo(width*.59,cy);ctx.bezierCurveTo(width*.6,cy+sign*height*.3,width*.84,cy+sign*height*.4,width,cy+sign*height*.28);ctx.stroke();
      }
    }
    ctx.restore();
  };
  const draw=time=>{
    frame=0;if(!visible||document.hidden||reduced.matches){last=0;return;}
    elapsed+=last?Math.min((time-last)/1000,.05):0;last=time;
    paint(elapsed%10);frame=requestAnimationFrame(draw);
  };
  const sync=()=>{
    if(frame)cancelAnimationFrame(frame);frame=0;last=0;
    if(visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(draw);
    else ctx.clearRect(0,0,width,height);
  };
  new ResizeObserver(resize).observe(panel);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(panel);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);resize();
})();
