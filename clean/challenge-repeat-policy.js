(() => {
'use strict';
window.PW_CHALLENGE_REPEAT_POLICY=function({deck,count,seen,excluded,last,random=Math.random}){
 const valid=i=>Number.isInteger(i)&&i>=0&&i<count;
 let available=Array.from({length:count},(_,i)=>i).filter(i=>!excluded.has(i));
 // Keep every mode playable after the player has completed the entire bank.
 if(!available.length)available=Array.from({length:count},(_,i)=>i);
 let history=new Set([...seen].filter(valid));
 let fresh=available.filter(i=>!history.has(i));
 if(!fresh.length){history=new Set();fresh=available;}
 const eligible=new Set(fresh);
 let remaining=[...new Set(deck.filter(i=>valid(i)&&eligible.has(i)))];
 if(!remaining.length){remaining=[...fresh];for(let i=remaining.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[remaining[i],remaining[j]]=[remaining[j],remaining[i]]}}
 if(remaining.length>1&&remaining[0]===last){[remaining[0],remaining[1]]=[remaining[1],remaining[0]]}
 const index=remaining.shift();history.add(index);
 return {index,deck:remaining,seen:[...history]};
};
})();
