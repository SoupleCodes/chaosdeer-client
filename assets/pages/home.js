export function homeContents() {
    return `
                <div id="nav">
                <button id="ms-name" onclick="userBox();">@...</button>
                <span class="ms-seperator">|</span>
                <span id="ms-show-guest-nav" class="hidden">
                    <button onclick="window.location.reload();" id="ms-button-reload">Return to menu</button>
                </span>
                <span id="ms-hide-guest-nav">
                    <button onclick="switchScene('main-inbox');" id="ms-button-inbox">Inbox</button>
                    <button onclick="switchScene('main-livechat');" id="ms-button-livechat">Livechat</button>
                    <button id="ms-button-mod" class="hidden"
                        onclick="switchScene('main-moderation');">Moderation</button>
                </span>
            </div>
            <div id="ms-userbox" class="mc-container hidden">
                <button onclick="showUser(username);">Profile</button>
                <button onclick="switchScene('main-config');">Settings</button>
                <button onclick="logOut();">Log out</button>
                <button onclick="showUserPrompt();">Show a user...</button>
                <button onclick="switchScene('main-whatsnew');">What's new?</button>
            </div>
            <small id="ms-ulist">0 users online (?)</small><br><br>
            <div id="ms-make-post">
                <center>
                    <button onclick="addAttachment();">URL...</button>
                    <button onclick="addUpload();">+</button>
                    <textarea id="ms-msg" class="message-input" maxlength=2000 autocomplete="off"
                        onkeydown="doInputEnterThingy(event, 'ms-button-post')" placeholder="What's on your mind?"
                        type="text"></textarea>
                    <button id="ms-button-post" onclick="sendPost();">Post</button><br>
                    <small id="ms-details"></small>
                </center>
            </div>
            <br>
            <div id="ms-posts"></div>
            <input class="hidden" id="ms-attach" onchange="attachFile();" multiple=true type="file">
    `
}