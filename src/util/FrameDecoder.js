import { Transform } from 'stream';

import Header from '../Header';

export default class FrameDecoder extends Transform {
    constructor(opts, headerRule=null) {
        super(opts);
        this.data = '';

        // TODO Delete this when client is implemented too.
        this.totalHeaderLength = 40;
        if(!!headerRule){
            this.headerRule = headerRule;
            this.totalHeaderLength = this.headerRule.totalLength;
        }
    }

    _transform(chunk, encoding, callback) {
        const chunks = (this.data + chunk).split( new RegExp(`(.{0,${this.totalHeaderLength}}8=.+?\\x0110=\\d\\d\\d\\x01)`,"g") );
        for (let i = 0; i < chunks.length - 1; i++) {
            this.push(chunks[i]);
        }
        this.data = chunks[chunks.length - 1];
        callback();
    }

    destroy() {
        this.data = null;
    }
}
