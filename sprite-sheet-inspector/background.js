chrome.runtime.onInstalled.addListener(()=>{
  chrome.contextMenus.removeAll(()=>chrome.contextMenus.create({id:'ssi-image',title:'Inspect image as sprite sheet',contexts:['image']}));
});
chrome.contextMenus.onClicked.addListener(async(info,tab)=>{
  if(info.menuItemId!=='ssi-image'||!tab?.id)return;
  try{await chrome.tabs.sendMessage(tab.id,{type:'SSI_OPEN_URL',url:info.srcUrl})}catch{}
});
