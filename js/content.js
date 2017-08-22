let t = null;

/* window.onmouseup = function(e){
    var selection = window.getSelection();
    if(selection.anchorOffset != selection.extentOffset){
        chrome.runtime.sendMessage(selection.toString());
    }
} */

window.oncontextmenu = function(e) {
    t = e.target;
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    console.log('Content.js receive massage: ', arguments);
    t.src = message;
});
