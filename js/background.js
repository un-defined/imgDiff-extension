chrome.contextMenus.create({
    'type':'normal',
    'title':'设为图片一',
    'contexts':['image'],
    'id':'pic1',
    'onclick':setPic1
});

chrome.contextMenus.create({
    'type':'normal',
    'title':'设为图片一',
    'contexts':['image'],
    'id':'pic2',
    'onclick':setPic1
    
});

function translate(info, tab){
    console.log(info, tab)
    var url = 'http://translate.google.com.hk/#auto/zh-CN/'+info.selectionText ;
    // window.open(url, '_blank');
}

function setPic1(info, tab) {
    chrome.runtime.sendMessage('123');
    console.log(info, tab);
    localStorage.setItem('KKK', JSON.stringify(info));
    window.open( 'http://www.baidu.com', '_blank' );
}

function setPic2(info, tab) {
    console.log(info)
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    chrome.contextMenus.update('cn',{
        'title':'使用Google翻译“'+message+'”'
    });
});