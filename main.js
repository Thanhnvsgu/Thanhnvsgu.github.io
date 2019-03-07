const socket = io('https://streamchat6969.herokuapp.com/')

$("#video").hide();

socket.on('Danhsach',arUser => {
    // console.log(arUser);
    $("#video").show();
    $("#control").hide();
    arUser.forEach(element => {        
        const {username,userid} = element;
        $("#uluser").append(`<li id="${userid}"> ${username} </li>`);
    });
    
    // all client
    socket.on('NguoidungMoi',User =>{   
        $("#uluser").append(`<li id="${User.userid}"> ${User.username} </li>`);
    });

    socket.on('Ngatketnoi', e => {
        $(`#${e}`).remove();
    })
});

socket.on('Userdatontai', () => alert('User đã tồn tại'));

// Open Stream

function openStream(){
    const config = {
        "audio": true,
        "video": true
    };
    return navigator.mediaDevices.getUserMedia(config);
}
// Play Stream

function playStream(idVideoTag, stream){
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

// openStream().then(stream => playStream('localStream',stream));

var peer = new Peer({ key: 'peerjs', host:'streamchat6969.herokuapp.com/',secure:true, port: 443 });
peer.on('open', id => {
    $("#my-peer").append(id);
    $("#btnJoin").click(() => {
        const username = $("#userId").val();
        socket.emit('DangKy', {username: username, userid: id} );
    });
});

// Caller

$("#btnCall").click(() => {
    const id = $("#remoteId").val();
    openStream().then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream',remoteStream));       
    });
});

// Callee

peer.on('call', call => {
    openStream().then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream',remoteStream));
    })
});

$("#uluser").on('click','li',function(){
    // console.log($(this).attr('id'));
    const id = $(this).attr('id');
    openStream().then(stream => {
        playStream('localStream', stream); // local
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream',remoteStream)); // client
    });
});


