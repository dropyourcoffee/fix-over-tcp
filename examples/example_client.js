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
import Header from "../src/Header";

const fixParser = new FIXParser();
const SENDER = 'BANZAI';
const TARGET = 'EXEC';

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
});
fixParser.on('close', () => {
    console.log('Disconnected');
});
