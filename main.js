// import { connect } from "net";

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
    socket.on('nguoidung',e =>{
        $(`#${e.userid}`).attr('style', 'color:blue');
        $("#videoclient").append(`<video id="remote${e.userid}" width="300" controls></video>`)
    })
    // all client
    socket.on('NguoidungMoi',User =>{   
        $("#uluser").append(`<li id="${User.userid}"> ${User.username} </li>`);       
    });

    socket.on('Ngatketnoi', e => {
        $(`#${e}`).remove();
        // $(`#remote${e}`).remove();      
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

var peer = new Peer({ key: 'lwjd5qra8257b9' });


socket.on('truyenlai', e =>{
    // alert(e);
    peer.id = e;
});
socket.on('ketthuc2',e =>{
    $(`#${e}`).remove();
    $(`#remote${e}`).remove();
});

peer.on('disconnected', function() {
    alert("ngắt kết nối!");
});

peer.on('open', id => {
    // alert(id);
    $(`remote${id}`).remove();
    $("#my-peer").append(id);
    $("#btnJoin").click(() => {
        const username = $("#userId").val();
        socket.emit('DangKy', {username: username, userid: id} );
    });

    $("#uluser").on('click','li',function(){
        // alert(id);
        // console.log($(this).attr('id'));
        const contactid = $(this).attr('id');
        if(contactid != id){
            $(`#remote${contactid}`).remove();
            $("#videoclient").append(`<video id="remote${contactid}" width="300" controls></video>`);
            
            var res = openStream().then(stream => {
                playStream(`remote${id}`, stream); // Máy gọi          
                const call = peer.call(contactid, stream);
                call.on('stream', remoteStream => {               
                    playStream(`remote${contactid}`,remoteStream);
                }); // Máy nhận

            });   

            socket.emit('truyen', id);
        }else{
            alert("Bạn không chat với chính mình như vậy sẽ rất kì cục!!!");
        };
       
    });
    
    $("#btnout").on('click',()=>{
        // socket.disconnect();
        socket.emit('ketthuc',id);
        peer.destroy();
        $("#my-peer").value = "";
        $("#uluser > li").each(function(){
            $(this).remove();
        });
         $(`#remote${id}`).remove();
        $("#videoclient > video").each(function(){
            alert($(this).attr('id'));
            if($(this).attr('id') != `remote${id}`){
                $(`#${$(this).attr('id')}`).remove();
            }
        });
        $("#video").hide();
        $("#control").show();
        // $("#videoclient").append(`<video id="remote${id}"></video>`);
    });

    peer.on('call', call => {
   
        // alert(peer.id);
        
        $(`#remote${peer.id}`).remove();
        
        $("#videoclient").append(`<video id="remote${peer.id}" width="300" controls></video>`);

        openStream().then(stream => {

            call.answer(stream);     
        
             playStream(`remote${id}`, stream);
            call.on('stream', remoteStream => {                
                playStream(`remote${peer.id}`,remoteStream);        
            });
        });
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



