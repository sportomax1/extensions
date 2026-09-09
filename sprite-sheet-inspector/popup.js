async function send(type){const[t]=await chrome.tabs.query({active:true,currentWindow:true});if(!t?.id)return;try{await chrome.tabs.sendMessage(t.id,{type});window.close()}catch{alert('Refresh this webpage after installing or reloading the extension.')}}
document.getElementById('pick').onclick=()=>send('SSI_PICK');document.getElementById('largest').onclick=()=>send('SSI_LARGEST');
