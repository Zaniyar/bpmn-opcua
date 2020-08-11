const {
    OPCUAClient,
    ClientSubscription,
    AttributeIds,
    DataType,
    StatusCodes
} = require("node-opcua");

require('dotenv').config();

const endpointUrl = process.env.IP;

 class OPC{

    constructor(){
        this.client;
        this.session;
        this.nodeId = "ns=2;s=Rooster.OPCYellow";

    }

    async getClient(){
        return OPCUAClient.create({
            endpoint_must_exist: false,
            connectionStrategy: {
                maxRetry: 2,
                initialDelay: 2000,
                maxDelay: 10 * 1000
            }
        });
    }

    async getSession(){
        return this.client.createSession();
    }

    async main() {

        try {
    
            this.client = await this.getClient();
            this.client.on("backoff", () => console.log("retrying connection"));
            await this.client.connect(endpointUrl);
    
            this.session = await this.getSession();
    
            const browseResult = await this.session.browse("");
    
            console.log(browseResult.references.map((r) => r.browseName.toString()).join("\n"));
    
            const dataValue = await this.session.read({ nodeId: this.nodeId, attributeId: AttributeIds.Value });
            console.log(` Yellow = ${dataValue.value.value.toString()}`);
    
            const dataValue2 = await this.session.write({ nodeId: this.nodeId, attributeId: AttributeIds.Value,             
                    value: /* DataValue */ {
                    sourceTimestamp: new Date(),
                    statusCode: StatusCodes.Good,// <==== 
                    value: /* Variant */ {
                            dataType: DataType.Int32,
                            value: 0
                        }
                    }
            });
            console.log(dataValue2)
       
    
            await new Promise((resolve) => setTimeout(resolve, 2000));
    
         //   await subscription.terminate();
    
            console.log(" closing session");
          //  await session.close();
    
       //     await client.disconnect();
        }
        catch (err) {
            console.log("Error !!!", err);
            process.exit();
        }
    
    }
        
    async switchLight(isOn,color) {
        let nodeId ="ns=2;s=Rooster.OPC"+color;
        let status = await this.session.write({ nodeId: nodeId, attributeId: AttributeIds.Value,             
            value: /* DataValue */ {
            sourceTimestamp: new Date(),
            statusCode: StatusCodes.Good,// <==== 
            value: /* Variant */ {
                    dataType: DataType.Int32,
                    value: isOn
                }
            }
    });
    console.log(nodeId,isOn, status)
    }

    blinkIt(color, times){
        let isOn = 1;
        let howOften= 0;
        let interval = setInterval(function(){
            if(isOn==1){
                isOn = 0;
            }else{
                isOn = 1;
            }
            opc.switchLight(isOn,color);
            howOften++;
            if(howOften==times)
                clearInterval(interval);
        },1000);

    }
    
}
 class Blinker{
    constructor(color,times){
        this.color = color;
        this.times = times;
    }
    blinkIt(opc){
        console.log("THIS COLOR", this.color)
        let isOn = 1;
        let howOften= 0;
        let interval = setInterval(x=>{
            if(isOn==1){
                isOn = 0;
            }else{
                isOn = 1;
            }
            opc.switchLight(isOn,this.color);
            howOften++;
            if(howOften==this.times){
                clearInterval(interval);
                opc.switchLight(0,this.color);
            }
        },1000);
    }
}

module.exports ={
    Blinker,OPC
}


/*
const opcx = new OPC();
opcx.main();
setTimeout(function(){
    //console.log(opcx)
    setTimeout(function(){
        let blueBlinker = new Blinker("Blue",20);
        blueBlinker.blinkIt(opcx);
        setTimeout(function(){
  
            let redBlinker = new Blinker("Red",20);
            redBlinker.blinkIt(opcx);        
            
            setTimeout(function(){
  
                let greenBlinker = new Blinker("Green",30);
                greenBlinker.blinkIt(opcx);

                setTimeout(function(){
                    let yellowBlinker = new Blinker("Yellow",10);
                    yellowBlinker.blinkIt(opcx);
                },200)

            },200)


        },200)

    },0)


},6000)
*/