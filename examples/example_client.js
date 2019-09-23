import FIXParser, {
    Field,
    Fields,
    Messages,
    Side,
    OrderTypes,
    HandlInst,
    TimeInForce,
    EncryptMethod
} from './../src/FIXParser'; // from 'fixparser';

const fixParser = new FIXParser();
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
                return "------"; // 6 spaces
            }
        },
        {
            name: "filler",
            offset:11,
            length:29,
            get: (msg)=> {
                return "                EOHeadercli ]"; // 6 spaces
            }

        },
    ],

};

const SENDER = "CLIENT";
const TARGET = "SERVER";

const FixMsgSingleOrder = fixParser.createMessage(
    new Field(Fields.MsgType, Messages.NewOrderSingle),
    new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
    new Field(Fields.SenderCompID, SENDER),
    new Field(Fields.SendingTime, fixParser.getTimestamp()),
    new Field(Fields.TargetCompID, TARGET),
    new Field(Fields.ClOrdID, '11223344'),
    new Field(
        Fields.HandlInst,
        HandlInst.AutomatedExecutionNoIntervention
    ),
    new Field(Fields.OrderQty, '123'),
    new Field(Fields.TransactTime, fixParser.getTimestamp()),
    new Field(Fields.OrdType, OrderTypes.Market),
    new Field(Fields.Side, Side.Buy),
    new Field(Fields.Symbol, '700.HK'),
    new Field(Fields.TimeInForce, TimeInForce.Day)
);

fixParser.connect({
    host: 'localhost',
    port: 9878,
    protocol: 'tcp-header',
    headerRule: headerRule,
    sender: SENDER,
    target: TARGET,
    fixVersion: 'FIX.4.4',
    heartbeatIntervalMs: 3000,

});

fixParser.on('open', () => {
    console.log('Open');
    fixParser.send(FixMsgSingleOrder)
    console.log("sent Packet.. ", FixMsgSingleOrder.encode().toString())
});
fixParser.on('message', (message) => {
    console.log('received message', message.description, message.string);
    console.log("")
});
fixParser.on('close', () => {
    console.log('Disconnected');
});
