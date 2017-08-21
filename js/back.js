$(function(){
    console.log( 'Log from back page' );

    chrome.contextMenus.create({
        'type':'normal',
        'title':'Item-1',
        'contexts':['image'],
        'id':'item1',
        'onclick':function(info, tab){
            console.warn('Click menu item-1 ', info, tab );
            document.getElementById('img1').src = info.srcUrl;
        }
    });

    chrome.contextMenus.create({
        'type':'normal',
        'title':'Item-2',
        'contexts':['image'],
        'id':'item2',
        'onclick':function(info, tab){
            console.warn('Click menu item-2 ', info, tab );
            /* chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                chrome.tabs.sendMessage(tabs[0].id, info, function(res){
                    console.log(res);
                });
            }); */
            document.getElementById('img2').src = info.srcUrl;
            chrome.tabs.sendMessage(tab.id, rawDiff(), function(res){
                console.log(res);
            });
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

        return canvas.toDataURL("image/png");
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