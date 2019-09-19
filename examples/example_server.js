import FIXServer from './../src/FIXServer'; // from 'fixparser/server';
import FixParser from "./../src/FIXParser";

const fixServer = new FIXServer();
fixServer.createServer('localhost', 9878, 'tcp-header');

fixServer.on('open', () => {
    console.log('Open');
});
fixServer.on('message', (message) => {
    console.log(message.data.map(md=>({tag:md.tag, name:md.name, value: md.value})));
    console.log('server received message', message.description, message.string);
});

fixServer.on('close', () => {
    console.log('Disconnected');
});
