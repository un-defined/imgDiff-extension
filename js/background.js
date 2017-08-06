chrome.contextMenus.create({
    'type':'normal',
    'title':'设为图片一',
    'contexts':['image'],
    'id':'pic1',
    'onclick':setPic1
});

function translate(info, tab){
    console.log(info, tab)
    var url = 'http://translate.google.com.hk/#auto/zh-CN/'+info.selectionText ;
    // window.open(url, '_blank');
}

function setPic1(info, tab) {
    console.log(info, tab);
    localStorage.setItem('KKK', JSON.stringify(info));ß
    window.open( 'http://www.baidu.com', '_blank' );
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    chrome.contextMenus.update('cn',{
        'title':'使用Google翻译“'+message+'”'
    });
});