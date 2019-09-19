import { Socket } from 'net';

import FIXParserClientBase from './FIXParserClientBase';
import FrameDecoder from '../util/FrameDecoder';
import Header from "../Header";

export default class FIXParserClientSocketWithHeader extends FIXParserClientBase {
    connect() {
        this.socket = new Socket();
        this.socket.setEncoding('ascii');
        this.socket.pipe(new FrameDecoder()).on('data', (data) => {
            const messages = this.fixParser.parse(data.toString());
            let i = 0;
            for (i; i < messages.length; i++) {
                this.processMessage(messages[i]);
                this.eventEmitter.emit('message', messages[i]);
            }
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
            let rawMessage=message.encode()
            let packet = Buffer.allocUnsafe(Header.length + rawMessage.length);
            packet.write(Header.ctx.toString(),0);
            packet.write(rawMessage, Header.length)

            this.socket.write(packet);
        } else {
            console.error(
                'FIXParserClientSocketWithHeader: could not send message, socket not open',
                message
            );
        }
    }
}
