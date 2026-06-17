const audios = { 
    ping: document.createElement('audio'), 
    message: document.createElement('audio')
}
var pings = 0

audios.message.src = '/sounds/new.mp3';
audios.ping.src = '/sounds/ping.mp3';

if (Notification.permission !== "denied") {
    listenForPosts()
  } else {
    console.log('Notifications are disabled.')
}

document.addEventListener('focus', () => {
    if (pings==0) return null
    document.title = 'chaossoup'
    pings=0
})

function listenForPosts() {
    ws.on('incoming', (val) => {
        var c = val.command
        var data = val.data
        var user = localStorage.getItem("username")
        if (document.hasFocus()) {
            return null
        } else {
            switch (c) {
                case "new_post":
                    if (!(data.author.username === user)) {
                        pings++
                        if (data.content.includes("@" + user)) {
                            audios.ping.play()
                        } else {
                            audios.message.play()
                        }
                        new Notification(data.author.display_name ?? data.author.username, { 
                            body: data.content, 
                            icon: data.author.avatar || "", 
                            silent: true 
                        });
                    }
                    break;
                default:
                    break;
            }
            if (pings > 0) document.title="chaossoup ("+pings+")"
        }
    })
}