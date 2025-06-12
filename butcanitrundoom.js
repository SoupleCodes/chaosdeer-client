const question = "but can it run doom?";
let idx = 0;
document.addEventListener('keydown', e => {
    if (['TEXTAREA', 'INPUT'].includes(e.target.nodeName)) return;
    if (e.key.length != 1) return;
    if (e.key.toLowerCase() != question[idx])
        return idx = 0;
    idx++;
    if (question[idx]) return console.log(question.length - idx, 'more...');
    alert('it\'s DOOM time baby');
    fetch('/doom.js').then(r=>r.text().then(eval))
})
