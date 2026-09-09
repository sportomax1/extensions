(() => {
  if (window.__emojiKeysLoaded) return;
  window.__emojiKeysLoaded = true;
  const defaultMap={a:"🍎",b:"🍌",c:"🐱",d:"🐶",e:"🐘",f:"🦊",g:"🍇",h:"🏠",i:"🍦",j:"🧃",k:"🥝",l:"🦁",m:"🌙",n:"🥜",o:"🍊",p:"🐧",q:"👑",r:"🌈",s:"⭐",t:"🐯",u:"☂️",v:"🎻",w:"🐋",x:"❌",y:"🪀",z:"🦓"};
  let settings={mode:"off",size:42,duration:700,map:defaultMap};
  chrome.storage.local.get({emojiKeys:settings}).then(x=>settings={...settings,...x.emojiKeys,map:{...defaultMap,...x.emojiKeys?.map}});
  chrome.storage.onChanged.addListener(c=>{if(c.emojiKeys?.newValue)settings={...settings,...c.emojiKeys.newValue,map:{...defaultMap,...c.emojiKeys.newValue.map}}});
  const editable=t=>t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement||t?.isContentEditable;
  function animate(emoji,target){const r=target.getBoundingClientRect(),d=document.createElement("div"),x=Math.min(innerWidth-70,Math.max(8,r.left+Math.min(r.width,120)/2));d.textContent=emoji;Object.assign(d.style,{position:"fixed",left:`${x}px`,top:`${Math.max(8,r.top-10)}px`,fontSize:`${settings.size}px`,zIndex:"2147483647",pointerEvents:"none",transition:`transform ${settings.duration}ms cubic-bezier(.2,.8,.2,1),opacity ${settings.duration}ms ease`,filter:"drop-shadow(0 5px 7px #0007)",willChange:"transform,opacity"});document.documentElement.appendChild(d);requestAnimationFrame(()=>{d.style.transform="translateY(-75px) scale(1.65) rotate(14deg)";d.style.opacity="0"});setTimeout(()=>d.remove(),settings.duration+80)}
  function insert(t,v){if(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement){const a=t.selectionStart??t.value.length,b=t.selectionEnd??a;t.setRangeText(v,a,b,"end");try{t.dispatchEvent(new InputEvent("input",{bubbles:true,inputType:"insertText",data:v}))}catch{t.dispatchEvent(new Event("input",{bubbles:true}))}}else if(t.isContentEditable){document.execCommand("insertText",false,v)}}
  document.addEventListener("keydown",e=>{if(settings.mode==="off"||e.ctrlKey||e.metaKey||e.altKey||e.key.length!==1)return;const k=e.key.toLowerCase(),em=settings.map[k];if(!em||!editable(e.target))return;if(settings.mode==="animate"||settings.mode==="replace")animate(em,e.target);if(settings.mode==="replace"||settings.mode==="insert"){e.preventDefault();e.stopImmediatePropagation();insert(e.target,em)}},true);
})();
