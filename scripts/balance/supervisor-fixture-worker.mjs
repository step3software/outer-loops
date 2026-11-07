const mode=process.argv[2];
if(mode==='complete'){
  process.send?.({type:'heartbeat',heapUsed:process.memoryUsage().heapUsed,
    diagnostic:{checkpoint:'fixture-start'}});
  process.send?.({type:'result',result:{status:'complete',value:42}});
}else if(mode==='memory'){
  process.send?.({type:'heartbeat',heapUsed:Number(process.env.RW00_MAX_HEAP_BYTES)+1,
    diagnostic:{checkpoint:'memory-limit'}});
  setInterval(()=>{},1000);
}else if(mode==='memory-silent'){
  // Uncooperative worker; no IPC heartbeat is sent.
  globalThis.__residentLeak=Buffer.alloc(96*1024*1024,0x7f);
  while(true){}
}else if(mode==='hang'){
  process.send?.({type:'heartbeat',heapUsed:process.memoryUsage().heapUsed,
    diagnostic:{checkpoint:'before-tight-loop'}});
  while(true){}
}else{
  throw new Error('unknown fixture mode');
}
