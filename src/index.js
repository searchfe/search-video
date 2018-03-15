/**
 * @file Main js
 * @author IShinji<icanghai@foxmail.com>
 * @copyright 2018 Baidu.com, Inc. All Rights Reserved
 */

import {createDefaultConfig} from './config.js';
import {log} from './log.js';

export class searchVideo {
    constructor(config) {
        this.version = '1.0.0';
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
     * @param {Object} config set config to dom
     */
    initDom(config) {
        if (typeof config.id === 'string') {
            let container = document.querySelector('#' + config.id);
            // If <video> can use
            if (!!(document.createElement('video').canPlayType)) {
                container.innerHTML = '';
                let videoDom = document.createElement('video');
                for (let k in config) {
                    if (config.hasOwnProperty(k)) {
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
                            videoDom.setAttribute(k, config[k][0]);
                        }
                        else {
                            videoDom.setAttribute(k, config[k]);
                        }
                    }
                }
                log.bind(videoDom);
                container.appendChild(videoDom);
            }
        }
        else {
            alert('DOM id is wrong');
        }
    }
}

window.searchVideo = searchVideo;
