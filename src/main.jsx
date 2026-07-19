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
 const [stage,setStage]=useState(0); const [hits,setHits]=useState([]); const [feedback,setFeedback]=useState(''); const advancing=useRef(false);
 const trials={1:{pos:2,letter:'H'},2:{pos:2,letter:'K'},3:{pos:6,letter:'Q'},4:{pos:1,letter:'Q'},5:{pos:4,letter:'T'},6:{pos:4,letter:'T'}};
 const copy=[
  ['KEYBOARD TUTORIAL','Learn by doing.','You’ll play three short 1-back examples. Keep your hands on A and L—there are no buttons to click.'],
  ['POSITION · FIRST SIGNAL','Remember this square.','This is your first signal. There is nothing to match yet.'],
  ['POSITION · YOUR TURN','Did the position repeat?','Compare this square with the previous one, then respond.'],
  ['SOUND · FIRST SIGNAL','Remember the sound.','Listen to the letter. The square does not matter for this example.'],
  ['SOUND · YOUR TURN','Did the sound repeat?','Compare the spoken letter with the previous one, then respond.'],
  ['DUAL · FIRST SIGNAL','Now track both.','Remember the square position and the spoken letter together.'],
  ['DUAL · YOUR TURN','What repeated?','Position and sound can both match on the same turn.'],
  ['TUTORIAL COMPLETE','That’s dual n-back.','In a real session, respond only when position, sound, or both match N turns back.']
 ];
 const speak=()=>{const trial=trials[stage];if(!trial)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(trial.letter);u.rate=.82;u.pitch=.9;speechSynthesis.speak(u)};
 const advance=()=>{if(advancing.current)return;advancing.current=true;setFeedback('Correct');setTimeout(()=>{setStage(s=>s+1);setHits([]);setFeedback('');advancing.current=false},450)};
 useEffect(()=>{if(trials[stage])speak()},[stage]);
 useEffect(()=>{const key=e=>{const k=e.key.toLowerCase();if(k==='escape'){onClose();return}if(k==='r'){speak();return}if(e.code==='Space'){e.preventDefault();if([0,1,3,5].includes(stage)){setStage(s=>s+1);setFeedback('');return}if(stage===7){onPractice();return}setFeedback('Use the match key');return}if(!['a','l'].includes(k))return;
   if(stage===2){if(k==='a')advance();else setFeedback('Sound did not repeat')}
   else if(stage===4){if(k==='l')advance();else setFeedback('Position did not repeat')}
   else if(stage===6){const next=[...new Set([...hits,k])];setHits(next);if(next.length===2)advance();else setFeedback(`${k==='a'?'Position':'Sound'} match — one more`) }
   else setFeedback('No response needed yet');
  };addEventListener('keydown',key);return()=>removeEventListener('keydown',key)},[stage,hits]);
 const activePos=trials[stage]?.pos;
 return <div className="tutorial-wrap" role="dialog" aria-modal="true" aria-label="Interactive keyboard tutorial"><div className="key-tutorial panel">
  <div className="key-tutorial-top"><div><span>INTERACTIVE GUIDE</span><b>{String(stage+1).padStart(2,'0')} / 08</b></div><div><kbd>R</kbd> repeat sound <kbd>ESC</kbd> exit</div></div>
  <div className="key-tutorial-main"><div className="key-copy"><small>{copy[stage][0]}</small><h2>{copy[stage][1]}</h2><p>{copy[stage][2]}</p><div className={`key-feedback ${feedback==='Correct'?'success':''}`}>{feedback||' '}</div></div>
   <div className="key-stage">{stage===0||stage===7?<div className="tutorial-brain"><Brain/><i/></div>:<><div className="practice-grid">{[0,1,2,3,4,5,6,7,8].map(i=><i key={i} className={i===activePos?'lit':''}/>)}</div><div className="spoken"><Volume2/> LETTER SPOKEN</div></>}</div>
  </div>
  <div className="key-tutorial-foot"><div className="response-keys"><div className={hits.includes('a')?'active':''}><kbd>A</kbd><span><b>POSITION</b> visual match</span></div><div className={hits.includes('l')?'active':''}><kbd>L</kbd><span><b>SOUND</b> audio match</span></div></div><div className="key-prompt">{[0,1,3,5,7].includes(stage)?<><span>PRESS</span><kbd>SPACE</kbd><b>{stage===7?'START PRACTICE':'CONTINUE'}</b></>:<><span>RESPOND WITH</span><kbd>{stage===2?'A':stage===4?'L':'A + L'}</kbd></>}</div></div>
  <div className="stage-progress"><i style={{width:`${(stage+1)/8*100}%`}}/></div>
 </div></div>
}

function Home({n,setN,rounds,setRounds,best,onStart}){return <section className="home page">
  <h1>Hold more.<br/><em>Think clearer.</em></h1>
  <p className="lede">A focused dual n-back practice for training attention and working memory—one signal at a time.</p>
  <div className="setup panel"><div className="setup-head"><div><small>YOUR SESSION</small><h2>Dual {n}-Back</h2></div><span className="session-time">≈ {Math.ceil(rounds*3/60)} min</span></div>
    <div className="controls"><label>Difficulty <span>Match {n} steps back</span><div className="stepper"><button onClick={()=>setN(clamp(n-1,1,5))}>−</button><b>{n}</b><button onClick={()=>setN(clamp(n+1,1,5))}>+</button></div></label>
    <label>Trials <span>Length of session</span><div className="pills">{[15,20,30].map(x=><button className={rounds===x?'chosen':''} onClick={()=>setRounds(x)}>{x}</button>)}</div></label></div>
    <button className="primary justify-start! px-5!" onClick={onStart}><Play className="shrink-0" fill="currentColor" size={17}/> <span>Begin session</span> <ChevronRight className="mr-0! ml-auto! shrink-0" size={18}/></button>
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
 if(state==='ready')return <section className="page relative flex min-h-[calc(100vh-76px)] items-center justify-center px-6 py-12"><button className="back" onClick={onExit}><ArrowLeft/> Exit</button>
  <div className="mx-auto flex -translate-y-4 flex-col items-center text-center">
   <div className="text-[clamp(3rem,6vw,6rem)] leading-[.92] font-bold tracking-[-.06em] text-[var(--text)]">Ready your focus.</div>
   <button className="mt-12 flex h-14 w-56 items-center justify-center gap-3 bg-[var(--lime)] font-bold text-[var(--black)] transition-transform hover:-translate-y-0.5" onClick={begin}><Play size={18} fill="currentColor"/> Start</button>
  </div></section>;
 return <section className="game page"><div className="game-top"><button className="back" onClick={onExit}><X/> End</button><div><small>DUAL {n}-BACK</small><b>{trial+1} <span>/ {rounds}</span></b></div><button className="icon pause" onClick={()=>setState(s=>s==='play'?'pause':'play')}>{state==='play'?<Pause/>:<Play/>}</button></div>
 <div className="progress"><i style={{width:`${(trial+1)/rounds*100}%`}}/></div><div className="arena">{state==='pause'?<div className="paused"><Pause/><h2>Paused</h2><button onClick={()=>setState('play')}>Resume</button></div>:<div className="game-grid">{[0,1,2,3,4,5,6,7,8].map(i=><i className={current?.pos===i?'lit':''}/>)}</div>}</div>
 <div className="responses"><button className={hits.p.includes(trial)?'pressed':''} onClick={()=>respond('p')}><kbd>A</kbd><span><b>Position</b> visual match</span>{hits.p.includes(trial)&&<Check/>}</button><button className={hits.a.includes(trial)?'pressed':''} onClick={()=>respond('a')}><kbd>L</kbd><span><b>Sound</b> audio match</span>{hits.a.includes(trial)&&<Check/>}</button></div>
 <div className="heard"><Volume2/> Listen for the letter</div></section>
}

function Stats({history,onBack,onPlay}){
 const last=history.at(-1),avg=history.length?Math.round(history.reduce((s,x)=>s+x.score,0)/history.length):0;
 return <section className="page mx-auto w-full max-w-[1180px] px-6 py-10 lg:px-10 lg:py-12">
  <button className="flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]" onClick={onBack}><ArrowLeft size={17}/> Home</button>
  <div className="mt-11 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
   <div><div className="eyebrow"><i/> YOUR PROGRESS</div><div className="mt-6 text-[clamp(3.25rem,5.5vw,5rem)] leading-[.95] tracking-[-.055em]">{last?'Session complete.':'Start your practice.'}</div><p className="mt-5 text-sm text-[var(--muted)]">{last?'A little steadier every time. Your results stay privately on this device.':'Complete a session to see your scores here.'}</p></div>
   {last&&<button className="flex h-14 shrink-0 items-center justify-center gap-3 bg-[var(--lime)] px-8 font-bold text-[var(--black)] transition-transform hover:-translate-y-0.5" onClick={onPlay}><RotateCcw size={19}/> Train again</button>}
  </div>
  <div className="mt-12 grid gap-4 md:grid-cols-[2fr_1fr]">
   <div className="flex min-h-72 flex-col border border-[var(--line)] bg-[var(--panel)] p-9"><small>LATEST ACCURACY</small><div className="mt-8 font-mono text-8xl font-medium tracking-[-.07em]">{last?.score??'—'}{last&&<sup className="ml-2 text-3xl">%</sup>}</div><span className={`mt-auto text-xs ${last?.score>=80?'text-[var(--lime)]':'text-[var(--muted)]'}`}>{last?.score>=80?'Strong session':'Keep practicing'}</span></div>
   <div className="grid min-h-72 grid-cols-2 border border-[var(--line)] bg-[var(--panel)] p-9 md:grid-cols-1 md:grid-rows-2"><div className="flex flex-col justify-between pb-6 md:border-b md:border-[var(--line)]"><small>ALL-TIME AVERAGE</small><b className="font-mono text-4xl font-medium">{avg || '—'}{avg?'%':''}</b></div><div className="flex flex-col justify-between pl-6 md:pt-6 md:pl-0"><small>SESSIONS</small><b className="font-mono text-4xl font-medium">{history.length}</b></div></div>
  </div>
  <div className="mt-4 border border-[var(--line)] bg-[var(--panel)] p-8"><h2 className="m-0 text-2xl">Session history</h2>{history.length===0?<p className="mt-6 text-sm text-[var(--muted)]">No sessions yet. Your scores will appear here.</p>:<div className="mt-7">{history.slice().reverse().map((x,i)=><div key={`${x.date}-${i}`} className="grid grid-cols-[42px_1fr_80px_50px] items-center border-t border-[var(--line)] py-4 text-xs sm:grid-cols-[60px_1fr_120px_60px]"><span className="text-[var(--muted)]">#{history.length-i}</span><b>Dual {x.n}-Back</b><time className="text-[var(--muted)]">{new Date(x.date).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</time><strong className="text-right font-mono text-base">{x.score}%</strong></div>)}</div>}</div>
 </section>
}

createRoot(document.getElementById('root')).render(<App/>);
