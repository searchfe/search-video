/**
 * @file Platform Function. Support identification system, engine, browser type
 * @author 邹红全 <icanghai@foxmail.com>
 */
export class platform {
    constructor() {
        // system
        this.isIos = false;
        this.isAndroid = false;
        // browser
        this.isWechatApp = false;
        this.isBaiduApp = false;
        this.isWeiboApp = false;
        this.isQQApp = false;
        this.isUc = false;
        this.isBaidu = false;
        this.isQQ = false;
        this.isAdr = false;
        this.isSafari = false;
        this.isChrome = false;
        this.isFireFox = false;
	this.isSearchCraft = false;
        // engine
        this.isTrident = false;
        this.isGecko = false;
        this.isWebkit = false;
        this.init();
    }
    /**
     * Judge system, iOS, android
     *
     */
    matchOs() {
        if (/iPhone|iPad|iPod/i.test(this.ua())) {
            this.isIos = true;
        } else if (/Android/i.test(this.ua())) {
            this.isAndroid = true;
        }
    }
    /**
     * Judge browser type
     *
     */
    matchBrowser() {
        var uaArray = this.ua().split('Mobile');
        var apps = uaArray && uaArray.length > 1 ? uaArray[1] : null;

        if (/\bmicromessenger\/([\d.]+)/i.test(apps)) {
            this.isWechatApp = true;
        } else if (/baiduboxapp/i.test(apps)) {
            this.isBaiduApp = true;
        } else if (/weibo/i.test(apps)) {
            this.isWeiboApp = true;
        } else if (/\sQQ/i.test(apps)) {
            this.isQQApp = true;
        } else if (/UCBrowser/i.test(this.ua())) {
            this.isUc = true;
        } else if (/baidubrowser/i.test(this.ua())) {
            this.isBaidu = true;
        } else if (/qqbrowser\/([0-9.]+)/i.test(this.ua())) {
            this.isQQ = true;
        } else if (!/android/i.test(this.ua())
            && /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//i.test(this.ua())) {
            this.isSafari = true;
        } else if (/(?:Chrome|CrMo|CriOS)\/([0-9]{1,2}\.[0-9]\.[0-9]{3,4}\.[0-9]+)/i.test(this.ua())
            && !/samsung/i.test(this.ua())) {
            this.isChrome = true;
        } else if (/(firefox|FxiOS+)\/([0-9.ab]+)/i.test(this.ua())) {
            this.isFireFox = true;
        } else if (/android/i.test(this.ua())
            && /Android[\s\_\-\/i686]?[\s\_\-\/](\d+[\.\-\_]\d+[\.\-\_]?\d*)/i.test(this.ua())) {
            this.isAdr = true;
        } else if (/SearchCraft/i.test(this.ua())) {
	    this.isSearchCraft = true;
	}
    }
    /**
     * Judge browser engine type
     *
     */
    matchEngine() {
        if (/\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/i.test(this.ua())) {
            this.isTrident = true;
        } else if (/\brv:([\d\w.]+).*\bgecko\/(\d+)/i.test(this.ua())) {
            this.isGecko = true;
        } else if (/\bapplewebkit[\/]?([0-9.+]+)/i.test(this.ua())) {
            this.isWebkit = true;
        }
    }
    /**
     * OS Version
     *
     * @return {string}
     */
    getOsVersion() {
        var osVersion;
        var result;
        if (this.isAndroid()) {
            result = /Android ([\.\_\d]+)/.exec(this.ua()) || /Android\/([\d.]+)/.exec(this.ua());
            if (result && result.length > 1) {
                osVersion = result[1];
            }
        } else if (this.isIos()) {
            result = /OS (\d+)_(\d+)_?(\d+)?/.exec(this.appVersion());
            if (result && result.length > 3) {
                osVersion = result[1] + '.' + result[2] + '.' + (result[3] | 0);
            }
        }
        return osVersion;
    }
    /**
     * Wrap engine, browser, engine varible to function
     *
     */
    wrapFun() {
        var self = this;
        for (var key in self) {
            if (self.hasOwnProperty(key) && typeof self[key] !== 'function') {
                var handle = function (key) {
                    return key;
                }.bind(null, self[key]);
                self[key] = handle;
            }
        }
        self.needSpecialScroll = self.isIos() && window !== top;
    }
    /**
     * Get user agent
     *
     * @return {string} user agent
     */
    ua() {
        return navigator.userAgent;
    }
    /**
     * Get app version
     *
     * @return {string} app version
     */
    appVersion() {
        return navigator.appVersion;
    }
    secrVersion() {
	var match = this.ua().match(/ SearchCraft\/([0-9]+_)?([0-9.]+)/i);
	var version = /(iPhone|iPod|iPad)/.test(this.ua()) ? match[2].split('.') : match[2].split('.');
	return version ? version.map(parseFloat) : [];
    }
    /**
     * Init match user agent
     *
     * @return {Object} self object
     */
    init() {
        this.matchOs();
        this.matchBrowser();
        this.matchEngine();
        this.wrapFun();
        return this;
    };
}
