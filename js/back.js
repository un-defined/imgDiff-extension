$(function(){

    let canvas = document.getElementById('canvas');
    let img1 = new Image();
    let img2 = new Image();

    let {create, update} = chrome.contextMenus;
    let menuOpt1, menuOpt2;
    
    menuOpt2 = {
        'type': 'normal',
        'title': '与参照图片对比',
        'contexts': ['image'],
        'onclick': function (info, tab) {
            img2.src = info.srcUrl;
            img2.onload = function () {
                chrome.tabs.sendMessage(tab.id, rawDiff(), function (res) {
                    menuOpt1.generatedId && delete menuOpt1.generatedId;
                    update(ctxm, menuOpt1);
                });
            }
        }
    }
    menuOpt1 = {
        'type': 'normal',
        'title': '设为参照图片',
        'contexts': ['image'],
        'onclick': function (info, tab) {
            img1.src = info.srcUrl;
            console.log(menuOpt2);
            update(ctxm, menuOpt2);
        }
    }
    
    let ctxm = create(menuOpt1);

    function rawDiff() {
        canvas.width = Math.max(img1.naturalWidth, img2.naturalWidth);
        canvas.height = Math.max(img1.naturalHeight, img2.naturalHeight);
        canvas.style.display = 'inline-block';

        var context = canvas.getContext('2d');
        // https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Compositing
        context.globalCompositeOperation = 'exclusion';
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img1, 0, 0);
        context.drawImage(img2, 0, 0);

        return canvas.toDataURL("image/png");
    }

    function monoDiff() {
        // still need to do raw diff stuff first
        rawDiff();

        var context = canvas.getContext('2d');

        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        var rgba = imageData.data;
        for (var i = 0; i < rgba.length; i += 4) {
            // 以加权平均的方式计算灰度赋值给绿色通道
            // http://en.wikipedia.org/wiki/Grayscale
            var pixelDiff = rgba[i] * 0.3 + rgba[i + 1] * 0.6 + rgba[i + 2] * 0.1;
            rgba[i] = 0;
            rgba[i + 1] = pixelDiff;
            rgba[i + 2] = 0;
        }

        // clear raw diff pixels and draw new mono diff pixels
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.putImageData(imageData, 0, 0);
    }
});