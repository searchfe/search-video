/**
 * @file Main js
 * @author IShinji<icanghai@foxmail.com>
 * @copyright 2018 Baidu.com, Inc. All Rights Reserved
 */
// Polyfill for HUAWEI
import 'core-js/features/object/assign';
import 'core-js/features/array/includes';

import {createDefaultConfig} from './config.js';
import {log} from './log.js';

export class searchVideo {
    constructor(config) {
        this.version = '1.1.4';
        this._config = createDefaultConfig();
        Object.assign(this._config, config);
        if (this._config.autoplay === false) {
            this._config.controls = true;
        }
        if (typeof this._config.extra === 'undefined') {
            this._config.extra = {};
            this._config.extra.refer = '';
        }
        this.initDom(this._config);
    }

    checkParams(config) {
        if (typeof config.id !== 'string') {
            alert('DOM need to be string');
            return false;
        }
        if (config.https) {
            // Adjust video src is https
            let https = /^https:\/\//;
            config.src.forEach((value, index) => {
                if (!https.test(value)) {
                    alert('No.${index} video src is not https!');
                    return false;
                }
            });
            // Adjust poster src is https
            if (!https.test(config.poster)) {
                alert('Poster src is not https!');
                return false;
            }
        }
        return true;
    }

    /**
     * Set config to Dom
     *
     * @param {Object} config Set config to dom
     */
    initDom(config) {
        // Not video element attribute
        const EXTEA = ['extra', 'https'];
        let self = this;
        var checkResult = self.checkParams(config);
        if (!checkResult) {
            return;
        }
        let container = document.querySelector('#' + config.id);
        container.innerHTML = '<video>Sorry, your browser does not support embedded videos.</video>';
        let videoDom = container.querySelector('video');
        let srcList = [];
        for (let k in config) {
            if (config.hasOwnProperty(k) && !EXTEA.includes(k)) {
                if (typeof config[k] === 'boolean') {
                    if (k === 'playsinline' && config[k] === true) {
                        videoDom.setAttribute('playsinline', 'playsinline');
                        videoDom.setAttribute('webkit-playsinline', 'webkit-playsinline');
                    }
                    else {
                        videoDom[k] = config[k];
                    }
                }
                else if (k === 'src') {
                    srcList = config[k];
                    videoDom.setAttribute(k, config[k][0]);
                    // If src is a list, play list
                    if (srcList.length > 1) {
                        self.playList(videoDom, srcList);
                    }
                }
                else {
                    videoDom.setAttribute(k, config[k]);
                }
            }
        }
        log.bind(videoDom, config.extra.refer);
    }

    /**
     * 播放视频list
     *
     * @param {HTMLElement} videoDom Video DOM
     * @param {Array} srcList Video src list
     */
    playList(videoDom, srcList) {
        let index = 0;
        let flag = false;
        videoDom.addEventListener('ended', function () {
            index++;
            // When play list end set index = 0, to the first src url
            if (index === srcList.length) {
                index = 0;
            }
            videoDom.setAttribute('src', srcList[index]);
            if (!flag) {
                videoDom.addEventListener('loadeddata', function () {
                    if (index !== 0) {
                        videoDom.play();
                    }
                });
                flag = true;
            }
        });
    }
}

window.searchVideo = searchVideo;
