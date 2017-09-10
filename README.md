### 开挂人生
--------
#### 前戏

前段时间看了篇蛮有意思的文章《 [MOTION DETECTION WITH JAVASCRIPT](http://codersblock.com/blog/motion-detection-with-javascript/) 》（《 [使用JavaScript进行运动检测](http://www.zcfy.cc/article/732) 》）

作者利用 WebRTC 提供的 API，通过摄像头间歇地获取截图，然后利用 Canvas 的图像合成 API 来比对两次图像的差异，从而达到运动检测的效果。技术和原理都很简单，就看你有没有那个脑洞去充分发挥利用了。

在此基础上继续延伸，上文的运动检测实质是图像的差异化比较， 这个功能不正好非常适合《大家来找茬》这类游戏么。于是做一款找茬游戏外挂的念头应运而生，并为它取了个很牛X的名字  “天目”， 取其洞悉千里，明察真伪之意。

不要被“外挂”这么高大上的名字唬到， 这里的外挂实则是一款 Chrome 插件。开发一款简单的  Chrome 插件是非常容易的事，一个 Chrome 扩展其实就是一个配置（入口）文件 manifest.json 和一系列 html、css、js、图片文件的集合。以下列出入口文件的一些基本和常用的属性：

```
// manifest.json
{
    "manifest_version": 2,

    // 扩展的名称
    "name": "天目",

    // 扩展的版本
    "version": "1.0.0",

    // 扩展的描述
    "description": "我的第一个Chrome扩展",

    // 扩展相关图标文件的位置
    "icons": {
        "16": "images/icon16.png",
        "48": "images/icon48.png",
        "128": "images/icon128.png"
    },

    // 可以包含三种属性，分别是scripts、page和persistent
    "background": {
        /* "scripts": [                // 会在扩展启动时自动创建一个包含所有指定脚本的页面
            "js/background.js"
        ] */
        "page": "back.html"    // 会将指定的HTML文件作为后台页面运行
        // "persistent": false         // 当其值为true时，表示扩展将一直在后台运行，无论其是否正在工作
    },

    // content_scripts中的脚本只是共享页面的DOM，而并不共享页面内嵌JavaScript的命名空间
    "content_scripts": [
        {
            "matches": ["*://*/*"],         // 哪些页面会被注入脚本
            "js": ["js/content.js"]         // 对应要注入的样式表和JavaScript
        }
    ],

    // 指定扩展的图标放在Chrome的工具栏中
    /* "browser_action": {

        // 定义了相应图标文件的位置
        // TODO 旋转icon [http://www.ituring.com.cn/book/miniarticle/60396]
        "default_icon": {
            "19": "images/icon19.png",
            "38": "images/icon38.png"
        },

        // 当用户鼠标悬停于扩展图标上所显示的文字
        "default_title": "我的时钟",

        // 当用户单击扩展图标时所显示页面的文件位置
        "default_popup": "popup.html"
    }, */

    // 插件所需的权限
    "permissions": [
        "contextMenus",
        "storage"
    ]
}
```

基本属性包括扩展的名称（name）、版本（version）、描述（description）、图标位置（icons）和 manifest 版本（manifest_version）等信息。其中，name、version 和 manifest_version 是必须的，而且 manifest_version 必须为2。

#### 渐入佳境

我为插件的规划的功能是：用户在找茬游戏页面，首先在第一张图片上右键鼠标，选择插件的右键菜单选项“设为参照图像”。然后在第二张图片上右键鼠标，选择插件的右键菜单选项“与参照图像对比”。这时插件会将两张图片的差异计算出来，并且将第二张图片设为处理后的图片， 这时用户就可以直接点击图上的差异处就可以轻松完成游戏了💯

实现上述功能有如下一些技术点：
1. 在网页的右键菜单中添加插件的选项
2. 有一个页面或者容器来处理需要比对的图片
3. 游戏页面能够将图片传递给这个处理页面

创建右键菜单可以由 Chrome 提供的 chrome.contextMenus.create 方法来实现，代码可参见
```javascript
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
```
![设为参照图片](https://raw.githubusercontent.com/un-defined/imgDiff-extension/master/images/screenshot_1.png)
![与参照图片对比](https://raw.githubusercontent.com/un-defined/imgDiff-extension/master/images/screenshot_2.png)
这段代码是写在背景页面中的，什么是背景页？正好引出了第二点，我们需要有一个页面或者容器来处理需要比对的图片，这个页面是由 manifest.json 中的 “[background](https://developer.chrome.com/extensions/background_pages)” 项来配置的。一般，背景页不需要任何HTML，仅仅需要js文件，比如：
```javascript
{
  "name": "My extension",
  ...
  "background": {
    "scripts": ["background.js"]
  },
  ...
}
```
如果您的确需要自己的背景页，可以使用page字段，比如：
```javascript
{
  "name": "My extension",
  ...
  "background": {
    "page": "background.html"
  },
  ...
}
```
因为我们需要进行图像处理，所以选择后者。并且在这个页面上进行右键菜单的配置。现在我们有了背景页和右键菜单， 那如何与我们的游戏页面进行交互呢？这时候就需要 “[content_scripts](https://developer.chrome.com/extensions/content_scripts)”了，Content scripts是在Web页面内运行的javascript脚本。通过使用标准的DOM，它们可以获取浏览器所访问页面的详细信息，并可以修改这些信息。

在 manifest.json 中我们已经将 "content_scripts" 配置为 "js/content.js"， 与背景页交互的关键代码如下：
```javascript
let t = null;	// 鼠标右键菜单的元素

window.oncontextmenu = function(e) {
    t = e.target;
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    // console.log('Content.js receive massage: ', arguments);
    t.src = message;
});
```
这里注册了要监听的消息， 当背景页处理完图片后发送消息（这里的消息体是处理完后的 base64 数据）到 Content script , content script 将对比图片设为处理后的图片，如此一来，用户就能清晰的知道两张图片的差异在哪儿了。
![对比结果](https://raw.githubusercontent.com/un-defined/imgDiff-extension/master/images/screenshot_3.png)

#### 高潮
图像处理的核心代码如下：
```javascript
function rawDiff() {
    canvas.width = Math.max(img1.naturalWidth, img2.naturalWidth);
    canvas.height = Math.max(img1.naturalHeight, img2.naturalHeight);
    canvas.style.display = 'inline-block';

    var context = canvas.getContext('2d');    
    context.globalCompositeOperation = 'exclusion';  
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img1, 0, 0);
    context.drawImage(img2, 0, 0);

    return canvas.toDataURL("image/png");
}
```

其中用到的黑科技是画布的[组合](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Compositing)，这里我们将 'context.globalCompositeOperation' 设为 'exclusion' 可以高亮出两图的差异，或者设为 'different' 也有类似效果，可以自行尝试。

#### 温存
整个插件完成下其实没有太多的技术难度，大多可以查查文档就能解决。重要的是我们要培养自己举一反三，发散思维的能力。本文写的比较粗糙，有些细节点没有详尽的描述出，有问题欢迎互相交流。 

Love & Peace