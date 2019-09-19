import { createServer } from 'net';

import FIXParserServerBase from './FIXParserServerBase';
import FrameDecoder from '../util/FrameDecoder';
import Message from '../message/Message';
import Header from '../Header';

export default class FIXParserServerSocketWithHeader extends FIXParserServerBase {

    constructor(eventEmitter, parser, host, port, headerRule){
        super(eventEmitter, parser, host, port, headerRule);
        this.headerOffset = 0;
        this.bodyOffset = Header.length;
    }

    createServer(headerRule) {
        this.server = createServer((socket) => {
            this.socket = socket;
            this.socket.pipe(new FrameDecoder({},headerRule)).on('data', (data) => {
                const header = data.slice(0, Header.length);
                const body = data.slice(Header.length);
                const message = this.fixParser.parse(body.toString())[0];

                this.processMessage(header, message);
                this.eventEmitter.emit('message', message);
            });

            this.socket.on('open', () => {
                this.eventEmitter.emit('open');
            });

            this.socket.on('close', () => {
                this.eventEmitter.emit('close');
            });
        });
        this.headerRule = headerRule;

        this.server.listen(this.port, this.host);
    }

    send(message) {
        if (this.socket.readyState === 'open') {
            if (message instanceof Message) {
                this.fixParser.setNextTargetMsgSeqNum(
                    this.fixParser.getNextTargetMsgSeqNum() + 1
                );
                const rawMessage = message.encode();



                let packet = Buffer.allocUnsafe(this.headerRule.totalLength + rawMessage.length);

                // console.log(`first stx-> [${this.headerRule.Fields[0].get().charCodeAt(0)}]`);

                this.headerRule.Fields.forEach(field=>{
                    // console.log(`packet.write('${field.get.bind(this.headerRule)({body: rawMessage})}', ${field.offset})`)
                    packet.write(field.get.bind(this.headerRule)({body: rawMessage}).toString(), field.offset);

                })


                packet.write(rawMessage, this.bodyOffset);
                console.log(packet.toString())

                this.socket.write(packet);
            } else {
                console.error(
                    `[${Date.now()}] FIXParserServerSocketWithHeader: could not send message: message of wrong type`
                );
            }
        } else {
            console.error(
                `[${Date.now()}] FIXParserServerSocketWithHeader: could not send message, socket not open`
            );
        }
    }

    processMessage(header, message){
        super.processMessage(message);
        console.log(`[${new Date().format("yyyyMMdd-hh:mm:ss.ff")}] handle header here ::  ${header}`);


    }
}
