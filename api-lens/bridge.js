(()=>{
 if(window.__apiLensBridgeLoaded)return;window.__apiLensBridgeLoaded=true;
 window.addEventListener('message',e=>{if(e.source!==window||e.data?.source!=='api-lens-sniffer'||e.data.type!=='ENTRY')return;chrome.runtime.sendMessage({type:'API_LENS_SNIFF_ENTRY',entry:e.data.entry}).catch(()=>{})});
 chrome.runtime.onMessage.addListener((m,_s,send)=>{if(m.type==='API_LENS_SET_ENABLED'){window.postMessage({source:'api-lens-control',type:'SET_ENABLED',enabled:!!m.enabled},'*');send({ok:true});return false}return false});
})();
