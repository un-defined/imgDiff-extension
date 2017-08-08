window.onmouseup = function(e){
    var selection = window.getSelection();
    if(selection.anchorOffset != selection.extentOffset){
        chrome.runtime.sendMessage(selection.toString());
    }
}

window.oncontextmenu = function() {
    console.log('Context: ', arguments)
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    console.log('HH');
});