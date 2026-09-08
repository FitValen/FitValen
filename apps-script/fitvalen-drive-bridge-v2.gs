const LEGACY_DAILY_ID = '11GnSvhxxYzk3twJubwcp4KFx4tBW-w0O5-vEp0kXKwo';
const LEGACY_WEIGHT_ID = '1ztDwgFaPITm3vFSw9TPaQfEWz6NcOOCBfkv39d54h70';
const TZ = 'Europe/Madrid';
const WEB_PROTOCOL = 'web_v2';

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json_({ok:true, service:'FitValen Drive Bridge', version:2});
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const expected = PropertiesService.getScriptProperties().getProperty('DRIVE_SYNC_SECRET') || '';
    if (!expected || body.secret !== expected) return json_({ok:false,error:'unauthorized'});
    if (!body.dedupe_key) return json_({ok:false,error:'missing_dedupe_key'});

    const ctx = context_(body);
    if (alreadyProcessed_(ctx, body.dedupe_key)) {
      return json_({ok:true,duplicate:true,namespace:ctx.namespace,version:2});
    }

    const p = body.payload || {};
    switch (body.entity_type) {
      case 'diet': writeDiet_(ctx, p); break;
      case 'workout': writeWorkout_(ctx, p); break;
      case 'day': writeDay_(ctx, p); break;
      case 'weight': writeWeightPayload_(ctx, p); break;
      case 'zepp_sleep':
        if (!ctx.legacy) return json_({ok:false,error:'unsupported_web_entity_type'});
        writeZeppSleep_(ctx, p);
        break;
      case 'zepp_summary':
        if (!ctx.legacy) return json_({ok:false,error:'unsupported_web_entity_type'});
        writeZeppSummary_(ctx, p);
        break;
      default: return json_({ok:false,error:'unsupported_entity_type'});
    }

    markProcessed_(ctx, body);
    return json_({ok:true,namespace:ctx.namespace,version:2});
  } catch (err) {
    return json_({ok:false,error:String(err && err.stack || err),version:2});
  } finally {
    lock.releaseLock();
  }
}

function context_(body) {
  const protocol = String(body.protocol || '');

  // Strict Web v2 path: never falls back to Dani.
  if (protocol === WEB_PROTOCOL) {
    const namespace = String(body.namespace || '').trim();
    if (!/^[a-z0-9_]+$/.test(namespace)) throw new Error('invalid_namespace');

    const destination = body.destination || {};
    const dailyId = driveId_(destination.daily_sheet_id, 'daily_sheet_id');
    const weightId = driveId_(destination.weight_sheet_id, 'weight_sheet_id');
    if (dailyId === weightId) throw new Error('invalid_destination_pair');

    const ctx = {namespace:namespace,dailyId:dailyId,weightId:weightId,legacy:false,daily:null,weight:null};
    validateOwnerMarkers_(ctx);
    return ctx;
  }

  if (protocol) throw new Error('unsupported_protocol');

  // Explicit legacy protocol only: preserves existing Telegram sync behaviour.
  return {
    namespace:'legacy_dani',
    dailyId:LEGACY_DAILY_ID,
    weightId:LEGACY_WEIGHT_ID,
    legacy:true,
    daily:null,
    weight:null
  };
}

function driveId_(value, label) {
  const v = String(value || '').trim();
  if (!/^[A-Za-z0-9_-]{20,}$/.test(v)) throw new Error('invalid_' + label);
  return v;
}

function daily_(ctx) {
  if (!ctx.daily) ctx.daily = SpreadsheetApp.openById(ctx.dailyId);
  return ctx.daily;
}

function weight_(ctx) {
  if (!ctx.weight) ctx.weight = SpreadsheetApp.openById(ctx.weightId);
  return ctx.weight;
}

function configValue_(ss, key) {
  const sh = ss.getSheetByName('_FitValenConfig');
  if (!sh) throw new Error('owner_config_missing');
  const last = Math.max(sh.getLastRow(), 1);
  const vals = sh.getRange(1,1,last,2).getDisplayValues();
  for (let i=0; i<vals.length; i++) {
    if (String(vals[i][0] || '').trim() === key) return String(vals[i][1] || '').trim();
  }
  return '';
}

function validateOwnerMarkers_(ctx) {
  const dailyOwner = configValue_(daily_(ctx), 'owner_key');
  const weightOwner = configValue_(weight_(ctx), 'owner_key');
  if (!dailyOwner || dailyOwner !== ctx.namespace) throw new Error('daily_owner_mismatch');
  if (!weightOwner || weightOwner !== ctx.namespace) throw new Error('weight_owner_mismatch');
}

function time_(iso) {
  if (!iso) return Utilities.formatDate(new Date(), TZ, 'HH:mm');
  return Utilities.formatDate(new Date(iso), TZ, 'HH:mm');
}

function date_(isoOrDate) {
  if (!isoOrDate) return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  const s = String(isoOrDate);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return Utilities.formatDate(new Date(s), TZ, 'yyyy-MM-dd');
}

function hmin_(min) {
  if (min === null || min === undefined || min === '') return '';
  min = Number(min);
  const h = Math.floor(min/60), m = min%60;
  return h ? `${h} h ${m} min` : `${m} min`;
}

function appendRegistro_(ctx, row) {
  const sh = daily_(ctx).getSheetByName('Registro');
  if (!sh) throw new Error('registro_sheet_missing');
  sh.appendRow(row.concat(Array(Math.max(0,19-row.length)).fill('')).slice(0,19));
}

function sourceLabel_(ctx) {
  return ctx.legacy ? 'Supabase' : 'Supabase Web';
}

function writeDiet_(ctx, p) {
  const d = date_(p.date);
  const src = sourceLabel_(ctx);
  (p.entries || []).forEach(x => appendRegistro_(ctx, [
    d, time_(x.created_at), 'Alimentación', x.meal_slot || 'Comida', x.product_name || '',
    x.quantity ?? '', x.unit || '', x.kcal ?? '', x.protein_g ?? '', x.carbs_g ?? '', x.fat_g ?? '',
    '', '', '', '', '', '', x.source || src,
    x.quantity != null ? `${x.quantity} ${x.unit || ''}`.trim() : ''
  ]));
}

function writeWorkout_(ctx, p) {
  const d = date_(p.date), day = p.workout_day || '', src = sourceLabel_(ctx);
  appendRegistro_(ctx,[d,time_(p.started_at),'Entrenamiento','Inicio sesión',`Día ${day}`,'','','','','','',day,'','','','','',src,ctx.legacy?'Sesión sincronizada desde Telegram':'Sesión sincronizada desde Web']);
  (p.sets || []).forEach(s => {
    const flags=[];
    if (s.to_failure) flags.push('Fallo');
    if (s.assisted) flags.push('Asistida');
    if (s.notes) flags.push(s.notes);
    appendRegistro_(ctx,[d,time_(s.created_at),'Entrenamiento','Serie',s.exercise_name || '', '', '', '', '', '', '', day,s.exercise_code || '',s.weight_kg ?? '',s.reps ?? '',s.set_order ?? '',s.to_failure ? 'Sí' : '',src,flags.join(' · ')]);
  });
  (p.cardio || []).forEach(c => appendRegistro_(ctx,[d,time_(c.created_at),'Entrenamiento','Cardio',c.cardio_type || c.type || 'Cardio',c.duration_min ?? '','min','','','','',day,'','','','','',src,c.notes || '']));
  appendRegistro_(ctx,[d,time_(p.finished_at),'Entrenamiento','Fin sesión',`Día ${day}`,'','','','','','',day,'','','','','',src,'Sesión cerrada y sincronizada']);
}

function summarySheet_(ctx) {
  const sh = daily_(ctx).getSheetByName('Resumen_Diario');
  if (!sh) throw new Error('summary_sheet_missing');
  return sh;
}

function summaryRow_(ctx, date) {
  const sh=summarySheet_(ctx), last=Math.max(sh.getLastRow(),1);
  if (last < 2) return 2;
  const vals=sh.getRange(2,1,last-1,1).getDisplayValues().flat();
  const i=vals.findIndex(v=>String(v).trim()===date);
  return i>=0 ? i+2 : last+1;
}

function setSummary_(ctx, date, changes) {
  const sh=summarySheet_(ctx), r=summaryRow_(ctx,date);
  if (!sh.getRange(r,1).getValue()) sh.getRange(r,1).setValue(date);
  Object.keys(changes).forEach(k=>{
    const c=Number(k), v=changes[k];
    if (v!==undefined && v!==null && v!=='') sh.getRange(r,c).setValue(v);
  });
}

function writeDay_(ctx, p) {
  const d=date_(p.date), t=p.totals || {}, z=p.zepp_summary || {}, s=p.zepp_sleep || {}, w=p.weight || {};
  const workouts=p.workouts || [];
  const lastW=workouts.length ? workouts[workouts.length-1] : null;
  const notes=[];
  if (z.distance_km != null) notes.push(`Zepp: ${z.distance_km} km`);
  if (z.total_kcal != null) notes.push(`${z.total_kcal} kcal total`);
  if (z.resting_kcal != null) notes.push(`${z.resting_kcal} reposo`);
  if (z.pai_total != null) notes.push(`PAI ${z.pai_total}${z.pai_today!=null?` (+${z.pai_today} hoy)`:''}`);
  if (s.regularity_pct != null) notes.push(`Regularidad sueño ${s.regularity_pct}%`);
  if (s.deep_pct != null) notes.push(`Profundo ${s.deep_pct}%`);
  if (s.rem_pct != null) notes.push(`REM ${s.rem_pct}%`);
  setSummary_(ctx,d,{
    2:t.kcal,3:t.protein_g,4:t.carbs_g,5:t.fat_g,6:w.weight_kg,
    7:lastW ? lastW.workout_day : '',8:z.steps,9:z.activity_kcal,
    10:hmin_(s.duration_min),11:hmin_(s.deep_min),12:hmin_(s.rem_min),16:notes.join('; ')
  });
  if (w.weight_kg != null) upsertWeight_(ctx,d,w.weight_kg,ctx.legacy?'Supabase/Zepp':'Supabase Web');
}

function writeWeightPayload_(ctx, p) {
  const x=p.entry || {};
  if (x.weight_kg == null) return;
  upsertWeight_(ctx,date_(x.entry_date),x.weight_kg,x.source || sourceLabel_(ctx));
  setSummary_(ctx,date_(x.entry_date),{6:x.weight_kg});
}

function upsertWeight_(ctx, d, w, source) {
  const sh=weight_(ctx).getSheetByName('Sheet1');
  if (!sh) throw new Error('weight_sheet_missing');
  const last=Math.max(sh.getLastRow(),1);
  let r=last+1;
  if (last>=2) {
    const vals=sh.getRange(2,1,last-1,1).getDisplayValues().flat();
    const i=vals.findIndex(v=>String(v).trim()===d);
    if(i>=0) r=i+2;
  }
  sh.getRange(r,1,1,3).setValues([[d,w,source || 'FitValen']]);
}

function writeZeppSleep_(ctx, p) {
  const x=p.entry || {}, d=date_(x.entry_date);
  setSummary_(ctx,d,{10:hmin_(x.duration_min),11:hmin_(x.deep_min),12:hmin_(x.rem_min),16:`Sueño: regularidad ${x.regularity_pct ?? '?'}%; despierto ${hmin_(x.awake_min)} · ${x.awake_count ?? 0} veces`});
}

function writeZeppSummary_(ctx, p) {
  const x=p.entry || {}, d=date_(x.entry_date);
  setSummary_(ctx,d,{6:x.weight_kg,8:x.steps,9:x.activity_kcal,16:`Zepp: ${x.distance_km ?? '?'} km; ${x.total_kcal ?? '?'} kcal total (${x.resting_kcal ?? '?'} reposo + ${x.activity_kcal ?? '?'} actividad); PAI ${x.pai_total ?? '?'} (+${x.pai_today ?? '?'} hoy)`});
  if (x.weight_kg != null) upsertWeight_(ctx,d,x.weight_kg,'Zepp');
}

function syncSheet_(ctx) {
  const sh = daily_(ctx).getSheetByName('_FitValenSync');
  if (!sh) throw new Error('sync_sheet_missing');
  return sh;
}

function alreadyProcessed_(ctx, key) {
  const sh=syncSheet_(ctx), last=sh.getLastRow();
  if(last<2) return false;
  return sh.getRange(2,1,last-1,1).getDisplayValues().flat().some(v=>String(v)===String(key));
}

function markProcessed_(ctx, body) {
  syncSheet_(ctx).appendRow([
    body.dedupe_key,
    body.queue_id || '',
    body.entity_type || '',
    new Date(),
    body.destination_key || '',
    'done'
  ]);
}
