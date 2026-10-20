const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

function environment(){
  const definitions=new Map();
  class Element {
    attachShadow(){this.shadowRoot={innerHTML:'',addEventListener(){}};}
    dispatchEvent(){return true;}
  }
  const context={HTMLElement:Element,window:{},customElements:{get:k=>definitions.get(k),define:(k,v)=>definitions.set(k,v)},setTimeout:()=>0,clearTimeout(){},CustomEvent:class {constructor(type,options){this.type=type;Object.assign(this,options);}}};
  vm.createContext(context);
  const source=fs.readFileSync(path.join(__dirname,'../vaillant-app-card.js'),'utf8');
  vm.runInContext(source.replace("  if(!customElements.get('vaillant-app-card'))","  window.testResolver=resolveEntities; window.testLanguage=getLanguage; window.testTranslate=translate;\n  if(!customElements.get('vaillant-app-card'))"),context);
  return {language:context.window.testLanguage,translate:context.window.testTranslate,resolve:context.window.testResolver,Card:definitions.get('vaillant-app-card'),Editor:definitions.get('vaillant-app-card-editor')};
}
function fixture(system='example-system',entityPrefix='example'){
  const entities=[];
  const add=(dom,uid,name,id,options={})=>{
    const e={entity_id:`${dom}.${id||entityPrefix+'_'+entities.length}`,platform:'mypyllant',unique_id:`mypyllant_${system}_${uid}`,original_name:name,name:null,device_id:'example-home',disabled_by:null,config_entry_id:'example-entry',...options};
    entities.push(e);return e.entity_id;
  };
  const ids={};
  ids.firmware=add('sensor','home_base','Example Firmware Version');
  ids.climate=add('climate','zone_1_climate','Example Zone 1 (Circuit 0) Climate','renamed_'+entityPrefix);
  ids.room=add('sensor','zone_1_current_temperature','Example Current Temperature');
  ids.humidity=add('sensor','zone_1_humidity','Example Humidity');
  ids.water_heater=add('water_heater','domestic_hot_water_0_base','Example Hot Water');
  ids.water_target=add('sensor','domestic_hot_water_0_set_point','Example Setpoint');
  ids.boost=add('switch','domestic_hot_water_0_boost_switch','Example Boost');
  ids.water_calendar=add('calendar','domestic_hot_water_0_heating_calendar','Example Water Schedule');
  ids.heating_calendar=add('calendar','zone_1_heating_calendar','Example Heating Schedule');
  ids.circulation_calendar=add('calendar','domestic_hot_water_0_circulation_calendar','Example Circulation');
  ids.online=add('binary_sensor','home_control_online','Example Online');
  ids.trouble=add('binary_sensor','home_control_error','Example Trouble');
  ids.away=add('switch','home_holiday_switch','Example Away');
  ids.flow=add('sensor','circuit_0_flow_temperature','Example Flow');
  add('sensor','circuit_1_flow_temperature','Other Flow');
  ids.heating_curve=add('number','circuit_0_heating_curve','Example Curve');
  entities.at(-1).unique_id=entities.at(-1).unique_id.replace('mypyllant_','mypyllant ');
  ids.efficiency=add('sensor','heating_energy_efficiency','Example Efficiency');
  ids.electric_heating=add('sensor','opaque-device_0_0','Example Device 0 aroTHERM plus Consumed Electrical Energy Heating','renamed_energy_'+entityPrefix,{device_id:'example-outer'});
  ids.electric_water=add('sensor','opaque-device_1_0','Example Device 0 aroTHERM plus Consumed Electrical Energy Domestic Hot Water',null,{device_id:'example-outer'});
  ids.hydraulic_electric=add('sensor','other-opaque-device_0_1','Example Device 1 Hydraulic station Consumed Electrical Energy Heating',null,{device_id:'example-hydraulic'});
  const devices=[{id:'example-home',name:'Example home'},{id:'example-outer',model:'aroTHERM plus',name:'Example heat pump'},{id:'example-hydraulic',model:'Hydraulic station',name:'Example hydraulic'}];
  return {registry:{entities,devices},ids,add};
}

test('maps integration unique IDs after entity renaming, including legacy space and DHW set_point',()=>{
  const {resolve}=environment();const f=fixture();const r=resolve(f.registry,{});
  for(const [key,id] of Object.entries(f.ids))assert.equal(r.ids[key],id,key);
  assert.equal(r.selected.circuit,'0');assert.equal(r.selected.zone,'1');
});
test('ignores lookalike entities from another integration',()=>{
  const {resolve}=environment();const f=fixture();f.registry.entities.push({...f.registry.entities[1],entity_id:'climate.decoy',platform:'other'});
  assert.equal(resolve(f.registry,{}).ids.climate,f.ids.climate);
});
test('requires a system choice when several systems are present',()=>{
  const {resolve}=environment();const a=fixture(),b=fixture('second-system','second');const registry={entities:[...a.registry.entities,...b.registry.entities],devices:a.registry.devices};
  const pending=resolve(registry,{});assert.equal(pending.ids.climate,null);assert.equal(pending.choices.system.length,2);
  const selected=resolve(registry,{}, {system:'second-system'});assert.equal(selected.ids.climate,b.ids.climate);assert.equal(selected.ids.flow,b.ids.flow);
});
test('does not guess a heating zone or mix its circuit',()=>{
  const {resolve}=environment();const f=fixture();const second=f.add('climate','zone_2_climate','Example Zone 2 (Circuit 1) Climate');
  const r=resolve(f.registry,{});assert.equal(r.ids.climate,null);assert.equal(r.ids.flow,null);
  const chosen=resolve(f.registry,{zone:2});assert.equal(chosen.ids.climate,second);assert.notEqual(chosen.ids.flow,f.ids.flow);
});
test('does not guess a circuit when the association is unknown',()=>{
  const {resolve}=environment();const f=fixture();f.registry.entities.find(e=>e.entity_id===f.ids.climate).original_name='Renamed original';
  assert.equal(resolve(f.registry,{}).ids.flow,null);
  assert.equal(resolve(f.registry,{circuit:0}).ids.flow,f.ids.flow);
});
test('preserves disabled entity mapping without claiming availability',async()=>{
  const {Card}=environment();const f=fixture();f.registry.entities.find(e=>e.entity_id===f.ids.climate).disabled_by='user';
  const c=new Card();c.setConfig({});c.hass={connection:{},states:{},callWS:async({type})=>type.includes('entity_registry')?f.registry.entities:f.registry.devices};
  await c._discoveryPromise;assert.equal(c._ids.climate,f.ids.climate);assert.equal(c._canTemp(false),false);
});
test('energy mapping uses original metadata, keeps hydraulic energy separate, and rejects ambiguity',()=>{
  const {resolve}=environment();const f=fixture();let r=resolve(f.registry,{});assert.equal(r.ids.electric_heating,f.ids.electric_heating);assert.equal(r.ids.hydraulic_electric,f.ids.hydraulic_electric);
  f.registry.entities.push({...f.registry.entities.find(e=>e.entity_id===f.ids.electric_heating),entity_id:'sensor.another_device',device_id:'example-another-outer',unique_id:'mypyllant_example-system_another_0_2'});
  r=resolve(f.registry,{});assert.equal(r.ids.electric_heating,null);assert.equal(r.choices.energy_device.length,2);
  assert.equal(resolve(f.registry,{}, {energy_device:'example-outer'}).ids.electric_heating,f.ids.electric_heating);
});
test('explicit local entity overrides take precedence and can disable individual values',()=>{
  const {resolve}=environment();const f=fixture();const r=resolve(f.registry,{entities:{room:'sensor.custom_room',outdoor:null}});
  assert.equal(r.ids.room,'sensor.custom_room');assert.equal(r.ids.outdoor,null);
});
test('shares registry reads per HA connection and refreshes only on demand',async()=>{
  const {Card}=environment();const f=fixture();let count=0;const hass={connection:{},states:{},callWS:async({type})=>{count++;return type.includes('entity_registry')?f.registry.entities:f.registry.devices;}};
  const a=new Card(),b=new Card();a.setConfig({});b.setConfig({});a.hass=hass;b.hass=hass;await Promise.all([a._discoveryPromise,b._discoveryPromise]);assert.equal(count,2);
  a.hass={...hass};await a._discoveryPromise;assert.equal(count,2);
  await a._discover(true);assert.equal(count,4);
});
test('registry permissions failure is visible and manual mode still works',async()=>{
  const {Card}=environment();const c=new Card();c.setConfig({entities:{climate:'climate.local_override'}});c.hass={connection:{},states:{},callWS:async()=>{throw Error('permission denied');}};await c._discoveryPromise;
  assert.ok(c._discoveryError);assert.equal(c._ids.climate,'climate.local_override');
  const m=new Card();m.setConfig({auto_discover:false,entities:{climate:'climate.local_override'}});let called=false;m.hass={connection:{},states:{},callWS:async()=>{called=true;}};await m._discoveryPromise;assert.equal(called,false);
});
test('stale registry replies cannot overwrite a newer configuration',async()=>{
  const {Card}=environment();const f=fixture();let release;const wait=new Promise(r=>release=r);const c=new Card();c.setConfig({});c.hass={connection:{},states:{},callWS:async({type})=>{await wait;return type.includes('entity_registry')?f.registry.entities:f.registry.devices;}};const pending=c._discoveryPromise;
  c.setConfig({auto_discover:false,entities:{climate:'climate.new_configuration'}});release();await pending;assert.equal(c._ids.climate,'climate.new_configuration');
});
test('temperature actions use discovered entity IDs and reported limits',async()=>{
  const {Card}=environment();const f=fixture();const calls=[];const c=new Card();c.setConfig({});
  c.hass={connection:{},states:{[f.ids.climate]:{state:'auto',attributes:{supported_features:1,temperature:21,current_temperature:20,min_temp:7,max_temp:35,target_temp_step:.5}}},callWS:async({type})=>type.includes('entity_registry')?f.registry.entities:f.registry.devices,callService:async(...args)=>calls.push(args)};
  await c._discoveryPromise;c._page='heating';await c._click({target:{closest:()=>({disabled:false,dataset:{step:'1'},hasAttribute:()=>false})}});
  assert.equal(calls[0][0],'climate');assert.equal(calls[0][1],'set_temperature');assert.equal(calls[0][2].entity_id,f.ids.climate);assert.equal(calls[0][2].temperature,21.5);
});
test('overview controls keep heating and hot-water targets and confirmations separate',async()=>{
  const {Card}=environment();const f=fixture();const calls=[];const c=new Card();c.setConfig({});
  const states={
    [f.ids.climate]:{state:'auto',attributes:{supported_features:1,temperature:21,current_temperature:20,min_temp:7,max_temp:35,target_temp_step:.5}},
    [f.ids.water_heater]:{state:'Time Controlled',attributes:{supported_features:3,temperature:50,current_temperature:48,min_temp:35,max_temp:70}}
  };
  c.hass={connection:{},states,callWS:async({type})=>type.includes('entity_registry')?f.registry.entities:f.registry.devices,callService:async(...args)=>calls.push(args)};
  await c._discoveryPromise;c._page='home';
  const step=control=>({target:{closest:()=>({disabled:false,dataset:{step:'1',control},hasAttribute:()=>false})}});
  await c._click(step('water_heater'));await c._click(step('climate'));
  assert.equal(calls[0][2].entity_id,f.ids.water_heater);assert.equal(calls[0][2].temperature,51);
  assert.equal(calls[1][2].entity_id,f.ids.climate);assert.equal(calls[1][2].temperature,21.5);
  assert.equal(c._target(true),51);assert.equal(c._target(false),21.5);assert.equal(c._page,'home');
  states[f.ids.climate].attributes.temperature=21.5;
  assert.equal(c._target(false),21.5);assert.equal(c._target(true),51);assert.ok(c._pendingTemps.water_heater);assert.equal(c._pendingTemps.climate,undefined);
});
test('HA colors are the default and explicit schemes remain supported',()=>{
  const {Card,Editor}=environment();const c=new Card();c.setConfig({});assert.equal(c._config.color_scheme,'home_assistant');
  const editor=new Editor();editor.setConfig({});assert.ok(editor.shadowRoot.innerHTML.includes('value="home_assistant" selected'));
  editor.setConfig({color_scheme:'vaillant'});assert.ok(editor.shadowRoot.innerHTML.includes('value="vaillant" selected'));
  for(const color_scheme of ['vaillant','home_assistant','glass','graphite','ocean']){c.setConfig({color_scheme,accent_color:'#03a9f4',heating_color:'#f90'});assert.equal(c._config.color_scheme,color_scheme);}
  assert.throws(()=>c.setConfig({color_scheme:'unknown'}));
  for(const accent_color of ['red;display:none','#12345','#fff" onclick="alert(1)','var(--anything)'])assert.throws(()=>c.setConfig({accent_color}));
});
test('visual editor preserves existing entity mappings and optional settings',()=>{
  const {Editor}=environment();const editor=new Editor();let event;
  editor.dispatchEvent=e=>{event=e;return true;};
  editor.setConfig({type:'custom:vaillant-app-card',entities:{room:'sensor.example_room'},zone:1});
  editor._change({target:{dataset:{key:'color_scheme'},value:'glass'}});
  assert.equal(event.type,'config-changed');assert.equal(event.detail.config.color_scheme,'glass');assert.equal(event.detail.config.entities.room,'sensor.example_room');assert.equal(event.detail.config.zone,1);
  editor._change({target:{dataset:{key:'accent_color'},value:'#123456'}});assert.equal(event.detail.config.accent_color,'#123456');
  editor._change({target:{dataset:{key:'accent_color'},value:''}});assert.equal(event.detail.config.accent_color,undefined);
});
test('invalid color in visual editor never emits a configuration change',()=>{
  const {Editor}=environment();const editor=new Editor();let changes=0;editor.dispatchEvent=()=>{changes++;return true;};editor.setConfig({type:'custom:vaillant-app-card'});
  editor._change({target:{dataset:{key:'accent_color'},value:'#fff;background:red'}});assert.equal(changes,0);assert.ok(editor._error);
});

test('language follows HA, supports explicit overrides and falls back to English',()=>{
  const {language,translate,Card}=environment();
  assert.equal(language({}, {locale:{language:'de-DE'}}),'de');
  assert.equal(language({language:'en'}, {language:'de'}),'en');
  assert.equal(language({language:'auto'}, {language:'fr'}),'en');
  assert.equal(translate('Overview','de'),'Übersicht');
  assert.equal(translate('Overview','en'),'Overview');
  assert.equal(translate('Heating circuit 3','de'),'Heizkreis 3');
  assert.equal(translate('Ground floor: Target temperature','de'),'Ground floor: Wunschtemperatur');
  assert.equal(translate('sensor.example_room','de'),'sensor.example_room');
  assert.throws(()=>new Card().setConfig({language:'fr'}));
});

test('editor language changes retain private mappings and custom names',()=>{
  const {Editor}=environment(), editor=new Editor();let changed;
  editor.setConfig({entities:{room:'sensor.example_room'},title:'Overview',zone:1});
  editor.dispatchEvent=event=>{changed=event.detail.config;return true;};
  editor._change({target:{dataset:{key:'language'},value:'de'}});
  assert.equal(changed.language,'de');assert.equal(changed.title,'Overview');
  assert.equal(changed.entities.room,'sensor.example_room');assert.equal(changed.zone,1);
});

test('matches unprefixed HA energy names and associates the circuit from the original zone device',()=>{
  const {resolve}=environment(),f=fixture();
  const climate=f.registry.entities.find(e=>e.entity_id===f.ids.climate);
  climate.original_name='Climate';climate.name='My renamed thermostat';climate.device_id='example-zone';
  f.registry.devices.push({id:'example-zone',name:'Example Zone 1 (Circuit 0)',name_by_user:'Downstairs'});
  for(const e of f.registry.entities)if(/Energy/.test(e.original_name))e.original_name=e.original_name.replace(/^.*?(Consumed Electrical Energy|Earned Environment Energy|Heat Generated)/,'$1');
  f.add('sensor','opaque-device_2_0','Earned Environment Energy Heating','renamed_environment',{device_id:'example-outer'});
  f.add('sensor','opaque-device_3_0','Heat Generated Domestic Hot Water','renamed_heat',{device_id:'example-outer'});
  const r=resolve(f.registry,{});
  assert.equal(r.ids.flow,f.ids.flow);assert.equal(r.selected.circuit,'0');
  assert.equal(r.ids.electric_heating,f.ids.electric_heating);assert.equal(r.ids.electric_water,f.ids.electric_water);
  assert.equal(r.ids.hydraulic_electric,f.ids.hydraulic_electric);
  assert.equal(r.ids.environment_heating,'sensor.renamed_environment');assert.equal(r.ids.heat_water,'sensor.renamed_heat');
});

test('conflicting original circuit associations still require an explicit selection',()=>{
  const {resolve}=environment(),f=fixture();
  f.registry.devices[0].name='Example Zone (Circuit 1)';
  assert.equal(resolve(f.registry,{}).ids.flow,null);
  assert.equal(resolve(f.registry,{circuit:0}).ids.flow,f.ids.flow);
});

test('offline reports explain blocked controls without bypassing the command guard',async()=>{
  const {Card}=environment(),f=fixture(),calls=[],c=new Card();c.setConfig({});
  const states={
    [f.ids.online]:{state:'off',attributes:{}},
    [f.ids.climate]:{state:'auto',attributes:{supported_features:1,temperature:25,current_temperature:19.8}}
  };
  c.hass={connection:{},states,callWS:async({type})=>type.includes('entity_registry')?f.registry.entities:f.registry.devices,callService:async(...args)=>calls.push(args)};
  await c._discoveryPromise;
  assert.equal(c._canTemp(false),false);assert.match(c._home(),/Online sensor reports offline/);
  assert.match(c._home(),/data-more="online"/);
  assert.equal(await c._call('climate','set_temperature',{temperature:24}),false);assert.equal(calls.length,0);
  states[f.ids.online].state='on';c.hass={...c.hass};
  assert.equal(c._canTemp(false),true);assert.doesNotMatch(c._home(),/Online sensor reports offline/);
});

test('energy diagnostics distinguish unmapped, disabled, unavailable and unsupported readings',async()=>{
  const {Card}=environment(),f=fixture(),c=new Card();c.setConfig({});
  f.registry.entities.find(e=>e.entity_id===f.ids.electric_water).disabled_by='user';
  const states={[f.ids.electric_heating]:{state:'1200',attributes:{unit_of_measurement:'Wh'}}};
  c.hass={connection:{},states,callWS:async({type})=>type.includes('entity_registry')?f.registry.entities:f.registry.devices};await c._discoveryPromise;
  assert.equal(c._energyValue('electric_heating'),1.2);
  assert.equal(c._availability('electric_water'),'Disabled in Home Assistant');
  assert.equal(c._availability('environment_water'),'Not assigned');
  assert.equal(c._availability('hydraulic_electric'),'Unavailable');
  assert.match(c._status(),/Energy entity diagnostics/);
  states[f.ids.electric_heating]={state:'1200',attributes:{unit_of_measurement:'W'}};
  assert.equal(c._energyValue('electric_heating'),null);assert.equal(c._availability('electric_heating'),'Unsupported energy unit');
});

function controlCard(config={},user){
  const {Card}=environment(),c=new Card(),calls=[],events=[];
  c.setConfig({auto_discover:false,entities:{climate:'climate.example',water_heater:'water_heater.example',boost:'switch.example',efficiency:'sensor.example'},...config});
  c.dispatchEvent=e=>{events.push(e);return true;};
  c.hass={user,states:{
    'climate.example':{state:'auto',attributes:{supported_features:1,temperature:22,current_temperature:20,hvac_modes:['auto','heat_cool','off']}},
    'water_heater.example':{state:'Manual',attributes:{supported_features:3,temperature:52,current_temperature:50,operation_mode:'Manual',operation_list:['Manual','Off']}},
    'switch.example':{state:'off',attributes:{}},'sensor.example':{state:'3.9',attributes:{}}
  },callService:async(...args)=>calls.push(args)};
  return {c,calls,events};
}

test('read-only mode removes controls and blocks services and native more-info dialogs',async()=>{
  const {c,calls,events}=controlCard({control_mode:'read_only'},{is_admin:true});
  assert.equal(c._canTemp(false),false);assert.equal(c._canTemp(true),false);
  assert.doesNotMatch(c._home(),/data-step=|data-toggle=|data-mode=|data-more=/);
  assert.match(c._home(),/target-reading/);assert.match(c._home(),/22\.0/);
  assert.equal(await c._call('climate','set_temperature',{temperature:24}),false);
  assert.equal(await c._call('boost','turn_on'),false);c._more('climate');
  assert.equal(calls.length,0);assert.equal(events.length,0);
});

test('admin mode fails closed for missing or non-admin users and updates when the user changes',async()=>{
  for(const user of [undefined,{is_admin:false},{is_admin:'true'}]){
    const {c,calls}=controlCard({control_mode:'admin'},user);
    assert.equal(c._canTemp(false),false);assert.equal(await c._call('boost','turn_on'),false);assert.equal(calls.length,0);
  }
  const {c,calls}=controlCard({control_mode:'admin'},{id:'example-admin',is_admin:true});
  assert.equal(c._canTemp(false),true);assert.equal(await c._call('boost','turn_on'),true);assert.equal(calls.length,1);
  c.hass={...c.hass,user:{id:'example-viewer',is_admin:false}};
  assert.doesNotMatch(c.shadowRoot.innerHTML,/data-step=|data-toggle=|data-mode=|data-more=/);
  assert.equal(await c._call('climate','set_temperature',{temperature:23}),false);assert.equal(calls.length,1);
});

test('section policies restrict independently and cannot relax the global policy',async()=>{
  const {c,calls}=controlCard({control_modes:{heating:'read_only',hot_water:'admin',quick_actions:'full',settings:'read_only'}},{is_admin:false});
  assert.equal(c._canTemp(false),false);assert.equal(c._canTemp(true),false);
  assert.equal(await c._call('boost','turn_on'),true);assert.equal(calls.length,1);
  c.hass={...c.hass,user:{is_admin:true}};
  assert.equal(c._canTemp(false),false);assert.equal(c._canTemp(true),true);assert.equal(c._canInspect('water_heater'),false);
  assert.equal(await c._call('water_heater','set_temperature',{temperature:51}),true);assert.equal(calls.length,2);
  const blocked=controlCard({control_mode:'read_only',control_modes:{heating:'full'}},{is_admin:true});assert.equal(blocked.c._canTemp(false),false);
});

test('widgets render only their selected view with no dashboard navigation',()=>{
  const expected={overview:'control-grid',heating:'data-control="climate"',hot_water:'data-control="water_heater"',quick_actions:'quick-body',energy:'energy-summary',efficiency:'3.90',system:'status-grid',system_data:'overview-stats'};
  for(const [view,part] of Object.entries(expected)){
    const {c}=controlCard({view,control_mode:'full'});assert.ok(c.shadowRoot.innerHTML.includes(part),view);
    assert.doesNotMatch(c.shadowRoot.innerHTML,/<nav class="footer"/);
    if(view==='heating')assert.doesNotMatch(c.shadowRoot.innerHTML,/data-control="water_heater"/);
    if(view==='hot_water')assert.doesNotMatch(c.shadowRoot.innerHTML,/data-control="climate"/);
  }
  const hidden=controlCard({view:'efficiency',show_header:false});assert.doesNotMatch(hidden.c.shadowRoot.innerHTML,/<header class="top"/);
});

test('widget and permission options reject invalid configuration',()=>{
  for(const config of [{view:'invalid'},{control_mode:'invalid'},{show_header:'false'},{control_modes:null},{control_modes:[]},{control_modes:{unknown:'admin'}},{control_modes:{heating:true}}])assert.throws(()=>controlCard(config));
});

test('editor widget and nested permissions preserve entity mappings without mutating input',()=>{
  const {Editor}=environment(),e=new Editor(),original={type:'custom:vaillant-app-card',entities:{room:'sensor.example'},control_modes:{settings:'admin'}};let event;
  e.setConfig(original);e.dispatchEvent=value=>{event=value;return true;};
  e._change({target:{dataset:{key:'view'},value:'heating'}});assert.equal(event.detail.config.view,'heating');
  e._change({target:{dataset:{key:'control_mode'},value:'admin'}});assert.equal(event.detail.config.control_mode,'admin');
  e._change({target:{dataset:{key:'control_modes.heating'},value:'read_only'}});
  assert.equal(event.detail.config.control_modes.heating,'read_only');assert.equal(original.control_modes.heating,undefined);
  assert.equal(event.detail.config.control_modes.settings,'admin');assert.equal(event.detail.config.entities.room,'sensor.example');
  e._change({target:{dataset:{key:'control_modes.heating'},value:''}});assert.equal(event.detail.config.control_modes.heating,undefined);
});

test('optional external power sensor survives discovery without affecting energy totals',()=>{
  const {resolve}=environment(),f=fixture();
  const resolved=resolve(f.registry,{entities:{power:'sensor.external_meter_power'}});
  assert.equal(resolved.ids.power,'sensor.external_meter_power');
  assert.equal(resolved.ids.electric_heating,f.ids.electric_heating);
  const {c}=controlCard();assert.equal(c._powerPanel(),'');assert.doesNotMatch(c._energy(),/power-panel/);
  assert.throws(()=>controlCard({entities:{power:'switch.example'}}));
});

test('power display converts W and kW, preserves zero, and rejects energy units and invalid readings',()=>{
  const {c}=controlCard({entities:{power:'sensor.external_meter_power'}});
  const check=(state,unit,watts,value,displayUnit)=>{
    c.hass={...c.hass,states:{'sensor.external_meter_power':{state,attributes:{unit_of_measurement:unit}}}};
    assert.equal(c._powerValue(),watts);assert.equal(c._powerReading().value,value);assert.equal(c._powerReading().unit,displayUnit);
  };
  check('2450','W',2450,'2.45','kW');check('2.45','kW',2450,'2.45','kW');
  check('0','W',0,'0.0','W');check('42.5','W',42.5,'42.5','W');
  check('unavailable','W',null,'—','');check('unknown','W',null,'—','');check('bad','W',null,'—','');
  check('2450','Wh',null,'—','');assert.match(c._powerPanel(),/Unsupported power unit/);
  c.hass={...c.hass,states:{}};assert.match(c._powerPanel(),/Unavailable/);
});

test('standalone power widget needs no Vaillant registry and updates on sensor changes',async()=>{
  const {Card}=environment(),c=new Card();let reads=0;
  c.setConfig({view:'power',control_mode:'read_only',entities:{power:'sensor.external_meter_power'}});
  const hass={connection:{},states:{'sensor.external_meter_power':{state:'750',attributes:{unit_of_measurement:'W'}}},callWS:async()=>{reads++;throw Error('no registry access');}};
  c.hass=hass;await c._discoveryPromise;assert.equal(reads,0);assert.equal(c._discoveryPanel(),'');
  assert.match(c.shadowRoot.innerHTML,/750\.0/);assert.doesNotMatch(c.shadowRoot.innerHTML,/<nav |data-step=|data-toggle=/);
  c.hass={...hass,states:{'sensor.external_meter_power':{state:'1250',attributes:{unit_of_measurement:'W'}}}};
  assert.match(c.shadowRoot.innerHTML,/1\.25/);
});

test('power sensor editor preserves other mappings, allows future sensors and removes only power',()=>{
  const {Editor}=environment(),e=new Editor(),original={entities:{room:'sensor.example_room'},control_mode:'admin'};let event;
  e.setConfig(original);e.dispatchEvent=value=>{event=value;return true;};
  e.hass={states:{'sensor.power_w':{attributes:{unit_of_measurement:'W'}},'sensor.energy':{attributes:{unit_of_measurement:'Wh'}}}};
  assert.match(e.shadowRoot.innerHTML,/<option value="sensor.power_w"/);assert.doesNotMatch(e.shadowRoot.innerHTML,/<option value="sensor.energy"/);
  e._change({target:{dataset:{key:'entities.power'},value:'sensor.future_meter_power'}});
  assert.equal(event.detail.config.entities.power,'sensor.future_meter_power');assert.equal(original.entities.power,undefined);
  assert.equal(event.detail.config.entities.room,'sensor.example_room');assert.equal(event.detail.config.control_mode,'admin');
  const valid=event;e._change({target:{dataset:{key:'entities.power'},value:'switch.not_a_sensor'}});assert.equal(event,valid);assert.ok(e._error);
  e._change({target:{dataset:{key:'entities.power'},value:''}});assert.equal(event.detail.config.entities.power,undefined);assert.equal(event.detail.config.entities.room,'sensor.example_room');
});

function addTelemetry(f,device='example-outer',token='outer'){
  const ids={};
  for(const [key,suffix] of Object.entries({power:'current_power',on_off_cycles:'on_off_cycles',operation_time:'operation_time'}))ids[key]=f.add('sensor',`device_${token}_${suffix}`,'Renamed diagnostic',`${token}_${suffix}`,{device_id:device});
  return ids;
}

test('discovers internal power, cycles and operating hours by unique ID on the selected heat pump',()=>{
  const {resolve}=environment(),f=fixture(),ids=addTelemetry(f);const hydraulic=addTelemetry(f,'example-hydraulic','hydraulic');
  const r=resolve(f.registry,{});
  for(const [key,id] of Object.entries(ids)){assert.equal(r.ids[key],id);assert.notEqual(r.ids[key],hydraulic[key]);}
  assert.equal(r.selected.energy_device,'example-outer');
  const override=resolve(f.registry,{entities:{power:'sensor.external_power'}});assert.equal(override.ids.power,'sensor.external_power');assert.equal(override.ids.on_off_cycles,ids.on_off_cycles);
  assert.equal(resolve(f.registry,{entities:{power:null}}).ids.power,null);
});

test('diagnostics discovery works without energy sensors and does not guess between heat pumps',()=>{
  const {resolve}=environment(),f=fixture();
  const remaining=f.registry.entities.filter(e=>!/(Consumed Electrical Energy)/i.test(e.original_name));f.registry.entities.splice(0,f.registry.entities.length,...remaining);
  const first=addTelemetry(f),second=addTelemetry(f,'example-second-pump','second');f.registry.devices.push({id:'example-second-pump',model:'aroTHERM plus'});
  let r=resolve(f.registry,{});assert.equal(r.ids.power,null);assert.equal(r.ids.on_off_cycles,null);assert.equal(r.choices.energy_device.length,2);
  r=resolve(f.registry,{energy_device_id:'example-second-pump'});for(const [key,id] of Object.entries(second))assert.equal(r.ids[key],id);
  r=resolve(f.registry,{energy_device_id:'example-outer'});assert.equal(r.ids.power,first.power);
});

test('automatic standalone power widget reads the registry unless a manual source is set',async()=>{
  const {Card}=environment(),f=fixture(),ids=addTelemetry(f),c=new Card();let reads=0;
  c.setConfig({view:'power',control_mode:'read_only'});c.hass={connection:{},states:{[ids.power]:{state:'416',attributes:{unit_of_measurement:'W'}}},callWS:async({type})=>{reads++;return type.includes('entity_registry')?f.registry.entities:f.registry.devices;}};
  await c._discoveryPromise;assert.equal(reads,2);assert.equal(c._ids.power,ids.power);assert.match(c.shadowRoot.innerHTML,/416\.0/);
  c.setConfig({view:'power',entities:{power:'sensor.external_power'}});await c._discoveryPromise;assert.equal(reads,2);assert.equal(c._ids.power,'sensor.external_power');
});

test('cycles and hours render as reported, without converting hours a second time',()=>{
  const {c}=controlCard({entities:{on_off_cycles:'sensor.cycles',operation_time:'sensor.hours'}});
  c.hass={...c.hass,states:{'sensor.cycles':{state:'562',attributes:{}},'sensor.hours':{state:'1112',attributes:{unit_of_measurement:'h'}}}};
  assert.match(c._status(),/Heat pump operation/);assert.match(c._operationStats(),/562/);assert.match(c._operationStats(),/1,112\.0 h/);
  for(const view of ['on_off_cycles','operation_time']){c.setConfig({view,auto_discover:false,control_mode:'read_only',entities:{on_off_cycles:'sensor.cycles',operation_time:'sensor.hours'}});assert.doesNotMatch(c.shadowRoot.innerHTML,/<nav class="footer"/);assert.match(c.shadowRoot.innerHTML,view==='on_off_cycles'?/562/:/1,112\.0 h/);}
});

async function discoveryCard(f,config={}){
  const {Card}=environment(),c=new Card();c.setConfig(config);
  c.hass={connection:{},states:{},callWS:async({type})=>type.includes('entity_registry')?f.registry.entities:f.registry.devices};
  await c._discoveryPromise;return c;
}

test('automatic circuit selector hides a uniquely associated circuit despite additional placeholder entries',async()=>{
  const f=fixture(),c=await discoveryCard(f);
  assert.equal(c._choices.circuit.length,2);assert.equal(c._selected.circuit,'0');assert.equal(c._circuitLinked,true);
  assert.doesNotMatch(c._discoveryPanel(),/data-discovery="circuit"/);assert.equal(c._ids.flow,f.ids.flow);
});

test('a single enabled circuit is chosen without exposing a redundant selector',async()=>{
  const f=fixture();f.registry.entities.find(e=>e.entity_id===f.ids.climate).original_name='Climate';
  const other=f.registry.entities.find(e=>e.unique_id.endsWith('_circuit_1_flow_temperature'));other.disabled_by='user';
  const c=await discoveryCard(f);assert.equal(c._selected.circuit,'0');assert.equal(c._ids.flow,f.ids.flow);
  assert.equal(c._showCircuitSelector(),false);
});

test('explicit show/hide options affect presentation without guessing an unresolved circuit',async()=>{
  const f=fixture();f.registry.entities.find(e=>e.entity_id===f.ids.climate).original_name='Climate';
  const unresolved=await discoveryCard(f);assert.equal(unresolved._selected.circuit,undefined);assert.equal(unresolved._showCircuitSelector(),true);
  const hidden=await discoveryCard(f,{show_circuit_selector:false});assert.equal(hidden._showCircuitSelector(),false);assert.equal(hidden._ids.flow,null);assert.match(hidden._discoveryPanel(),/Set circuit in YAML/);
  const shown=await discoveryCard(fixture(),{show_circuit_selector:true});assert.equal(shown._showCircuitSelector(),true);
  const pinned=await discoveryCard(f,{show_circuit_selector:false,circuit:0});assert.equal(pinned._ids.flow,f.ids.flow);assert.doesNotMatch(pinned._discoveryPanel(),/Set circuit in YAML/);
});

test('selectors and unresolved-choice notices are scoped to the values shown on each page',async()=>{
  const f=fixture();f.registry.entities.find(e=>e.entity_id===f.ids.climate).original_name='Climate';
  f.add('climate','zone_2_climate','Zone 2 Climate');f.add('water_heater','domestic_hot_water_1_base','Other hot water');
  const c=await discoveryCard(f,{show_circuit_selector:true});
  c._page='energy';assert.doesNotMatch(c._discoveryPanel(),/data-discovery="(?:zone|water|circuit)"|Select a heating zone|Select a hot-water tank|Select the associated heating circuit/);
  c._page='water';assert.match(c._discoveryPanel(),/data-discovery="water"/);assert.doesNotMatch(c._discoveryPanel(),/data-discovery="(?:zone|circuit)"|Select a heating zone|Select the associated heating circuit/);
  c._page='heating';assert.match(c._discoveryPanel(),/data-discovery="zone"/);assert.match(c._discoveryPanel(),/data-discovery="circuit"/);assert.doesNotMatch(c._discoveryPanel(),/data-discovery="water"/);
});

test('standalone widgets omit circuit selection when none of their readings depend on it',async()=>{
  const f=fixture();f.registry.entities.find(e=>e.entity_id===f.ids.climate).original_name='Climate';
  for(const view of ['energy','efficiency','hot_water','quick_actions','heating','power','on_off_cycles','operation_time']){
    const c=await discoveryCard(f,{view,show_circuit_selector:true});assert.doesNotMatch(c._discoveryPanel(),/data-discovery="circuit"|Select the associated heating circuit/,view);
  }
  const c=await discoveryCard(f,{view:'system_data',show_circuit_selector:true});assert.match(c._discoveryPanel(),/data-discovery="circuit"/);
});

test('circuit visibility editor uses booleans and preserves other options',()=>{
  const {Editor,Card}=environment(),editor=new Editor();let event;
  editor.setConfig({entities:{power:'sensor.example'},circuit:0,control_mode:'admin'});editor.dispatchEvent=e=>{event=e;return true;};
  for(const [value,expected] of [['false',false],['true',true],['auto','auto']]){
    editor._change({target:{dataset:{key:'show_circuit_selector'},value}});assert.equal(event.detail.config.show_circuit_selector,expected);
    assert.equal(event.detail.config.entities.power,'sensor.example');assert.equal(event.detail.config.circuit,0);assert.equal(event.detail.config.control_mode,'admin');
  }
  assert.throws(()=>new Card().setConfig({show_circuit_selector:'false'}));
});
