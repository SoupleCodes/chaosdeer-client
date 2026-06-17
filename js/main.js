// Setup vars
var inboxEl = document.getElementById("notifications")
var startMouseY = null
var drag = false
var orig = 0

window.l = []
window.replies = []
window.attachments = []
window.imageWhitelist = ["u.cubeupload.com", "files.catbox.moe",
    "litter.catbox.moe", "i.ibb.co", "cubeupload.com", "media.tenor.com",
    "tenor.com", "c.tenor.com", "meower.fraudulent.loan", "soktdeer.com",
    "boss.soktdeer.com", "static.darflen.com", "eris.pages.dev"
]

var cssStylesEl = document.getElementById("custom-styles")
cssStylesEl.disabled = !Boolean(settings_template.post_themes)


// Auth-related stuff
function openLoginPopup() {openPopup('<h1>login</h1><div><input id="form-usr" placeholder="Username..." type="text" maxlength="20"><br><input id="form-pswd" placeholder="Password..." type="password"><br><button onclick="login()">Log in</button></div></div><br><br><font id="form-err" color="red"></font>')}
function openJoinPopup() {openPopup('<h1>register</h1><div><input id="form-usr" placeholder="Username..." type="text" maxlength="20"><br><input id="form-pswd" placeholder="Password..." type="password"><br><button onclick="register()">Register</button></div></div><br><br><font id="form-err" color="red"></font>')}

function login() {
    var usr = document.getElementById('form-usr').value
    var pswd = document.getElementById('form-pswd').value

    ws.send({ 
        command: "login_pswd", 
        username: usr, 
        password: pswd, 
        client: "chaossoup 1.0", 
        listener: "RegisterLoginPswdListener"
    })
}
function register() {
    var usr = document.getElementById('form-usr').value
    var pswd = document.getElementById('form-pswd').value

    logOut(1)

    ws.send({ 
        command: "register", 
        username: usr, 
        password: pswd, 
        client: "chaossoup 1.0", 
        listener: "RegisterLoginPswdListener"
    })
}
function logOut(a) {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    !a && window.location.reload();
};


// Post-related functions
function sendPost(origin) {
    var txtarea = document.querySelector('#' + (origin ? origin + '-text-editor' : 'text-editor') + ' textarea')
    var json = {
        command: "post", 
        content: txtarea.value, 
        replies: replies, 
        attachments: attachments
    }
    if (origin === 'livechat') {
        json.chat = 'livechat'
    }
    ws.send(json)

    txtarea.value = ""
    replies = []
    attachments = []
    updateReplyDetails(origin)
    updateAttachmentDetails(origin)
}
function jumpToPost(id) {
    var targetPost = document.querySelector('.post[id="' + id + '"]')
    if (targetPost) {
        var postParent = targetPost.parentElement
        postParent.scrollBy({
            top: targetPost.offsetTop - (postParent.offsetHeight / 2),
            behavior: "smooth"
        })
        highlightPost(id)
    }
}
function highlightPost(id) {
    var targetPost = document.querySelector('.post[id="' + id + '"]')
    targetPost.classList.add('highlighted')
    setTimeout(function() {
        targetPost.classList.remove('highlighted')
    }, 500)
}
function edit(id) {
    var parent = document.querySelector('.post[id="' + id + '"] .post-content')
    var statsEl = parent.querySelector('.post-stats')
    if (!parent.querySelector('.edit-post')) {
        var editpost = document.createElement('div')
        editpost.classList.add('edit-post')

        var txtarea = document.createElement('textarea')
        txtarea.value = parent.querySelector('span').textContent
        editpost.appendChild(txtarea)

        var button = document.createElement('button')
        button.textContent = 'Update'
        button.addEventListener("click", function() {
            ws.send({ command: "edit_post", id: id, content: txtarea.value })
            editpost.remove()
        })
        editpost.appendChild(button)
        editpost.before(statsEl)
        parent.appendChild(editpost)
    }
}
function removePost(id) {
    var c = confirm("Are you sure you want to delete this post?")
    if (c) {
        ws.send({ command: "delete_post", id: id })
    }
}
function deletePost(id) {
    var el = document.querySelector('.post[id="' + id + '"]')
    if (el) {
        el.remove()
        var findReplies = document.querySelectorAll('.reply[reply-id="' + id + '"]')
        for (let i = 0; i < findReplies.length; i++) {
            findReplies[i].innerText = '→ post deleted'
        }
    }
}
function updatePost(id, content) {
    var el = document.querySelector('.post[id="' + id + '"] span.post-message')
    if (el) {
        el.innerHTML = deHTML(content)
    }
}
function scrollTopage(i,el) {
    var content = document.getElementById("content")
    var width = content.children[0].clientWidth + 10
    var inboxEl = document.getElementById("notifications")
    var inboxOpen = (inboxEl.style.left !== "-315px")

    document.querySelector('#bottombar .selected').classList.remove('selected')
    el.classList.add('selected')

    content.style.left = ((width * -i) + (inboxOpen * 315)) + "px"
}


// Add attachment logic
function addAttachment(origin) {
    var url = window.prompt("Add an attachment via whitelisted URL")
    try {
        var testUrl = new URL(url)
        if (!(imageWhitelist.includes(testUrl.hostname))) {
            alert('URL hostname is not part of whitelist')
            return null
        }
    } catch (__) {
        alert("Not a real url")
        return null
    }
    if (![null,""].includes(url)) {
        if (attachments.length != 5) {
            attachments.push(url);
        };
    }
    updateAttachmentDetails(origin)
}
function updateAttachmentDetails(origin) {
    var detailsEl = document.getElementById((origin || "home") + "-attachment-details")
    if (attachments.length==0) {
        detailsEl.innerHTML=""; 
        return null
    } else {
        if (attachments.length > 1) {
            detailsEl.innerHTML=attachments.length+" attachments - "
        } else {
            detailsEl.innerHTML="1 attachment - "
        }
        detailsEl.innerHTML+='<a href="#" onclick="removeAll()">Remove all</a>'
    }
}

// Replying
function reply(origin,id) {
    if (replies.includes(id) || replies.length>4) {
        return null
    }
    replies.push(id)
    highlightPost(id)
    updateReplyDetails(origin)
}
function removeAll(origin) {
    replies = []
    updateReplyDetails(origin)
}
function updateReplyDetails(origin) {
    var detailsEl = document.getElementById((origin || "home") + "-reply-details")
    if (replies.length==0) {
        detailsEl.innerHTML=""; 
        return null
    } else {
        if (replies.length > 1) {
            detailsEl.innerHTML=replies.length+" replies - "
        } else {
            detailsEl.innerHTML="1 reply - "
        }
        detailsEl.innerHTML+='<a href="#" onclick="removeAll()">Remove all</a>'
    }
}


// Inbox
function dealWithDrag(e) {
    let diff = e.clientY - startMouseY
    let val = diff
    if (orig + val > 0) {
        inboxEl.style.top = 0 + 'px'
    } else if (orig + val < -(inboxEl.clientHeight - (document.body.offsetHeight + 5))) {
        inboxEl.style.top = -(inboxEl.clientHeight - (document.body.offsetHeight + 5)) + 'px'
    } else {
        inboxEl.style.top = (orig + val) + 'px'
    }
}
inboxEl.addEventListener("mousedown", function(e) {
    if (!drag) {
        drag = true
        e = e || window.event
        e.preventDefault();
        e.stopPropagation();

        startMouseY = e.pageY
        orig = Number((inboxEl.style.top).split("px")[0])
        inboxEl.addEventListener("mousemove", dealWithDrag)
    }
}, true)
inboxEl.addEventListener("mouseup", function(){
    if (drag) {
        inboxEl.removeEventListener("mousemove", dealWithDrag)
        drag = false
    }
})
function toggleViewInbox() {
    var inboxEl = document.getElementById("notifications")
    var content = document.getElementById("content")
    var contentLeft = content.style.left.split("px")[0] * 1
    var hidden = (inboxEl.style.left === "-315px")

    if (hidden) {
        inboxEl.style.left = "0px"
        contentLeft = contentLeft + 315
    } else {
        inboxEl.style.left = "-315px"
        contentLeft = contentLeft - 315
    }
    content.style.left = contentLeft + "px"
}


// Config
function update(v) {
    if (l.includes(v)) {
        return null
    }
    l.push(v)
}
function pickColor(me) {
    var parent = me.parentNode
    var children = parent.children
    Array.from(children).map(c => {
        c.classList.remove('selected')
    })

    me.classList.add('selected')
    if (me.tagName === "INPUT") me.setAttribute("data-color", me.value)
    if (parent.id === "mc-display-color") {
        update("color")
    }
    if (parent.id === "mc-post-background") {
        update("background")
    }
}
function pickTheme(me) {
    document.querySelector('.theme.selected').classList.remove('selected')
    me.classList.add('selected')

    var myStyle = me.childNodes[0].getAttribute("data-style")
    document.getElementById("site-theme").href = "/themes/" + myStyle + ".css"
    changeSetting('theme', myStyle)
}
function saveCustom() {
    var el = document.getElementById("mc-custom-site-css")
    changeSetting("custom_css", el.value)

    document.getElementById("additional-styles").textContent = "\n@import url('https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap');\n\n" + el.value
}

function savePreferences() {
    var r = l.length
    for (let i = 0; i < r; i++) {
        setTimeout(function() {
            var property = l[i]
            l.slice(1)
            var val = ''
            console.log(property)
            switch (property) {
                case 'display_name':
                    val = document.getElementById("mc-display-name").value
                    break;
                case 'bio':
                    val = document.getElementById("mc-bio").value
                    break;
                case 'color':
                    val = document.querySelector('#mc-display-color .swatch.selected').getAttribute("data-color")
                    break;
                case 'font':
                    val = document.getElementById("mc-display-font").value
                    break;
                case 'weight':
                    val = document.getElementById("mc-display-weight").value
                    break;
                case 'avatar':
                    val = document.getElementById("mc-avatar-url").value
                    break;
                case 'banner':
                    val = document.getElementById("mc-banner-url").value
                    break;
                case 'background':
                    try {
                        var url = new URL((document.getElementById("mc-set-background").value).split("url(''")[0].split(")")[0]);
                        val = "url(" + url + ")"
                      } catch (_) {
                        val = document.querySelector('#mc-post-background .swatch.selected').getAttribute("data-color")
                    }
                    break;
                case 'css':
                    val = document.getElementById("mc-profile-custom").value
                    break;
                case 'lastfm':
                    val = document.getElementById("mc-lastfm").value
                    break;
                default:
                    break;
            }
            emitter.send({ command: "set_property", property: property, value: val })
        }, i * 500); // To prevent being ratelimited
    }
}
function changePswd() {
    var pswdEl = document.getElementById("mc-pw-password")
    var newpswdEl = document.getElementById("mc-pw-new-password")

    ws.send({
        command: "change_password", 
        password: pswdEl.value, 
        new_password: newpswdEl.value, 
        listener: "pwAccountBossDeer"
    })
    
    pswdEl.value = ""
    newpswdEl.value = ""
}
function deleteAcc() {
    var pswdEl = document.getElementById("mc-del-password")
    ws.send({
        command: "delete_account", 
        password: pswdEl.value, 
        listener: "daAccountBossDeer"
    })

    pswdEl.value = ""
    logOut()
}
function modAction(action) {
    switch (action) {
        case "ban":
            var timeEl = document.getElementById("mm-until-ban")
            var userEl = document.getElementById("mm-username-ban")
            var rsonEl = document.getElementById("mm-reason-ban")
            var bannedUntil
            if (timeEl != "") {
                bannedUntil = new Date(timeEl.value).getTime() / 1000
            } else {
                bannedUntil = 0
            }
            ws.send({ 
                command: "ban", 
                username: userEl.value, 
                banned_until: bannedUntil, 
                ban_reason: rsonEl.value 
            })
            clearValueOf(["mm-username-ban", "mm-until-ban", "mm-reason-ban"])
            break;
        case "forcekick":
            var userEl = document.getElementById("mm-username-forcekick")
            ws.send({ command: "force_kick", username: userEl.value })
            userEl.value=""
            break;
        case "send_inbox":
            var txtEl = document.getElementById("mm-content-inbox")
            ws.send({ 
                command: "post_inbox", 
                content: txtEl.value, 
                replies: [], 
                attachments: [] 
            })
            txtEl.value=""
            break;
        case "get_ips":
            ws.send({ command: "get_ips", username: document.getElementById("mm-username-ip").value })
            break;
        case "banish_to_the_SHADOW_REALM":
            ws.send({ command: "banish_to_the_SHADOW_REALM", ip: document.getElementById("mm-ip-block").value })
            clearValueOf(["mm-ip-block"])
            break;
        default:
            break;
    }
}


// Miscellaneous
function addCssString(rule, property, style) {
    if (!style) {
        return null
    }
    var cssEl = document.styleSheets[3]
    var isSameRule = [].slice.call(cssEl.rules).map(e => e.selectorText).find((t) => t == rule)
    var overridingProperty = Boolean([].slice.call(cssEl.rules).filter(e => e.selectorText == rule).filter(e => e.style.getPropertyValue(property)).length)
    if (!isSameRule || isSameRule && !overridingProperty) {
        cssEl.addRule(rule, property + ": " + style)
    }
}

function createPost(data, origin) {
    if (!data) {
        return '';
    }

    addCssString(('.post[author="' + data.author.username + '"] .post-author'), 'color', data.author.profile.color)
    addCssString(('.post[author="' + data.author.username + '"] .post-author'), 'font-weight', data.author.profile.weight)
    addCssString(('.post[author="' + data.author.username + '"] .post-author'), 'font-family', data.author.profile.font)
    addCssString(('.post[author="' + data.author.username + '"] .post-content'), 'background',  data.author.profile.background)

    let html = '<div author="' + data.author.username + '" id="' + data._id + '" class="post">'
    html += '<div class="profile-picture">'
    html += '<img src="'
    html += deHTML(data.author.avatar)
    html += '"/></div>'
    html += '<div class="post-content">'
    if (data.replies && data.replies.length > 0) {
        html += '<div class="replies">'
            for (let i = 0; i < data.replies.length; i++) {
                var reply = data.replies[i]
                html += '<div onclick="jumpToPost(\''
                html += reply._id
                html += '\')" reply-id="' + reply._id + '" class="reply">'
                html += '→ ' + (reply.author.display_name || "mystery user") + ': ' + reply.content
                html += '</div>'
            }
        html += '</div>'
    }
    html += '<p><a class="post-author" onclick="openProfile(\''
    html += deHTML(data.author.username)
    html += '\')" href="#">'
    html += deHTML(data.author.display_name)
    html += '</a>: <span class="post-message">'
    html += md.renderInline(deHTML(data.content))
    html += '</span></p>'
    if (data.attachments && data.attachments.length > 0) {
        html += '<div class="post-attachments">'
            for (let i = 0; i < data.attachments.length; i++) {
                var attachment = data.attachments[i]
                html += '<div onclick="openPopup(\'<img src=&quot;'
                html += attachment
                html += '&quot;>\')"' + '">'
                html += '<img class="attachment" src="'
                html += attachment
                html += '" />'
                html += '</div>'
            }
        html += '</div>'
    }
    html += '<small class="post-stats">' + new Date(data.created * 1000).toLocaleString()
    if (!(origin==="livechat")) {
        html +=' ∙ <a onclick="reply(\''
        html += (origin||"home") + '\', '
        html += '\'' + data._id + '\')" href="#">Reply</a>'
    }
    if (data.author.username === localStorage.getItem("username")) {
        html +=' ∙ <a onclick="edit(\''
        html += data._id
        html += '\')" href="#">Edit</a>'

        html +=' ∙ <a onclick="removePost(\''
        html += data._id
        html += '\')" href="#">Delete</a>'
    }
    html += '</small></div></div>'

    return html
}
function openProfile(u) {
    event && event.preventDefault()

    emitter.send({command: "get_user", username: u})
}
function openProfilePopup(u) {
    let html = '<div id="user-display">'
    
        html += '<div id="profile-container">'
            html += '<div id="profile-image-container">'
                html += '<img src="'
                html += u.avatar
                html += '"/>'
            html += '</div>'

            html += '<div id="profile-info">'
                html += '<div id="profile-display-name">'
                html += u.display_name
                html += '</div>'

                html += '<div id="profile-username">'
                html += u.username
                html += '</div>'

                html += '<div id="profile-more-info">'
                html += 'Joined at: ' + new Date(u.created * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                      timeZone: 'UTC'
                })
                html += '</div>'
            html += '</div>'
        html += '</div>'

        html += '<div id="profile-description">'
                html += '<p>'
                    html += deHTML(u.profile.bio)
                html += '</p>'
        html += '</div>'

    html += '</div>'
    openPopup(html, true, u)
}

function dealWithCommand(c, val) {
    var postsEl = document.getElementById("home-posts")
    var postsLivechatEl = document.getElementById("livechat-posts")
    
    switch (c) {
        case "ulist":
            var ulist = val.ulist
            var array = Object.keys(ulist)
            var len = array.length
            var ulistEl = document.getElementById("user-count")
            var ulistList = document.getElementById("ulist-list")
            var ulistLivechatEl = document.getElementById("livechat-user-count")
            var ulistListLivechat = document.getElementById("livechat-ulist-list")
            if (len > 0) {
                ulistEl.innerHTML = (len > 1 ? 'There are <b>' + len + '</b> online users' : 'You are the only user here!')
                ulistList.textContent = array.join(', ')
                ulistList.classList.remove('hidden')
            } else {
                ulistEl.innerHTML = 'There is no one <button onclick="document.title=\'okay lsoer\'">here</button> :('
                ulistList.classList.add('hidden')
            }

            ulistLivechatEl.innerHTML = ulistEl.innerHTML
            ulistListLivechat.innerHTML = ulistList.innerHTML
            break;
        case "messages":
            var posts = val.messages
            for (let i = 0; i < posts.length; i++) {
                postsEl.innerHTML += createPost(posts[i])
            }
            break;
        case "new_post":
            if (val.origin === "livechat") {
                postsLivechatEl.insertAdjacentHTML("afterbegin", createPost(val.data, "livechat"))
            } else {
                postsEl.insertAdjacentHTML("afterbegin", createPost(val.data))
            }
            break;
        case "edited_post":
            updatePost(val._id, val.content)
            break;
        case "deleted_post":
            deletePost(val._id)
            break;
        default:
            break;
    }
}