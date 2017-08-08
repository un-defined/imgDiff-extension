$(function(){
    console.log( 'Log from back page' );

    chrome.contextMenus.create({
        'type':'normal',
        'title':'设为图片一',
        'contexts':['image'],
        'id':'pic1',
        'onclick':function(){
            console.log( 'M1: ', arguments )
        }
    });

    chrome.contextMenus.create({
        'type':'normal',
        'title':'设为图片二',
        'contexts':['image'],
        'id':'pic2',
        'onclick':function(){
            console.log( 'M2: ', arguments )
        }
    });

    var img1 = document.getElementById('img1');
    var img2 = document.getElementById('img2');
    var canvas = document.getElementById('canvas');

    $('#raw').click(rawDiff);
    $('#mono').click(monoDiff);

    function rawDiff() {
        canvas.width = Math.max(img1.naturalWidth, img2.naturalWidth);
        canvas.height = Math.max(img1.naturalHeight, img2.naturalHeight);
        canvas.style.display = 'inline-block';

        var context = canvas.getContext('2d');
        context.globalCompositeOperation = 'difference';
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img1, 0, 0);
        context.drawImage(img2, 0, 0);
    }

    function monoDiff() {
        // still need to do raw diff stuff first
        rawDiff();

        var context = canvas.getContext('2d');

        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        var rgba = imageData.data;
        for (var i = 0; i < rgba.length; i += 4) {
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