interface ObserverData{
    callback: Function;
    bindObj: Object;
}

class StoreChannel{
    private channels: Map<string, any>
    private observers: Map<string, ObserverData[]>

    constructor(){
        this.channels = new Map();
        this.observers = new Map();
    }

    publish(channel, data) {
        console.log(channel, data, 'publish 합니다.');
        this.channels.set(channel, data);        
        this.notify(channel);
    }

    subscribe(channel, callback, bindObj) {
        console.log('subscribe 합니다');

        let observerDatas: ObserverData[] | undefined = this.observers.get(channel);

        if(!observerDatas) { 
            observerDatas = [{callback, bindObj}]
            this.observers.set(channel, observerDatas);
            return;
        };

        const newObserverDatas = observerDatas.concat({callback, bindObj});
        this.observers.set(channel, newObserverDatas);
    }

    notify(channel) {
        const observerDatas: ObserverData[] | undefined =  this.observers.get(channel);
        if (!observerDatas) return;
        
        console.log('notify임..!');

        const data = this.channels.get(channel);
        observerDatas.forEach((observerData) => {observerData.callback.call(observerData.bindObj,data)
            console.log(observerData, observerData.callback,'뭐 있는지 좀 보자 ㅋ');
        });
    }
}

const storeChannel = new StoreChannel();

export{
    storeChannel,
    StoreChannel
}
