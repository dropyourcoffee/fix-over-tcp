import { Socket } from 'net';

import FIXParserClientBase from './FIXParserClientBase';
import FrameDecoder from '../util/FrameDecoder';
import Header from "../Header";

export default class FIXParserClientSocketWithHeader extends FIXParserClientBase {

    constructor(eventEmitter, parser) {
        super(eventEmitter, parser);
        this.headerOffset = 0;
        this.bodyOffset = Header.length;
    }

    connect() {
        this.socket = new Socket();
        this.socket.setEncoding('ascii');
        this.socket.pipe(new FrameDecoder()).on('data', (data) => {
            const header = data.slice(0, Header.length);
            const body = data.slice(Header.length);
            const message = this.fixParser.parse(data.toString())[0];

            this.processMessage(header, message);
            this.eventEmitter.emit("message", message);

        });

        this.socket.on('close', () => {
            this.eventEmitter.emit('close');
            this.stopHeartbeat();
        });

        this.socket.on('error', (error) => {
            this.eventEmitter.emit('error', error);
            this.stopHeartbeat();
        });

        this.socket.on('timeout', () => {
            this.eventEmitter.emit('timeout');
            this.socket.end();
            this.stopHeartbeat();
        });

        this.socket.connect(this.port, this.host, () => {
            console.log('Connected', this.socket.readyState);
            if (this.socket.readyState === 'open') {
                this.eventEmitter.emit('open');
                this.startHeartbeat();
            }
        });
    }

    close() {
        if (this.socket && this.socket.readyState === 'open') {
            this.socket.close();
        } else {
            console.error(
                'FIXParserClientSocketWithHeader: could not close socket, connection not open'
            );
        }
    }

    send(message) {
        if (this.socket.readyState === 'open') {
            this.fixParser.setNextTargetMsgSeqNum(
                this.fixParser.getNextTargetMsgSeqNum() + 1
            );

            // prepend header
            const rawMessage=message.encode();
            const packet = Buffer.allocUnsafe(Header.length + rawMessage.length);
            packet.write(Header.ctx.toString(),this.headerOffset);
            packet.write(rawMessage, this.bodyOffset);

            this.socket.write(packet);
        } else {
            console.error(
                'FIXParserClientSocketWithHeader: could not send message, socket not open',
                message
            );
        }
    }
    processMessage(header, message){
        super.processMessage(message);
        console.log(`[${new Date().format("yyyyMMdd-hh:mm:ss.ff")}] handle header here ::  ${header}`);


    }
}
