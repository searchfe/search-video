/**
 * @file log
 * @author IShinji<icanghai@foxmail.com>
 * @copyright 2018 Baidu.com, Inc. All Rights Reserved
 */
import {platform} from './utils/platform.js';

export var log = {
    videoLog: {
        status: {
            init: false,
            waiting: false
        },
        time: {
            play: 0,
            // loadstart的时机(video提供的事件回调)
            loadstart: 0,
            // loadmetadata的时机(video提供的事件回调)
            loadedmetadata: 0,
            // loadeddata的时机(video提供的事件回调)
            loadeddata: 0,
            currentTime: 0
        },
        expand: {
            /* eslint-disable fecs-camelcase */
            // 加载播放器到dns解析完的时长
            loadplayer_2_dns: 0,
            // dns解析完到建连完毕的时长
            dns_2_connect: 0,
            // 建连完毕到loadstart的时长
            loadplayer_2_loadstart: 0,
            // loadstart到loadmetadata的时长
            loadstart_2_loadmetadata: 0,
            // loadmetadata到loadeddata的时长
            loadmetadata_2_loadeddata: 0,
            // loadeddata到playing的时长
            loadeddata_2_playing: 0,
            // 点击到playing的时长
            loadplayer_2_playing: 0
            /* eslint-enable fecs-camelcase */
        },
        network: 'unknown',
        getNetworkType: 'baiduboxapp://v19/utils/getNetworkType?callback=videoPageGetNetworkType',
        ua: new platform(),
        sectionNum: 10
    },
    init() {
        var Webb2 = require('./lib/webb2.core.min.js');
        var md5 = require('./lib/md5.js');
        var lid = md5(location.href + (+new Date()) + Math.random());
        this.webb2 = new Webb2({
            pid: '1_5',
            lid: lid,
            /* eslint-disable fecs-camelcase */
            pf_comm: {
                sample: 1
            },
            et_comm: {
                sample: 1
            }
            /* eslint-enable fecs-camelcase */
        });
    },

    /**
     * Bind log event
     *
     * @param {Element} videoEl <video> element
     * @param {string} refer page refer
     */
    bind(videoEl, refer = '') {
        var self = this;
        var os = new platform();
        var videoLog = self.videoLog;
        self.init();
        self.getNetwork();
        window.videoPageGetNetworkType = function (data) {
            var data = JSON.parse(data);
            if (data && !parseInt(data.status, 10) && data.data) {
                self.videoLog.network = data.data.networkType;
            }
        };
        var autoplay = videoEl.getAttribute('autoplay');
        if (autoplay) {
            videoLog.time.play = +new Date();
        }
        var urlData = {
            url: location.href,
            videoSrc: videoEl.src
        };
        videoLog.duration = videoEl.duration;
        videoEl.addEventListener('loadstart', function () {
            videoLog.time.loadstart = +new Date();
        });
        videoEl.addEventListener('loadedmetadata', function () {
            videoLog.time.loadedmetadata = +new Date();
        });
        videoEl.addEventListener('loadeddata', function () {
            videoLog.time.loadeddata = +new Date();
        });
        // Play times & Start time
        videoEl.addEventListener('play', function () {
            urlData.videoSrc = videoEl.src;
            if (!videoLog.status.init && videoLog.time.play === 0) {
                videoLog.time.play = +new Date();
            }
        });
        videoEl.addEventListener('playing', function () {
            if (isNaN(videoLog.duration)) {
                videoLog.duration = videoEl.duration;
            }
            var playingTime = +new Date();
            // iOS playing event is true playing
            if (!videoLog.status.init && !os.isAndroid()) {
                var data = {
                    refer: refer
                };
                Object.assign(data, urlData);
                self.getPlayTime(data);
            }
        });
        // Played time & Play completion ratio
        var sectionArr = new Array(videoLog.sectionNum).fill(0);
        videoEl.addEventListener('timeupdate', function () {
            var duration = videoEl.duration;
            // Hack Android playing event
            if (!videoLog.status.init && os.isAndroid() && videoEl.currentTime !== 0) {
                var data = {
                    refer: refer
                };
                Object.assign(data, urlData);
                self.getPlayTime(data);
            }
            // If duration > 10s send Played time & Play completion ratio log
            if (duration > 10) {
                for (var i = 0; i < sectionArr.length; i++) {
                    if (sectionArr[i] === 0
                    && ((videoEl.currentTime / duration) >= (i / sectionArr.length))
                    && ((videoEl.currentTime / duration) < ((i + 1) / sectionArr.length))) {
                        sectionArr[i] = 1;
                        // Data of 0% is replace by play times
                        if (i !== 0) {
                            var data = {
                                cent: (i / videoLog.sectionNum) * 100 + '%'
                            };
                            Object.assign(data, urlData);
                            self.sendLog('section', data);
                        }
                    }
                }
            }
        });
        // Play end statistics separately
        videoEl.addEventListener('ended', function () {
            var data = {
                cent: '100%'
            };
            Object.assign(data, urlData);
            self.sendLog('section', data);
            var tempTime = +new Date();
            videoLog = {
                status: {
                    init: false,
                    waiting: false
                },
                time: {
                    play: tempTime,
                    currentTime: 0
                },
                sectionNum: 10
            };
            sectionArr.fill(0);
        });
        // Error log
        videoEl.addEventListener('error', function () {
            var data = videoEl.error;
            send('error', data);
        });
    },
    getNetwork() {
        var self = this;
        var ua = this.videoLog.ua;
        if (ua.isSearchCraft()) {
            self.getNetworkSearchCraft();
        } else if (ua.isBaiduApp()) {
            self.getNetworkBaidubox();
        }
    },

    /**
     * 将当前简单版本跟目标版本的版本号进行对比
     *
     * @param {string} version 目标版本
     * @return {Booleans} true/false true表示当前版本>=目标版本，false表示当前版本<目标版本
     */
    versionCompare(version) {
        var curVer = 0;
        var destVer = 0;
        var secrVersion = this.videoLog.ua.secrVersion();
        var destVersion = version.split('.');
        for (var i = 0, l = secrVersion.length; i < l; i++) {
            curVer += secrVersion[i];
        }
        for (var j = 0, m = destVersion.length; j < m; j++) {
            destVer += (destVersion[j] - 0);
        }
        if (curVer < destVer) {
            return false;
        } else {
            return true;
        }
    },

    // 获取手百的网络状态
    getNetworkBaidubox() {
        location.assign(this.videoLog.getNetworkType);
    },
    // 获取简单的网络状态
    getNetworkSearchCraft() {
        var self = this;
        var ua = self.videoLog.ua;
        if (!ua.isSearchCraft() || ua.isSearchCraft() && !self.versionCompare('2.9')) {
            return;
        }
        var msg = {
            func: 'invokeModule',
            moduleName: 'Utility',
            options: {
                action: 'network'// 获取网络状态
            },
            callback: 'searchcraftWifiCb'
        };
        if (window.Viaduct && window.Viaduct.postMessage) {
            ua.isAndroid() ? window.Viaduct.postMessage(JSON.stringify(msg)) : window.Viaduct.postMessage(msg);
        }
        window.searchcraftWifiCb = function (param) {
            if (param.status === 0 && param.data && param.data.network) {
                self.videoLog.network = param.data.network;
            }
        };
    },
    // 获取dns解析和建连时间
    getDnsConnect() {
        var videoLog = this.videoLog;
        // 查下performance api浏览器是否支持
        if (typeof window.performance === 'undefined' || typeof window.performance.getEntriesByType === 'undefined') {
            /* eslint-disable fecs-camelcase */
            videoLog.expand.loadplayer_2_dns = -1;
            videoLog.expand.dns_2_connect = -1;
            /* eslint-enable fecs-camelcase */
            return;
        }
        var resources = window.performance.getEntriesByType('resource');
        for (var i = 0, l = resources.length; i < l; i++) {
            if (resources[i].name.match(/^https:\/\/vdse.bdstatic.com/)
            || resources[i].name.match(/^https:\/\/vd1.bdstatic.com/)
            || resources[i].name.match(/^https:\/\/vd2.bdstatic.com/)
            || resources[i].name.match(/^https:\/\/vd3.bdstatic.com/)
            || resources[i].name.match(/^https:\/\/vd4.bdstatic.com/)) {
                /* eslint-disable fecs-camelcase */
                videoLog.expand.loadplayer_2_dns = resources[i].domainLookupEnd - resources[i].domainLookupStart;
                videoLog.expand.dns_2_connect = resources[i].connectEnd - resources[i].connectStart;
                /* eslint-enable fecs-camelcase */
                break;
            }
        }
    },

    /**
     * 获取播放过程中的各种时长
     *
     * @param {number} time 视频播放时机
     */
    getPlayExpand(time) {
        var videoLog = this.videoLog;
        /* eslint-disable fecs-camelcase */
        /* eslint-disable max-len */
        videoLog.expand.connect_2_loadstart = videoLog.time.loadstart - (videoLog.time.play + videoLog.expand.loadplayer_2_dns + videoLog.expand.dns_2_connect);
        // to check loadstart和play的时机谁先谁后
        videoLog.expand.loadplayer_2_loadstart = videoLog.time.loadstart - videoLog.time.play;
        videoLog.expand.loadstart_2_loadmetadata = videoLog.time.loadedmetadata - videoLog.time.loadstart;
        videoLog.expand.loadmetadata_2_loadeddata = videoLog.time.loadeddata - videoLog.time.loadedmetadata;
        videoLog.expand.loadeddata_2_playing = time - videoLog.time.loadeddata;
        videoLog.expand.loadplayer_2_playing = time - videoLog.time.play;
        /* eslint-enable max-len */
        /* eslint-enable fecs-camelcase */
    },
    getPlayTime(data) {
        var self = this;
        var videoLog = self.videoLog;
        videoLog.status.init = true;
        self.getDnsConnect();
        var playTime = videoLog.time.play;
        // 短视频落地页页面加载的时候就试图自动播放视频，会调用video的loadstart
        if (videoLog.time.loadstart < playTime) {
            videoLog.time.loadstart = playTime;
            /* eslint-disable max-len */
            videoLog.time.play = videoLog.time.loadstart - (videoLog.expand.loadplayer_2_dns + videoLog.expand.dns_2_connect);
            /* eslint-enable max-len */
        }
        if (videoLog.time.loadedmetadata < playTime) {
            videoLog.time.loadedmetadata = videoLog.time.loadstart;
        }
        if (videoLog.time.loadeddata < playTime && videoLog.time.loadeddata > 0) {
            videoLog.time.loadeddata = videoLog.time.loadedmetadata;
        }
        // 有一些浏览器不支持loadeddata，活着loadeddata执行的时机晚于playing
        if (videoLog.time.loadeddata === 0) {
            videoLog.time.loadeddata = +new Date();
        }
        var time = +new Date();
        self.getPlayExpand(time);
        self.sendLog('play', data);
    },

    /**
     * Send log function
     *
     * @param {string} type event type
     * @param {Object} data the record data object
     */
    sendLog(type, data) {
        var self = this;
        var time = '';
        var videoLog = self.videoLog;
        switch (type) {
            case 'play':
                var expand = videoLog.expand;
                time = expand.loadplayer_2_playing;
                // Send log when first time start play
                self.webb2.sendPfLog(
                    // info
                    {
                        /* eslint-disable fecs-camelcase */
                        loadplayer_2_dns: expand.loadplayer_2_dns,
                        dns_2_connect: expand.dns_2_connect,
                        connect_2_loadstart: expand.connect_2_loadstart,
                        loadplayer_2_loadstart: expand.loadplayer_2_loadstart,
                        loadstart_2_loadmetadata: expand.loadstart_2_loadmetadata,
                        loadmetadata_2_loadeddata: expand.loadmetadata_2_loadeddata,
                        loadeddata_playing: expand.loadeddata_playing,
                        loadplayer_2_playing: expand.loadplayer_2_playing
                        /* eslint-enable fecs-camelcase */
                    },
                    // dim
                    {
                        net: self.videoLog.network,
                        type: 'thirdparty'
                    },
                    // ext
                    {
                        ext: {
                            refer: data.refer,
                            videoSrc: data.videoSrc
                        }
                    }
                );
                break;
            case 'section':
                self.webb2.sendPfLog(
                    // info
                    {
                        cent: data.cent
                    },
                    // dim
                    {
                        net: self.videoLog.network,
                        type: 'thirdparty-cent'
                    },
                    // ext
                    {
                        ext: {
                            refer: data.refer,
                            videoSrc: data.videoSrc
                        }
                    }
                );
                break;
            case 'error':
                self.webb2.sendExceptionLog(
                    // info
                    {
                        code: data.code,
                        message: data.message
                    },
                    // dim
                    {
                        net: self.videoLog.network
                    },
                    // ext
                    {
                        ext: {
                            refer: data.refer,
                            videoSrc: data.videoSrc
                        }
                    }
                );
                break;
        }
    }
};
