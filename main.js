const md = markdownit({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) {}
      }
  
      return ''; // use external default escaping
    },
    html: false,
    linkify: true,
    typographer: false,
    breaks: true,
  })
  .disable('image');
  
const version = "1.7.6b";
const serverVersion = "Helium-1.0.1a";

let shift = false;
let detect_file_type = false;

let themes = {
    "deer": "Deer",
    "helium": "Helium",
    "midnight": "Midnight",
    "bright": "Bright",
    "cosmic-latte": "Cosmic Latte"
}

const settings_template = {
    replace_text: true,
    detect_file_type: false,
    debug: true,
    upload_key: "",
    upload_service: "",
    enter_to_send: false, //TODO: implement this
}

let settings = JSON.parse(localStorage.getItem("settings"));
for (const i in settings_template) {
    if (!i in settings) {
        settings[i] = settings_template[i]
        localStorage.setItem("settings", JSON.stringify(settings))
    }
}

//TODO: more to the bottom bc this happens after all the functions are initialised n stuff
chaosEvents.addEventListener('ready', () => {
    document.addEventListener('keydown', (e) => {
        if (e.key == 'Shift') shift = true;
    })
    document.addEventListener('keyup', (e) => {
        if (e.key == 'Shift') shift = false;
    })

    if (localStorage.getItem("theme") == null) {
        localStorage.setItem("theme", "helium")
    } else if (!localStorage.getItem("theme") in themes) {
        localStorage.setItem("theme", "helium")
    }
    document.getElementById("top-style").href = `/themes/${localStorage.getItem("theme")}.css`;

    if (localStorage.getItem("customCSS")) {
        document.getElementById("custom-style").innerText = localStorage.getItem("customCSS");
        document.getElementById("mc-theme-custom").value = localStorage.getItem("customCSS");
    }

    if (localStorage.getItem("settings") == null) {
        localStorage.setItem("settings", JSON.stringify(settings_template))
    };

    if (localStorage.getItem("last_inbox_id") == null) {
        localStorage.setItem("last_inbox_id", "")
    };

    for (const i in themes) {
        document.getElementById("mc-theme-buttons").innerHTML += `<button onclick="setTheme('${i}');">${themes[i]}</button> `
    }

    document.getElementById("mc-theme-name").innerText = themes[localStorage.getItem("theme")];
    document.getElementById("mc-upload-service").value = settings.upload_service;
    fetch('changelog.md')
        .then(response => response.text())
        .then(markdownContent => {
            document.getElementById("mw-new").innerHTML = md.render(markdownContent);
        })
        .catch(error => {
            console.error('Error fetching changelog:', error);
        });
    
    clearValueOf(["rl-username", "rl-password", "rl-invitecode"]);
    stgsTriggers();
    rltab('login');
})

// @berry told me not eat commented out code so....
function stgsTriggers() {
    if (settings.replace_text) {
        replace_text = true;
        document.getElementById("mc-button-replace").innerText = "(enabled) Replace text";
    } else {
        replace_text = false;
        document.getElementById("mc-button-replace").innerText = "(disabled) Replace text";
    };
    //if (settings.detect_file_type) {
        //detect_file_type = true;
        //document.getElementById("mc-button-detectft").innerText = "(enabled) Detect file types";
    //} else {
    detect_file_type = false;
        //document.getElementById("mc-button-detectft").innerText = "(disabled) Detect file types";
    //};
};
function updateStg(setting) {
    switch(setting) {
        case "replace_text":
            settings.replace_text = !settings.replace_text;
            break
        case "upload_key":
            settings.upload_key = document.getElementById("mc-upload-key").value;
            clearValueOf(["mc-upload-key"])
            break
        case "upload_service":
            console.log(document.getElementById("mc-upload-service").value);
            settings.upload_service = document.getElementById("mc-upload-service").value;
            document.getElementById("mc-upload-service").value = settings.upload_service;
            break
        case "detect_file_type":
            settings.detect_file_type = !settings.detect_file_type;
            break
    }
    localStorage.setItem("settings", JSON.stringify(settings));
    stgsTriggers();
};

async function uploadFile(file) {
    // ORIGINAL CREDIT TO:
    // @stripes on SoktDeer
    // @sandstripes on GitHub
    // https://gist.github.com/sandstripes/7d342a06cc8325f272cd42d6442f6466
    // note: very much so modified since then, mainly because i need to use imgbb because cors sucks
    const data = new FormData();
    data.set('key', settings.upload_key);
    data.set('image', file);

    const init = {
        method: 'POST',
        body: data
    };
    const res = await fetch("https://api.imgbb.com/1/upload", init);
    const rsp = await res.json()
    if ("data" in rsp && "image" in rsp.data && "url" in rsp.data.image) {
        if (rsp.data.image.url.startsWith('https://i.ibb.co/')) {
            return rsp.data.image.url;
        } else {
            throw new Error(rsp);
        };
    } else {
            throw new Error(rsp);
    }
};

async function uploadFileFraud(file) { // Edited version of above
    const data = new FormData();
    data.set('file', file);

    const init = {
        method: 'POST',
        headers: {'Key': settings.upload_key},
        body: data
    };

    const res = await fetch("https://u.fraudulent.loan/upload", init);
    const rsp = await res.json()
    if ("urls" in rsp && rsp.urls.length != 0) {
        return "https://u.fraudulent.loan/" + rsp.urls[0];
    } else {
        throw new Error(rsp);
    };
};

function deHTML(t) {
    t = t.replaceAll("&", "&gt;")
    t = t.replaceAll("<", "&lt;")
    return t
}

function updateUlist() {
    var ulstring = "";
    for (const i in ulist) {
        var ba = ""
        if (raw_ulist[ulist[i]]['bot']) {
            ba += ` <span title="This user is a robot." class="inline-icon-u material-symbols-outlined">smart_toy</span>`
        }
        ulstring += `<span class="clickable" title="${raw_ulist[ulist[i]]['client'].replaceAll("'", "\\'")}" onclick="showUser('${ulist[i].replaceAll("'", "\\'")}');">${deHTML(ulist[i])}${ba}</span>` //vulnerable!
        if (i != ulist.length - 1) {
            ulstring += ", "
        };
    };
    if (!(ulist.includes(username)) && ulist.length != 0 && guest == false) {
        document.getElementById("ms-ulist").innerHTML = `${ulist.length} user online (${ulstring})❓ (Try <a href='javascript:window.location.reload();'>refreshing the page</a>?)`;
        document.getElementById("ml-ulist").innerHTML = `${ulist.length} user online (${ulstring})❓ (Try <a href='javascript:window.location.reload();'>refreshing the page</a>?)`;
    } else if (ulist.length == 1 && guest == false) {
        document.getElementById("ms-ulist").innerHTML = "You are the only user online. 😥🦌";
        document.getElementById("ml-ulist").innerHTML = "You are the only user online. 😥🦌";
    } else if (ulist.length == 1) {
        document.getElementById("ms-ulist").innerHTML = `${ulist.length} user online (${ulstring})`;
        document.getElementById("ml-ulist").innerHTML = `${ulist.length} user online (${ulstring})`;
    } else if (ulist.length == 0) {
        if (guest) {
            document.getElementById("ms-ulist").innerHTML = "Nobody is online. 😥🦌";
            document.getElementById("ml-ulist").innerHTML = "Nobody is online. 😥🦌";
        } else {
            document.getElementById("ms-ulist").innerHTML = "Nobody is online. 😥❓ (Try <a href='javascript:window.location.reload();'>refreshing the page</a>?)";
            document.getElementById("ml-ulist").innerHTML = "Nobody is online. 😥❓ (Try <a href='javascript:window.location.reload();'>refreshing the page</a>?)";
        };
    } else {
        document.getElementById("ms-ulist").innerHTML = `${ulist.length} users online (${ulstring})`;
        document.getElementById("ml-ulist").innerHTML = `${ulist.length} users online (${ulstring})`;
    };
}

function rltab (tab) {
    clearValueOf(["rl-username", "rl-username-s", "rl-password", "rl-password-s", "rl-invitecode", ])
    if (tab == "login") {
        handleAppearElement(["rl-signup-container"], "hide")
        handleAppearElement(["rl-login-container"], "show")
        document.getElementById("rl-t-login").disabled = true;
        document.getElementById("rl-t-signup").disabled = false;
    } else if (tab == "signup") {
        handleAppearElement(["rl-signup-container"], "show")
        handleAppearElement(["rl-login-container"], "hide")
        document.getElementById("rl-t-login").disabled = false;
        document.getElementById("rl-t-signup").disabled = true;
    };
};

function logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.reload();
};

function loadPost(resf, isFetch, isInbox) {
    if (settings.debug) { console.log("Loading post " + resf._id) };
    var sts = new Date(resf.created * 1000).toLocaleString();

    var post = document.createElement("div");
    post.classList.add("post");
    post.setAttribute("id", resf._id)
    
    if (!isInbox) {
        var avatar = document.createElement("img");
        if (resf.author.avatar) {
            avatar.src = resf.author.avatar;
        } else {
            avatar.src = "/assets/default.png";
        };
        avatar.setAttribute("onerror", "this.src = '/assets/default.png';")
        avatar.setAttribute("onclick", `showUser("${resf.author.username.replaceAll('"', '\\"')}");`); // TODO: use this more often
        avatar.classList.add("clickable");
        avatar.classList.add("pfp");
        post.appendChild(avatar);

        var postUsername = document.createElement("span");
        postUsername.innerHTML = `<b>${deHTML(resf.author.display_name)}</b> (<span class="mono">@${deHTML(resf.author.username)}</span>)`;
        if(resf.author.color) {
            postUsername.querySelector("b").style.color = resf.author.color;
            postUsername.querySelector("b").style.textShadow = "0 0 3px " + resf.author.color
        }
        if(resf.author.font) {
            postUsername.querySelector("b").style.fontFamily = resf.author.font;
            postUsername.querySelector("b").style.fontWeight = "initial"
        }
        if(resf.author.background) {
            post.style.backgroundColor = resf.author.background;
        }
        if(resf.author["border-top"]) {
            post.style.borderTop = resf.author["border-top"];
        }
        if(resf.author["border-bottom"]) {
            post.style.borderBottom = resf.author["border-bottom"];
        }
        if(resf.author["border-left"]) {
            post.style.borderLeft = resf.author["border-left"];
        }
        if(resf.author["border-right"]) {
            post.style.borderRight = resf.author["border-right"];
        }
        if (resf.author.bot) {
            postUsername.innerHTML += ' <span title="This user is a robot." class="inline-icon material-symbols-outlined">smart_toy</span>'
        };
        postUsername.setAttribute("onclick", `showUser("${resf.author.username.replaceAll('"', '\\"')}");`);
        postUsername.classList.add("clickable");
        post.appendChild(postUsername);

        var breaklineA = document.createElement("br");
        post.appendChild(breaklineA);
    }

    var postDetails = document.createElement("small");
    if (isInbox) {
        postDetails.innerHTML = `${sts}`;
    } else {
        postDetails.innerHTML = `${sts} - <span class="text-clickable" onclick="reply('${resf._id}');">Reply</span>`;
        if (resf.author.username == username) {
            postDetails.innerHTML += ` - <span class="text-clickable" onclick="editer('${resf._id}');">Edit</span>`
        }
        if (resf.author.username == username || delete_all) {
            postDetails.innerHTML += ` - <span class="text-clickable" onclick="if (confirm('delete post?')) {deletepost('${resf._id}');};">Delete</span>`
        }
    };
    post.appendChild(postDetails);
    
    var breaklineB = document.createElement("br");
    post.appendChild(breaklineB);
    
    if (!isInbox) {
        if (resf.replies.length != 0) {
            for (const i in resf.replies) {
                let reply_loaded = `→ ${resf.replies[i].author.display_name} (@${resf.replies[i].author.username}): ${resf.replies[i].content}`
                let replyContent = document.createElement("span");
                replyContent.innerText = reply_loaded;
                replyContent.classList.add("reply");
                replyContent.classList.add("clickable");
                replyContent.classList.add(`reply-${resf.replies[i]._id}`)
                replyContent.setAttribute("onclick", `document.getElementById("${resf.replies[i]._id}").scrollIntoView({behavior:'smooth'});`)
                post.appendChild(replyContent);

                let brl = document.createElement("br");
                post.appendChild(brl);
            };
            
            
            var horlineB = document.createElement("hr");
            post.appendChild(horlineB);
        };
    }

    var postContent = document.createElement("span");
    postContent.classList.add("post-content");
    postContent.setAttribute("id", "content-" + resf._id)
    if (!isInbox) {
        postContent.innerHTML = md.render(resf.content);
        postContent.innerHTML = findandReplaceMentions(postContent.innerHTML);
    } else {
        postContent.innerText = findandReplaceMentions(resf.content);
    }
    post.appendChild(postContent);

    if (resf.attachments.length != 0) {
        var horline = document.createElement("hr");
        post.appendChild(horline);
        
        var attachmentDetails = document.createElement("span");
        for (const x in resf.attachments) {
            attachmentDetails.innerHTML += `<a target="_blank" rel="noopener noreferrer" id="p-${resf._id}-attachment-${Number(x)}">Loading...</a><br>`
        }
        post.appendChild(attachmentDetails)

        for (let i = 0; i < resf.attachments.length; i++) {
            let attachment = document.createElement("img");
            attachment.src = resf.attachments[i];
            attachment.classList.add("attachment");
            attachment.setAttribute("onerror", "this.remove();");
            post.appendChild(attachment);
        }
    };
    
    var postboxid;
    if (isInbox) {
    	postboxid = "mi-posts"
   	} else if (resf.origin == "livechat") {
   		postboxid = "ml-posts"
   	} else {
   		postboxid = "ms-posts"
  	};

    if (isFetch) {
        document.getElementById(postboxid).appendChild(post);
    } else {
        document.getElementById(postboxid).insertBefore(post, document.getElementById(postboxid).firstChild);
    }

    for (const x in resf.attachments) {
        document.getElementById(`p-${resf._id}-attachment-${Number(x)}`).innerText = `Attachment ${Number(x) + 1} (${resf.attachments[x]})`
        document.getElementById(`p-${resf._id}-attachment-${Number(x)}`).href = resf.attachments[x];
    }
};

function updateDetailsMsg() {
    if (editing) {
        document.getElementById("ms-details").innerHTML = `Editing post ${edit_id} - <span class="text-clickable" onclick="clearAll();">Quit editing</span>`
    } else if (replies.length == 0 && attachments.length == 0) {
        document.getElementById("ms-details").innerText = ""
    } else if (replies.length == 0) {
        if (attachments.length == 1) {var plurals = ""} else {var plurals = "s"}
        document.getElementById("ms-details").innerHTML = `${attachments.length} attachment${plurals} - <span class="text-clickable" onclick="clearAll();">Remove all</span>`
    } else if (attachments.length == 0) {
        if (replies.length == 1) {var plurals = "y"} else {var plurals = "ies"} 
        document.getElementById("ms-details").innerHTML = `${replies.length} repl${plurals} - <span class="text-clickable" onclick="clearAll();">Remove all</span>`
    } else {
        if (replies.length == 1) {var plurals = "y"} else {var plurals = "ies"}
        if (attachments.length == 1) {var plurals_b = ""} else {var plurals_b = "s"}
        document.getElementById("ms-details").innerHTML = `${replies.length} repl${plurals}, ${attachments.length} attachment${plurals_b} - <span class="text-clickable" onclick="clearAll();">Remove all</span>`
    };
};

function reply(id) {
    if (!editing) {
        if (replies.length != 5) {
            replies.push(id);
        };
        document.getElementById("ms-msg").focus();
        updateDetailsMsg();
    }
};

function editer(id) {
    edit_id = id;
    editing = true;
    if (id in posts) {
        document.getElementById("ms-msg").value = posts[id].content;
    }
    document.getElementById("ms-msg").focus();
    updateDetailsMsg();
};

function removepost(id, dba) {
    try {
        document.getElementById(id).classList.remove("post");
        if (dba) {
            document.getElementById(id).innerHTML = "<small class='reply' style='vertical-align:top;'><i>post deleted by author</i></small>";
        } else {
            document.getElementById(id).innerHTML = "<small class='reply' style='vertical-align:top;'><i>post deleted by moderator</i></small>";
        }
        var repliesMade = document.getElementsByClassName("reply-" + id);
        for (const x in repliesMade) {
            repliesMade[x].innerText = `→ post deleted`;
        }
    } catch {}
}

function editedpost(id, content) {
    try {
        document.getElementById("content-" + id).innerHTML = md.render(content);
        if (id in posts) {
            posts[id].content = content;
            var repliesMade = document.getElementsByClassName("reply-" + id);
            for (const x in repliesMade) {
                repliesMade[x].innerText = `→ ${posts[id].author.display_name} (@${posts[id].author.username}): ${content}`;
            }
        }
    } catch {}
}

function clearAll() {
    if (editing) {
        clearValueOf(["ms-msg"])
    }
    editing = false;
    replies = [];
    attachments = [];
    updateDetailsMsg();
};

function showUserPrompt() {
    var un = prompt("Username?") 
    if (un) { showUser(un) }
}

function setServerPrompt() {
    var un = prompt("Server URL?") 
    if (un) {
        localStorage.setItem("serverurl", un);
    } else {
        if (localStorage.getItem("serverurl")) {
            localStorage.removeItem("serverurl");
        }
    }
    window.location.reload();
}

function clearIPs() {
    document.getElementById("mm-ips").innerText = "";
    clearValueOf(["mm-username-ip"])
}

function setTheme(theme) {
    localStorage.setItem("theme", theme)
    document.getElementById("top-style").href = `/themes/${theme}.css`;
    document.getElementById("mc-theme-name").innerText = themes[localStorage.getItem("theme")];
}

function setCustomTheme() {
    var ccss = document.getElementById("mc-theme-custom").value;
    localStorage.setItem("customCSS", ccss);
    document.getElementById("custom-style").innerText = ccss;
}

function doInputEnterThingy(e, click) {
    if (e.key != 'Enter') return;
    if (shift) return;
    document.getElementById(click).click()
    if (click)e.preventDefault();
}

handlePings()