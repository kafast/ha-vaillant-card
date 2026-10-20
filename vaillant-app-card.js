/* Vaillant App Card v1.1.0 — independent custom card, no external dependencies. */
(() => {
  // Registry data stays in the authenticated HA browser session, never in the repository.
  const REGISTRY_CACHE = new WeakMap();
  const ENTITY_KEYS = ['climate','water_heater','room','humidity','outdoor','tank','water_target',
    'heating_target','heating_mode','flow','flow_target','system_flow','pressure','online','trouble',
    'operating_state','circuit_state','boost','ventilation','away','heating_curve','veto_duration',
    'efficiency','firmware','firmware_update','heating_calendar','water_calendar','circulation_calendar',
    'electric_heating','electric_water','environment_heating','environment_water','heat_heating',
    'heat_water','hydraulic_electric','hydraulic_heat'];
  const emptyIds = () => Object.fromEntries(ENTITY_KEYS.map(k => [k, null]));
  const uid = e => String(e?.unique_id || '').replace(/^mypyllant /, 'mypyllant_');
  const domain = e => String(e?.entity_id || '').split('.')[0];
  const label = e => e?.name || e?.original_name || e?.entity_id || 'Nicht benannt';
  function only(items) { return items.length === 1 ? items[0] : null; }
  function choose(items, wanted) {
    if (wanted !== undefined && wanted !== null && wanted !== '') return items.find(i => String(i.value) === String(wanted)) || null;
    return only(items.filter(i => !i.disabled)) || only(items);
  }
  async function loadRegistry(hass, force = false) {
    const connection = hass.connection || hass;
    if (force) REGISTRY_CACHE.delete(connection);
    if (!REGISTRY_CACHE.has(connection)) {
      const promise = Promise.all([
        hass.callWS({type:'config/entity_registry/list'}),
        hass.callWS({type:'config/device_registry/list'}).catch(() => [])
      ]).then(([entities, devices]) => {
        if (!Array.isArray(entities) || !Array.isArray(devices)) throw new Error('Unerwartete Registerantwort.');
        const relevant = entities.filter(e => e.platform === 'mypyllant');
        const deviceIds = new Set(relevant.map(e => e.device_id).filter(Boolean));
        return {entities:relevant, devices:devices.filter(d => deviceIds.has(d.id))};
      }).catch(error => { if (REGISTRY_CACHE.get(connection) === promise) REGISTRY_CACHE.delete(connection); throw error; });
      REGISTRY_CACHE.set(connection, promise);
    }
    return REGISTRY_CACHE.get(connection);
  }
  function resolveEntities(registry, config, selected = {}) {
    const manual = config.entities || {};
    const ids = emptyIds();
    const issues = [];
    const choices = {system:[], zone:[], water:[], circuit:[], energy_device:[]};
    const all = registry.entities.filter(e => e.platform === 'mypyllant' && (!config.config_entry_id || e.config_entry_id === config.config_entry_id));
    const parsed = all.map(e => {
      const match = uid(e).match(/^mypyllant_(.+)_(zone_\d+_climate|domestic_hot_water_\d+_base|home_(?:base|control_online|control_error))$/);
      return match ? {entry:e, system:match[1]} : null;
    }).filter(Boolean);
    const systems = [...new Set(parsed.map(p => p.system))];
    for (const system of systems) {
      const entries = parsed.filter(p => p.system === system).map(p => p.entry);
      const home = entries.find(e => uid(e) === `mypyllant_${system}_home_base`);
      const device = registry.devices.find(d => d.id === home?.device_id);
      choices.system.push({value:system, label:device?.name_by_user || device?.name || (home ? label(home).replace(/ Firmware Version$/i,'') : label(entries[0])), disabled:entries.every(e => e.disabled_by)});
    }
    const explicitClimate = all.find(e => e.entity_id === manual.climate);
    const explicitWater = all.find(e => e.entity_id === manual.water_heater);
    const pinned = parsed.find(p => p.entry === explicitClimate) || parsed.find(p => p.entry === explicitWater);
    const system = choose(choices.system, config.system_id ?? selected.system ?? pinned?.system);
    const applyManual = () => {
      for (const key of ENTITY_KEYS) if (Object.prototype.hasOwnProperty.call(manual,key)) ids[key] = manual[key] || null;
      return {ids, choices, selected:selection, issues};
    };
    const selection = {};
    if (!system) {
      issues.push(systems.length ? 'Bitte eine Anlage auswählen.' : 'Keine myVAILLANT-Anlage gefunden. Integration und Entitäten prüfen.');
      return applyManual();
    }
    selection.system = system.value;
    const prefix = `mypyllant_${system.value}_`;
    const entries = all.filter(e => uid(e).startsWith(prefix) && !systems.some(other => other!==system.value && other.length>system.value.length && uid(e).startsWith(`mypyllant_${other}_`)));
    function match(key, dom, unique) {
      const candidates = entries.filter(e => domain(e) === dom && uid(e) === unique);
      const picked = only(candidates.filter(e => !e.disabled_by)) || only(candidates);
      ids[key] = picked?.entity_id || null;
      if (candidates.length > 1 && !picked) issues.push(`Mehrdeutige Zuordnung: ${key}.`);
    }
    const systemFields = {
      outdoor:['sensor','home_outdoor_temperature'], pressure:['sensor','home_water_pressure'],
      system_flow:['sensor','home_system_flow_temperature'], operating_state:['sensor','home_energy_manager_state'],
      online:['binary_sensor','home_control_online'], trouble:['binary_sensor','home_control_error'],
      firmware:['sensor','home_base'], firmware_update:['binary_sensor','home_firmware_update_required'],
      away:['switch','home_holiday_switch'], efficiency:['sensor','heating_energy_efficiency']
    };
    for (const [key,[dom,suffix]] of Object.entries(systemFields)) match(key,dom,prefix+suffix);
    const zoneEntries = entries.filter(e => domain(e)==='climate' && /^zone_\d+_climate$/.test(uid(e).slice(prefix.length)));
    choices.zone = zoneEntries.map(e => ({value:uid(e).slice(prefix.length).match(/^zone_(\d+)/)[1],label:label(e).replace(/ Climate$/i,''),disabled:!!e.disabled_by}));
    const explicitZone = explicitClimate && uid(explicitClimate).slice(prefix.length).match(/^zone_(\d+)_climate$/)?.[1];
    const zone = choose(choices.zone, config.zone ?? selected.zone ?? explicitZone);
    if (zone) {
      selection.zone = zone.value;
      const zp = `${prefix}zone_${zone.value}_`;
      for (const [key,dom,suffix] of [
        ['climate','climate','climate'], ['room','sensor','current_temperature'], ['humidity','sensor','humidity'],
        ['heating_target','sensor','desired_temperature'], ['heating_mode','sensor','heating_operating_mode'],
        ['ventilation','switch','ventilation_boost_switch'], ['veto_duration','number','quick_veto_duration'],
        ['heating_calendar','calendar','heating_calendar']
      ]) match(key,dom,zp+suffix);
    } else if (choices.zone.length > 1) issues.push('Bitte eine Heizzone auswählen.');
    const waterEntries = entries.filter(e => domain(e)==='water_heater' && /^domestic_hot_water_\d+_base$/.test(uid(e).slice(prefix.length)));
    choices.water = waterEntries.map(e => ({value:uid(e).slice(prefix.length).match(/^domestic_hot_water_(\d+)/)[1],label:label(e),disabled:!!e.disabled_by}));
    const explicitDhw = explicitWater && uid(explicitWater).slice(prefix.length).match(/^domestic_hot_water_(\d+)_base$/)?.[1];
    const water = choose(choices.water, config.water ?? selected.water ?? explicitDhw);
    if (water) {
      selection.water = water.value;
      const wp = `${prefix}domestic_hot_water_${water.value}_`;
      for (const [key,dom,suffix] of [
        ['water_heater','water_heater','base'], ['tank','sensor','tank_temperature'], ['water_target','sensor','set_point'],
        ['boost','switch','boost_switch'], ['water_calendar','calendar','heating_calendar'], ['circulation_calendar','calendar','circulation_calendar']
      ]) match(key,dom,wp+suffix);
    } else if (choices.water.length>1) issues.push('Bitte einen Warmwasserspeicher auswählen.');
    const circuits = [...new Set(entries.map(e => uid(e).slice(prefix.length).match(/^circuit_(\d+)_/)?.[1]).filter(v=>v!==undefined))];
    choices.circuit = circuits.map(value => ({value,label:`Heizkreis ${Number(value)+1}`,disabled:false}));
    const climateEntry = entries.find(e => e.entity_id === ids.climate);
    // The original integration name contains the actual associated circuit, independently of a renamed entity_id.
    const associated = climateEntry?.original_name?.match(/\(Circuit\s+(\d+)\)/i)?.[1];
    const circuit = choose(choices.circuit, config.circuit ?? selected.circuit ?? associated);
    if (circuit) {
      selection.circuit=circuit.value;
      for (const [key,dom,suffix] of [
        ['flow','sensor','flow_temperature'], ['flow_target','sensor','flow_temperature_setpoint'],
        ['circuit_state','sensor','state'], ['heating_curve','number','heating_curve']
      ]) match(key,dom,`${prefix}circuit_${circuit.value}_${suffix}`);
    } else if (choices.circuit.length>1) issues.push('Zugehörigen Heizkreis auswählen; keine Zuordnung geraten.');
    const energyPatterns = {
      electric_heating:/ consumed electrical energy heating$/i,
      electric_water:/ consumed electrical energy domestic hot water$/i,
      environment_heating:/ earned environment energy heating$/i,
      environment_water:/ earned environment energy domestic hot water$/i,
      heat_heating:/ heat generated heating$/i,
      heat_water:/ heat generated domestic hot water$/i
    };
    // Energy unique IDs contain opaque indices, not the energy type. Use immutable original integration names.
    const energy = entries.filter(e => domain(e)==='sensor' && e.device_id && Object.values(energyPatterns).some(p=>p.test(e.original_name || '')));
    const deviceIds = [...new Set(energy.map(e => e.device_id))];
    const getDevice = id => registry.devices.find(d => d.id===id);
    const isHydraulic = id => /hydraulic|hydraulik/i.test(`${getDevice(id)?.model || ''} ${getDevice(id)?.name || ''} ${energy.find(e=>e.device_id===id)?.original_name || ''}`);
    const outer = deviceIds.filter(id => !isHydraulic(id));
    choices.energy_device = outer.map(id => ({value:id,label:getDevice(id)?.name_by_user || getDevice(id)?.name || 'Energiegerät',disabled:false}));
    const energyDevice = choose(choices.energy_device,config.energy_device_id ?? selected.energy_device);
    if (energyDevice) {
      selection.energy_device=energyDevice.value;
      for (const [key,pattern] of Object.entries(energyPatterns)) {
        const candidates=energy.filter(e=>e.device_id===energyDevice.value && pattern.test(e.original_name || ''));
        ids[key]=(only(candidates.filter(e=>!e.disabled_by)) || only(candidates))?.entity_id || null;
      }
    } else if(choices.energy_device.length>1) issues.push('Für die Energieanzeige ein Gerät auswählen.');
    const hydraulic=only(deviceIds.filter(isHydraulic));
    if(hydraulic) for(const [key,pattern] of [['hydraulic_electric',energyPatterns.electric_heating],['hydraulic_heat',energyPatterns.heat_heating]]) {
      const candidates=energy.filter(e=>e.device_id===hydraulic&&pattern.test(e.original_name || ''));
      ids[key]=(only(candidates.filter(e=>!e.disabled_by)) || only(candidates))?.entity_id || null;
    }
    return applyManual();
  }
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
    .panel{border-radius:12px;background:var(--va-panel);border:1px solid #2a302d;margin-top:10px}.quick{margin:1px 0 17px;border:1px solid var(--va-line);border-radius:12px}.quick summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:9px;padding:14px;font-size:13px}.quick summary::after{content:'⌄';margin-left:auto;color:var(--va-sub)}.quick summary::-webkit-details-marker{display:none}.quick-body{padding:0 8px 8px;display:grid;gap:6px}.quick-body button{display:flex;align-items:center;gap:11px;width:100%;border:0;background:var(--va-panel);text-align:left;padding:12px;border-radius:7px;font-size:13px}.quick-body button.on{color:var(--va-green);background:#073b32}.quick-body button span{margin-left:auto;font-size:11px;color:var(--va-sub)}
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
      this._discoveryToken=0; this._selected={}; this._choices={}; this._ids=emptyIds();
      this.shadowRoot.addEventListener('click', e => this._click(e));
      this.shadowRoot.addEventListener('change', e => this._change(e));
      this.shadowRoot.addEventListener('toggle', e => { if(e.target.matches?.('.quick')) this._quick=e.target.open; }, true);
    }
    setConfig(config) {
      if (!config || typeof config !== 'object') throw new Error('Konfiguration fehlt.');
      if(config.entities && (typeof config.entities!=='object' || Array.isArray(config.entities))) throw new Error('entities muss eine Zuordnung sein.');
      for(const [key,id] of Object.entries(config.entities || {})) {
        if(!ENTITY_KEYS.includes(key) || (id!==null && (typeof id!=='string' || !/^[a-z_]+\.[a-z0-9_]+$/.test(id)))) throw new Error('Ungültige Entitätszuordnung: '+key);
      }
      for(const key of ['zone','circuit','water']) if(config[key]!==undefined && !/^\d+$/.test(String(config[key]))) throw new Error(key+' muss ein nichtnegativer Index sein.');
      this._config={title:'Wärmepumpe', zone_name:'Heizung', ...config};
      this._ids={...emptyIds(), ...(config.entities || {})};
      this._selected={}; this._choices={}; this._registry=null; this._discoveryIssues=[]; this._discoveryError=null; this._discoveryBusy=false;
      this._discoveryToken++; this._resetPending(); this._signature=null;
      this._render();
      if(this._hass) this._discoveryPromise=this._discover();
    }
    set hass(hass) {
      this._hass=hass;
      const connection=hass.connection || hass.callWS;
      if(this._config && connection!==this._connection) {
        this._connection=connection; this._discoveryPromise=this._discover();
      }
      const signature=JSON.stringify(Object.values(this._ids).filter(Boolean).map(id=>hass.states[id]));
      if (signature !== this._signature) { this._signature=signature; this._render(); }
    }
    get hass(){return this._hass;}
    getCardSize(){return this._page==='home'?10:13;}
    getGridOptions(){return {columns:12,min_columns:6,rows:'auto'};}
    static getStubConfig(){return {type:'custom:vaillant-app-card'};}
    disconnectedCallback(){clearTimeout(this._pendingTimer);}
    _resetPending() { clearTimeout(this._pendingTimer); this._pending=null; }
    async _discover(force=false) {
      if (!this._config || !this._hass || this._config.auto_discover===false) return;
      const token=++this._discoveryToken;
      this._discoveryBusy=true; this._discoveryError=null; this._render();
      try {
        const registry=await loadRegistry(this._hass,force);
        if(token!==this._discoveryToken)return;
        this._registry=registry;
        this._applyDiscovery();
      } catch(error) {
        if(token!==this._discoveryToken)return;
        this._discoveryError='Automatische Zuordnung nicht möglich. Erneut suchen oder Entitäten im lokalen Karten-YAML angeben.';
        this._ids={...emptyIds(),...(this._config.entities||{})};
      } finally {
        if(token===this._discoveryToken){this._discoveryBusy=false;this._render();}
      }
    }
    _applyDiscovery() {
      if(!this._registry)return;
      const resolved=resolveEntities(this._registry,this._config,this._selected);
      this._ids=resolved.ids; this._choices=resolved.choices; this._selected=resolved.selected; this._discoveryIssues=resolved.issues;
      this._signature=null;
    }
    _discoveryPanel() {
      if(this._config.auto_discover===false)return '';
      const titles={system:'Anlage',zone:'Heizzone',water:'Warmwasserspeicher',circuit:'Heizkreis',energy_device:'Energiegerät'};
      const pinned={system:'system_id',zone:'zone',water:'water',circuit:'circuit',energy_device:'energy_device_id'};
      const selectors=Object.entries(this._choices||{}).filter(([key,items])=>items.length>1 && this._config[pinned[key]]===undefined).map(([key,items])=>
        `<label class="row"><span>${titles[key]}</span><select data-discovery="${key}" aria-label="${titles[key]} wählen" ${this._busy?'disabled':''}><option value="" disabled ${this._selected[key]===undefined?'selected':''}>Bitte auswählen</option>${items.map(i=>`<option value="${esc(i.value)}" ${String(this._selected[key])===String(i.value)?'selected':''}>${esc(i.label)}${i.disabled?' (deaktiviert)':''}</option>`).join('')}</select></label>`).join('');
      return `${this._discoveryBusy?'<div class="small muted" role="status">myVAILLANT-Entitäten werden zugeordnet …</div>':''}${this._discoveryError?`<div class="message error">${esc(this._discoveryError)}</div>`:''}${selectors}${this._discoveryIssues?.length?`<div class="availability">${this._discoveryIssues.map(esc).join('<br>')}</div>`:''}${this._discoveryError || this._discoveryIssues?.length || this._page==='status'?'<button class="row" data-discover>Entitäten neu suchen</button>':''}`;
    }
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
      ${!this._ok(key)?`<div class="message error">${esc(this._ids[key] || (water?'Warmwasser':'Heizung'))} ist noch nicht zugeordnet, deaktiviert oder nicht verfügbar.</div>`:''}
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
      <span class="tag">Energie · Sensorstände</span><div class="energy-ring"><strong>${fmt(a===null||b===null?null:a+b,2)}</strong><span class="small muted">kWh</span><small>Elektrische Energie<br>Energiegerät</small></div>
      <div class="small muted">Aktuelle Werte der Integration. Der Zeitraum richtet sich nach den Sensoren; keine Jahres- oder Monatsauswertung.</div>
      <div class="section">Elektrische Energie · Energiegerät</div>${this._energyRow('Heizung','electric_heating','heat')}${this._energyRow('Warmwasser','electric_water','water')}
      <div class="section">Energieeffizienz</div>${this._metric('Heizen + Warmwasser','efficiency','leaf',2)}
      <div class="section">Umweltertrag · Energiegerät</div>${this._energyRow('Heizung','environment_heating','leaf')}${this._energyRow('Warmwasser','environment_water','leaf')}
      <div class="section">Erzeugte Wärme · Energiegerät</div>${this._energyRow('Heizung','heat_heating','heat')}${this._energyRow('Warmwasser','heat_water','water')}
      <div class="section">Hydraulic station · separat</div>${this._energyRow('Elektrische Energie Heizung','hydraulic_electric','energy')}${this._energyRow('Erzeugte Wärme Heizung','hydraulic_heat','heat')}
      <div class="small muted" style="margin-top:15px">Die Hydraulikstation wird separat angezeigt und nicht zur Außeneinheit addiert. Die Karte fordert keine zusätzlichen Cloud-Aktualisierungen an.</div>`;}
    _circuitLabel(){return this._selected.circuit===undefined?'Heizkreis':`Heizkreis ${Number(this._selected.circuit)+1}`;}
    _status(){const required=['climate','water_heater','online','trouble','outdoor','room','tank','flow','pressure'];const missing=required.filter(k=>!this._ok(k));return `
      <div class="section" style="margin-top:9px">Systemstatus</div>${this._banner()}<div style="height:10px"></div>${this._row('Betriebszustand','operating_state','settings')}${this._row(this._circuitLabel(),'circuit_state','heat')}
      <div class="metric-grid" style="margin-top:10px"><div class="metric">${icon('pressure')}<strong>${this._formatSensor('pressure')}</strong><small>Wasserdruck</small></div><div class="metric">${icon('heat')}<strong>${this._formatSensor('flow')}</strong><small>Vorlauf ${esc(this._circuitLabel())}</small></div></div>
      <div class="section">Temperaturen</div>${this._metric('Vorlauf System','system_flow','temp')}${this._metric('Vorlauf Soll','flow_target','temp')}${this._metric('Speicher Warmwasser','tank','water')}${this._metric('Außentemperatur','outdoor','temp')}
      <div class="section">Wartung & Details</div>${this._row('Störungsmeldungen','trouble','info',this._state('trouble')==='on'?'Störung':this._state('trouble')==='off'?'Keine gemeldet':'Nicht verfügbar')}${this._row('Firmware','firmware','info')}${this._row('Firmware-Update','firmware_update','info',this._state('firmware_update')==='on'?'Verfügbar':this._state('firmware_update')==='off'?'Keines gemeldet':'Nicht verfügbar')}
      ${missing.length?`<div class="availability"><b>Fehlende oder nicht verfügbare Entitäten</b><br>${missing.map(k=>`<code>${esc(this._ids[k] || k+' (nicht zugeordnet)')}</code>`).join('<br>')}<br>Bei Bedarf in der Entitätenverwaltung aktivieren. Die Karte kann deaktivierte Entitäten nicht selbst einschalten.</div>`:''}`;
    }
    _render(){
      if(!this._config||!this._hass)return;
      const page=this._page,tab=['heating','water'].includes(page)?'home':page;
      const contents=page==='home'?this._home():page==='energy'?this._energy():page==='status'?this._status():this._detail(page==='water');
      const notice=this._error||this._notice;
      this.shadowRoot.innerHTML=`<style>${CSS}</style><ha-card><header class="top"><div><div class="eyebrow">Wärmepumpe</div><div class="title">${esc(this._config.title)}</div></div><div class="outside">${icon('home')}${this._formatSensor('outdoor')}</div></header><main class="body">${this._discoveryPanel()}${notice?`<div class="message ${this._error?'error':''}" role="${this._error?'alert':'status'}"><button data-dismiss aria-label="Hinweis schließen">×</button>${esc(notice)}</div>`:''}${contents}</main><nav class="footer" aria-label="Wärmepumpe">${[['home','Zuhause'],['energy','Energie'],['status','Status']].map(([p,label])=>`<button class="nav ${tab===p?'active':''}" data-page="${p}" ${tab===p?'aria-current="page"':''}>${icon(p)}${label}</button>`).join('')}</nav></ha-card>`;
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
      if(el.hasAttribute('data-discover')){this._discoveryPromise=this._discover(true);return;}
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
    async _change(event){const el=event.target;if(el.dataset.discovery){if(this._busy)return;this._resetPending();this._notice=null;this._error=null;const key=el.dataset.discovery;if(key==='system')this._selected={system:el.value};else if(key==='zone'){delete this._selected.circuit;this._selected.zone=el.value;}else this._selected[key]=el.value;this._applyDiscovery();this._render();return;}if(!el.dataset.mode)return;const key=el.dataset.mode;await this._call(key,key==='climate'?'set_hvac_mode':'set_operation_mode',key==='climate'?{hvac_mode:el.value}:{operation_mode:el.value});}
  }
  if(!customElements.get('vaillant-app-card'))customElements.define('vaillant-app-card',VaillantAppCard);
  window.customCards=window.customCards||[];
  if(!window.customCards.some(c=>c.type==='vaillant-app-card'))window.customCards.push({type:'vaillant-app-card',name:'Vaillant App Card',description:'Heizung, Warmwasser, Energie und Status im Stil der myVAILLANT-App.',preview:true});
})();
