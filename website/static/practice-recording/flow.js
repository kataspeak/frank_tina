(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.RecordingFlow=factory();})(typeof window==='object'?window:globalThis,()=>{
  const initial=()=>({enabled:false,phase:'idle',saved:0,capture:false});
  const toggle=(s,enabled)=>({...s,enabled});
  const start=s=>({...s,phase:'model',capture:s.enabled});
  const speak=s=>s.phase==='model'?{...s,phase:'speech'}:s;
  const finish=s=>s.phase==='speech'?{...s,phase:'idle',saved:s.saved+(s.capture?1:0),capture:false}:s;
  const stop=s=>({...s,phase:'idle',capture:false});
  const play=(s,source)=>source==='model'||(source==='voice'&&s.saved>0)?{...stop(s),phase:source==='model'?'listen-model':'listen-voice'}:s;
  return {initial,toggle,start,speak,finish,stop,play};
});
