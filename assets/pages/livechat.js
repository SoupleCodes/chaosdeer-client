export function livechatContents() {
    return `
            <button onclick="switchScene('main-scene');">Return to Home</button><br>
            <h2>Livechat</h2>
            <small id="ml-ulist">0 users online (?)</small><br><br>
            <div id="ml-make-post">
                <center>
                    <button onclick="addAttachment();">URL...</button>
                    <button onclick="addUpload();">+</button>
                    <textarea id="ml-msg" class="message-input" maxlength=2000 autocomplete="off"
                        onkeydown="doInputEnterThingy(event, 'ml-button-post')" placeholder="What's on your mind?"
                        type="text"></textarea>
                    <button id="ml-button-post" onclick="sendLcPost();">Post</button><br>
                    <small id="ms-details"></small>
                </center>
            </div>
            <div id="ml-posts"></div>
    `
}