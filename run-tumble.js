(() => {
  const panel=document.querySelector('.stochastic-visual');if(!panel)return;
  const canvas=panel.querySelector('canvas'),ctx=canvas.getContext('2d');
  const pause=panel.querySelector('.run-pause'),restart=panel.querySelector('.run-restart');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let width=0,height=0,frame=0,last=0,visible=false,playing=!reduced.matches;
  let x=0,y=0,angle=0,nextTumble=0,blocked=false,elapsed=0,trail=[];
  const wait=()=>-.95*Math.log(Math.max(1e-9,1-Math.random()));
  const reset=()=>{x=0;y=0;angle=Math.random()*Math.PI*2;nextTumble=wait();blocked=false;elapsed=0;trail=[[0,0]];};
  const labels=()=>{const es=document.documentElement.dataset.lang==='es';pause.textContent=es?(playing?'Pausar':'Reproducir'):(playing?'Pause':'Play');restart.textContent=es?'Reiniciar':'Restart';};
  const advance=dt=>{
    elapsed+=dt;
    if(elapsed>55){reset();return;}
    // Constant-speed runs, exponential waiting times, isotropic tumbles.
    // An impenetrable circular wall holds the particle until it points inward.
    let remaining=dt;
    while(remaining>1e-8){
      const h=Math.min(remaining,nextTumble);remaining-=h;nextTumble-=h;
      if(!blocked){
        const dx=Math.cos(angle)*.5*h,dy=Math.sin(angle)*.5*h;
        if((x+dx)**2+(y+dy)**2>1){
          const a=dx*dx+dy*dy,b=2*(x*dx+y*dy),c=x*x+y*y-1;
          const t=a?Math.max(0,Math.min(1,(-b+Math.sqrt(Math.max(0,b*b-4*a*c)))/(2*a))):0;
          x+=dx*t;y+=dy*t;blocked=true;
        }else{x+=dx;y+=dy;}
        trail.push([x,y]);if(trail.length>4000)trail.shift();
      }
      if(nextTumble<=1e-8){angle=Math.random()*Math.PI*2;nextTumble=wait();blocked=x*x+y*y>.999999&&(x*Math.cos(angle)+y*Math.sin(angle)>=0);}
    }
  };
  const render=()=>{
    ctx.clearRect(0,0,width,height);
    const radius=Math.max(1,Math.min(width-40,height-78)/2),cx=width/2,cy=48+(height-54)/2;
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#37a15a';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,radius+1,0,Math.PI*2);ctx.clip();
    ctx.strokeStyle='rgba(247,133,26,.76)';ctx.lineWidth=1.6;ctx.lineJoin='round';ctx.beginPath();
    trail.forEach((p,i)=>{const px=cx+p[0]*radius,py=cy-p[1]*radius;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);});ctx.stroke();ctx.restore();
    ctx.fillStyle='#ff8a1c';ctx.shadowColor='rgba(255,143,32,.35)';ctx.shadowBlur=9;
    ctx.beginPath();ctx.arc(cx+x*radius,cy-y*radius,5.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
  };
  const resize=()=>{width=panel.clientWidth;height=panel.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);render();};
  const draw=time=>{frame=0;if(!visible||document.hidden||!playing){last=0;return;}const dt=last?Math.min((time-last)/1000,.05):0;last=time;advance(dt*2);render();frame=requestAnimationFrame(draw);};
  const sync=()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=0;labels();render();if(visible&&!document.hidden&&playing)frame=requestAnimationFrame(draw);};
  pause.addEventListener('click',()=>{playing=!playing;sync();});restart.addEventListener('click',()=>{reset();sync();});
  reset();new ResizeObserver(resize).observe(panel);new IntersectionObserver(e=>{visible=e[0].isIntersecting;sync();}).observe(panel);
  document.addEventListener('visibilitychange',sync);document.addEventListener('languagechange',labels);reduced.addEventListener('change',()=>{playing=!reduced.matches;sync();});resize();labels();
})();
