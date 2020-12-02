import { EventUtil } from '@util';
import { EventType } from '@types';
import { StoreChannelType } from "@types";
import { storeChannel } from '@store';
import { Source } from '@model';
import './PlaybackTools.scss'
import { runInThisContext } from 'vm';

(() => {
  const PlaybackTools = class extends HTMLElement {
    public iconlist: string[];
    public eventKeyList: string[];

    private sourceList: Source[];
    private audioContext:AudioContext;
    private sourceBuffer:AudioBufferSourceNode;

    private audioStartTime:number;
    private contextStartTime:number;
    private contextPauseTime: number;
    private skipQuantum:number;
    private playtime:number;
    private isloop:number;

    constructor() {
      super();
      this.iconlist = ['play', 'stop', 'repeat', 'fastRewind', 'fastForward', 'skipPrev', 'skipNext'];
    
      this.eventKeyList = ['audi-source-play-or-pause', 'audi-source-stop', 'audi-source-repeat', 'audi-source-fast-rewind', 'audi-soure-fast-forward', 'audi-source-skip-prev', 'audi-source-skip-next'];
      this.sourceList = [];
      this.audioContext = new AudioContext();
      this.audioContext.suspend();//만들고 바로 흐르지 않게 해놓아햐 할 듯..
      this.sourceBuffer = this.audioContext.createBufferSource();

      //일단 모두 0으로 해두고.
      this.audioStartTime=0;
      this.contextStartTime=0;
      this.contextPauseTime=0;
      this.skipQuantum=3;
      this.playtime=0;
      this.isloop=0;
    }

    connectedCallback() {
      this.render();
      this.subscribe();
      this.initEvent();
    }

    render() {
      this.innerHTML = `
                <div class="playback-tools">
                  ${this.iconlist.reduce((acc, icon, idx) => acc + `<audi-icon-button id="${icon}" color="white" icontype="${icon}" event-key="${this.eventKeyList[idx]}" size="32px"></audi-icon-button>`, '')}
                </div>
            `;
    }

    initEvent(): void {
      const allIcon = document.querySelectorAll('audi-icon-button');
      const playOrPause = allIcon[10];
      const stop = allIcon[11];
      const loop = allIcon[12];

      const fastRewind = allIcon[13];
      const fastForward = allIcon[14];

      const skipPrev = allIcon[15];
      const skipNext = allIcon[16];
      //document.querySelector('.playback-tools')?.childNodes[0];//document.querySelectorAll('audi-icon-button')[2];
      
      // 왜 안되는지는 물어봐야겠다.
      // EventUtil.registerEventToRoot({
      //   eventTypes: [EventType.click],
      //   eventKey: 'audi-source-play-or-pause',
      //   listeners: [this.playOrPause],
      //   bindObj: this
      // });
      
      //생각해보니.. 이거는 원래 이벤트 등록을 다른 것들 하는것처럼 해줘야하는데
      //그렇게 되면 아. 함수로 부르면 되긴 하구나.. ㅇㅇ... callback에서 실행되게 하면 된다.
       playOrPause.addEventListener('click', ()=>{
        if(this.iconlist[0]=='play'){
          if(this.sourceList.length!==0){
            this.play(0);
            this.iconlist[0]='pause';
          }
        }
        else {
          this.iconlist[0]='play';
          this.pause();
        }

        //render 후에 등록한 이벤트가 지워지기 때문에 다시 한 것입니다.
        //원래는 root에서 관리하게 하면 이렇게 안해도 되기는 하죠.
        this.render();
        this.initEvent();
      })

     stop.addEventListener('click', () =>{
        this.stop();

        this.iconlist[0]='play';

        this.render();
        this.initEvent();
      })

      loop.addEventListener('click', ()=>{
        // loop.style.color = 이게 안되네;;;
        this.loop(0); 
                
        this.render();
        this.initEvent();
      })

      fastRewind.addEventListener('click', ()=>{
        this.fastRewind(0);

        this.iconlist[0]='pause';
        
        this.render();
        this.initEvent();
      })

      fastForward.addEventListener('click', ()=>{
        this.fastForward(0);

        this.iconlist[0]='pause';
        
        this.render();
        this.initEvent();
      })

      skipPrev.addEventListener('click', ()=>{
        this.skipPrev(0);
      })

      skipNext.addEventListener('click', ()=>{
        this.skipNext(0);
      })
    }

    //색깔 바꾸는 건 어떻게 되는걸까.. 클릭하면 색이 바뀌어야 하는딩.
    createBufferSource(idx:number) {
      this.sourceBuffer = this.audioContext.createBufferSource();
      this.sourceBuffer.buffer = this.sourceList[idx].audioBuffer;
      this.sourceBuffer.connect(this.audioContext.destination);

      //loop 함수는 loop의 상태를 변경해주는 거고, 
      //얘는 loop의 상태에 따라 반영해주는 거임.
      if(this.isloop == 1){
        this.sourceBuffer.loop = true;
        this.sourceBuffer.loopStart = 2;
        this.sourceBuffer.loopEnd = 5;
        
        //적용이 안된다.
        // this.sourceBuffer.onended = ()=>{
        //   console.log('끝');
        // }
      }
      else {
        this.sourceBuffer.loop = false;
        this.sourceBuffer.loopStart = 0;
        this.sourceBuffer.loopEnd = 0;
      }
    }

    play(idx:number) {
      this.contextStartTime = this.audioContext.currentTime;

      console.log(this.sourceList[idx]);

      if(this.sourceBuffer.buffer==null){

        this.createBufferSource(idx);

        //맨 처음에 stop 하고 suspend 하기 때문에..ㅇㅇ 될 듯.
        if(this.audioContext.state==='suspended') {
          this.audioContext.resume();
        }

        this.sourceBuffer.start(0, this.audioStartTime);
      }
      else {
        if(this.audioContext.state==='suspended') 
          this.audioContext.resume();
      }
    }

    pause() {
      this.audioStartTime += this.audioContext.currentTime - this.contextStartTime;

      this.contextStartTime = this.audioContext.currentTime;

      if(this.audioContext.state==='running'){
        this.audioContext.suspend();
      }
    } 

    stop() {
      //start안 했는데 stop해서 생길 수 있는 문제를 방지.
      try {
        this.sourceBuffer.stop();
      }
      catch(e){}
      this.sourceBuffer.buffer = null;

      //파기하고 다시 만들기.. 이래야 씹히는 게 없다.
      //저장해둔 게 어떻게 되는지가 좀 문제이긴 하네요.
      this.audioContext.close();
      this.audioContext = new AudioContext();
      this.audioStartTime=0;

      this.audioContext.suspend();
      this.contextStartTime =0;
    }

    loop(idx:number) {
      //하지만 이건 사실 음원 파일이 있을 때 되어야 하는 겁니다.
      //그거를 원래 막아야 하기는 한데 다른 애도 다 마찬가지긴 해가지고..

      if(this.isloop==0) { //loop를 적용한다.
        this.isloop=1;

        //하지만 사실 이렇게 해봐야 loop은 안먹을거다. 움직이게 되면... buffer를 새로 만드니까...
        //그래서 buffer 만드는 데에서 설정해줘야할 거임.
        this.sourceBuffer.loop = true;
        this.sourceBuffer.loopStart = 2;
        this.sourceBuffer.loopEnd = 5;

        this.sourceBuffer.onended = ()=>{
          //나는 loop의 끝을 알고싶었다니까..
          console.log('ㅇ222ㅇ');
        }

      }
      else{ //loop를 해제한다.
        this.isloop=0;
        this.sourceBuffer.loop = false;
        //false만 하면 사실 의미 없지 않나 싶기는 함.
        //원래 loop를 할 애의 범위를 받아와서 그 만큼만 loop를 돌려야 하기는 할텐데....
        //loop 마커같은 게 있어가지고 그 애로 조절해야 할걸?
        this.sourceBuffer.loopStart = 0;
        this.sourceBuffer.loopEnd = 0;

        this.audioStartTime;
        //이거를 딱 눌렀을 때의.. 그거를..... 해줘야되는데 그걸 어떻게 알아요..?
        //루프의 시작이랑 마지막 일 때를.. 딱 내가 루프를 누ㄹㄴ다는 보장이 없어요.
        //그러면 어떻게 하죠..??
        //이제까지는 누른 시간으로 게산을 해주었는데
        //얘는 진짜 골때린다 ㅋㅋㅋㅋ..

        this.contextStartTime = this.audioContext.currentTime;
      }
    }

    fastRewind(idx:number) {
      this.contextPauseTime = this.audioContext.currentTime;
      const newStartTime = Number(this.audioStartTime) + (this.contextPauseTime - this.contextStartTime);
      let jumpedStartTime = newStartTime-this.skipQuantum;

      this.audioContext.suspend();
      //맨 처음에만 문제가 그 뒤에는 문제 없는 이유는 어차피 buffer 자체를 null로 안만들어서 그렇다.
      try {
        this.sourceBuffer.stop(); 
      }
      catch(e) {
      }
      this.audioContext.resume();

      this.createBufferSource(idx);
      
      if(jumpedStartTime < 0) {
        jumpedStartTime = 0;
      }
      this.sourceBuffer.start(0, jumpedStartTime);
    
      this.audioStartTime = jumpedStartTime;
      this.contextStartTime = this.audioContext.currentTime;
    }

    fastForward(idx:number) {
      this.contextPauseTime = this.audioContext.currentTime;
      const newStartTime = Number(this.audioStartTime) + (this.contextPauseTime - this.contextStartTime);
      
      let jumpedStartTime = newStartTime+this.skipQuantum;

      this.audioContext.suspend();
      try {
        this.sourceBuffer.stop(); 
      }
      catch(e) {
      }
      this.audioContext.resume();

      this.createBufferSource(idx);

      if(jumpedStartTime > this.playtime) {
        jumpedStartTime = this.playtime;
      }

      this.sourceBuffer.start(0, jumpedStartTime);
    
      this.audioStartTime = jumpedStartTime;
      this.contextStartTime = this.audioContext.currentTime;
    }

    skipPrev(idx:number) {
      this.stop();
      this.play(idx);
    }

    skipNext(idx:number) {
      this.stop();

      //이걸 해도 사실 마지막이긴 해서.
      this.audioStartTime = this.playtime;
      this.play(idx);      
    }

    playOrPause() {
      console.log('플레이 또는 일시정지');
    }

    subscribe(){
      storeChannel.subscribe(StoreChannelType.SOURCE_LIST_CHANNEL,this.updateSourceList,this);
    }

    //아 이게 subscribe를 해놓아서 할 때..
    //파일을 올렸을 때 publish를 통해서 가져오는거구나
    updateSourceList(sourceList){
      this.sourceList = sourceList;

      //duration
      this.playtime = this.sourceList[0].audioBuffer.length / this.sourceList[0].audioBuffer.sampleRate;
    }

  };
  customElements.define('audi-playback-tools', PlaybackTools);
})()

export { };
