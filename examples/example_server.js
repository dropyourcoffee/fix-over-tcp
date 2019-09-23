import FIXServer from './../src/FIXServer'; // from 'fixparser/server';
import {
    Field,
    Fields,
    Messages,
    Side,
    OrderTypes,
    HandlInst,
    TimeInForce,
} from './../src/FIXParser';

const fixServer = new FIXServer();
const headerRule = {
    totalLength: 40,
    Fields:[
        {
            name: "stx",
            offset:0,
            length:1,
            get: function(msg){
                return String.fromCharCode(Buffer.alloc(1, 0x02, 'base64')[0]); // STX
            }

        },
        {
            name: "len",
            offset:1,
            length:4,
            get: function(msg){
                return ("000"+ (this.totalLength + msg.body.length) ).slice(-4);
            }

        },
        {
            name: "connID",
            offset:5,
            length:6,
            get: function(msg){
                return "______"; // 6 spaces
            }
        },
        {
            name: "filler",
            offset:11,
            length:29,
            get: (msg)=> {
                return "                   EOHeader ]"; // 6 spaces
            }

        },
    ],

};

const protocol =  (process.argv.length>2)? "tcp":"tcp-header";


fixServer.createServer('localhost', 9878, protocol, headerRule);
const SENDER = "SERVER";
const TARGET = "CLIENT";

const FixMsgSingleOrder = fixServer.createMessage(
    new Field(Fields.MsgType, Messages.NewOrderSingle),
    new Field(Fields.SenderCompID, SENDER),
    new Field(Fields.TargetCompID, TARGET),
    new Field(Fields.ClOrdID, '11223344'),
    new Field(
        Fields.HandlInst,
        HandlInst.AutomatedExecutionNoIntervention
    ),
    new Field(Fields.OrderQty, '123'),
    new Field(Fields.OrdType, OrderTypes.Market),
    new Field(Fields.Side, Side.Buy),
    new Field(Fields.Symbol, '700.HK'),
    new Field(Fields.TimeInForce, TimeInForce.Day)
);

fixServer.on('open', () => {
    console.log('Open');
});
fixServer.on('message', (message) => {
    // console.log(message.data.map(md=>({tag:md.tag, name:md.name, value: md.value})));
    console.log('server received message', message.description, message.string);
    fixServer.send(FixMsgSingleOrder);
    console.log("");
});

fixServer.on('close', () => {
    console.log('Disconnected');
});
