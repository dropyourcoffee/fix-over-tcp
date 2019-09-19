import { createServer } from 'net';

import FIXParserServerBase from './FIXParserServerBase';
import FrameDecoder from '../util/FrameDecoder';
import Message from '../message/Message';
import Header from "../Header"
// import util from "../util/util"

export default class FIXParserServerSocketWithHeader extends FIXParserServerBase {
    createServer() {
        this.server = createServer((socket) => {
            this.socket = socket;
            this.socket.pipe(new FrameDecoder()).on('data', (data) => {
                let header = data.slice(0, Header.length);
                let body = data.slice(Header.length)
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

        this.server.listen(this.port, this.host);
    }

    send(message) {
        if (this.socket.readyState === 'open') {
            if (message instanceof Message) {
                this.fixParser.setNextTargetMsgSeqNum(
                    this.fixParser.getNextTargetMsgSeqNum() + 1
                );
                this.socket.write(message.encode());
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
        super.processMessage(message)
        console.log(`[${new Date().format("yyyyMMdd-hh:mm:ss.ff")}] handle header here ::  ${header}`);


    }
}
