(() => {
  const panel=document.querySelector('.cosmic-visual');if(!panel)return;
  const canvas=panel.querySelector('canvas'),ctx=canvas.getContext('2d');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let width=0,height=0,frame=0,last=0,elapsed=reduced.matches?15:0,visible=false;
  // Illustrative galaxy distribution, not a fitted cosmological simulation.
  let seed=7311;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const centers=[[.22,.35],[.5,.28],[.77,.48],[.47,.66]];
  const galaxies=Array.from({length:180},(_,i)=>({x:rnd(),y:rnd(),group:i%4,angle:rnd()*Math.PI*2,r:.018+rnd()*.13,size:.6+rnd()*1.8,phase:rnd()*Math.PI*2}));
  const stars=Array.from({length:100},()=>({x:rnd(),y:rnd(),r:.3+rnd()*.8}));
  const glow=(x,y,r,alpha,color)=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${color},${alpha})`);g.addColorStop(1,`rgba(${color},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);};
  const render=()=>{
    ctx.clearRect(0,0,width,height);
    stars.forEach(s=>{ctx.fillStyle='rgba(190,217,245,.35)';ctx.beginPath();ctx.arc(s.x*width,s.y*height,s.r,0,Math.PI*2);ctx.fill();});
    const cycle=elapsed%30,assembly=Math.sin(Math.PI*Math.min(cycle,15)/30)**2;
    const expansion=cycle>15?1+(cycle-15)*.022:1;
    ctx.globalAlpha=Math.max(0,Math.min(1,cycle/1.2,(30-cycle)/1.5));
    centers.forEach((c,i)=>{const cx=(.5+(c[0]-.5)*expansion)*width,cy=(.5+(c[1]-.5)*expansion)*height;glow(cx,cy,width*.12,.08+.12*assembly,i%2?'105,124,226':'63,190,210');});
    ctx.globalCompositeOperation='screen';
    centers.forEach((c,i)=>{
      const cx=(.5+(c[0]-.5)*expansion)*width,cy=(.5+(c[1]-.5)*expansion)*height;
      ctx.save();ctx.translate(cx,cy);ctx.rotate(elapsed*.025+i);ctx.scale(1,.58);
      ctx.strokeStyle=`rgba(139,191,244,${.35*assembly})`;ctx.lineWidth=2;ctx.shadowColor='#6b9dec';ctx.shadowBlur=9;
      for(let arm=0;arm<2;arm++){ctx.beginPath();for(let j=0;j<65;j++){const a=j*.11+arm*Math.PI,r=j*width*.00065;const x=Math.cos(a)*r,y=Math.sin(a)*r;if(!j)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}
      ctx.restore();
    });
    galaxies.forEach(g=>{
      const c=centers[g.group],a=g.angle+elapsed*.06;
      const tx=c[0]+Math.cos(a)*g.r,ty=c[1]+Math.sin(a)*g.r*1.2;
      const px=g.x*(1-assembly)+tx*assembly,py=g.y*(1-assembly)+ty*assembly;
      const x=(.5+(px-.5)*expansion)*width,y=(.5+(py-.5)*expansion)*height;
      const twinkle=.8+.2*Math.sin(elapsed*.5+g.phase);
      glow(x,y,6+g.size*3,.18*twinkle,'122,203,246');
      ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=`rgba(215,237,255,${.7*twinkle})`;
      ctx.beginPath();ctx.ellipse(0,0,g.size*2.1,g.size*.7,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff4d8';ctx.beginPath();ctx.arc(0,0,g.size*.55,0,Math.PI*2);ctx.fill();ctx.restore();
    });
    // Gentle concentric wavefronts suggest a changing cosmic scale.
    if(cycle>15){ctx.strokeStyle='rgba(105,161,222,.08)';ctx.lineWidth=1;for(let i=0;i<3;i++){const r=((cycle-15)*.028+i*.2)% .8;ctx.beginPath();ctx.ellipse(width*.5,height*.45,width*r,height*r*.8,0,0,Math.PI*2);ctx.stroke();}}
    ctx.globalCompositeOperation='source-over';
    ctx.globalAlpha=1;
  };
  const resize=()=>{width=panel.clientWidth;height=panel.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);render();};
  const draw=time=>{frame=0;if(!visible||document.hidden||reduced.matches){last=0;return;}elapsed+=last?Math.min((time-last)/1000,.05):0;last=time;render();frame=requestAnimationFrame(draw);};
  const sync=()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=0;if(visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(draw);else render();};
  new ResizeObserver(resize).observe(panel);new IntersectionObserver(e=>{visible=e[0].isIntersecting;sync();}).observe(panel);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);resize();
})();
