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
