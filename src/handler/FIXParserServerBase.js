/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright 2019 Victor Norgren
 * Released under the MIT license
 */
import { EventEmitter } from 'events';

import * as Messages from './../constants/ConstantsMessage';
import * as Fields from './../constants/ConstantsField';
import util from "../util/util"

export default class FIXParserServerBase extends EventEmitter {
    constructor(eventEmitter, parser, host, port) {
        super();
        this.eventEmitter = eventEmitter;
        this.fixParser = parser;
        this.host = host;
        this.port = port;
        this.server = null;
        this.socket = null;
        this.sender = null;
        this.target = null;
        this.heartBeatInterval = null;
        this.heartBeatIntervalId = null;
        this.createServer();
    }

    processMessage(message) {
        if (message.messageType === Messages.SequenceReset) {
            const newSeqNo = (this.fixParser.getField(Fields.NewSeqNo) || {})
                .value;
            if (newSeqNo) {
                console.log(
                    `[${new Date().format("yyyyMMdd-HH:mm:ss.ff")}]] FIXServer new sequence number ${newSeqNo}`
                );
                this.fixParser.setNextTargetMsgSeqNum(newSeqNo);
            }
        }
        console.log(
            `[${new Date().format("yyyyMMdd-HH:mm:ss.ff")}] FIXServer received message ${message.description}`
        );
    }
}
