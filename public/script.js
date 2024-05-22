const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001',
  path: '/peer',
  proxied: true
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  console.log('script/stream');
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    console.log('script/myPeer/call');
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      console.log('script/myPeer/stream');
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    console.log('script/myPeer/user-connected ', userId);
    connectToNewUser(userId, stream)
  })
}).catch((reason) => console.log({ reason }));

socket.on('user-disconnected', userId => {
  console.log('script/myPeer/user-disconnected ', userId);
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  console.log('script/myPeer/open ', ROOM_ID, id);
  try {
    socket.emit('join-room', ROOM_ID, id)
  } catch(err) {
    console.error({ err });
  }
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  console.log('script/connectToNewUser/initial ', userId);
  call.on('stream', userVideoStream => {
    console.log('script/connectToNewUser/stream');
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    console.log('script/connectToNewUser/close');
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  console.log('script/addVideoStream/initial');
  video.addEventListener('loadedmetadata', () => {
    console.log('script/addVideoStream/loadedmetadata');
    video.play()
  })
  console.log('script/addVideoStream/append');
  videoGrid.append(video)
}