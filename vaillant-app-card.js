/* Vaillant App Card v1.0.0 — independent custom card, no external dependencies. */
(() => {
  const DEFAULTS = {
    climate: 'climate.haus_zone_1_circuit_0_climate',
    water_heater: 'water_heater.haus_domestic_hot_water_0',
    room: 'sensor.haus_zone_1_circuit_0_current_temperature',
    humidity: 'sensor.haus_zone_1_circuit_0_humidity',
    outdoor: 'sensor.haus_outdoor_temperature',
    tank: 'sensor.haus_domestic_hot_water_0_tank_temperature',
    water_target: 'sensor.haus_domestic_hot_water_0_setpoint',
    heating_target: 'sensor.haus_zone_1_circuit_0_desired_temperature',
    heating_mode: 'sensor.haus_zone_1_circuit_0_heating_operating_mode',
    flow: 'sensor.haus_circuit_0_current_flow_temperature',
    flow_target: 'sensor.heitzkreis_haus_circuit_0_flow_temperature_setpoint',
    system_flow: 'sensor.haus_system_flow_temperature',
    pressure: 'sensor.haus_system_water_pressure',
    online: 'binary_sensor.haus_online_status',
    trouble: 'binary_sensor.haus_trouble_codes',
    operating_state: 'sensor.haus_energy_manager_state',
    circuit_state: 'sensor.haus_circuit_0_state',
    boost: 'switch.haus_domestic_hot_water_0_boost',
    ventilation: 'switch.haus_zone_1_circuit_0_ventilation_boost',
    away: 'switch.haus_away_mode',
    heating_curve: 'number.haus_circuit_0_heating_curve',
    veto_duration: 'number.haus_zone_1_circuit_0_quick_veto_duration',
    efficiency: 'sensor.haus_heating_energy_efficiency',
    firmware: 'sensor.haus_firmware_version',
    firmware_update: 'binary_sensor.haus_firmware_update_required',
    heating_calendar: 'calendar.haus_zone_1_circuit_0',
    water_calendar: 'calendar.haus_domestic_hot_water_0',
    circulation_calendar: 'calendar.circulating_water_in_haus_domestic_hot_water_0',
    electric_heating: 'sensor.garten_wp_ausseneinheit_haus_device_1_arotherm_plus_consumed_electrical_energy_heating',
    electric_water: 'sensor.garten_wp_ausseneinheit_haus_device_1_arotherm_plus_consumed_electrical_energy_domestic_hot_water',
    environment_heating: 'sensor.garten_wp_ausseneinheit_haus_device_1_arotherm_plus_earned_environment_energy_heating',
    environment_water: 'sensor.garten_wp_ausseneinheit_haus_device_1_arotherm_plus_earned_environment_energy_domestic_hot_water',
    heat_heating: 'sensor.garten_wp_ausseneinheit_haus_device_1_arotherm_plus_heat_generated_heating',
    heat_water: 'sensor.garten_wp_ausseneinheit_haus_device_1_arotherm_plus_heat_generated_domestic_hot_water',
    hydraulic_electric: 'sensor.hwr_hydraulik_station_haus_device_0_hydraulic_station_consumed_electrical_energy_heating',
    hydraulic_heat: 'sensor.hwr_hydraulik_station_haus_device_0_hydraulic_station_heat_generated_heating'
  };
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const numeric = v => v !== null && v !== undefined && String(v).trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null;
  const fmt = (v, digits=1) => numeric(v) === null ? '—' : Number(v).toLocaleString('de-DE', {minimumFractionDigits:digits, maximumFractionDigits:digits});
  const paths = {
    home:'M3 10 12 3l9 7M5 9v12h14V9M9 21v-7h6v7',
    heat:'M7 3c-5 6 5 6 0 12m5-12c-5 6 5 6 0 12m5-12c-5 6 5 6 0 12',
    water:'M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Z',
    energy:'m13 2-9 12h7l-1 8 10-13h-8l1-7Z',
    status:'M2 12h5l3-8 4 16 3-8h5',
    arrow:'m9 5 7 7-7 7', back:'m15 5-7 7 7 7',
    check:'M9 12l2 2 4-5M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
    calendar:'M4 5h16v16H4ZM8 2v6m8-6v6M4 10h16',
    settings:'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-8 0v6',
    wind:'M3 8h12a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h6',
    clock:'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
    info:'M12 11v6m0-10v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
    leaf:'M20 3C5 2 2 10 6 16c5 6 15-1 14-13ZM4 21 16 8',
    temp:'M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Zm3-8v11',
    pressure:'M5 19a10 10 0 1 1 14 0M12 12l5-5M6 19h12'
  };
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.info}"/></svg>`;
  const modeName = v => ({auto:'Zeitgesteuert', heat_cool:'Manuell', heat:'Heizen', cool:'Kühlen', off:'Aus',
    'Time Controlled':'Zeitgesteuert', TIME_CONTROLLED:'Zeitgesteuert', 'Manual':'Manuell', MANUAL:'Manuell',
    'Off':'Aus', 'Cylinder Boost':'Warmwasser schnell', HEATING:'Heizen', COOLING:'Kühlen',
    DHW:'Warmwasser', DOMESTIC_HOT_WATER:'Warmwasser', STANDBY:'Bereitschaft', IDLE:'Bereitschaft',
    'none':'Normal', boost:'Temporäre Änderung', away:'Abwesend', sleep:'Absenkung', eco:'Eco',
    'Quick Veto':'Temporäre Änderung', 'Regular':'Normal'})[v] || v || 'Nicht verfügbar';
  const CSS = `
    :host{display:block;--va-bg:#101314;--va-panel:#1c201f;--va-line:#303634;--va-fg:#f0f3f1;--va-sub:#a7afab;--va-green:#00b59c;--va-orange:#e79a32;font-family:Roboto,"Segoe UI",sans-serif;color:var(--va-fg)}
    *{box-sizing:border-box}ha-card{display:block;background:var(--va-bg);border:1px solid var(--va-line);border-radius:22px;overflow:hidden;color:var(--va-fg);box-shadow:none}
    button,select{font:inherit;color:inherit}button{cursor:pointer;-webkit-tap-highlight-color:transparent}button:disabled,select:disabled{opacity:.4;cursor:default}button:focus-visible,select:focus-visible{outline:2px solid var(--va-green);outline-offset:3px}
    svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
    .top{display:flex;align-items:center;justify-content:space-between;padding:23px 22px 13px;gap:10px}.title{font-size:21px;letter-spacing:-.4px}.eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:1.7px;color:var(--va-sub);margin-bottom:5px}.outside{display:flex;align-items:center;gap:6px;color:var(--va-sub);font-size:13px;white-space:nowrap}.outside svg{width:17px}
    .body{padding:5px 18px 22px;min-height:435px}.muted{color:var(--va-sub)}.small{font-size:12px;line-height:1.6}.section{font-size:10px;letter-spacing:1.5px;color:var(--va-sub);text-transform:uppercase;margin:25px 1px 11px}
    .panel{border-radius:12px;background:var(--va-panel);border:1px solid #2a302d;margin-top:10px}.quick{margin:1px 0 17px;border:1px solid var(--va-line);border-radius:12px}.quick summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:9px;padding:14px;font-size:13px}.quick summary::after{content:'⌄';margin-left:auto;color:var(--va-sub)}.quick summary::-webkit-details-marker{display:none}.quick-body{padding:0 8px 8px;display:grid;gap:6px}.quick-body button{display:flex;align-items:center;gap:11px;width:100%;border:0;background:var(--va-panel);text-align:left;padding:12px;border-radius:7px;font-size:13px}.quick-body button.on{color:var(--va-green);background:#073b32}.quick button span{margin-left:auto;font-size:11px;color:var(--va-sub)}
    .zone{display:block;position:relative;width:100%;padding:17px 15px 15px;text-align:center;background:linear-gradient(145deg,#252a27,#1a1e1c);color:var(--va-fg);border:1px solid #414943;border-radius:12px;margin:12px 0 0}.zone-name{font-size:14px;margin-bottom:12px}.zone-bar{height:2px;background:var(--va-green);box-shadow:0 0 9px #00b59c80;margin-bottom:16px}.zone.heating .zone-bar{background:linear-gradient(90deg,var(--va-orange),#698e64,var(--va-green));box-shadow:0 0 9px #ddb05550}.zone-main{display:flex;align-items:center;justify-content:center;gap:10px}.zone-main svg{color:var(--va-green)}.zone.heating .zone-main svg{color:var(--va-orange)}.zone-number{font-size:34px;font-weight:300;letter-spacing:-1px}.zone-unit{font-size:20px}.zone-sub{margin-top:8px;font-size:11px;color:var(--va-sub);display:flex;gap:8px;justify-content:space-between}.zone-sub b{font-weight:400;color:#e1e7e2}.chevron{position:absolute;right:12px;top:15px;color:#8c9890}.chevron svg{width:15px}
    .footer{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--va-line);padding:6px;background:#191d1b}.nav{background:transparent;border:0;padding:9px 4px;color:var(--va-sub);display:flex;align-items:center;flex-direction:column;gap:6px;font-size:10px;border-radius:10px}.nav.active{color:var(--va-green);background:#083329}.nav svg{width:20px;height:20px}
    .back{border:0;background:none;color:var(--va-green);padding:5px;display:flex;align-items:center;gap:10px}.back span{color:var(--va-fg);font-size:17px}.detail-top{display:flex;justify-content:space-around;margin:20px 0 3px;text-align:center}.detail-top b{display:block;font-size:19px;font-weight:400;margin-bottom:4px}.detail-top small{color:var(--va-sub);font-size:11px}
    .dial{width:224px;height:224px;margin:24px auto 10px;position:relative;display:grid;place-items:center}.halo{position:absolute;inset:10px;border-radius:50%;background:conic-gradient(from 180deg,#00b59c44,#00b59c11,#00b59c66,#00b59c44);filter:blur(13px)}.dial.heating .halo{background:conic-gradient(from 160deg,#00b59c66,#00b59c22,#e5a22c77,#00b59c55)}.dial-inner{width:188px;height:188px;border-radius:50%;background:#080d0b;border:2px solid #008f7c;display:flex;align-items:center;justify-content:center;flex-direction:column;position:relative;box-shadow:0 0 20px #00b59c22,inset 0 0 20px #00b59c0d}.dial.heating .dial-inner{border-color:#179d83;border-top-color:var(--va-orange)}.dial-icon{color:var(--va-green);height:23px;margin-bottom:5px}.dial.heating .dial-icon{color:var(--va-orange)}.dial-value{font-size:46px;font-weight:300;letter-spacing:-1.7px;line-height:1.15}.dial-value span{font-size:24px}.dial-current{font-size:12px;color:var(--va-sub);margin-top:7px}.stepper{display:flex;justify-content:space-between;max-width:260px;margin:14px auto 22px;align-items:center}.stepper button{width:58px;height:52px;color:var(--va-green);font-weight:200;font-size:35px;background:transparent;border:1px solid #24463d;border-radius:12px}.stepper small{font-size:11px;color:var(--va-sub)}
    .row{display:flex;align-items:center;gap:11px;padding:14px 12px;width:100%;background:var(--va-panel);border:0;border-radius:9px;text-align:left;font-size:12px;margin-bottom:5px;min-height:49px}.row>svg{color:var(--va-green);width:18px}.row .value{margin-left:auto;text-align:right;color:var(--va-sub);max-width:50%;overflow-wrap:anywhere}.row .value svg{width:14px;height:14px;vertical-align:middle;margin-left:6px}.row select{margin-left:auto;max-width:58%;background:#111b16;border:1px solid #3c5448;border-radius:6px;padding:8px 6px;font-size:12px}.message{font-size:12px;padding:12px;background:#102e25;border:1px solid #205542;border-radius:9px;line-height:1.5;margin:8px 0;color:#c7e6d8}.message.error{background:#3a241c;border-color:#79503c;color:#ffcfb7}.message button{float:right;color:inherit;background:none;border:0;font-size:17px;padding:0 0 3px 8px}.chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.chip{padding:6px 10px;background:#1c2d25;border:1px solid #2d4d3f;border-radius:20px;font-size:10px;color:#b5d0c1}
    .metric-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.metric{padding:15px 12px;background:var(--va-panel);border-radius:10px;min-height:93px}.metric svg{color:var(--va-green);width:18px;height:18px}.metric strong{font-size:22px;font-weight:400;display:block;margin:9px 0 5px}.metric small{color:var(--va-sub);font-size:11px;line-height:1.4;display:block}.status-line{display:flex;align-items:center;gap:9px;border-radius:9px;padding:14px;background:#12362b;color:#b4e4ce;font-size:12px}.status-line.warn{color:#ffce9f;background:#36291b}.status-line.neutral{color:var(--va-sub);background:var(--va-panel)}.status-line svg{color:var(--va-green)}
    .energy-ring{width:202px;height:202px;margin:24px auto;border:3px solid var(--va-orange);border-left-color:#ce4735;border-radius:50%;display:flex;justify-content:center;align-items:center;flex-direction:column;box-shadow:0 0 24px #e3982710}.energy-ring strong{font-size:37px;font-weight:300;letter-spacing:-1px}.energy-ring small{color:var(--va-sub);font-size:11px;max-width:140px;text-align:center;line-height:1.6;margin-top:8px}.tag{font-size:11px;color:var(--va-green);background:#10332a;display:inline-block;padding:6px 10px;border-radius:6px;margin-top:4px}.warnmark{color:#f0bc7a}.availability{margin-top:15px;padding:12px;border:1px dashed #4d5144;border-radius:10px;color:#c3c4b1;line-height:1.6;font-size:11px;overflow-wrap:anywhere}.availability code{color:#e5e5da;font-size:10px}.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    @media(max-width:350px){.top{padding:18px 15px 12px}.body{padding:5px 12px 18px}.zone-number{font-size:30px}.zone-sub{font-size:10px}.dial{width:210px;height:210px}.row{padding:12px 9px;gap:7px}.row select{max-width:55%}}
    @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
  `;
  class VaillantAppCard extends HTMLElement {
    constructor() {
      super(); this.attachShadow({mode:'open'}); this._page='home'; this._quick=false; this._busy=false;
      this.shadowRoot.addEventListener('click', e => this._click(e));
      this.shadowRoot.addEventListener('change', e => this._change(e));
      this.shadowRoot.addEventListener('toggle', e => { if(e.target.matches?.('.quick')) this._quick=e.target.open; }, true);
    }
    setConfig(config) {
      if (!config || typeof config !== 'object') throw new Error('Konfiguration fehlt.');
      this._config={title:'Haus', zone_name:'Zone 1', ...config};
      this._ids={...DEFAULTS, ...(config.entities || {})}; this._render();
    }
    set hass(hass) {
      this._hass=hass;
      const signature=JSON.stringify(Object.values(this._ids || {}).map(id=>hass.states[id]));
      if (signature !== this._signature) { this._signature=signature; this._render(); }
    }
    get hass(){return this._hass;}
    getCardSize(){return this._page==='home'?10:13;}
    getGridOptions(){return {columns:12,min_columns:6,rows:'auto'};}
    static getStubConfig(){return {type:'custom:vaillant-app-card',title:'Haus',zone_name:'Zone 1'};}
    disconnectedCallback(){clearTimeout(this._pendingTimer);}
    _entity(key){return this._hass?.states[this._ids[key]];}
    _ok(key){const s=this._entity(key);return !!s && !['unavailable','unknown'].includes(s.state);}
    _state(key){return this._ok(key)?this._entity(key).state:null;}
    _attr(key,name){return this._ok(key)?this._entity(key).attributes?.[name]:null;}
    _num(key){return numeric(this._state(key));}
    _first(...values){return values.map(numeric).find(v=>v!==null) ?? null;}
    _current(water){return water?this._first(this._attr('water_heater','current_temperature'),this._num('tank')):this._first(this._attr('climate','current_temperature'),this._num('room'));}
    _target(water) {
      const key=water?'water_heater':'climate';
      const actual=this._first(this._attr(key,'temperature'),this._num(water?'water_target':'heating_target'));
      if(this._pending?.key===key){
        if(actual!==null && Math.abs(actual-this._pending.value)<.01){clearTimeout(this._pendingTimer);this._pending=null;}
        else return this._pending.value;
      }
      return actual;
    }
    _formatSensor(key,digits=1){const e=this._entity(key);return this._num(key)===null?'—':`${fmt(e.state,digits)}${e.attributes.unit_of_measurement?' '+esc(e.attributes.unit_of_measurement):''}`;}
    _offline(){return this._state('online')==='off';}
    _canTemp(water){const k=water?'water_heater':'climate';return this._ok(k)&&!this._offline()&&((Number(this._attr(k,'supported_features'))&1)===1)&&this._target(water)!==null;}
    _row(label,key,ic='info',value=null){return `<button class="row" data-more="${esc(key)}">${icon(ic)}<span>${esc(label)}</span><span class="value">${value===null?esc(this._state(key)===null?'Nicht verfügbar':modeName(this._state(key))):value}${icon('arrow')}</span></button>`;}
    _metric(label,key,ic,digits=1){return `<button class="row" data-more="${esc(key)}">${icon(ic)}<span>${esc(label)}</span><span class="value">${this._formatSensor(key,digits)}${icon('arrow')}</span></button>`;}
    _toggle(label,key,ic){const on=this._state(key)==='on';return `<button class="${on?'on':''}" data-toggle="${key}" aria-pressed="${on}" ${!this._ok(key)||this._busy||this._offline()?'disabled':''}>${icon(ic)}${esc(label)}<span>${on?'Aktiv':'Aus'}</span></button>`;}
    _banner(){
      if(this._state('online')==='off')return `<div class="status-line warn">${icon('info')}Anlage nicht erreichbar</div>`;
      if(this._state('trouble')==='on')return `<button class="row" data-more="trouble">${icon('info')}<span class="warnmark">Anlage meldet eine Störung</span><span class="value">${icon('arrow')}</span></button>`;
      if(this._state('online')==='on'&&this._state('trouble')==='off')return `<div class="status-line">${icon('check')}Anlage meldet keine Störung</div>`;
      return `<div class="status-line neutral">${icon('info')}Anlagenstatus nicht vollständig verfügbar</div>`;
    }
    _home(){return `
      <details class="quick" ${this._quick?'open':''}><summary>${icon('settings')}Schnellzugriff</summary><div class="quick-body">${this._toggle('Warmwasser schnell','boost','water')}${this._toggle('Stoßlüften','ventilation','wind')}${this._toggle('Abwesenheitsmodus','away','home')}</div></details>
      ${this._zone(false)}${this._zone(true)}
      <div class="chips"><span class="chip">${icon('temp').replace('<svg','<svg style="width:12px;height:12px;vertical-align:middle;margin-right:3px"')}Vorlauf ${this._formatSensor('flow')}</span><span class="chip">Wasserdruck ${this._formatSensor('pressure')}</span></div>
      <div class="small muted" style="margin:19px 2px 0">Temperatur oder Betriebsart ändern? Tippe auf Heizung oder Warmwasser.</div>`;}
    _zone(water){const t=this._target(water);const c=this._current(water);const m=water?this._attr('water_heater','operation_mode')||this._state('water_heater'):this._state('heating_mode')||this._state('climate');return `
      <button class="zone ${water?'':'heating'}" data-page="${water?'water':'heating'}" aria-label="${water?'Warmwasser':esc(this._config.zone_name)} öffnen">
      <span class="chevron">${icon('arrow')}</span><div class="zone-name">${water?'Warmwasser':esc(this._config.zone_name)}</div><div class="zone-bar"></div>
      <div class="zone-main">${icon(water?'water':'heat')}<span class="zone-number">${fmt(t)}<span class="zone-unit"> °C</span></span></div>
      <div class="zone-sub"><span>${esc(modeName(m))}</span><span>Aktuell: <b>${fmt(c)} °C</b></span>${water?'':`<span>${fmt(this._first(this._attr('climate','current_humidity'),this._num('humidity')),0)} %</span>`}</div></button>`;}
    _modeSelect(water){
      const key=water?'water_heater':'climate';
      const modes=this._attr(key,water?'operation_list':'hvac_modes') || [];
      const active=water?this._attr(key,'operation_mode'):this._state(key);
      if(!Array.isArray(modes)||!modes.length)return this._row('Betriebsart',key,'settings');
      const disabled=!this._ok(key)||this._busy||this._offline()||(water&&!(Number(this._attr(key,'supported_features'))&2));
      return `<label class="row">${icon('settings')}<span>Betriebsart</span><select data-mode="${key}" aria-label="Betriebsart ${water?'Warmwasser':'Heizung'}" ${disabled?'disabled':''}>${modes.includes(active)?'':`<option selected disabled value="">${esc(modeName(active))}</option>`}${modes.map(m=>`<option value="${esc(m)}" ${m===active?'selected':''}>${esc(modeName(m))}</option>`).join('')}</select></label>`;
    }
    _detail(water){const target=this._target(water),current=this._current(water),key=water?'water_heater':'climate';
      const min=numeric(this._attr(key,'min_temp')),max=numeric(this._attr(key,'max_temp'));
      const blocked=!this._canTemp(water)||this._busy;
      return `<button class="back" data-page="home">${icon('back')}<span>${water?'Warmwasser':esc(this._config.zone_name)}</span></button>
      ${water?'':`<div class="detail-top"><div><b>${this._formatSensor('outdoor')}</b><small>Außen</small></div><div><b>${fmt(this._first(this._attr('climate','current_humidity'),this._num('humidity')),0)} %</b><small>Luftfeuchte</small></div></div>`}
      <div class="dial ${water?'':'heating'}"><div class="halo"></div><div class="dial-inner"><div class="dial-icon">${icon(water?'water':'heat')}</div><div class="dial-value">${fmt(target)}<span> °C</span></div><div class="dial-current">Aktuell: ${fmt(current)} °C</div></div></div>
      <div class="stepper"><button data-step="-1" aria-label="Solltemperatur senken" ${blocked||(min!==null&&target<=min)?'disabled':''}>−</button><small>${this._pending?.key===key?'Wird übernommen …':'Wunschtemperatur'}</small><button data-step="1" aria-label="Solltemperatur erhöhen" ${blocked||(max!==null&&target>=max)?'disabled':''}>+</button></div>
      ${!this._ok(key)?`<div class="message error">${esc(this._ids[key])} ist deaktiviert, fehlt oder ist nicht verfügbar.</div>`:''}
      ${!water?`<div class="small muted" style="margin-bottom:16px">Im Zeitbetrieb kann eine Änderung als zeitlich begrenzte Wunschtemperatur gelten (Quick Veto).</div>`:''}
      <div class="section">Optionen</div>${this._modeSelect(water)}
      ${this._row('Wochenplaner',water?'water_calendar':'heating_calendar','calendar','Kalender öffnen')}
      ${water?this._row('Zirkulation','circulation_calendar','clock','Kalender öffnen')+`<div class="quick-body" style="padding:0">${this._toggle('Warmwasser schnell','boost','water')}</div>`:this._row('Heizkurve','heating_curve','settings',this._formatSensor('heating_curve',2))+this._row('Dauer der Wunschtemperatur','veto_duration','clock',this._formatSensor('veto_duration'))}
      ${this._row('Weitere Einstellungen',key,'settings','Öffnen')}
      <div class="small muted" style="margin-top:15px">Wochenpläne lassen sich im Home-Assistant-Kalender bearbeiten. „Kalender öffnen“ zeigt hier die Entitätsdetails.</div>`;
    }
    _energyValue(key){const n=this._num(key),unit=this._attr(key,'unit_of_measurement');return n===null?null:unit==='Wh'?n/1000:unit==='kWh'?n:unit==='MWh'?n*1000:null;}
    _energyRow(label,key,ic){const n=this._energyValue(key);return this._row(label,key,ic,n===null?this._formatSensor(key):`${fmt(n,2)} kWh`);}
    _energy(){const a=this._energyValue('electric_heating'),b=this._energyValue('electric_water');return `
      <span class="tag">Energie · Sensorstände</span><div class="energy-ring"><strong>${fmt(a===null||b===null?null:a+b,2)}</strong><span class="small muted">kWh</span><small>Elektrische Energie<br>aroTHERM plus</small></div>
      <div class="small muted">Aktuelle Werte der Integration. Der Zeitraum richtet sich nach den Sensoren; keine Jahres- oder Monatsauswertung.</div>
      <div class="section">Elektrische Energie · aroTHERM plus</div>${this._energyRow('Heizung','electric_heating','heat')}${this._energyRow('Warmwasser','electric_water','water')}
      <div class="section">Energieeffizienz</div>${this._metric('Heizen + Warmwasser','efficiency','leaf',2)}
      <div class="section">Umweltertrag · aroTHERM plus</div>${this._energyRow('Heizung','environment_heating','leaf')}${this._energyRow('Warmwasser','environment_water','leaf')}
      <div class="section">Erzeugte Wärme · aroTHERM plus</div>${this._energyRow('Heizung','heat_heating','heat')}${this._energyRow('Warmwasser','heat_water','water')}
      <div class="section">Hydraulic station · separat</div>${this._energyRow('Elektrische Energie Heizung','hydraulic_electric','energy')}${this._energyRow('Erzeugte Wärme Heizung','hydraulic_heat','heat')}
      <div class="small muted" style="margin-top:15px">Die Hydraulikstation wird separat angezeigt und nicht zur Außeneinheit addiert. Die Karte fordert keine zusätzlichen Cloud-Aktualisierungen an.</div>`;}
    _status(){const required=['climate','water_heater','online','trouble','outdoor','room','tank','flow','pressure'];const missing=required.filter(k=>!this._ok(k));return `
      <div class="section" style="margin-top:9px">Systemstatus</div>${this._banner()}<div style="height:10px"></div>${this._row('Betriebszustand','operating_state','settings')}${this._row('Heizkreis 1','circuit_state','heat')}
      <div class="metric-grid" style="margin-top:10px"><div class="metric">${icon('pressure')}<strong>${this._formatSensor('pressure')}</strong><small>Wasserdruck</small></div><div class="metric">${icon('heat')}<strong>${this._formatSensor('flow')}</strong><small>Vorlauf Heizkreis 1</small></div></div>
      <div class="section">Temperaturen</div>${this._metric('Vorlauf System','system_flow','temp')}${this._metric('Vorlauf Soll','flow_target','temp')}${this._metric('Speicher Warmwasser','tank','water')}${this._metric('Außentemperatur','outdoor','temp')}
      <div class="section">Wartung & Details</div>${this._row('Störungsmeldungen','trouble','info',this._state('trouble')==='on'?'Störung':this._state('trouble')==='off'?'Keine gemeldet':'Nicht verfügbar')}${this._row('Firmware','firmware','info')}${this._row('Firmware-Update','firmware_update','info',this._state('firmware_update')==='on'?'Verfügbar':this._state('firmware_update')==='off'?'Keines gemeldet':'Nicht verfügbar')}
      ${missing.length?`<div class="availability"><b>Fehlende oder nicht verfügbare Entitäten</b><br>${missing.map(k=>`<code>${esc(this._ids[k])}</code>`).join('<br>')}<br>Bei Bedarf in der Entitätenverwaltung aktivieren. Die Karte kann deaktivierte Entitäten nicht selbst einschalten.</div>`:''}`;
    }
    _render(){
      if(!this._config||!this._hass)return;
      const page=this._page,tab=['heating','water'].includes(page)?'home':page;
      const contents=page==='home'?this._home():page==='energy'?this._energy():page==='status'?this._status():this._detail(page==='water');
      const notice=this._error||this._notice;
      this.shadowRoot.innerHTML=`<style>${CSS}</style><ha-card><header class="top"><div><div class="eyebrow">Wärmepumpe</div><div class="title">${esc(this._config.title)}</div></div><div class="outside">${icon('home')}${this._formatSensor('outdoor')}</div></header><main class="body">${notice?`<div class="message ${this._error?'error':''}" role="${this._error?'alert':'status'}"><button data-dismiss aria-label="Hinweis schließen">×</button>${esc(notice)}</div>`:''}${contents}</main><nav class="footer" aria-label="Wärmepumpe">${[['home','Zuhause'],['energy','Energie'],['status','Status']].map(([p,label])=>`<button class="nav ${tab===p?'active':''}" data-page="${p}" ${tab===p?'aria-current="page"':''}>${icon(p)}${label}</button>`).join('')}</nav></ha-card>`;
    }
    _more(key){const id=this._ids[key];if(!id)return;this.dispatchEvent(new CustomEvent('hass-more-info',{detail:{entityId:id},bubbles:true,composed:true}));}
    async _call(key,service,data={}){
      if(this._busy||!this._ok(key)||this._offline())return false;
      this._busy=true;this._error=null;this._notice=null;this._render();
      try{await this._hass.callService(this._ids[key].split('.')[0],service,{entity_id:this._ids[key],...data});this._notice='Übermittelt. Die Rückmeldung der myVAILLANT-Integration kann etwas dauern.';return true;}
      catch(e){this._error=`Änderung nicht übernommen: ${e?.message||String(e)}`;return false;}
      finally{this._busy=false;this._render();}
    }
    async _click(event){
      const el=event.target.closest('button');if(!el||el.disabled)return;
      if(el.hasAttribute('data-page')){this._page=el.dataset.page;this._error=null;this._notice=null;this._render();return;}
      if(el.hasAttribute('data-dismiss')){this._error=null;this._notice=null;this._render();return;}
      if(el.dataset.more){this._more(el.dataset.more);return;}
      if(el.dataset.toggle){const k=el.dataset.toggle;await this._call(k,this._state(k)==='on'?'turn_off':'turn_on');return;}
      if(el.dataset.step){
        const water=this._page==='water',key=water?'water_heater':'climate';if(!this._canTemp(water))return;
        const step=numeric(this._attr(key,'target_temp_step'))|| (water?1:.5);
        let value=Math.round((this._target(water)+Number(el.dataset.step)*step)*100)/100;
        const min=numeric(this._attr(key,'min_temp')),max=numeric(this._attr(key,'max_temp'));
        if(min!==null)value=Math.max(min,value);if(max!==null)value=Math.min(max,value);
        const previous=this._pending;this._pending={key,value};clearTimeout(this._pendingTimer);
        const ok=await this._call(key,'set_temperature',{temperature:value});
        if(!ok){this._pending=previous;this._render();return;}
        this._pendingTimer=setTimeout(()=>{if(this._pending){this._pending=null;this._notice='Wunschtemperatur noch nicht bestätigt. Angezeigt wird wieder der gemeldete Wert.';this._render();}},45000);
      }
    }
    async _change(event){const el=event.target;if(!el.dataset.mode)return;const key=el.dataset.mode;await this._call(key,key==='climate'?'set_hvac_mode':'set_operation_mode',key==='climate'?{hvac_mode:el.value}:{operation_mode:el.value});}
  }
  if(!customElements.get('vaillant-app-card'))customElements.define('vaillant-app-card',VaillantAppCard);
  window.customCards=window.customCards||[];
  if(!window.customCards.some(c=>c.type==='vaillant-app-card'))window.customCards.push({type:'vaillant-app-card',name:'Vaillant App Card',description:'Heizung, Warmwasser, Energie und Status im Stil der myVAILLANT-App.',preview:true});
})();
