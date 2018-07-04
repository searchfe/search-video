/**
 * @file Setup default config
 * @author IShinji<icanghai@foxmail.com>
 * @copyright 2018 Baidu.com, Inc. All Rights Reserved
 */

export const defaultConfig = {
    'autoplay': false,
    'controls': true,
    'loop': false,
    'preload': 'metadata',
    'playsinline': true,
    'muted': false,
    'webkit-playsinline': true
};

export function createDefaultConfig() {
    return Object.assign({}, defaultConfig);
}
