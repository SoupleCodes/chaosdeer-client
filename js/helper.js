// Tabs logic
let tabParents = document.querySelectorAll('.tabs')
if (tabParents) {
    Array.from(tabParents).map(t => {
        let tabs = t.querySelectorAll('.tab')
        let tabsContent = document.querySelector(`#${t.id}-content`)
        
        Array.from(tabs).map((c, index) => {
            c.classList.remove('selected')
            c.addEventListener('click', function() {
                tabs.forEach(a => {
                    a.classList.remove('selected')
                })
                c.classList.add('selected')

                Array.from(tabsContent.children).map(c => {
                    c.classList.add('hidden')
                })
                tabsContent.children[index].classList.remove('hidden')
            });
        })
        tabs[0].classList.add('selected')

        Array.from(tabsContent.children).map(c => {
            c.classList.add('hidden')
        })
        tabsContent.children[0].classList.remove('hidden')
    });
}


// Code for popups
function openPopup(content, iframe, data) {
    if (!document.getElementById('popup-window')) {
        const popupWin = document.createElement('div')
        popupWin.id = 'popup-window'

        const popupDialog = document.createElement('div')
        popupDialog.id = 'dialog'
        popupWin.appendChild(popupDialog)

        document.body.appendChild(popupWin)
    }

    let popupEl = document.getElementById('popup-window')
    if (iframe) {
        var _iframe = document.createElement('iframe')
        popupEl.querySelector('#dialog').appendChild(_iframe)
        _iframe.contentWindow.document.open();
        _iframe.contentWindow.document.write('<link rel="stylesheet" href="/global.css">')
        _iframe.contentWindow.document.write(content);
        var style = document.createElement('style')
        var css = data.profile.css
        if (data.banner) {
            css += ('\n#profile-container { background: url("' + data.banner + '") }')
        }
        style.textContent = css
        _iframe.contentWindow.document.head.appendChild(style) 
        _iframe.contentWindow.document.body.classList.add("chaossoup")
        _iframe.contentWindow.document.close();
    } else {
        popupEl.querySelector('#dialog').innerHTML = content
    }

    setTimeout(() => {
        popupEl.style.opacity = 1
        popupEl.querySelector('#dialog').style.opacity = 0.9
    }, 500)

    popupEl.addEventListener("click", function(e) {
        e.preventDefault()
        if (!(e.target.id==="popup-window")) return null;
        popupEl.remove()
    })
    
    if (iframe) {
        return _iframe
    }
}

// De-html-ifying text
function deHTML(t) {
    if (!t) {
        return '';
    }
    t = t.replaceAll("&", "&gt;")
    t = t.replaceAll("<", "&lt;")
    return t
}

// Easier way of clearing multiple elements
function clearValueOf(array) {
    array.forEach(id => {
        var el = document.getElementById(id)
        el.value = ""
        el.innerHTML = ""
    });
}


// Setup markdown config
const md = markdownit("default", {
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


// Logic for inserting into textboxes
// Would probably be better if there was a parameter for the element instead lol
function markdown(me,f,r) {
    var el = me.parentNode.parentNode.parentNode.querySelector('textarea')
    var val = el.value
    var selected = val.slice(el.selectionStart, el.selectionEnd)
    var before = val.slice(0, el.selectionStart)
    var end = val.slice(el.selectionEnd)

    var newSelected
    if (f === 'insert') newSelected = r
    if (f === 'bold') newSelected = '**' + selected + '**'

    var newVal = before + newSelected + end
    el.value = newVal
}


// Emoji Picker
var emojiObj = {
    smileys: ['🙂','😋','😀','😍','😂','😅','😒','😭','🤯','😗','🥺','😁','🤓','😰','🤮','😣','😛','😊','🙁','😇','😎','😵‍💫','🧐','👿','🥳',],
    gestures: ['👋','👌','🤟','🤘','👍','👎','👊','👏','🤝','🙏','💪','👂','🧠','👀','👁','👅','👄'],
    people: ['👶','👧','🧒','👦','👨','👩‍🦱','🧑‍🦱','👨‍🦱','🧑‍🦳','👨‍🦳','👩‍🦲','🧑‍🦲','🤶','🎅','👼','🙅‍♀️','🙅','🙅‍♂️','🤦‍♀️','🤦','🤦‍♂️','🤷‍♀️','🤷','🤷‍♂️','🗣','👤','👥'],
    clothing: ['🧳','🌂','☂️','👓','🕶','👔','👕','👖','🧦','👗','👘','🥻','🩱','🩳','👚','👛','👜','👝','🎒','👞','🥾','👠','👡','🩰','👑','🎩','🎓','🧢','💍','💼'],
    travel: ['🚲','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🚀','🛸','🚁','🛶','⛵️','🚤','🛥','🛳','⛴','🚢','⚓️','⛽️','🚧','⛱','🏖','🏝','🏜','🌋','🗻','🏠','🛤','🛣','🗾','🎑','🏞','🌅','🌄','🌠','🎇','🎆','🌇','🌆','🏙','🌃','🌌','🌉','🌁'],
    objects: ["⌚️","📱","📲","💻","⌨️","🖥","🖨","🖱","🖲","🕹","🗜","💽","💾","💿","📀","📼","📷","📸","📹","🎥","📽","🎞","📞","☎️","📟","📠","📺","📻","🎛","🧭","⏰","🕰","⌛️","⏳","💰","💳","💎","⚖️","🧰","🛠","⛏","🔩","⚙️","🧱","⛓","⛓️‍💥","🧲","🔫","💣","🧨","⚔️","🛡","🚬","⚰️","🔮","🔭","🔬","🕳","🩹","🩺","💊","🧻","🚽","🚰","🚿","🛁","🛀","🧼","🪒","🧽","🧴","🛎","🔑","🗝","🚪","🪑","🛋","🛏","🖼","🛍","🛒","🎁","🎈","🎏","🎀","🎊","🎉","✉️","📩","📦","🏷","📫","📜","📄","📊","📈","📉","🗒","🗓","📅","🗑","📋","📓","📔","📚","📖","🔖","🧷","📌","📝","✏️","🔍","🔐","🔒"],
    nature: ["🌵","🎄","🌲","🌳","🌴","🌱","🌿","🍀","🎍","🎋","🍃","🍂","🍁","🍄","🐚","🌾","💐","🌷","🌹","🥀","🌺","🌸","🌼","🌻","🌞","🌝","🌛","🌜","🌚","🌕","🌑","🌔","🌙","🌎","💫","⭐","🌟","✨","⚡","💥","🔥","🌪","🌈","🌤","⛅","🌥"]
}
function openEmojiPicker(el) {
    if (el.querySelector('.emoji-picker')) {
        el.querySelector('.emoji-picker').remove()
        return null
    }
    var container = document.createElement('div')
    container.classList.add('emoji-picker')

    var categEl = document.createElement('div')
    categEl.classList.add('emoji-catgeories')
    var keys = Object.keys(emojiObj)
    for (var i = 0; i < keys.length; i++) {
        var indivCategEl = document.createElement('div')
        if (i===0) {
            indivCategEl.classList.add('selected')
        }
        indivCategEl.classList.add('emoji-category')
        categEl.appendChild(indivCategEl)
    }
    categEl.addEventListener("click", function(e) {
        e.stopPropagation()
        e.stopImmediatePropagation()

        var targetEl = e.target
        if (!(targetEl.className === 'emoji-category')) {
            return null
        }

        var index = Array.prototype.indexOf.call(categEl.children, targetEl)
        resetBody(emojiObj[keys[index]])

        var selected = categEl.querySelector('.emoji-category.selected')
        if (selected) {
            selected.classList.remove('selected')
        }
        targetEl.classList.add('selected')
    })
    container.appendChild(categEl)

    var bodyEl = document.createElement('div')
    bodyEl.classList.add('emoji-body')
    bodyEl.addEventListener("click", function(e) {
        e.stopPropagation()
        if(!(e.target.className==='emoji-item')) {
            return null
        }
        var targEmoj = e.target.innerText
        markdown(el, "insert", targEmoj)

    })
    resetBody(emojiObj.smileys)
    function resetBody(obj) {
        bodyEl.innerHTML = ''
        for (var i = 0; i < obj.length; i++) {
            var s = document.createElement('span')
            s.classList.add('emoji-item')
            s.textContent = obj[i]
            bodyEl.appendChild(s)
        }
    }
    container.appendChild(bodyEl)
    el.appendChild(container)
}