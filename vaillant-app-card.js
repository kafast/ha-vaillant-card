/* Vaillant App Card v1.4.1 — independent custom card, no external dependencies.
 * AI-generated and AI-assisted experimental code. Tests use simulated data;
 * operation on a physical heating system has not been validated. See README. */
(() => {
  // Registry data stays in the authenticated HA browser session, never in the repository.
  const REGISTRY_CACHE = new WeakMap();
  const COLOR_SCHEMES = {vaillant:'Vaillant',home_assistant:'Home Assistant',glass:'Glass',graphite:'Graphite',ocean:'Ocean'};
  // German translations; all source messages and identifiers use English.
  const DE = {
  "Not assigned": "Nicht zugeordnet",
  "Disabled in Home Assistant": "In Home Assistant deaktiviert",
  "No numeric reading": "Kein Zahlenwert",
  "Unsupported energy unit": "Energieeinheit nicht unterstützt",
  "Online sensor reports offline. Controls are disabled; open the sensor to check its state.": "Online-Sensor meldet offline. Steuerung gesperrt; Sensor zur Prüfung öffnen.",
  "Control entity is not assigned.": "Steuerentität ist nicht zugeordnet.",
  "Control entity is disabled in Home Assistant.": "Steuerentität ist in Home Assistant deaktiviert.",
  "Control entity is unavailable.": "Steuerentität ist nicht verfügbar.",
  "Entity does not report temperature control support.": "Entität meldet keine Unterstützung für Temperatursteuerung.",
  "No target temperature reported.": "Keine Solltemperatur gemeldet.",
  "Some energy readings are missing. Open System for assignment and availability details.": "Einige Energiewerte fehlen. Unter Anlage stehen Zuordnung und Verfügbarkeit.",
  "Energy entity diagnostics": "Diagnose der Energieentitäten",
  "Cloud connection": "Cloud-Verbindung",
  "Connected": "Verbunden",
  "Disconnected": "Getrennt",

  "System status": "Systemstatus",
  "Automatic matching failed. Retry discovery or specify entities in the local card YAML.": "Automatische Zuordnung nicht möglich. Erneut suchen oder Entitäten im lokalen Karten-YAML angeben.",
  "No myVAILLANT system found. Check the integration and its entities.": "Keine myVAILLANT-Anlage gefunden. Integration und Entitäten prüfen.",
  "Select the associated heating circuit; no circuit has been guessed.": "Zugehörigen Heizkreis auswählen; keine Zuordnung geraten.",
  "Select a device for the energy display.": "Für die Energieanzeige ein Gerät auswählen.",
  "Select a hot-water tank.": "Bitte einen Warmwasserspeicher auswählen.",
  "Select a heating zone.": "Bitte eine Heizzone auswählen.",
  "Select a system.": "Bitte eine Anlage auswählen.",
  "Ambiguous match: ": "Mehrdeutige Zuordnung: ",
  "Unexpected registry response.": "Unerwartete Registerantwort.",
  "Configuration is missing.": "Konfiguration fehlt.",
  "entities must be a mapping.": "entities muss eine Zuordnung sein.",
  "Invalid entity mapping: ": "Ungültige Entitätszuordnung: ",
  " must be a non-negative index.": " muss ein nichtnegativer Index sein.",
  "Unknown color scheme: ": "Unbekannter Farbstil: ",
  " must be a hex color, for example #03a9f4.": " muss eine Hex-Farbe sein, z. B. #03a9f4.",
  "Enter a hex color such as #03a9f4, or leave the field empty.": "Bitte eine Hex-Farbe wie #03a9f4 eingeben oder das Feld leer lassen.",
  "Home Assistant uses your active theme colors. Glass uses translucent surfaces; a dashboard background makes the effect more visible. Light/dark mode follows Home Assistant.": "Home Assistant übernimmt die Farben des aktiven Themes. Glas nutzt transparente Flächen; mit einem Dashboard-Hintergrund ist der Effekt deutlicher. Hell/Dunkel folgt Home Assistant.",
  "Enter colors as hex values. Empty fields use the selected scheme. Additional settings are available in the YAML editor.": "Farbwerte als Hex eingeben. Leere Felder verwenden die Farben des Farbstils. Weitere Einstellungen sind im YAML-Editor verfügbar.",
  "Sent. The myVAILLANT integration may take a moment to confirm the change.": "Übermittelt. Die Rückmeldung der myVAILLANT-Integration kann etwas dauern.",
  "Target temperature not confirmed yet. Showing the reported value again.": "Wunschtemperatur noch nicht bestätigt. Angezeigt wird wieder der gemeldete Wert.",
  "Change not applied: ": "Änderung nicht übernommen: ",
  "Control entity is not assigned or is unavailable. Check whether it is enabled in Home Assistant.": "Steuerentität nicht zugeordnet oder nicht verfügbar. Aktivierung in Home Assistant prüfen.",
  "A target change may apply as a temporary override. Check its duration in the corresponding integration setting.": "Eine Sollwertänderung kann als zeitlich begrenzte Wunschtemperatur gelten. Die Dauer lässt sich über die zugehörige Einstellung der Integration prüfen.",
  "Period and freshness depend on the integration. The hydraulic station is shown separately.": "Zeitraum und Aktualität laut Integration. Die Hydraulikstation wird separat ausgewiesen.",
  "Edit weekly schedules in the Home Assistant calendar.": "Wochenpläne im Home-Assistant-Kalender bearbeiten.",
  "Missing or unavailable entities": "Fehlende oder nicht verfügbare Entitäten",
  "Enable them in entity settings if needed.": "Bei Bedarf in der Entitätenverwaltung aktivieren.",
  "System status is not fully available": "Anlagenstatus nicht vollständig verfügbar",
  "No fault reported by the system": "Anlage meldet keine Störung",
  "System reports a fault": "Anlage meldet eine Störung",
  "System is offline": "Anlage nicht erreichbar",
  "Matching myVAILLANT entities …": "myVAILLANT-Entitäten werden zugeordnet …",
  "Discover entities again": "Entitäten neu suchen",
  "Mode & settings": "Betriebsart & Einstellungen",
  "Temperature in scheduled mode": "Temperatur im Zeitbetrieb",
  "Override duration": "Dauer der Wunschtemperatur",
  "More settings": "Weitere Einstellungen",
  "Heating and hot water · Energy device": "Heizung und Warmwasser · Energiegerät",
  "Reported value for heating and hot water": "Gemeldeter Wert für Heizen und Warmwasser",
  "Hydraulic station · separate": "Hydraulikstation · separat",
  "Heating electrical energy": "Elektrische Energie Heizung",
  "Heating heat output": "Erzeugte Wärme Heizung",
  "System flow temperature": "Vorlauf System",
  "Target flow temperature": "Vorlauf Soll",
  "Hot-water tank": "Warmwasserspeicher",
  "Fault details": "Störungsmeldungen",
  "Firmware update": "Firmware-Update",
  "None reported": "Keine gemeldet",
  "Unavailable": "Nicht verfügbar",
  "Unnamed": "Nicht benannt",
  "Select an option": "Bitte auswählen",
  " (disabled)": " (deaktiviert)",
  " (not assigned)": " (nicht zugeordnet)",
  "All system data": "Alle Anlagendaten",
  "Decrease target temperature": "Solltemperatur senken",
  "Increase target temperature": "Solltemperatur erhöhen",
  "Open settings": "Einstellungen öffnen",
  "Awaiting confirmation …": "Wird übernommen …",
  "Adjust heating": "Heizung einstellen",
  "Adjust hot water": "Warmwasser einstellen",
  "System & maintenance": "Anlage & Wartung",
  "Heating & hot water": "Klima & Warmwasser",
  "Accent color · optional": "Akzentfarbe · optional",
  "Heating color · optional": "Heizungsfarbe · optional",
  "Heating name": "Name der Heizung",
  "Responsive heating, hot water, energy and system controls for myVAILLANT.": "Responsive Bedienung für Heizung, Warmwasser, Energie und Anlage mit myVAILLANT.",
  "Current target temperature": "Aktuelle Wunschtemperatur",
  "Energy overview": "Energie im Blick",
  "Electrical energy": "Elektrische Energie",
  "Tank temperature": "Speichertemperatur",
  "Room temperature": "Raumtemperatur",
  "Outdoor temperature": "Außentemperatur",
  "Current reading": "Aktueller Wert",
  "Target temperature": "Wunschtemperatur",
  "Quick actions": "Schnellaktionen",
  "System data": "Anlagendaten",
  "System overview": "Systemübersicht",
  "Operating state": "Betriebszustand",
  "Sensor readings": "Sensorstände",
  "Energy efficiency": "Energieeffizienz",
  "Heat output": "Erzeugte Wärme",
  "Environmental yield": "Umweltertrag",
  "Hot-water boost": "Warmwasser schnell",
  "Temporary override": "Temporäre Änderung",
  "Scheduled": "Zeitgesteuert",
  "Heating curve": "Heizkurve",
  "Heating circuit": "Heizkreis",
  "Heating zone": "Heizzone",
  "Energy device": "Energiegerät",
  "Heat pump": "Wärmepumpe",
  "Hot water": "Warmwasser",
  "Heating": "Heizung",
  "Cooling": "Kühlen",
  "Water pressure": "Wasserdruck",
  "Humidity": "Luftfeuchte",
  "Operating mode": "Betriebsart",
  "Standby": "Bereitschaft",
  "Away": "Abwesend",
  "Setback": "Absenkung",
  "Manual": "Manuell",
  "Ventilation boost": "Stoßlüften",
  "Schedules": "Zeitplanung",
  "Weekly schedule": "Wochenplaner",
  "Circulation": "Zirkulation",
  "Control": "Regelung",
  "Comfort": "Komfort",
  "Maintenance": "Wartung",
  "Temperatures": "Temperaturen",
  "Fault": "Störung",
  "Available": "Verfügbar",
  "Overview": "Übersicht",
  "Title": "Überschrift",
  "Color scheme": "Farbstil",
  "Graphite": "Graphit",
  "Ocean": "Ozean",
  "Glass": "Glas",
  "Outside": "Außen",
  "Efficiency": "Effizienz",
  "Flow temperature": "Vorlauf",
  "Open": "Öffnen",
  "System": "Anlage",
  "Energy": "Energie",
  "Active": "Aktiv",
  "Off": "Aus",
  " selection": " wählen",
  " settings": " einstellen",
  "Dismiss message": "Hinweis schließen",
  "Heating circuit {number}": "Heizkreis {number}",
  "Ambiguous match: {key}.": "Mehrdeutige Zuordnung: {key}.",
  "Change not applied: {reason}": "Änderung nicht übernommen: {reason}",
  "{name}: Decrease target temperature": "{name}: Solltemperatur senken",
  "{name}: Increase target temperature": "{name}: Solltemperatur erhöhen",
  "{name}: Target temperature": "{name}: Wunschtemperatur",
  "{name}: Open settings": "{name}: Einstellungen öffnen",
  "Operating mode {name}": "Betriebsart {name}",
  "Heat": "Heizen",
  "Select": "Auswählen",
  "Language": "Sprache",
  "Automatic (Home Assistant)": "Automatisch (Home Assistant)",
  "German": "Deutsch",
  "English": "Englisch",
  "{name} selection": "{name} wählen",
  "{name} settings": "{name} einstellen",
  "Flow temperature Heating circuit {number}": "Vorlauf Heizkreis {number}"
};
  function getLanguage(config={}, hass={}) {
    const language=config.language && config.language!=='auto' ? config.language : hass.locale?.language || hass.language || globalThis.navigator?.language || 'en';
    return String(language).toLowerCase().startsWith('de') ? 'de' : 'en';
  }
  const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const TRANSLATION_PATTERNS = Object.entries(DE).filter(([key])=>key.includes('{')).map(([key,value])=>{
    const names=[...key.matchAll(/\{(\w+)\}/g)].map(m=>m[1]);
    const expression=key.split(/\{\w+\}/).map(escapePattern).join('(.+?)');
    return {expression:new RegExp('^'+expression+'$'),names,value};
  });
  function translate(message,language) {
    if(language!=='de' || typeof message!=='string')return message;
    if(Object.prototype.hasOwnProperty.call(DE,message))return DE[message];
    const core=message.trim();
    if(!core)return message;
    let translated=DE[core];
    if(translated===undefined) for(const pattern of TRANSLATION_PATTERNS){
      const match=core.match(pattern.expression);
      if(match){const values=Object.fromEntries(pattern.names.map((name,index)=>[name,match[index+1]]));translated=pattern.value.replace(/\{(\w+)\}/g,(_,name)=>values[name]);break;}
    }
    return translated===undefined?message:message.slice(0,message.indexOf(core))+translated+message.slice(message.indexOf(core)+core.length);
  }
  // Only presentation text is translated. Entity IDs, service payloads, input
  // values, and explicitly configured display names are never rewritten.
  function localize(root,language) {
    if(language!=='de' || !root?.ownerDocument?.createTreeWalker)return;
    const walker=root.ownerDocument.createTreeWalker(root,4);
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(!node.parentElement?.closest('style,script,[data-no-localize]'))node.data=translate(node.data,language);
    }
    for(const element of root.querySelectorAll('[aria-label],[title],[placeholder]')){
      if(element.hasAttribute('data-preserve-aria') || element.closest('[data-no-localize]'))continue;
      for(const name of ['aria-label','title','placeholder'])if(element.hasAttribute(name))element.setAttribute(name,translate(element.getAttribute(name),language));
    }
  }
  const DEFAULT_COLOR_SCHEME = 'home_assistant';
  const isHexColor = value => typeof value==='string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value);
  const ENTITY_KEYS = ['climate','water_heater','room','humidity','outdoor','tank','water_target',
    'heating_target','heating_mode','flow','flow_target','system_flow','pressure','online','trouble',
    'operating_state','circuit_state','boost','ventilation','away','heating_curve','veto_duration',
    'efficiency','firmware','firmware_update','heating_calendar','water_calendar','circulation_calendar',
    'electric_heating','electric_water','environment_heating','environment_water','heat_heating',
    'heat_water','hydraulic_electric','hydraulic_heat'];
  const emptyIds = () => Object.fromEntries(ENTITY_KEYS.map(k => [k, null]));
  const uid = e => String(e?.unique_id || '').replace(/^mypyllant /, 'mypyllant_');
  const domain = e => String(e?.entity_id || '').split('.')[0];
  const label = e => e?.name || e?.original_name || e?.entity_id || 'Unnamed';
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
        if (!Array.isArray(entities) || !Array.isArray(devices)) throw new Error('Unexpected registry response.');
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
      issues.push(systems.length ? 'Select a system.' : 'No myVAILLANT system found. Check the integration and its entities.');
      return applyManual();
    }
    selection.system = system.value;
    const prefix = `mypyllant_${system.value}_`;
    const entries = all.filter(e => uid(e).startsWith(prefix) && !systems.some(other => other!==system.value && other.length>system.value.length && uid(e).startsWith(`mypyllant_${other}_`)));
    function match(key, dom, unique) {
      const candidates = entries.filter(e => domain(e) === dom && uid(e) === unique);
      const picked = only(candidates.filter(e => !e.disabled_by)) || only(candidates);
      ids[key] = picked?.entity_id || null;
      if (candidates.length > 1 && !picked) issues.push(`Ambiguous match: ${key}.`);
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
    } else if (choices.zone.length > 1) issues.push('Select a heating zone.');
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
    } else if (choices.water.length>1) issues.push('Select a hot-water tank.');
    const circuits = [...new Set(entries.map(e => uid(e).slice(prefix.length).match(/^circuit_(\d+)_/)?.[1]).filter(v=>v!==undefined))];
    choices.circuit = circuits.map(value => ({value,label:`Heating circuit ${Number(value)+1}`,disabled:false}));
    const climateEntry = entries.find(e => e.entity_id === ids.climate);
    // The original integration name contains the actual associated circuit, independently of a renamed entity_id.
    const zoneDevice = registry.devices.find(d => d.id === climateEntry?.device_id);
    // HA may remove the device prefix from original_name. The integration's
    // original device name still contains the associated circuit index.
    const associations = [...new Set([...`${climateEntry?.original_name || ''} ${zoneDevice?.name || ''}`.matchAll(/\(Circuit\s+(\d+)\)/gi)].map(m=>m[1]))];
    const associated = only(associations);
    const circuit = choose(choices.circuit, config.circuit ?? selected.circuit ?? associated);
    if (circuit) {
      selection.circuit=circuit.value;
      for (const [key,dom,suffix] of [
        ['flow','sensor','flow_temperature'], ['flow_target','sensor','flow_temperature_setpoint'],
        ['circuit_state','sensor','state'], ['heating_curve','number','heating_curve']
      ]) match(key,dom,`${prefix}circuit_${circuit.value}_${suffix}`);
    } else if (choices.circuit.length>1) issues.push('Select the associated heating circuit; no circuit has been guessed.');
    const energyPatterns = {
      electric_heating:/(?:^|\s)consumed electrical energy heating$/i,
      electric_water:/(?:^|\s)consumed electrical energy domestic hot water$/i,
      environment_heating:/(?:^|\s)earned environment energy heating$/i,
      environment_water:/(?:^|\s)earned environment energy domestic hot water$/i,
      heat_heating:/(?:^|\s)heat generated heating$/i,
      heat_water:/(?:^|\s)heat generated domestic hot water$/i
    };
    // Energy unique IDs contain opaque indices, not the energy type. Use immutable original integration names.
    const energy = entries.filter(e => domain(e)==='sensor' && e.device_id && Object.values(energyPatterns).some(p=>p.test(e.original_name || '')));
    const deviceIds = [...new Set(energy.map(e => e.device_id))];
    const getDevice = id => registry.devices.find(d => d.id===id);
    const isHydraulic = id => /hydraulic|hydraulik/i.test(`${getDevice(id)?.model || ''} ${getDevice(id)?.name || ''} ${energy.find(e=>e.device_id===id)?.original_name || ''}`);
    const outer = deviceIds.filter(id => !isHydraulic(id));
    choices.energy_device = outer.map(id => ({value:id,label:getDevice(id)?.name_by_user || getDevice(id)?.name || 'Energy device',disabled:false}));
    const energyDevice = choose(choices.energy_device,config.energy_device_id ?? selected.energy_device);
    if (energyDevice) {
      selection.energy_device=energyDevice.value;
      for (const [key,pattern] of Object.entries(energyPatterns)) {
        const candidates=energy.filter(e=>e.device_id===energyDevice.value && pattern.test(e.original_name || ''));
        ids[key]=(only(candidates.filter(e=>!e.disabled_by)) || only(candidates))?.entity_id || null;
      }
    } else if(choices.energy_device.length>1) issues.push('Select a device for the energy display.');
    const hydraulic=only(deviceIds.filter(isHydraulic));
    if(hydraulic) for(const [key,pattern] of [['hydraulic_electric',energyPatterns.electric_heating],['hydraulic_heat',energyPatterns.heat_heating]]) {
      const candidates=energy.filter(e=>e.device_id===hydraulic&&pattern.test(e.original_name || ''));
      ids[key]=(only(candidates.filter(e=>!e.disabled_by)) || only(candidates))?.entity_id || null;
    }
    return applyManual();
  }
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const numeric = v => v !== null && v !== undefined && String(v).trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null;
  const formatNumber = (v, digits=1, language='en') => numeric(v) === null ? '—' : Number(v).toLocaleString(language==='de'?'de-DE':'en-US', {minimumFractionDigits:digits, maximumFractionDigits:digits});
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
  const modeName = v => ({auto:'Scheduled', heat_cool:'Manual', heat:'Heat', cool:'Cooling', off:'Off',
    'Time Controlled':'Scheduled', TIME_CONTROLLED:'Scheduled', 'Manual':'Manual', MANUAL:'Manual',
    'Off':'Off', 'Cylinder Boost':'Hot-water boost', HEATING:'Heat', COOLING:'Cooling',
    DHW:'Hot water', DOMESTIC_HOT_WATER:'Hot water', STANDBY:'Standby', IDLE:'Standby',
    'none':'Normal', boost:'Temporary override', away:'Away', sleep:'Setback', eco:'Eco',
    'Quick Veto':'Temporary override', 'Regular':'Normal'})[v] || v || 'Unavailable';
  const CSS = `
:host{display:block;container-type:inline-size;container-name:vaillant;font-family:Roboto,"Segoe UI",sans-serif;--va-bg:#121b18;--va-panel:#19241f;--va-raised:#223029;--va-line:#2d3b33;--va-fg:#eff6f1;--va-sub:#9caf9f;--va-green:#55dab3;--va-orange:#efb36c;--va-accent-bg:#203d30;--va-error-bg:#3c2921;--va-error:#ffd0b8}
*{box-sizing:border-box}ha-card{display:flex;flex-direction:column;background:var(--va-bg);border:1px solid var(--va-line);border-radius:20px;overflow:clip;color:var(--va-fg);box-shadow:none}
ha-card.light{--va-bg:#ffffff;--va-panel:#f5f8f6;--va-raised:#edf2ee;--va-line:#d9e3dc;--va-fg:#172a20;--va-sub:#566b5c;--va-green:#00785b;--va-orange:#9b580b;--va-accent-bg:#e2f3e9;--va-error-bg:#fff0e7;--va-error:#923b18}
button,select{font:inherit;color:inherit}button{cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}button:disabled,select:disabled{opacity:.4;cursor:default}button:focus-visible,select:focus-visible{outline:2px solid var(--va-green);outline-offset:3px}button:hover:enabled{filter:brightness(1.08)}
svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.top{order:0;display:flex;align-items:center;justify-content:space-between;padding:22px 18px 18px;gap:14px}.eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:1.7px;color:var(--va-sub);margin-bottom:5px}.title{font-size:21px;line-height:1.2;font-weight:550;letter-spacing:-.6px;overflow-wrap:anywhere}.outside{display:flex;align-items:center;gap:7px;color:var(--va-fg);font-size:15px;white-space:nowrap}.outside svg{color:var(--va-green);width:20px}.outside small{display:none;color:var(--va-sub);font-size:11px}
.body{order:1;padding:0 14px 16px;min-width:0}.footer{order:2;position:sticky;bottom:0;z-index:2;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;border-top:1px solid var(--va-line);padding:7px;background:var(--va-bg)}.nav{min-height:54px;border:0;background:none;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;font-size:11px;color:var(--va-sub);border-radius:10px}.nav.active{background:var(--va-accent-bg);color:var(--va-green)}.nav svg{width:19px;height:19px}.muted{color:var(--va-sub)}.small{font-size:12px;line-height:1.6}.section{font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--va-sub);margin:0 0 13px}.page-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px}.page-heading h2{font-size:20px;letter-spacing:-.5px;margin:0;font-weight:550}.page-heading small{font-size:11px;color:var(--va-sub)}.back{min-height:44px;display:flex;align-items:center;gap:6px;background:none;border:0;padding:0;color:var(--va-green);font-size:12px}.back svg{width:17px}
.overview{display:grid;gap:14px;align-items:start}.control-grid{display:grid;gap:12px;min-width:0}.control-panel{background:var(--va-panel);border:1px solid var(--va-line);border-radius:15px;padding:17px;min-width:0;position:relative;overflow:hidden}.control-panel::before{content:'';position:absolute;inset:0 auto 0 0;width:3px;background:var(--va-green)}.control-panel.heating::before{background:var(--va-orange)}.control-head{display:flex;align-items:center;justify-content:space-between;gap:9px}.control-title{display:flex;align-items:center;gap:10px;min-width:0}.control-title h3{font-size:15px;font-weight:550;margin:0;overflow-wrap:anywhere}.control-title svg{color:var(--va-green);width:20px}.control-panel.heating .control-title svg{color:var(--va-orange)}.mode-pill{font-size:10px;padding:5px 8px;border:1px solid var(--va-line);border-radius:20px;color:var(--va-sub);text-align:right;max-width:50%;overflow-wrap:anywhere}.reading{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin:20px 0}.temperature strong{font-size:46px;font-weight:400;line-height:1;letter-spacing:-2px}.temperature .unit{font-size:18px;color:var(--va-sub);margin-left:5px}.temperature-label{font-size:11px;color:var(--va-sub);margin-top:7px}.secondary-reading{text-align:right;font-size:13px;color:var(--va-fg);line-height:1.5}.secondary-reading small{display:block;font-size:10px;color:var(--va-sub)}.setpoint-label{font-size:11px;color:var(--va-sub);display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.setpoint-label .pending{color:var(--va-green);font-size:10px}.stepper{display:grid;grid-template-columns:48px minmax(0,1fr) 48px;align-items:center;background:var(--va-raised);border:1px solid var(--va-line);border-radius:11px;overflow:hidden}.stepper button{height:48px;min-width:44px;background:transparent;border:0;font-size:27px;line-height:1;color:var(--va-green)}.stepper button:first-child{border-right:1px solid var(--va-line)}.stepper button:last-child{border-left:1px solid var(--va-line)}.stepper output{text-align:center;font-size:23px;font-variant-numeric:tabular-nums;letter-spacing:-.5px;white-space:nowrap}.stepper output span{font-size:14px;color:var(--va-sub);margin-left:3px}.control-mode{margin-top:12px}.control-mode .row{margin-bottom:0;padding:7px 0;background:none;border:0;min-height:44px}.control-mode .row>svg{display:none}.control-mode .row select{background:var(--va-raised)}.desktop-mode{display:none}.details-button{margin-top:12px;width:100%;min-height:44px;border:0;background:none;padding:5px 0 0;color:var(--va-sub);display:flex;align-items:center;justify-content:space-between;font-size:11px}.details-button svg{width:15px}
.overview-aside{display:grid;gap:14px;min-width:0;align-items:start}.surface{border:1px solid var(--va-line);border-radius:14px;padding:16px;background:var(--va-panel);min-width:0}.quick-body{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.quick-action{border:1px solid var(--va-line);border-radius:10px;background:var(--va-raised);min-width:0;min-height:88px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:7px;padding:10px 5px;text-align:center}.quick-action svg{width:20px;color:var(--va-sub)}.quick-action .action-label{font-size:10px;line-height:1.35;overflow-wrap:anywhere}.quick-action .action-state{font-size:9px;color:var(--va-sub)}.quick-action.on{background:var(--va-accent-bg);border-color:var(--va-green)}.quick-action.on svg,.quick-action.on .action-state{color:var(--va-green)}.overview-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.stat{background:var(--va-raised);border:1px solid var(--va-line);border-radius:10px;text-align:left;padding:12px 10px;min-width:0;min-height:78px}.stat small{font-size:10px;color:var(--va-sub);display:flex;align-items:center;gap:5px}.stat small svg{width:13px;height:13px;color:var(--va-green)}.overview-stats .stat:nth-child(n+3){display:none}.stat strong{display:block;font-size:17px;font-weight:500;margin-top:9px;overflow-wrap:anywhere}.aside-link{display:flex;align-items:center;justify-content:space-between;min-height:44px;width:100%;border:0;padding:12px 0 0;margin-top:9px;background:none;color:var(--va-green);font-size:11px}.aside-link svg{width:16px}
.row{width:100%;min-height:50px;border:0;border-radius:9px;background:var(--va-raised);margin-bottom:6px;padding:12px 10px;display:flex;align-items:center;gap:9px;text-align:left;font-size:12px;min-width:0}.row>svg{width:17px;color:var(--va-green)}.row>span:not(.value){min-width:0;overflow-wrap:anywhere}.row .value{margin-left:auto;text-align:right;color:var(--va-sub);max-width:55%;overflow-wrap:anywhere}.row .value svg{vertical-align:middle;width:13px;height:13px;margin-left:5px}.row select{margin-left:auto;max-width:62%;min-height:40px;padding:6px;border:1px solid var(--va-line);border-radius:7px;background:var(--va-panel);font-size:12px}.detail-layout{display:grid;gap:14px;align-items:start}.detail-layout .control-panel{padding:22px}.detail-layout .temperature strong{font-size:62px}.detail-layout .reading{margin:30px 0}.detail-layout .stepper{grid-template-columns:58px minmax(0,1fr) 58px}.detail-layout .stepper button{height:56px}.settings-stack{display:grid;gap:14px}.hint{font-size:11px;color:var(--va-sub);line-height:1.65;margin:14px 0 0}.hint:first-child{margin-top:0}
.energy-summary{display:grid;gap:10px;margin-bottom:16px}.energy-total{background:var(--va-accent-bg);border:1px solid var(--va-line);border-radius:14px;padding:20px}.energy-total small{display:flex;align-items:center;gap:8px;color:var(--va-sub);font-size:11px}.energy-total small svg{color:var(--va-green);width:17px}.energy-total strong{display:block;font-size:38px;font-weight:450;letter-spacing:-1.4px;margin:16px 0 7px;font-variant-numeric:tabular-nums}.energy-total strong span{font-size:17px;letter-spacing:0;color:var(--va-sub);margin-left:6px}.energy-total p{margin:0;color:var(--va-sub);font-size:11px;line-height:1.5}.energy-grid,.status-grid{display:grid;gap:14px;align-items:start}.energy-grid .surface .row:last-child,.status-grid .surface .row:last-child{margin-bottom:0}.energy-total.secondary{background:var(--va-panel)}
.status-line{display:flex;align-items:center;gap:9px;border:1px solid var(--va-line);background:var(--va-accent-bg);border-radius:10px;padding:14px;font-size:12px;line-height:1.4}.status-line svg{color:var(--va-green)}.status-line.warn{background:var(--va-error-bg);color:var(--va-error)}.status-line.neutral{background:var(--va-raised);color:var(--va-sub)}.status-line+.row{margin-top:8px}.warnmark{color:var(--va-error)}.availability{font-size:11px;line-height:1.7;border:1px dashed var(--va-line);border-radius:10px;padding:13px;margin-top:14px;color:var(--va-sub);overflow-wrap:anywhere}.availability code{font-size:10px;color:var(--va-fg)}.message{font-size:12px;line-height:1.6;background:var(--va-accent-bg);border:1px solid var(--va-line);border-radius:10px;padding:12px;margin-bottom:14px;color:var(--va-fg)}.message.error{background:var(--va-error-bg);color:var(--va-error)}.message button{float:right;background:none;border:0;padding:0 0 5px 10px;font-size:18px;color:inherit}.discovery:empty{display:none}.discovery{display:grid;gap:8px;margin-bottom:14px}.discovery .row{margin-bottom:0}.discovery .availability{margin-top:0}.discovery>button[data-discover]{background:none;color:var(--va-green);font-size:11px;min-height:38px;padding:8px 0}.discovery .small{padding:10px}
@container vaillant (min-width:620px){
 .top{padding:26px 24px 20px}.title{font-size:25px}.outside{font-size:20px;gap:10px}.outside small{display:block;margin-right:2px}.body{order:2;padding:0 22px 22px}.footer{order:1;position:static;display:flex;gap:6px;width:fit-content;border:1px solid var(--va-line);border-radius:12px;padding:4px;margin:0 22px 20px;background:var(--va-panel)}.nav{min-height:44px;min-width:120px;padding:9px 17px;flex-direction:row;gap:8px;font-size:12px;border-radius:8px}.nav svg{width:17px;height:17px}
 .control-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.control-panel{padding:21px}.control-title h3{font-size:17px}.reading{margin:27px 0}.temperature strong{font-size:58px}.temperature .unit{font-size:20px}.desktop-mode{display:block}.overview-aside{grid-template-columns:1.1fr 1fr}.overview-stats{gap:7px}.overview-stats .stat:nth-child(n+3){display:block}.stat{min-height:75px}.quick-body{grid-template-columns:repeat(3,minmax(0,1fr))}.quick-action{min-height:94px}.detail-layout{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.detail-layout .control-panel{position:sticky;top:12px}.detail-layout .reading{margin:35px 0}.energy-summary{grid-template-columns:1.25fr 1fr}.energy-grid,.status-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.discovery{grid-template-columns:repeat(2,minmax(0,1fr))}.discovery>.message,.discovery>.availability,.discovery>.small{grid-column:1/-1}.discovery>button[data-discover]{grid-column:1/-1}.page-heading{margin:3px 0 20px}
}
@container vaillant (min-width:1050px){
 .top{padding:30px 28px 23px}.title{font-size:28px}.body{padding:0 26px 26px}.footer{margin-left:26px;margin-bottom:23px}.overview{grid-template-columns:minmax(0,2.35fr) minmax(260px,1fr);gap:18px}.overview-aside{grid-template-columns:1fr;gap:16px}.control-grid{gap:18px}.control-panel{padding:26px}.control-grid>.control-panel{min-height:381px;display:flex;flex-direction:column}.control-grid .reading{margin:32px 0}.control-grid .temperature strong{font-size:64px}.control-grid .control-mode{margin-top:18px}.control-grid .details-button{margin-top:auto;padding-top:20px}.quick-body{grid-template-columns:1fr;gap:6px}.quick-action{min-height:46px;flex-direction:row;justify-content:flex-start;text-align:left;padding:10px 12px;gap:10px}.quick-action .action-label{font-size:11px}.quick-action .action-state{margin-left:auto;font-size:10px}.quick-action svg{width:18px}.overview-aside .surface{padding:16px}.overview-aside .stat{min-height:70px}.overview-aside .stat strong{font-size:17px}.detail-layout{grid-template-columns:minmax(300px,.85fr) minmax(0,1.15fr)}.settings-stack{grid-template-columns:1fr 1fr}.settings-stack .hint-surface{grid-column:1/-1}.energy-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.energy-summary{grid-template-columns:1fr 1fr}.energy-total{padding:24px}.energy-total strong{font-size:46px}.status-grid{grid-template-columns:1fr 1fr 1fr}.discovery{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@container vaillant (max-width:340px){.top{padding:18px 14px}.title{font-size:19px}.body{padding:0 10px 12px}.control-panel{padding:14px}.control-head{align-items:flex-start}.mode-pill{font-size:9px}.control-title h3{font-size:14px}.temperature strong{font-size:40px}.quick-action{padding:9px 3px}.quick-action .action-label{font-size:9px}.row{font-size:11px;gap:6px}.row select{max-width:58%;font-size:11px}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
/* Color schemes inherit the active HA mode; optional accents are set on the card. */
ha-card,ha-card.light{--va-accent-bg:color-mix(in srgb,var(--va-green) 15%,transparent);--va-nav-bg:var(--va-bg)}
ha-card .footer{background:var(--va-nav-bg)}
ha-card[data-color-scheme="home_assistant"]{
 --va-bg:var(--ha-card-background,var(--card-background-color,#1c1c1c));
 --va-panel:var(--secondary-background-color,#282828);
 --va-raised:color-mix(in srgb,var(--primary-text-color,#eee) 6%,transparent);
 --va-line:var(--ha-card-border-color,var(--divider-color,#444));
 --va-fg:var(--primary-text-color,#eee);--va-sub:var(--secondary-text-color,#aaa);
 --va-green:var(--primary-color,#03a9f4);--va-orange:var(--state-climate-heat-color,#ff9800);
 border-radius:var(--ha-card-border-radius,12px);box-shadow:var(--ha-card-box-shadow,none);
 backdrop-filter:var(--ha-card-backdrop-filter,none);-webkit-backdrop-filter:var(--ha-card-backdrop-filter,none)
}
ha-card.light[data-color-scheme="home_assistant"]{
 --va-bg:var(--ha-card-background,var(--card-background-color,#fff));
 --va-panel:var(--secondary-background-color,#f5f5f5);
 --va-line:var(--ha-card-border-color,var(--divider-color,#e0e0e0));
 --va-fg:var(--primary-text-color,#212121);--va-sub:var(--secondary-text-color,#666)
}
ha-card[data-color-scheme="glass"]{
 --va-bg:var(--ha-card-glass-tint,rgba(17,25,39,.55));--va-panel:rgba(255,255,255,.07);--va-raised:rgba(255,255,255,.075);
 --va-line:rgba(255,255,255,.20);--va-fg:var(--primary-text-color,#f3f6fc);--va-sub:var(--secondary-text-color,#bdcadc);
 --va-green:var(--primary-color,#80d8ff);--va-orange:var(--state-climate-heat-color,#ffc17e);--va-nav-bg:rgba(17,25,39,.88);
 border-radius:var(--ha-card-border-radius,20px);box-shadow:0 8px 32px rgba(0,0,0,.15),inset 0 1px 0 rgba(255,255,255,.13);
 backdrop-filter:var(--ha-card-backdrop-filter,blur(18px) saturate(1.15));-webkit-backdrop-filter:var(--ha-card-backdrop-filter,blur(18px) saturate(1.15))
}
ha-card.light[data-color-scheme="glass"]{
 --va-bg:var(--ha-card-glass-tint,rgba(255,255,255,.60));--va-panel:rgba(255,255,255,.32);--va-raised:rgba(255,255,255,.26);
 --va-line:rgba(30,50,80,.17);--va-fg:var(--primary-text-color,#172439);--va-sub:var(--secondary-text-color,#4e6179);
 --va-green:var(--primary-color,#007da8);--va-orange:var(--state-climate-heat-color,#9b580b);--va-nav-bg:rgba(244,248,255,.92);
 box-shadow:0 8px 32px rgba(30,45,65,.10),inset 0 1px 0 rgba(255,255,255,.7)
}
ha-card[data-color-scheme="glass"] select{background:rgba(20,29,43,.88)}
ha-card.light[data-color-scheme="glass"] select{background:rgba(255,255,255,.92)}
ha-card[data-color-scheme="graphite"]{
 --va-bg:#17191e;--va-panel:#20232a;--va-raised:#2a2e36;--va-line:#3a404b;
 --va-fg:#f1f3f8;--va-sub:#acb4c5;--va-green:#b7c7ed;--va-orange:#f3bc83
}
ha-card.light[data-color-scheme="graphite"]{
 --va-bg:#fff;--va-panel:#f4f5f8;--va-raised:#e9ecf2;--va-line:#d6dbe5;
 --va-fg:#202634;--va-sub:#576276;--va-green:#455f91;--va-orange:#985d1c
}
ha-card[data-color-scheme="ocean"]{
 --va-bg:#101c2c;--va-panel:#172a40;--va-raised:#20364f;--va-line:#304c69;
 --va-fg:#edf7ff;--va-sub:#a4bdd5;--va-green:#6fd4f7;--va-orange:#eebd7c
}
ha-card.light[data-color-scheme="ocean"]{
 --va-bg:#f9fcff;--va-panel:#eef6ff;--va-raised:#e0effc;--va-line:#c5dbed;
 --va-fg:#14334b;--va-sub:#4e6a83;--va-green:#0077a3;--va-orange:#975d11
}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
 ha-card[data-color-scheme="glass"]{--va-bg:#182333;--va-panel:#202f42;--va-raised:#293c52}
 ha-card.light[data-color-scheme="glass"]{--va-bg:#f4f7fc;--va-panel:#fff;--va-raised:#eaf0f7}
}
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
      if (!config || typeof config !== 'object') throw new Error('Configuration is missing.');
      if(config.entities && (typeof config.entities!=='object' || Array.isArray(config.entities))) throw new Error('entities must be a mapping.');
      for(const [key,id] of Object.entries(config.entities || {})) {
        if(!ENTITY_KEYS.includes(key) || (id!==null && (typeof id!=='string' || !/^[a-z_]+\.[a-z0-9_]+$/.test(id)))) throw new Error('Invalid entity mapping: '+key);
      }
      for(const key of ['zone','circuit','water']) if(config[key]!==undefined && !/^\d+$/.test(String(config[key]))) throw new Error(key+' must be a non-negative index.');
      if(config.color_scheme!==undefined && !Object.prototype.hasOwnProperty.call(COLOR_SCHEMES,config.color_scheme)) throw new Error('Unknown color scheme: '+String(config.color_scheme));
      for(const key of ['accent_color','heating_color']) if(config[key]!==undefined && !isHexColor(config[key])) throw new Error(key+' must be a hex color, for example #03a9f4.');
      if(config.language!==undefined && !['auto','en','de'].includes(config.language)) throw new Error('language must be auto, en, or de.');
      this._customTitle=Object.prototype.hasOwnProperty.call(config,'title');this._customZone=Object.prototype.hasOwnProperty.call(config,'zone_name');
      this._config={title:'Heat pump', zone_name:'Heating', color_scheme:DEFAULT_COLOR_SCHEME, language:'auto', ...config};
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
      const signature=JSON.stringify([hass.themes?.darkMode,getLanguage(this._config,hass),...Object.values(this._ids).filter(Boolean).map(id=>hass.states[id])]);
      if (signature !== this._signature) { this._signature=signature; this._render(); }
    }
    get hass(){return this._hass;}
    _language(){return getLanguage(this._config,this._hass);}
    _t(message){return translate(message,this._language());}
    _format(value,digits=1){return formatNumber(value,digits,this._language());}
    getCardSize(){return this._page==='home'?10:13;}
    getGridOptions(){return {columns:'full',min_columns:6,rows:'auto'};}
    static getConfigElement(){return document.createElement('vaillant-app-card-editor');}
    static getStubConfig(){return {type:'custom:vaillant-app-card'};}
    disconnectedCallback(){this._resetPending();}
    _resetPending() { for(const timer of Object.values(this._pendingTimers || {})) clearTimeout(timer); this._pendingTemps={}; this._pendingTimers={}; }
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
        this._discoveryError='Automatic matching failed. Retry discovery or specify entities in the local card YAML.';
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
      const titles={system:'System',zone:'Heating zone',water:'Hot-water tank',circuit:'Heating circuit',energy_device:'Energy device'};
      const pinned={system:'system_id',zone:'zone',water:'water',circuit:'circuit',energy_device:'energy_device_id'};
      const selectors=Object.entries(this._choices||{}).filter(([key,items])=>items.length>1 && this._config[pinned[key]]===undefined).map(([key,items])=>
        `<label class="row"><span>${this._t(titles[key])}</span><select data-discovery="${key}" aria-label="${this._t(titles[key])} selection" ${this._busy?'disabled':''}><option value="" disabled ${this._selected[key]===undefined?'selected':''}>Select an option</option>${items.map(i=>`<option data-no-localize value="${esc(i.value)}" ${String(this._selected[key])===String(i.value)?'selected':''}>${esc(key==='circuit'?this._t(i.label):i.label)}${i.disabled?this._t(' (disabled)'):''}</option>`).join('')}</select></label>`).join('');
      return `${this._discoveryBusy?'<div class="small muted" role="status">Matching myVAILLANT entities …</div>':''}${this._discoveryError?`<div class="message error">${esc(this._discoveryError)}</div>`:''}${selectors}${this._discoveryIssues?.length?`<div class="availability">${this._discoveryIssues.map(esc).join('<br>')}</div>`:''}${this._discoveryError || this._discoveryIssues?.length || this._page==='status'?'<button class="row" data-discover>Discover entities again</button>':''}`;
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
      const pending=this._pendingTemps?.[key];
      if(pending){
        if(actual!==null && Math.abs(actual-pending.value)<.01){clearTimeout(this._pendingTimers[key]);delete this._pendingTimers[key];delete this._pendingTemps[key];}
        else return pending.value;
      }
      return actual;
    }
    _formatSensor(key,digits=1){const e=this._entity(key);return this._num(key)===null?'—':`${this._format(e.state,digits)}${e.attributes.unit_of_measurement?' '+esc(e.attributes.unit_of_measurement):''}`;}
    _offline(){return this._state('online')==='off';}
    _canTemp(water){const k=water?'water_heater':'climate';return this._ok(k)&&!this._offline()&&((Number(this._attr(k,'supported_features'))&1)===1)&&this._target(water)!==null;}
    _row(label,key,ic='info',value=null){return `<button class="row" data-more="${esc(key)}">${icon(ic)}<span>${esc(label)}</span><span class="value">${value===null?esc(this._state(key)===null?'Unavailable':modeName(this._state(key))):value}${icon('arrow')}</span></button>`;}
    _metric(label,key,ic,digits=1){return `<button class="row" data-more="${esc(key)}">${icon(ic)}<span>${esc(label)}</span><span class="value">${this._formatSensor(key,digits)}${icon('arrow')}</span></button>`;}
    _toggle(label,key,ic){const on=this._state(key)==='on';return `<button class="quick-action ${on?'on':''}" data-toggle="${key}" aria-pressed="${on}" ${!this._ok(key)||this._busy||this._offline()?'disabled':''}>${icon(ic)}<span class="action-label">${esc(label)}</span><span class="action-state">${on?'Active':'Off'}</span></button>`;}
    _banner(){
      if(this._offline())return this._offlineNotice()+(this._state('trouble')==='on'?this._row('Fault details','trouble','info','Fault'):'');
      if(this._state('trouble')==='on')return `<button class="row" data-more="trouble">${icon('info')}<span class="warnmark">System reports a fault</span><span class="value">${icon('arrow')}</span></button>`;
      if(this._state('online')==='on'&&this._state('trouble')==='off')return `<div class="status-line">${icon('check')}No fault reported by the system</div>`;
      return `<div class="status-line neutral">${icon('info')}System status is not fully available</div>`;
    }
    _modeSelect(water){
      const key=water?'water_heater':'climate';
      const modes=this._attr(key,water?'operation_list':'hvac_modes') || [];
      const active=water?this._attr(key,'operation_mode'):this._state(key);
      if(!Array.isArray(modes)||!modes.length)return this._row('Operating mode',key,'settings');
      const disabled=!this._ok(key)||this._busy||this._offline()||(water&&!(Number(this._attr(key,'supported_features'))&2));
      return `<label class="row">${icon('settings')}<span>Operating mode</span><select data-mode="${key}" aria-label="Operating mode ${water?this._t('Hot water'):this._t('Heating')}" ${disabled?'disabled':''}>${modes.includes(active)?'':`<option selected disabled value="">${esc(modeName(active))}</option>`}${modes.map(m=>`<option value="${esc(m)}" ${m===active?'selected':''}>${esc(modeName(m))}</option>`).join('')}</select></label>`;
    }
    _energyValue(key){const n=this._num(key),unit=this._attr(key,'unit_of_measurement');return n===null?null:unit==='Wh'?n/1000:unit==='kWh'?n:unit==='MWh'?n*1000:null;}
    _availability(key){
      if(!this._ids[key])return 'Not assigned';
      if(this._registry?.entities.find(e=>e.entity_id===this._ids[key])?.disabled_by)return 'Disabled in Home Assistant';
      if(!this._ok(key))return 'Unavailable';
      return this._num(key)===null?'No numeric reading':'Unsupported energy unit';
    }
    _energyRow(label,key,ic){const n=this._energyValue(key);return this._row(label,key,ic,n===null?this._availability(key):`${this._format(n,2)} kWh`);}
    _temperatureReason(water){
      const key=water?'water_heater':'climate';
      if(!this._ids[key])return 'Control entity is not assigned.';
      if(this._registry?.entities.find(e=>e.entity_id===this._ids[key])?.disabled_by)return 'Control entity is disabled in Home Assistant.';
      if(!this._ok(key))return 'Control entity is unavailable.';
      if(!(Number(this._attr(key,'supported_features'))&1))return 'Entity does not report temperature control support.';
      if(this._target(water)===null)return 'No target temperature reported.';
      return '';
    }
    _offlineNotice(){return this._offline()?`<button class="row" data-more="online">${icon('info')}<span>Online sensor reports offline. Controls are disabled; open the sensor to check its state.</span>${icon('arrow')}</button>`:'';}
    _circuitLabel(){return this._selected.circuit===undefined?'Heating circuit':`Heating circuit ${Number(this._selected.circuit)+1}`;}
    _stat(label,key,ic,digits=1) {
      return `<button class="stat" data-more="${esc(key)}"><small>${icon(ic)}${esc(label)}</small><strong>${this._formatSensor(key,digits)}</strong></button>`;
    }
    _home(){return `${this._offlineNotice()}<div class="overview">
      <div class="control-grid">${this._controlPanel(false)}${this._controlPanel(true)}</div>
      <aside class="overview-aside">
        <section class="surface"><div class="section">Quick actions</div><div class="quick-body">${this._toggle('Hot-water boost','boost','water')}${this._toggle('Ventilation boost','ventilation','wind')}${this._toggle('Away','away','home')}</div></section>
        <section class="surface"><div class="section">System data</div><div class="overview-stats">${this._stat('Flow temperature','flow','heat')}${this._stat('Water pressure','pressure','pressure')}${this._stat('Outside','outdoor','temp')}${this._stat('Efficiency','efficiency','leaf',2)}</div><button class="aside-link" data-page="status">All system data${icon('arrow')}</button></section>
      </aside></div>`;}
    _controlPanel(water,detail=false) {
      const key=water?'water_heater':'climate',name=water?this._t('Hot water'):this._customZone?this._config.zone_name:this._t('Heating');
      const target=this._target(water),current=this._current(water);
      const mode=water?this._attr(key,'operation_mode') || this._state(key):this._state('heating_mode') || this._state(key);
      const humidity=this._first(this._attr('climate','current_humidity'),this._num('humidity'));
      const min=numeric(this._attr(key,'min_temp')),max=numeric(this._attr(key,'max_temp'));
      const blocked=!this._canTemp(water)||this._busy;
      return `<article class="control-panel ${water?'water':'heating'}" aria-label="${esc(name)}" data-preserve-aria>
        <div class="control-head"><div class="control-title">${icon(water?'water':'heat')}<h3 data-no-localize>${esc(name)}</h3></div><span class="mode-pill">${esc(modeName(mode))}</span></div>
        <div class="reading"><div class="temperature"><strong>${this._format(current)}</strong><span class="unit">°C</span><div class="temperature-label">${water?'Tank temperature':'Room temperature'}</div></div><div class="secondary-reading">${water?icon('water'):`${this._format(humidity,0)} %`}<small>${water?'Current reading':'Humidity'}</small></div></div>
        <div class="setpoint-label"><span>Target temperature</span>${this._pendingTemps?.[key]?'<span class="pending" role="status">Awaiting confirmation …</span>':''}</div>
        <div class="stepper"><button data-step="-1" data-control="${key}" aria-label="${esc(name)}: ${esc(this._t('Decrease target temperature'))}" data-preserve-aria ${blocked||(min!==null&&target<=min)?'disabled':''}>−</button><output aria-label="${esc(name)}: ${esc(this._t('Target temperature'))}" data-preserve-aria>${this._format(target)}<span>°C</span></output><button data-step="1" data-control="${key}" aria-label="${esc(name)}: ${esc(this._t('Increase target temperature'))}" data-preserve-aria ${blocked||(max!==null&&target>=max)?'disabled':''}>+</button></div>
        <div class="control-mode ${detail?'':'desktop-mode'}">${this._modeSelect(water)}</div>
        ${detail?'':`<button class="details-button" data-page="${water?'water':'heating'}" aria-label="${esc(name)}: ${esc(this._t('Open settings'))}" data-preserve-aria>Mode & settings${icon('arrow')}</button>`}
        ${this._temperatureReason(water)?`<p class="hint">${esc(this._temperatureReason(water))}</p>`:''}${detail?this._offlineNotice():''}
      </article>`;
    }
    _detail(water){return `<div class="page-heading"><button class="back" data-page="home">${icon('back')}Overview</button><small>${water?this._t('Hot water'):this._t('Heating')} settings</small></div>
      <div class="detail-layout">${this._controlPanel(water,true)}<div class="settings-stack">
        <section class="surface"><div class="section">Schedules</div>${this._row('Weekly schedule',water?'water_calendar':'heating_calendar','calendar','Open')}${water?this._row('Circulation','circulation_calendar','clock','Open'):this._row('Override duration','veto_duration','clock',this._formatSensor('veto_duration'))}<p class="hint">Edit weekly schedules in the Home Assistant calendar.</p></section>
        <section class="surface"><div class="section">${water?'Comfort':'Control'}</div>${water?`<div class="quick-body">${this._toggle('Hot-water boost','boost','water')}</div>`:this._row('Heating curve','heating_curve','settings',this._formatSensor('heating_curve',2))}${this._row('More settings',water?'water_heater':'climate','settings','Open')}</section>
        ${water?'':`<section class="surface hint-surface"><div class="section">Temperature in scheduled mode</div><p class="hint">A target change may apply as a temporary override. Check its duration in the corresponding integration setting.</p></section>`}
      </div></div>`;}
    _energyKeys(){return ['electric_heating','electric_water','environment_heating','environment_water','heat_heating','heat_water','hydraulic_electric','hydraulic_heat'];}
    _energy(){const a=this._energyValue('electric_heating'),b=this._energyValue('electric_water');return `
      <div class="page-heading"><h2>Energy overview</h2><small>Sensor readings</small></div>${this._energyKeys().some(k=>this._energyValue(k)===null)?'<button class="row" data-page="status">Some energy readings are missing. Open System for assignment and availability details.</button>':''}
      <div class="energy-summary"><section class="energy-total"><small>${icon('energy')}Electrical energy</small><strong>${this._format(a===null||b===null?null:a+b,2)}<span>kWh</span></strong><p>Heating and hot water · Energy device</p></section><section class="energy-total secondary"><small>${icon('leaf')}Energy efficiency</small><strong>${this._format(this._num('efficiency'),2)}</strong><p>Reported value for heating and hot water</p></section></div>
      <div class="energy-grid">
        <section class="surface"><div class="section">Electrical energy</div>${this._energyRow('Heating','electric_heating','heat')}${this._energyRow('Hot water','electric_water','water')}</section>
        <section class="surface"><div class="section">Environmental yield</div>${this._energyRow('Heating','environment_heating','leaf')}${this._energyRow('Hot water','environment_water','leaf')}</section>
        <section class="surface"><div class="section">Heat output</div>${this._energyRow('Heating','heat_heating','heat')}${this._energyRow('Hot water','heat_water','water')}</section>
        <section class="surface"><div class="section">Hydraulic station · separate</div>${this._energyRow('Heating electrical energy','hydraulic_electric','energy')}${this._energyRow('Heating heat output','hydraulic_heat','heat')}</section>
      </div><p class="hint">Period and freshness depend on the integration. The hydraulic station is shown separately.</p>`;}
    _status(){const required=['climate','water_heater','online','trouble','outdoor','flow','pressure'];const missing=required.filter(k=>!this._ok(k));return `
      <div class="page-heading"><h2>System & maintenance</h2><small>System overview</small></div><div class="status-grid">
        <section class="surface"><div class="section">System status</div>${this._banner()}${this._row('Cloud connection','online','info',this._state('online')==='on'?'Connected':this._state('online')==='off'?'Disconnected':'Unavailable')}${this._row('Operating state','operating_state','settings')}${this._row(this._circuitLabel(),'circuit_state','heat')}</section>
        <section class="surface"><div class="section">System data</div>${this._metric('Water pressure','pressure','pressure')}${this._metric('Flow temperature '+this._circuitLabel(),'flow','heat')}${this._metric('Target flow temperature','flow_target','temp')}${this._metric('System flow temperature','system_flow','temp')}</section>
        <section class="surface"><div class="section">Temperatures</div>${this._metric('Room temperature','room','home')}${this._metric('Hot-water tank','tank','water')}${this._metric('Outdoor temperature','outdoor','temp')}</section>
        <section class="surface"><div class="section">Maintenance</div>${this._row('Fault details','trouble','info',this._state('trouble')==='on'?'Fault':this._state('trouble')==='off'?'None reported':'Unavailable')}${this._row('Firmware','firmware','info')}${this._row('Firmware update','firmware_update','info',this._state('firmware_update')==='on'?'Available':this._state('firmware_update')==='off'?'None reported':'Unavailable')}</section>
      </div>${this._energyKeys().some(k=>this._energyValue(k)===null)?`<section class="surface"><div class="section">Energy entity diagnostics</div>${this._energyKeys().filter(k=>this._energyValue(k)===null).map(k=>`<div class="hint"><code>${esc(k)}</code>: ${esc(this._t(this._availability(k)))}${this._ids[k]?`<br><code>${esc(this._ids[k])}</code>`:''}</div>`).join('')}</section>`:''}${missing.length?`<div class="availability"><b>Missing or unavailable entities</b><br>${missing.map(k=>`<code>${esc(this._ids[k] || k+' (not assigned)')}</code>`).join('<br>')}<br>Enable them in entity settings if needed.</div>`:''}`;
    }
    _render(){
      if(!this._config||!this._hass)return;
      const page=this._page,tab=['heating','water'].includes(page)?'home':page;
      const contents=page==='home'?this._home():page==='energy'?this._energy():page==='status'?this._status():this._detail(page==='water');
      const notice=this._error||this._notice;
      const accents=[this._config.accent_color?'--va-green:'+this._config.accent_color+';':'',this._config.heating_color?'--va-orange:'+this._config.heating_color+';':''].join('');
      this.shadowRoot.innerHTML=`<style>${CSS}</style><ha-card lang="${this._language()}" data-color-scheme="${esc(this._config.color_scheme)}" style="${accents}" class="${this._hass.themes?.darkMode===false?'light':'dark'}"><header class="top"><div><div class="eyebrow">Heating & hot water</div><div class="title" data-no-localize>${esc(this._customTitle?this._config.title:this._t('Heat pump'))}</div></div><div class="outside">${icon('temp')}<div><small>Outdoor temperature</small>${this._formatSensor('outdoor')}</div></div></header><main class="body"><div class="discovery">${this._discoveryPanel()}</div>${notice?`<div class="message ${this._error?'error':''}" role="${this._error?'alert':'status'}"><button data-dismiss aria-label="Dismiss message">×</button>${esc(notice)}</div>`:''}${contents}</main><nav class="footer" aria-label="Heat pump">${[['home','Overview'],['energy','Energy'],['status','System']].map(([p,label])=>`<button class="nav ${tab===p?'active':''}" data-page="${p}" ${tab===p?'aria-current="page"':''}>${icon(p)}${label}</button>`).join('')}</nav></ha-card>`;
      localize(this.shadowRoot,this._language());
    }
    _more(key){const id=this._ids[key];if(!id)return;this.dispatchEvent(new CustomEvent('hass-more-info',{detail:{entityId:id},bubbles:true,composed:true}));}
    async _call(key,service,data={}){
      if(this._busy||!this._ok(key)||this._offline())return false;
      this._busy=true;this._error=null;this._notice=null;this._render();
      try{await this._hass.callService(this._ids[key].split('.')[0],service,{entity_id:this._ids[key],...data});this._notice='Sent. The myVAILLANT integration may take a moment to confirm the change.';return true;}
      catch(e){this._error=`Change not applied: ${e?.message||String(e)}`;return false;}
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
        const water=el.dataset.control?el.dataset.control==='water_heater':this._page==='water',key=water?'water_heater':'climate';if(!this._canTemp(water))return;
        const step=numeric(this._attr(key,'target_temp_step'))|| (water?1:.5);
        let value=Math.round((this._target(water)+Number(el.dataset.step)*step)*100)/100;
        const min=numeric(this._attr(key,'min_temp')),max=numeric(this._attr(key,'max_temp'));
        if(min!==null)value=Math.max(min,value);if(max!==null)value=Math.min(max,value);
        this._pendingTemps[key]={value};clearTimeout(this._pendingTimers[key]);
        const ok=await this._call(key,'set_temperature',{temperature:value});
        if(!ok){delete this._pendingTemps[key];delete this._pendingTimers[key];this._render();return;}
        if(this._pendingTemps[key])this._pendingTimers[key]=setTimeout(()=>{if(this._pendingTemps[key]){delete this._pendingTemps[key];delete this._pendingTimers[key];this._notice='Target temperature not confirmed yet. Showing the reported value again.';this._render();}},45000);
      }
    }
    async _change(event){const el=event.target;if(el.dataset.discovery){if(this._busy)return;this._resetPending();this._notice=null;this._error=null;const key=el.dataset.discovery;if(key==='system')this._selected={system:el.value};else if(key==='zone'){delete this._selected.circuit;this._selected.zone=el.value;}else this._selected[key]=el.value;this._applyDiscovery();this._render();return;}if(!el.dataset.mode)return;const key=el.dataset.mode;await this._call(key,key==='climate'?'set_hvac_mode':'set_operation_mode',key==='climate'?{hvac_mode:el.value}:{operation_mode:el.value});}
  }
  class VaillantAppCardEditor extends HTMLElement {
    constructor(){super();this.attachShadow({mode:'open'});this._config={};this.shadowRoot.addEventListener('change',event=>this._change(event));}
    setConfig(config){this._config={...config};this._error=null;this._render();}
    set hass(hass){const previous=getLanguage(this._config,this._hass);this._hass=hass;if(previous!==getLanguage(this._config,hass))this._render();}
    _change(event){
      const key=event.target.dataset.key,value=event.target.value;
      if(!['title','zone_name','color_scheme','accent_color','heating_color','language'].includes(key))return;
      if(key==='language'&&!['auto','en','de'].includes(value))return;
      if(key==='color_scheme'&&!Object.prototype.hasOwnProperty.call(COLOR_SCHEMES,value))return;
      if(['accent_color','heating_color'].includes(key)&&value.trim()&&!isHexColor(value.trim())){
        this._error='Enter a hex color such as #03a9f4, or leave the field empty.';this._render();return;
      }
      const config={...this._config,type:this._config.type || 'custom:vaillant-app-card'};
      if(value.trim())config[key]=value.trim();else delete config[key];
      this._config=config;this._error=null;
      this.dispatchEvent(new CustomEvent('config-changed',{detail:{config},bubbles:true,composed:true}));
      this._render();
    }
    _render(){
      const field=(key,label,placeholder)=>`<label>${label}<input data-key="${key}" value="${esc(this._config[key] || '')}" placeholder="${placeholder}" spellcheck="false"></label>`;
      this.shadowRoot.innerHTML=`<style>
        :host{display:block;color:var(--primary-text-color,#212121);font-family:inherit}*{box-sizing:border-box}.fields{display:grid;gap:16px;padding:8px 0}label{display:grid;gap:7px;font-size:13px}input,select{font:inherit;color:inherit;min-height:44px;border:1px solid var(--divider-color,#ccc);border-radius:8px;background:var(--card-background-color,#fff);padding:10px 12px;width:100%}input:focus-visible,select:focus-visible{outline:2px solid var(--primary-color,#03a9f4);outline-offset:2px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}p{font-size:12px;line-height:1.6;margin:0;color:var(--secondary-text-color,#666)}.error{color:var(--error-color,#b3261e)}@media(max-width:500px){.pair{grid-template-columns:1fr}}
        </style><div class="fields" lang="${getLanguage(this._config,this._hass)}">
        <div class="pair">${field('title','Title','Heat pump')}${field('zone_name','Heating name','Heating')}</div>
        <label>Language<select data-key="language">${[['auto','Automatic (Home Assistant)'],['de','German'],['en','English']].map(([value,label])=>`<option value="${value}" ${value===(this._config.language || 'auto')?'selected':''}>${label}</option>`).join('')}</select></label>
        <label>Color scheme<select data-key="color_scheme">${Object.entries(COLOR_SCHEMES).map(([key,name])=>`<option value="${key}" ${key===(this._config.color_scheme || DEFAULT_COLOR_SCHEME)?'selected':''}>${name}</option>`).join('')}</select></label>
        <p>Home Assistant uses your active theme colors. Glass uses translucent surfaces; a dashboard background makes the effect more visible. Light/dark mode follows Home Assistant.</p>
        <div class="pair">${field('accent_color','Accent color · optional','#03a9f4')}${field('heating_color','Heating color · optional','#ff9800')}</div>
        <p>Enter colors as hex values. Empty fields use the selected scheme. Additional settings are available in the YAML editor.</p>
        ${this._error?`<p class="error" role="alert">${esc(this._error)}</p>`:''}</div>`;
      localize(this.shadowRoot,getLanguage(this._config,this._hass));
    }
  }
  if(!customElements.get('vaillant-app-card-editor'))customElements.define('vaillant-app-card-editor',VaillantAppCardEditor);
  if(!customElements.get('vaillant-app-card'))customElements.define('vaillant-app-card',VaillantAppCard);
  window.customCards=window.customCards||[];
  if(!window.customCards.some(c=>c.type==='vaillant-app-card'))window.customCards.push({type:'vaillant-app-card',name:'Vaillant App Card',description:'Responsive heating, hot water, energy and system controls for myVAILLANT.',preview:true});
})();
