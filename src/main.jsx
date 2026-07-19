import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowLeft, BarChart3, Brain, Check, ChevronRight, Code2, HelpCircle, Keyboard, Pause, Play, RotateCcw, Volume2, X} from 'lucide-react';
import './style.css';

const LETTERS=['C','H','K','L','Q','R','S','T'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const getHistory=()=>JSON.parse(localStorage.getItem('nback-history')||'[]');

function App(){
  const [screen,setScreen]=useState('home'); const [n,setN]=useState(2); const [rounds,setRounds]=useState(20);
  const [history,setHistory]=useState(getHistory); const [dark,setDark]=useState(true);
  const [tutorial,setTutorial]=useState(()=>!localStorage.getItem('nback-tutorial-seen'));
  const best=history.length?Math.max(...history.map(x=>x.score)):0;
  return <main className={dark?'dark':'light'}>
    <div className="grain"/>
    <header><button className="brand" onClick={()=>setScreen('home')}><span><Brain size={19}/></span>N/BACK</button><nav>
      <button className={screen==='stats'?'active':''} onClick={()=>setScreen('stats')}><BarChart3 size={17}/> Progress</button>
      <button onClick={()=>setTutorial(true)}><HelpCircle size={17}/> How to play</button>
      <a href="https://github.com/rohannbajpai/nback" target="_blank" rel="noreferrer"><Code2 size={17}/> Source</a>
      <button className="icon" aria-label="Toggle theme" onClick={()=>setDark(!dark)}>{dark?'☼':'◐'}</button>
    </nav></header>
    {screen==='home'&&<Home n={n} setN={setN} rounds={rounds} setRounds={setRounds} best={best} onStart={()=>setScreen('game')}/>} 
    {screen==='game'&&<Game n={n} rounds={rounds} onExit={()=>setScreen('home')} onFinish={r=>{const h=[...history,r];localStorage.setItem('nback-history',JSON.stringify(h));setHistory(h);setScreen('stats')}}/>}
    {screen==='stats'&&<Stats history={history} onBack={()=>setScreen('home')} onPlay={()=>setScreen('game')}/>} 
    {tutorial&&<Tutorial onClose={()=>{localStorage.setItem('nback-tutorial-seen','true');setTutorial(false)}} onPractice={()=>{localStorage.setItem('nback-tutorial-seen','true');setTutorial(false);setN(1);setRounds(15);setScreen('game')}}/>}
  </main>
}

function Tutorial({onClose,onPractice}){
 const [step,setStep]=useState(0); const [pressed,setPressed]=useState(false);
 const steps=[
  {tag:'THE IDEA',title:'Compare now with before.',body:'Each turn gives you two signals: a square position and a spoken letter. Notice when either one matches the signal from N turns earlier.'},
  {tag:'POSITION MATCH',title:'Same place, N turns later.',body:'If the square returns to the same cell it occupied N turns ago, press A—or tap Position. Ignore the letter for this decision.'},
  {tag:'SOUND MATCH',title:'Same letter, N turns later.',body:'If the spoken letter matches the one from N turns ago, press L—or tap Sound. The square can be somewhere completely different.'},
  {tag:'YOU’RE READY',title:'Track both. Respond to either.',body:'A turn can match position, sound, both, or neither. Only respond when you detect a match. Start with 1-back to learn the rhythm.'}
 ];
 const speak=()=>{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance('K');u.rate=.82;u.pitch=.9;speechSynthesis.speak(u)};
 useEffect(()=>setPressed(false),[step]);
 return <div className="tutorial-wrap" role="dialog" aria-modal="true" aria-label="How to play dual n-back"><div className="tutorial panel">
  <div className="tutorial-top"><div className="tutorial-count"><span>GUIDE</span> 0{step+1} / 04</div><button className="tutorial-close" onClick={onClose} aria-label="Close tutorial"><X/></button></div>
  <div className="tutorial-body"><div className="tutorial-copy"><small>{steps[step].tag}</small><h2>{steps[step].title}</h2><p>{steps[step].body}</p>
   {step===0&&<div className="n-example"><span>NOW</span><b>N = 2</b><span>2 TURNS AGO</span></div>}
   {step===1&&<button className={`demo-response ${pressed?'pressed':''}`} onClick={()=>setPressed(true)}><kbd>A</kbd><span><b>Position</b> Try it</span>{pressed&&<Check/>}</button>}
   {step===2&&<button className="demo-response" onClick={speak}><Volume2/><span><b>Hear “K”</b> Play sound</span><Play/></button>}
   {step===3&&<div className="match-summary"><span><i/> POSITION <kbd>A</kbd></span><span><i/> SOUND <kbd>L</kbd></span></div>}
  </div><div className={`tutorial-visual step-${step}`}>
   {step===0&&<><div className="signal-card past"><span>−2</span><i/><b>K</b></div><div className="trail">···</div><div className="signal-card now"><span>NOW</span><i/><b>K</b></div></>}
   {step===1&&<><div className="mini-grid">{[0,1,2,3,4,5,6,7,8].map(i=><i key={i} className={i===2?'lit':''}/>)}</div><ArrowLeft/><div className="mini-grid faded">{[0,1,2,3,4,5,6,7,8].map(i=><i key={i} className={i===2?'lit':''}/>)}</div></>}
   {step===2&&<div className="sound-rings"><i/><i/><i/><Volume2/><b>K</b></div>}
   {step===3&&<div className="dual-lock"><Brain/><span>POSITION</span><i>+</i><span>SOUND</span></div>}
  </div></div>
  <div className="tutorial-foot"><div className="tutorial-dots">{steps.map((_,i)=><button key={i} className={i===step?'active':''} onClick={()=>setStep(i)} aria-label={`Tutorial step ${i+1}`}/>)}</div><div>{step>0&&<button className="text-button" onClick={()=>setStep(step-1)}>Back</button>}{step<3?<button className="next-button" onClick={()=>setStep(step+1)}>Next <ChevronRight/></button>:<button className="next-button" onClick={onPractice}>Start 1-back practice <Play fill="currentColor"/></button>}</div></div>
 </div></div>
}

function Home({n,setN,rounds,setRounds,best,onStart}){return <section className="home page">
  <div className="eyebrow"><i/> WORKING MEMORY, SHARPENED</div>
  <h1>Hold more.<br/><em>Think clearer.</em></h1>
  <p className="lede">A focused dual n-back practice for training attention and working memory—one signal at a time.</p>
  <div className="setup panel"><div className="setup-head"><div><small>YOUR SESSION</small><h2>Dual {n}-Back</h2></div><span className="session-time">≈ {Math.ceil(rounds*3/60)} min</span></div>
    <div className="controls"><label>Difficulty <span>Match {n} steps back</span><div className="stepper"><button onClick={()=>setN(clamp(n-1,1,5))}>−</button><b>{n}</b><button onClick={()=>setN(clamp(n+1,1,5))}>+</button></div></label>
    <label>Trials <span>Length of session</span><div className="pills">{[15,20,30].map(x=><button className={rounds===x?'chosen':''} onClick={()=>setRounds(x)}>{x}</button>)}</div></label></div>
    <button className="primary" onClick={onStart}><Play fill="currentColor" size={17}/> Begin session <ChevronRight size={18}/></button>
    <p className="keys"><Keyboard size={15}/> During play: <kbd>A</kbd> position match · <kbd>L</kbd> sound match</p>
  </div>
  <div className="side-note"><span>01</span><p><b>Two streams. One focus.</b><br/>Watch the position. Hear the letter. Respond when either repeats from {n} turns ago.</p></div>
  <div className="best"><small>PERSONAL BEST</small><strong>{best || '—'}<sup>%</sup></strong><span>{best?'Keep the rhythm.':'Your first session awaits.'}</span></div>
</section>}

function Game({n,rounds,onExit,onFinish}){
 const [trial,setTrial]=useState(-1),[seq,setSeq]=useState([]),[state,setState]=useState('ready'),[hits,setHits]=useState({p:[],a:[]}); const timer=useRef(); const started=useRef(Date.now());
 const current=seq[trial];
 const makeTrial=(s,i)=>{let pos=Math.floor(Math.random()*9),letter=LETTERS[Math.floor(Math.random()*LETTERS.length)]; if(i>=n&&Math.random()<.3)pos=s[i-n].pos;if(i>=n&&Math.random()<.3)letter=s[i-n].letter;return {pos,letter}};
 const begin=()=>{const s=[];for(let i=0;i<rounds;i++)s.push(makeTrial(s,i));setSeq(s);setTrial(0);setState('play');started.current=Date.now()};
 const respond=kind=>{if(state!=='play'||hits[kind].includes(trial))return;setHits(h=>({...h,[kind]:[...h[kind],trial]}))};
 useEffect(()=>{if(state!=='play'||trial<0)return; speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(current.letter);u.rate=.82;u.pitch=.9;speechSynthesis.speak(u);timer.current=setTimeout(()=>{if(trial+1>=rounds)finish();else setTrial(t=>t+1)},2600);return()=>clearTimeout(timer.current)},[trial,state]);
 useEffect(()=>{const key=e=>{if(e.key.toLowerCase()==='a')respond('p');if(e.key.toLowerCase()==='l')respond('a');if(e.code==='Space'){e.preventDefault();state==='ready'?begin():setState(s=>s==='play'?'pause':'play')}};addEventListener('keydown',key);return()=>removeEventListener('keydown',key)},[state,trial,hits]);
 const finish=()=>{clearTimeout(timer.current);speechSynthesis.cancel();let correct=0,total=0;for(let i=n;i<seq.length;i++){for(const k of ['p','a']){const match=k==='p'?seq[i].pos===seq[i-n].pos:seq[i].letter===seq[i-n].letter;const pressed=hits[k].includes(i);if(match===pressed)correct++;total++}}onFinish({date:new Date().toISOString(),n,score:Math.round(correct/total*100),trials:rounds,time:Math.round((Date.now()-started.current)/1000)})};
 if(state==='ready')return <section className="ready page"><button className="back" onClick={onExit}><ArrowLeft/> Exit</button><div className="ready-card"><span className="orbit"><Brain/></span><small>DUAL {n}-BACK</small><h1>Ready your focus.</h1><p>Position responds with your left hand. Sound responds with your right.</p><div className="key-pair"><div><kbd>A</kbd><b>Position</b><span>visual match</span></div><div><kbd>L</kbd><b>Sound</b><span>audio match</span></div></div><button className="primary" onClick={begin}><Play fill="currentColor"/> Start</button><span className="space">or press SPACE</span></div></section>;
 return <section className="game page"><div className="game-top"><button className="back" onClick={onExit}><X/> End</button><div><small>DUAL {n}-BACK</small><b>{trial+1} <span>/ {rounds}</span></b></div><button className="icon pause" onClick={()=>setState(s=>s==='play'?'pause':'play')}>{state==='play'?<Pause/>:<Play/>}</button></div>
 <div className="progress"><i style={{width:`${(trial+1)/rounds*100}%`}}/></div><div className="arena">{state==='pause'?<div className="paused"><Pause/><h2>Paused</h2><button onClick={()=>setState('play')}>Resume</button></div>:<div className="grid">{[0,1,2,3,4,5,6,7,8].map(i=><i className={current?.pos===i?'lit':''}/>)}</div>}</div>
 <div className="responses"><button className={hits.p.includes(trial)?'pressed':''} onClick={()=>respond('p')}><kbd>A</kbd><span><b>Position</b> visual match</span>{hits.p.includes(trial)&&<Check/>}</button><button className={hits.a.includes(trial)?'pressed':''} onClick={()=>respond('a')}><kbd>L</kbd><span><b>Sound</b> audio match</span>{hits.a.includes(trial)&&<Check/>}</button></div>
 <div className="heard"><Volume2/> Listen for the letter</div></section>
}

function Stats({history,onBack,onPlay}){const last=history.at(-1),avg=history.length?Math.round(history.reduce((s,x)=>s+x.score,0)/history.length):0;return <section className="stats page"><button className="back" onClick={onBack}><ArrowLeft/> Home</button><div className="stats-head"><div><div className="eyebrow"><i/> YOUR PROGRESS</div><h1>{last?'Session complete.':'Start your practice.'}</h1><p>{last?'A little steadier every time. Your results stay privately on this device.':'Complete a session to see your scores here.'}</p></div>{last&&<button className="primary" onClick={onPlay}><RotateCcw/> Train again</button>}</div>
 <div className="score-grid"><div className="score panel"><small>LATEST ACCURACY</small><strong>{last?.score??'—'}<sup>{last&&'%'}</sup></strong><span className={last?.score>=80?'good':''}>{last?.score>=80?'Strong session':'Keep practicing'}</span></div><div className="metric panel"><small>ALL-TIME AVERAGE</small><b>{avg || '—'}{avg?'%':''}</b><small>SESSIONS</small><b>{history.length}</b></div></div>
 <div className="history panel"><h2>Session history</h2>{history.length===0?<p className="empty">No sessions yet. Your scores will appear here.</p>:history.slice().reverse().map((x,i)=><div className="row"><span>#{history.length-i}</span><b>Dual {x.n}-Back</b><time>{new Date(x.date).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</time><strong>{x.score}%</strong></div>)}</div></section>}

createRoot(document.getElementById('root')).render(<App/>);
