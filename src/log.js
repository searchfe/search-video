/**
 * @file log
 * @author IShinji<icanghai@foxmail.com>
 * @copyright 2018 Baidu.com, Inc. All Rights Reserved
 */
import {platform} from './utils/platform.js';

export let log = {
    init() {
        let Webb2 = require('./lib/webb2.core.min.js');
        let md5 = require('./lib/md5.js');
        let lid = md5(location.href + (+new Date()) + Math.random());
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
     * @param {Element} videoEl <video> element
     */
    bind(videoEl, refer = '') {
        let self = this;
        let os = new platform();
        self.init();
        let videoLog = {
            status: {
                init: false,
                waiting: false
            },
            time: {
                play: 0,
                currentTime: 0
            },
            sectionNum: 10
        };
        let autoplay = videoEl.getAttribute('autoplay');
        if (autoplay) {
            videoLog.time.play = +new Date();
        }
        let urlData = {
            url: location.href,
            videoSrc: videoEl.src
        };
        videoLog.duration = videoEl.duration;
        // Play times & Start time
        videoEl.addEventListener('play', function () {
            urlData.videoSrc = videoEl.src;
            if (!videoLog.status.init && videoLog.time.play === 0) {
                videoLog.time.play = +new Date();
            }
        });
        videoEl.addEventListener('playing', function () {
            if (isNaN(videoLog.duration)) {
                videoLog.duration = videoEl.duration
            }
            let playingTime = +new Date();
            // iOS playing event is true playing
            if (!videoLog.status.init && !os.isAndroid()) {
                videoLog.status.init = true;
                let playTime = playingTime - videoLog.time.play;
                let data = {
                    time: playTime,
                    refer: refer
                };
                Object.assign(data, urlData);
                self.sendLog('play', data);
            }
            else if (videoLog.status.waiting) {
                videoLog.status.waiting = false;
                let time = playingTime - videoLog.time.waiting;
                let data = {
                    time: time,
                    duration: videoLog.duration
                };
                Object.assign(data, urlData);
                self.sendLog('waiting', data);
            }
        });
        videoEl.addEventListener('waiting', function () {
            videoLog.time.waiting = +new Date();
            videoLog.status.waiting = true;
        });
        // Played time & Play completion ratio
        let sectionArr = new Array(videoLog.sectionNum).fill(0);
        videoEl.addEventListener('timeupdate', function () {
            if (isNaN(videoLog.duration)) {
                videoLog.duration = videoEl.duration;
            }
            // Hack Android playing event
            if (!videoLog.status.init && os.isAndroid() && videoEl.currentTime !== 0) {
                videoLog.status.init = true;
                let playingTime = +new Date();
                let playTime = playingTime - videoLog.time.play;
                let data = {
                    time: playTime,
                    refer: refer
                };
                Object.assign(data, urlData);
                self.sendLog('play', data);
            }
            // If duration > 10s send Played time & Play completion ratio log
            if (videoLog.duration > 10) {
                for (let i = 0; i < sectionArr.length; i++) {
                    if (sectionArr[i] === 0
                    && ((videoEl.currentTime / videoLog.duration) >= (i / sectionArr.length))
                    && ((videoEl.currentTime / videoLog.duration) < ((i + 1) / sectionArr.length))) {
                        sectionArr[i] = 1;
                        // Data of 0% is replace by play times
                        if (i !== 0) {
                            let data = {
                                currentTime: videoEl.currentTime,
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
            if (isNaN(videoLog.duration)) {
                videoLog.duration = videoEl.duration;
            }
            let data = {
                currentTime: videoLog.duration,
                cent: '100%'
            };
            Object.assign(data, urlData);
            self.sendLog('section', data);
            let tempTime = +new Date();
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
    },
    /**
     * Send log function
     * @param {String} type event type
     * @param {Object} data the record data object
     */
    sendLog(type, data) {
        let self = this;
        let time = '';
        switch (type) {
            case 'play':
                time = data.time;
                // Send log when first time start play
                self.webb2.send('pf_comm', {
                    expend: time,
                    url: data.url,
                    videoSrc: data.videoSrc,
                    refer: data.refer
                }, function () {}, {
                    group: 'searchVideo'
                });
                // Send log when start play time >= 100ms
                if (100 <= time && time < 300) {
                    self.webb2.send('et_comm', {
                        msg: 'searchVideo: Start playing 100<=time<300',
                        time: time,
                        url: data.url,
                        videoSrc: data.videoSrc
                    });
                }
                if (300 <= time && time < 1000) {
                    self.webb2.send('et_comm', {
                        msg: 'searchVideo: Start playing 300<=time<1000',
                        time: time,
                        url: data.url,
                        videoSrc: data.videoSrc
                    });
                }
                if (1000 <= time) {
                    self.webb2.send('et_comm', {
                        msg: 'searchVideo: Start playing 1000<=time',
                        time: time,
                        url: data.url,
                        videoSrc: data.videoSrc
                    });
                }
                break;
            case 'waiting':
                time = data.time;
                let duration = data.duration;
                // Send log when buffer event happen, coust time >= 100ms
                if (100 <= time && time < 300) {
                    self.webb2.send('et_comm', {
                        msg: 'searchVideo: Buffer 100<=time<300',
                        time: time,
                        duration: duration,
                        url: data.url,
                        videoSrc: data.videoSrc
                    });
                }
                if (300 <= time && time < 1000) {
                    self.webb2.send('et_comm', {
                        msg: 'searchVideo: Buffer 300<=time<1000',
                        time: time,
                        duration: duration,
                        url: data.url,
                        videoSrc: data.videoSrc
                    });
                }
                if (1000 <= time) {
                    self.webb2.send('et_comm', {
                        msg: 'searchVideo: Buffer 1000<=time',
                        time: time,
                        duration: duration,
                        url: data.url,
                        videoSrc: data.videoSrc
                    });
                }
                break;
            case 'section':
                self.webb2.send('pf_comm', {
                    cent: data.cent,
                    currentTime: data.currentTime,
                    url: data.url,
                    videoSrc: data.videoSrc
                }, function () {}, {
                    group: 'searchVideo'
                });
                break;
        }
    }
};
