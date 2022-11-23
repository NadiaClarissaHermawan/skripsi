//html elements
const btnCreate = document.getElementById('btnCreate');
const btnJoin = document.getElementById('btnJoin');
const inputGameId = document.getElementById('roomId');
const roomCode = document.getElementById('roomCode');
const clientCounter = document.getElementById('clientCounter');

//connect to server
let ws = new WebSocket('ws://localhost:88');

//declare attr
let clientId = null;
let roomId = {
    'id' : null,
    'creator' : -1 //-1 blm join & bukan creator, 0 join tp bukan creator, 1 creator room
};

//client ws message listener
ws.onmessage = message => {
    const resp = JSON.parse(message.data);

    //connect
    if (resp.method === 'connect') {
        clientId = resp.clientId;
        console.log('client id set successfully ' + clientId);
    //create
    } else if (resp.method === 'create') {
        roomId = {
            'id' : resp.room.roomId,
            'creator' : 1
        };
        console.log('room successfully created with id ' + resp.room.roomId);
        btnJoin.click();
    //join
    } else if (resp.method === 'join') {
        console.log('client joined successfully');
        roomCode.textContent = 'Room id : ' + roomId.id;
        clientCounter.textContent = 'clients connected : ' + resp.room.clients.length + '';
        roomCode.classList.remove('none');
        clientCounter.classList.remove('none');
    //someone disconnected
    } else if (resp.method === 'disconnect') {
        clientCounter.textContent = 'clients connected : ' + resp.room.clients.length + '';
        console.log('client id ' + resp.clientId + ' has disconnected.');
    }
};

//create room button listeners
btnCreate.addEventListener('click', e => {
    if (roomId.creator !== -1) {
        const payLoad = {
            'method': 'move',
            'clientId': clientId,
            'roomId': roomId.id
        };
        ws.send(JSON.stringify(payLoad));
    }
    
    const payLoad = {
        'method': 'create',
        'clientId': clientId
    };
    ws.send(JSON.stringify(payLoad));
});

//join room button listeners
btnJoin.addEventListener('click', e => {
    if (inputGameId.value !== '') {
        if (roomId.creator !== -1) {
            const payLoad = {
                'method': 'move',
                'clientId': clientId,
                'roomId': roomId.id
            };
            ws.send(JSON.stringify(payLoad));
        }
        roomId = {
            'id' : inputGameId.value.trim(),
            'creator' : 0
        };
    } 
    inputGameId.value = "";
    const payLoad = {
        'method': 'join',
        'clientId': clientId,
        'roomId' : roomId.id
    };
    ws.send(JSON.stringify(payLoad));
});