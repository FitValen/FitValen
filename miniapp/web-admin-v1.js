(function(){
  var ADMIN_API='https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-admin';
  function token(){try{return localStorage.getItem('fitvalen_web_session')||''}catch(e){return ''}}
  function payload(){
    try{
      var p=(token().split('.')[1]||'').replace(/-/g,'+').replace(/_/g,'/');
      while(p.length%4){p+='='}
      return JSON.parse(atob(p));
    }catch(e){return {}}
  }
  if(String(payload().role||'').toLowerCase()!=='admin'){return}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function openSheet(html){var o=document.getElementById('overlay'),s=document.getElementById('sheet');if(!o||!s){return}s.innerHTML=html;o.className='overlay on'}
  function closeSheet(){var o=document.getElementById('overlay');if(o){o.className='overlay'}}
  function request(action,body){
    var data=Object.assign({action:action},body||{});
    return fetch(ADMIN_API,{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+token()},body:JSON.stringify(data)}).then(function(r){return r.text().then(function(t){var j;try{j=JSON.parse(t)}catch(e){throw new Error('Respuesta no válida')}if(!r.ok||!j.ok){throw new Error(j.error||('HTTP '+r.status))}return j.data})})
  }
  function notify(text){var e=document.getElementById('toast');if(!e){return}e.textContent=text;e.className='toast on';setTimeout(function(){e.className='toast'},1800)}
  function renderUsers(users){
    var html='<div class="row"><div><div class="ey">👥 ADMINISTRACIÓN</div><div class="stat" style="margin-top:5px">Usuarios Web</div></div><button class="iconbtn" id="fvUsersClose">×</button></div><div class="small" style="margin-top:8px">Las contraseñas se procesan en el backend y nunca se muestran después de guardarlas.</div>';
    for(var i=0;i<users.length;i++){
      var u=users[i],member=String(u.role||'')!=='admin';
      html+='<div class="card" style="margin-top:12px"><div class="row"><div><div class="foodname">'+esc(u.username)+'</div><div class="small">'+esc(u.role)+' · '+(u.active?'Activo':'Inactivo')+'</div></div><span class="pill '+(u.active?'good':'warn')+'">'+(u.active?'Activo':'Inactivo')+'</span></div>';
      if(member){
        html+='<div class="fvField" style="margin-top:12px"><label>Nueva contraseña</label><input class="input" style="font-size:16px;height:48px" type="password" autocomplete="new-password" id="fvPwd_'+i+'" placeholder="Mínimo 8 caracteres"></div><button class="actionbtn primary wide" style="margin-top:8px" data-fv-setpwd="'+i+'">Guardar contraseña y activar</button>';
        if(u.active){html+='<button class="actionbtn wide" style="margin-top:8px" data-fv-active="'+i+'" data-next="0">Desactivar usuario</button>'}
      }
      html+='</div>';
    }
    openSheet(html);
    var c=document.getElementById('fvUsersClose');if(c){c.onclick=closeSheet}
    var pwdBtns=document.querySelectorAll('[data-fv-setpwd]');
    for(var p=0;p<pwdBtns.length;p++)pwdBtns[p].onclick=function(){
      var idx=Number(this.getAttribute('data-fv-setpwd')),u=users[idx],inp=document.getElementById('fvPwd_'+idx),pw=String(inp&&inp.value||'');
      if(pw.length<8){notify('La contraseña debe tener al menos 8 caracteres');return}
      var b=this;b.disabled=true;b.textContent='Guardando…';
      request('set_password',{username:u.username,password:pw}).then(function(){if(inp){inp.value=''}notify('Usuario activado');loadUsers()}).catch(function(e){b.disabled=false;b.textContent='Guardar contraseña y activar';notify(e&&e.message?e.message:String(e))})
    };
    var activeBtns=document.querySelectorAll('[data-fv-active]');
    for(var a=0;a<activeBtns.length;a++)activeBtns[a].onclick=function(){
      var idx=Number(this.getAttribute('data-fv-active')),u=users[idx],next=this.getAttribute('data-next')==='1';
      request('set_active',{username:u.username,active:next}).then(function(){notify(next?'Usuario activado':'Usuario desactivado');loadUsers()}).catch(function(e){notify(e&&e.message?e.message:String(e))})
    };
  }
  function loadUsers(){
    openSheet('<div class="row"><div><div class="ey">👥 ADMINISTRACIÓN</div><div class="stat" style="margin-top:5px">Usuarios Web</div></div><button class="iconbtn" id="fvUsersClose">×</button></div><div class="empty">Cargando…</div>');
    var c=document.getElementById('fvUsersClose');if(c){c.onclick=closeSheet}
    request('list_users',{}).then(function(d){renderUsers(d.users||[])}).catch(function(e){notify(e&&e.message?e.message:String(e));closeSheet()})
  }
  function install(){
    var top=document.querySelector('.topactions');if(!top||document.getElementById('fvWebUsers')){return}
    var b=document.createElement('button');b.id='fvWebUsers';b.className='iconbtn';b.title='Usuarios';b.setAttribute('aria-label','Usuarios');b.textContent='👥';b.onclick=loadUsers;top.insertBefore(b,top.firstChild)
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
