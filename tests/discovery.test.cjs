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
  const context={HTMLElement:Element,window:{},customElements:{get:k=>definitions.get(k),define:(k,v)=>definitions.set(k,v)},setTimeout:()=>0,clearTimeout(){},CustomEvent:class {}};
  vm.createContext(context);
  const source=fs.readFileSync(path.join(__dirname,'../vaillant-app-card.js'),'utf8');
  vm.runInContext(source.replace("  if(!customElements.get('vaillant-app-card'))","  window.testResolver=resolveEntities;\n  if(!customElements.get('vaillant-app-card'))"),context);
  return {resolve:context.window.testResolver,Card:definitions.get('vaillant-app-card')};
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
