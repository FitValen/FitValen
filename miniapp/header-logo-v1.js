(function(){
  var DATA='data:image/webp;base64,UklGRhYFAABXRUJQVlA4IAoFAABQGgCdASpgAGAAPlUkj0YjoaEhJzYKSHAKiWMAxQzjTVIAKQv9ADpIv2+9IC559JR5b9k8o6978ADfAP5B/bsel/kN0l9Cb/W8eHHR/o/Tu/2v7x59Pn//uf434Cv5b/Xv9N+cPeu9FX9gCi6y0re9JYi/0k6uZE82w/Vr2OCFWtXGy/7IU0uvneI0K+XUnL5fJ52TE7/zrKDDt35kwOtJafiO6ooKW8rRe3qjN1kSNMgFrTqVUF2zqpKL3NofQXkhKc8ClEAVsebYz4bdUTMxja5muWZ6CYZl1AAA/v+dVBwblZRvhej2ZmflImcBizxhVEx4NN/XeNj34SyWJOUxnoGS2sMR0OOW/OYM9w9KodL5FOOh0ZDxnYlGonl9Fb3I9wBVNZ7ocq4kMztTr1AStz53kiNmm/yp/HqowEDeq59EDhwoOD3TrYrz+9D1H3hALecBLUKpIKUMgKXE70LkR4Kh2FCjpHA1MUVuKOQmu5+9PPY47lQnHAPKbhZ5Bcvyqf5EjW0XwrtpwmD5LReP1ZhyBbhP0mf5X1arKifH5Pjxkep81iBH8OEaNeM9MCZasq+r0FLSj+DKL8w0Wff5y/p2dTGffzJUM50jQbnkf/1dgywKuwOvDD1F0dYj0JTuBwYXJOEPyLbfrqr8asamX2MdXZw/VU0q0dAnN5Hy7D/Mu9tfQQlsU6w/t4JPKt0I6e9B17kbx6jEFMm2qIhkfv/PrbGDp+V5kI2ji6bwJGwuV7WO9Ec8hg3fYE75KKxbn9QGSbhyvP1l2AO3RONt9IgjhFrzsj8VfBaL5Vz491JX1kwd/9MaGATzl6NcYNyVf+IZG/t9XjBEayUbAuDWYe5RdLVDO6pOqf4k+6NPCPqgftQEkV8ruwrIeburuVK7UJa5F901BAZu1DlWgYAxo+QOUBcZjqFq3DcnEvGUgiE1c26Q5/WuiYVtPSyd6g0PF9puKTa/Zuw2kv29oI8pWfKOhJmm92zU4mYtMrpZFVM2irGV/m0FT4NTnF6JDyZF3ZD1e5Ock1jfP2vWrh1gvaj6GDXLM3VzJ5nfWh9QiaPd8/Ub+3lnCZWK3/W9k7PVYdivQfUMUvVyjF7318AlZW+K3YyhlT5s62XKGeeL6sLtQIzuwY4IxAE6ZPBlYQyauxz+KcDfxuI4jFGxeOd/17wonJ2Hxn40n6dntVDurmN1TKgZ4shdt276Iyr6eXFp9dkltHzmKkK717Jk+INfwwM+DFPYmmpZ6P/qN5PSskOS20Zk9ZQpJCPmTrkFLqgU+dI4MzUvtch7ukjF/jmQKP87rBEc02AV6Gl/2cQikQEpfqngBRIo3nPRozV+6T7maGtdG2dHvJIm/3UGf8e9Fi9T3ldhlgks8C78ZtG98jhikYiVvA0XcIofO+kzmqYYtFB/hywud55KlnzS897KrsP878Xb+IpUbY3zxk4vpgY9K+oVw7iqiL0Krh1LQJltnIzuYTEVpRrp9boSSYL0Y0/LPEauK9yxz5gVBdWB6TFAfaU4NCucFAjNNmK8S3QfzalpYjr0wjVfss3JJV3+PPcjh2pI7Sx/+Tuf+IfrjExdqfF34PviA/TSnBTAU7zadmq+aBjdGa/FhcpdBpVriGwvMI79dbQK2Jj2mwDmmTvzSX3b0XB4ojq0cVR3n2x43ZtBEeX4f3VVkre2xVkRWRT184xesTCjPk2GmnWIYyjd56+qAfgAAAA=';
  function installLogo(){
    var box=document.querySelector('.topbar .logo');
    if(!box||box.getAttribute('data-fv-real-logo')==='1'){return}
    box.setAttribute('data-fv-real-logo','1');
    box.textContent='';
    var img=document.createElement('img');
    img.className='fvHeaderLogoImg';
    img.alt='FitValen';
    img.src=DATA;
    box.appendChild(img);
  }
  function install(){
    installLogo();
    var top=document.querySelector('.topbar');
    if(top&&window.MutationObserver){new MutationObserver(function(){installLogo()}).observe(top,{childList:true,subtree:true})}
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
