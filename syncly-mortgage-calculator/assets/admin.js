(function(){
  document.addEventListener('click', function(e){
    if(e.target && e.target.id === 'syncly-mc-copy'){
      var input = document.getElementById('syncly-mc-shortcode');
      if(!input) return;
      input.select();
      input.setSelectionRange(0, 99999);
      try {
        document.execCommand('copy');
        e.target.textContent = 'Copied!';
        setTimeout(()=>{ e.target.textContent = 'Copy'; }, 1400);
      } catch(err){
        // Fallback
        navigator.clipboard && navigator.clipboard.writeText(input.value).then(()=>{
          e.target.textContent = 'Copied!';
          setTimeout(()=>{ e.target.textContent = 'Copy'; }, 1400);
        });
      }
    }
  });
})();
