const prodUrl = "wss://chaos.goog-search.eu.org/";
const loclUrl = "ws://10.88.0.3:3000";

//
//   DO NOT FORGET TO CHANGE THE URL
//

let wsurl = prodUrl;
if (localStorage.getItem("serverurl")) {
    wsurl = localStorage.getItem("serverurl");
}

// Thanks to @highonranking on Medium for this code!
// https://medium.com/@highonranking/building-an-event-emitter-in-javascript-like-node-js-a897f9c51f02
class EventEmitter {
  constructor() {
    this.events = {}
    this.last_command = ""
  }
  
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }

  send(val) {
    this.last_command = val.command
    x.send(JSON.stringify(val))
  }
}

let x = new WebSocket(wsurl)
var emitter = new EventEmitter()
window.ws = emitter

x.onmessage = function(e) {
    let incoming_data = JSON.parse(e.data)
    emitter.emit('incoming', incoming_data)
}

emitter.on('incoming', (val) => {
  console.log(val)
  if (val.error && !val.error) return null
    
  if (val.inbox) {
    fillInbox(val.inbox)
  }
  if (val.ips) {
    document.getElementById("mm-ips").innerHTML = val.ips.toString().replaceAll(",", "\n")
  }
  if (val.user) {
    if (ws.last_command === 'get_user') {
      openProfilePopup(val.user)
    } else {
      if (val.user.permissions.includes("PROTECTED")) {
        document.getElementById("btn-moderation").classList.toggle("hidden")
        document.getElementById("moderation").classList.toggle("invisible")
      }
      fillFormData(val.user)
      emitter.send({ command: "get_inbox" })
    }
  }

  var command = val.command
  switch (command) {
      case "greet":
          dealWithCommand("ulist", val)
          dealWithCommand("messages", val)

          emitter.send({command: "login_token", token: localStorage.getItem("token"), client: "chaossoup 1.0"})
          if (localStorage.getItem("token")) {
            document.getElementById("text-editor").classList.toggle("hidden")
            document.getElementById("livechat-text-editor").classList.toggle("hidden")
            document.getElementById("nav-login").outerHTML = '<a id="nav-logout" href="#" onclick="logOut()">Logout</a>'
          }
          break;
      default:
          dealWithCommand(command, val)
          break;
  }

  var listener = val.listener
  switch (listener) {
      case "RegisterLoginPswdListener":
          if (val.error) {
            document.getElementById("form-err").innerHTML = val.code + ": " + val.context
            return null
          }
          document.getElementById('popup-window').remove()
          localStorage.setItem("username", val.user.username)
          localStorage.setItem("token", val.token)

          document.getElementById("text-editor").classList.toggle("hidden")
          document.getElementById("livechat-text-editor").classList.toggle("hidden")
          document.getElementById("nav-login").outerHTML = '<a id="nav-logout" href="#" onclick="logOut()">Logout</a>'

          emitter.send({ command: "login_token", token: val.token, client: "chaossoup 1.0" })
          emitter.send({ command: "get_inbox" })
      default:
          break;
  }
})

function setInnContentOfEl(id, val) {
  document.getElementById(id).value = val
}
function check(id, val) {
  document.getElementById(id).checked = val
}
function fillFormData(u) {
  setInnContentOfEl("mc-display-name", u.display_name)
  setInnContentOfEl("mc-bio", u.profile.bio)
  setInnContentOfEl("mc-display-font", u.profile.font || "Verdana")
  setInnContentOfEl("mc-display-weight", u.profile.weight || "Normal")
  setInnContentOfEl("mc-avatar-url", u.avatar)
  setInnContentOfEl("mc-banner-url", u.banner)
  
  var targetSwatch = document.querySelector('.swatch[data-color="' + u.profile.color + '"]')
  if (targetSwatch) {
    targetSwatch.classList.add("selected")
  } else {
    document.querySelector('input.swatch').classList.add("selected")
  }
  document.querySelector('input.swatch').value = u.profile.color

  if (u.avatar) document.querySelectorAll('#settings-profile img')[0].src = u.avatar
  if (u.banner) document.querySelectorAll('#settings-profile img')[1].src = u.banner

  setInnContentOfEl("mc-profile-custom", u.profile.css)
  setInnContentOfEl("mc-lastfm", u.profile.lastfm)

  check("check-post-themes", settings_template.post_themes)
  check("check-replace-text", settings_template.replace_text)
}
function fillInbox(data) {
  if (data.length < 1) return;
  var timeGroups = Object.entries(Object.groupBy(data, ({ created }) => new Date(created * 1000).toLocaleString().split(",")[0]))
  var html = ''
  var o = Object.entries(data) 
  localStorage.setItem("last_inbox_id", o[o.length - 1][1]._id)
  for (let i = 0; i < timeGroups.length; i++) {
      var date = timeGroups[i][0]
      var g = timeGroups[i][1]

      html += '<div class="timeline">'
      html += '<h4>' + date + '</h4>'

      html += '<div class="list">'

      for (let j = 0; j < g.length; j++) {
          var c = g[j]
  
          html += '<div class="list-item">'

          html += '<div class="inbox-msg"><p>' + md.renderInline(deHTML(c.content)) + '</p></div>'
          html += '<small>' + new Date(c.created * 1000).toLocaleString(undefined, {timeStyle:'short'}) + ' ∙ <b>posted by ' + c.author + '</b></small>'
  
          html += '</div>'
      }

      html += '</div>'
      html += '</div>'
  }
  document.getElementById("notifications").innerHTML = html
}