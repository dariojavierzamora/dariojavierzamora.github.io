(() => {
  const panel=document.querySelector('.dipole-visual'), data=window.DIPOLE_FRAMES;
  if(!panel||!data)return;
  const canvas=panel.querySelector('canvas'),ctx=canvas.getContext('2d');
  const status=panel.querySelector('.dipole-status'),pause=panel.querySelector('.dipole-pause'),restart=panel.querySelector('.dipole-restart');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let width=0,height=0,frame=0,last=0,elapsed=0,visible=false,playing=!reduced.matches;
  const language=()=>document.documentElement.dataset.lang||'en';
  const labels=()=>{pause.textContent=language()==='es'?(playing?'Pausar':'Reproducir'):(playing?'Pause':'Play');restart.textContent=language()==='es'?'Reiniciar':'Restart';};
  const render=()=>{
    ctx.clearRect(0,0,width,height);
    const position=Math.max(0,(elapsed-2)/.4),index=Math.min(Math.floor(position),data.frames.length-1);
    const next=Math.min(index+1,data.frames.length-1),fraction=index===next?0:position-index;
    const current=data.frames[index],future=data.frames[next];
    const size=Math.min(width*.8,height-160),spacing=size/data.width;
    const left=(width-size)/2,top=62;
    ctx.lineCap='round';ctx.lineJoin='round';
    for(let i=0;i<current.angles.length;i++){
      const a=current.angles[i],delta=Math.atan2(Math.sin(future.angles[i]-a),Math.cos(future.angles[i]-a));
      const angle=a+delta*fraction;
      const x=left+(i%data.width+.5)*spacing,y=top+(data.width-1-Math.floor(i/data.width)+.5)*spacing;
      const dx=Math.cos(angle)*spacing*.34,dy=-Math.sin(angle)*spacing*.34;
      ctx.fillStyle='rgba(162,216,231,.13)';ctx.beginPath();ctx.arc(x,y,1.1,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=`hsl(${175+35*Math.sin(angle)},75%,68%)`;ctx.lineWidth=Math.max(1.3,spacing*.07);
      ctx.beginPath();ctx.moveTo(x-dx,y-dy);ctx.lineTo(x+dx,y+dy);ctx.stroke();
      const phi=Math.atan2(dy,dx),head=spacing*.19;
      ctx.beginPath();ctx.moveTo(x+dx-head*Math.cos(phi-.5),y+dy-head*Math.sin(phi-.5));ctx.lineTo(x+dx,y+dy);ctx.lineTo(x+dx-head*Math.cos(phi+.5),y+dy-head*Math.sin(phi+.5));ctx.stroke();
    }
    status.textContent=`15 × 15 · T = 0.01 · ${language()==='es'?'Paso':'Step'} ${current.step.toLocaleString(language()==='es'?'es-AR':'en-US')}`;
  };
  const resize=()=>{width=panel.clientWidth;height=panel.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);render();};
  const draw=time=>{
    frame=0;if(!visible||document.hidden||!playing){last=0;return;}
    elapsed+=last?Math.min((time-last)/1000,.05):0;last=time;
    // Hold the final state; restart a fresh relaxation instead of reversing it.
    if(elapsed>2+(data.frames.length-1)*.4+4)elapsed=0;
    render();frame=requestAnimationFrame(draw);
  };
  const sync=()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=0;labels();render();if(visible&&!document.hidden&&playing)frame=requestAnimationFrame(draw);};
  pause.addEventListener('click',()=>{playing=!playing;sync();});
  restart.addEventListener('click',()=>{elapsed=0;sync();});
  new ResizeObserver(resize).observe(panel);new IntersectionObserver(e=>{visible=e[0].isIntersecting;sync();}).observe(panel);
  document.addEventListener('visibilitychange',sync);document.addEventListener('languagechange',()=>{labels();render();});
  reduced.addEventListener('change',()=>{playing=!reduced.matches;sync();});resize();labels();
})();
