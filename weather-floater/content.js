(() => {
  if (window.__weatherFloaterLoaded) return;
  window.__weatherFloaterLoaded = true;

  const CODES = {
    0:["Clear","☀️"],1:["Mostly clear","🌤️"],2:["Partly cloudy","⛅"],3:["Cloudy","☁️"],
    45:["Fog","🌫️"],48:["Fog","🌫️"],51:["Drizzle","🌦️"],53:["Drizzle","🌦️"],55:["Drizzle","🌧️"],
    61:["Rain","🌧️"],63:["Rain","🌧️"],65:["Heavy rain","🌧️"],71:["Snow","🌨️"],73:["Snow","🌨️"],
    75:["Heavy snow","❄️"],80:["Showers","🌦️"],81:["Showers","🌧️"],82:["Heavy showers","⛈️"],95:["Thunderstorm","⛈️"]
  };
  const defaults = { visible:true, units:"fahrenheit", location:null, x:null, y:null };
  let settings = { ...defaults };

  const host = document.createElement("div");
  host.id = "weather-floater-host";
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode:"open" });
  shadow.innerHTML = `
  <style>
    *{box-sizing:border-box}#w{position:fixed;right:20px;bottom:20px;width:330px;background:rgba(10,18,34,.96);color:#fff;z-index:2147483646;border-radius:18px;border:1px solid #334155;box-shadow:0 18px 55px #0008;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;backdrop-filter:blur(16px)}
    #bar{padding:10px;display:flex;gap:6px;align-items:center;cursor:move;background:#111b30;border-bottom:1px solid #24324a}input{min-width:0;flex:1;background:#0b1325;color:#fff;border:1px solid #475569;border-radius:9px;padding:8px 9px;outline:none}button{background:#263752;color:#fff;border:0;border-radius:9px;padding:8px 9px;cursor:pointer;font-weight:700}button:hover{filter:brightness(1.15)}#go{background:#2563eb}#close{background:#7f1d1d}.body{padding:14px}.hero{display:flex;align-items:center;justify-content:space-between;gap:10px}.place{font-size:14px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.temp{font-size:46px;line-height:1;font-weight:850;letter-spacing:-2px}.icon{font-size:42px}.summary{margin-top:5px;color:#cbd5e1;font-size:12px;line-height:1.45}.details{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0}.stat{background:#162238;border:1px solid #263956;border-radius:10px;padding:8px}.stat span{display:block;color:#94a3b8;font-size:10px;text-transform:uppercase}.stat b{font-size:12px}.days{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}.day{background:#162238;border-radius:9px;padding:7px 3px;text-align:center;font-size:10px}.day b,.day i,.day span{display:block}.day i{font-style:normal;font-size:18px;margin:3px 0}.day span{color:#94a3b8}.status{color:#94a3b8;font-size:12px;padding:4px 0}.error{color:#fca5a5}.footer{display:flex;justify-content:space-between;gap:8px;margin-top:9px;color:#64748b;font-size:9px}.hidden{display:none!important}
  </style>
  <section id="w">
    <div id="bar"><input id="q" placeholder="City, ZIP, or place"><button id="go">Go</button><button id="loc" title="Use current location">◎</button><button id="unit" title="Toggle °F / °C">°F</button><button id="close">×</button></div>
    <div id="body" class="body"><div class="status">Search a location or use ◎.</div></div>
  </section>`;

  const w = shadow.querySelector("#w"), body = shadow.querySelector("#body"), q = shadow.querySelector("#q"), unitBtn = shadow.querySelector("#unit");
  const unitSymbol = () => settings.units === "fahrenheit" ? "°F" : "°C";
  const windUnit = () => settings.units === "fahrenheit" ? "mph" : "km/h";
  const weatherInfo = code => CODES[code] || ["Weather","🌤️"];

  async function save() { await chrome.storage.local.set({ weatherFloater: settings }); }
  function setStatus(text, isError=false){ body.innerHTML = `<div class="status ${isError?"error":""}">${escapeHtml(text)}</div>`; }
  function escapeHtml(v){ return String(v ?? "").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
  function position(){ if(Number.isFinite(settings.x)&&Number.isFinite(settings.y)){ w.style.right="auto";w.style.bottom="auto";w.style.left=`${settings.x}px`;w.style.top=`${settings.y}px`; } }

  async function loadWeather(lat, lon, name, country="") {
    setStatus("Loading weather…");
    try {
      const tempUnit = settings.units;
      const wind = tempUnit === "fahrenheit" ? "mph" : "kmh";
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&temperature_unit=${tempUnit}&wind_speed_unit=${wind}&timezone=auto&forecast_days=7`;
      const r = await fetch(url, { cache:"no-store" });
      if (!r.ok) throw new Error(`Weather HTTP ${r.status}`);
      const d = await r.json();
      const c = d.current, daily = d.daily, [label,icon] = weatherInfo(c.weather_code);
      const days = daily.time.map((date,i)=>{ const [dl,di]=weatherInfo(daily.weather_code[i]); return `<div class="day" title="${escapeHtml(dl)}"><b>${new Date(date+"T12:00").toLocaleDateString([],{weekday:"short"})}</b><i>${di}</i><strong>${Math.round(daily.temperature_2m_max[i])}°</strong><span>${Math.round(daily.temperature_2m_min[i])}°</span></div>`; }).join("");
      const precip = daily.precipitation_probability_max?.[0];
      body.innerHTML = `<div class="hero"><div><div class="place">${escapeHtml(name)}${country?`, ${escapeHtml(country)}`:""}</div><div class="temp">${Math.round(c.temperature_2m)}°</div></div><div class="icon">${icon}</div></div>
        <div class="summary">${escapeHtml(label)} · Feels ${Math.round(c.apparent_temperature)}°</div>
        <div class="details"><div class="stat"><span>Humidity</span><b>${Math.round(c.relative_humidity_2m)}%</b></div><div class="stat"><span>Wind</span><b>${Math.round(c.wind_speed_10m)} ${windUnit()}</b></div><div class="stat"><span>Rain/Snow</span><b>${precip == null ? "—" : Math.round(precip)+"%"}</b></div></div>
        <div class="days">${days}</div><div class="footer"><span>Open-Meteo</span><span>${escapeHtml(d.timezone || "")}</span></div>`;
      settings.location = { lat, lon, name, country };
      await save();
    } catch (e) { setStatus(`Weather request failed: ${e.message}`, true); }
  }

  async function search(){
    const term=q.value.trim(); if(!term) return;
    setStatus("Searching…");
    try{
      const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=8&language=en&format=json`,{cache:"no-store"});
      if(!r.ok) throw new Error(`Search HTTP ${r.status}`);
      const d=await r.json(), a=d.results?.[0]; if(!a) throw new Error("Location not found");
      q.value=""; await loadWeather(a.latitude,a.longitude,[a.name,a.admin1].filter(Boolean).join(", "),a.country_code||"");
    }catch(e){setStatus(e.message,true)}
  }

  shadow.querySelector("#go").onclick=search;
  q.onkeydown=e=>{if(e.key==="Enter") search()};
  shadow.querySelector("#loc").onclick=()=>navigator.geolocation.getCurrentPosition(p=>loadWeather(p.coords.latitude,p.coords.longitude,"Current location"),e=>setStatus(`Location unavailable: ${e.message}`,true),{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
  unitBtn.onclick=async()=>{settings.units=settings.units==="fahrenheit"?"celsius":"fahrenheit";unitBtn.textContent=unitSymbol();await save();if(settings.location)loadWeather(settings.location.lat,settings.location.lon,settings.location.name,settings.location.country)};
  shadow.querySelector("#close").onclick=async()=>{settings.visible=false;w.classList.add("hidden");await save()};
  chrome.runtime.onMessage.addListener(async m=>{if(m?.type!=="WX_TOGGLE")return;settings.visible=!settings.visible;w.classList.toggle("hidden",!settings.visible);await save()});

  let drag=null, bar=shadow.querySelector("#bar");
  bar.onpointerdown=e=>{if(["INPUT","BUTTON"].includes(e.target.tagName))return;const r=w.getBoundingClientRect();drag=[e.clientX-r.left,e.clientY-r.top];w.style.right="auto";w.style.bottom="auto";bar.setPointerCapture(e.pointerId)};
  bar.onpointermove=e=>{if(!drag)return;const x=Math.max(0,Math.min(innerWidth-w.offsetWidth,e.clientX-drag[0])),y=Math.max(0,Math.min(innerHeight-w.offsetHeight,e.clientY-drag[1]));w.style.left=`${x}px`;w.style.top=`${y}px`;settings.x=x;settings.y=y};
  bar.onpointerup=async()=>{if(drag){drag=null;await save()}};

  chrome.storage.local.get({weatherFloater:defaults}).then(({weatherFloater})=>{settings={...defaults,...weatherFloater};unitBtn.textContent=unitSymbol();w.classList.toggle("hidden",!settings.visible);position();if(settings.location)loadWeather(settings.location.lat,settings.location.lon,settings.location.name,settings.location.country)});
})();
