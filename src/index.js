/**
 * @file Main js
 * @author IShinji<icanghai@foxmail.com>
 * @copyright 2018 Baidu.com, Inc. All Rights Reserved
 */

import {createDefaultConfig} from './config.js';
import {log} from './log.js';

export class searchVideo {
    constructor(config) {
        this.version = '1.1.1';
        this._config = createDefaultConfig();
        Object.assign(this._config, config);
        if (this._config.autoplay === false) {
            this._config.controls = true;
        }
        this.initDom(this._config);
    }

    /**
     * Set config to Dom
     *
     * @param {Object} config Set config to dom
     */
    initDom(config) {
        if (typeof config.id === 'string') {
            let container = document.querySelector('#' + config.id);
            // If <video> can use
            if (!!(document.createElement('video').canPlayType)) {
                container.innerHTML = '';
                let videoDom = document.createElement('video');
                let srcList = [];
                for (let k in config) {
                    if (config.hasOwnProperty(k) && k !== 'extra') {
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
                                this.playList(videoDom, srcList);
                            }
                        }
                        else {
                            videoDom.setAttribute(k, config[k]);
                        }
                    }
                }
                log.bind(videoDom, config.extra.refer);
                container.appendChild(videoDom);
            }
        }
        else {
            alert('DOM id is wrong');
        }
    }
    /**
     * 
     * @param {HTMLElement} videoDom Video DOM
     * @param {Array} srcList Video src list
     */
    playList(videoDom, srcList) {
        let index = 0;
        let flag = false;
        videoDom.addEventListener('ended', function() {
            index++;
            // When play list end set index = 0, to the first src url
            if (index === srcList.length){
                index = 0;    
            }
            videoDom.setAttribute('src',srcList[index]);
            if (!flag) {
                videoDom.addEventListener('loadeddata', function() {
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
