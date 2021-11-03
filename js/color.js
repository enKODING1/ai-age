import { ThemeHandler } from "./ThemeHandler.js";
var btn = document.querySelector('.night-day')


let mode = "white"
//다크 모드 배경색 폰트색
const night = {
    background: [
        {
            elem: "body",
            color: '#14161A'
        }, {
            elem: '.file-upload',
            color: '#484A50'
        }, {
            elem: '.pop-btn',
            color: '#484A50'
        }, {
            elem: ".list",
            color: '#484A50'
        }, {
            elem: '.license',
            color: 'rgba(86, 115, 235, 0.082)'
        }, {
            elem: '.email',
            color: 'rgba(86, 115, 235, 0.082)'
        }
    ],
    font: [
        {
            elem: "body",
            color: '#DCE2F0'
        }, {
            elem: '.license',
            color: 'rgb(86, 115, 235)'
        }, {
            elem: '.license',
            color: 'rgb(86, 115, 235)'
        }, {
            elem: '.email',
            color: 'rgb(86, 115, 235)'
        }
    ]
};

const light = {
    background: [
        {
            elem: "body",
            color: '#F7F8FB'
        }, {
            elem: '.file-upload',
            color: 'white'
        }, {
            elem: '.pop-btn',
            color: 'white'
        }, {
            elem: ".list",
            color: '#ffffff'
        }, {
            elem: '.license',
            color: 'rgb(224, 230, 251)'
        }, {
            elem: '.email',
            color: 'rgb(224, 230, 251)'
        }
    ],
    font: [
        {
            elem: "body",
            color: '#7b9acc'
        }, {
            elem: '.license',
            color: 'rgb(86, 115, 235)'
        }, {
            elem: '.email',
            color: 'rgb(86, 115, 235)'
        }
    ]
};

var handler = new ThemeHandler(light,night);
handler.autoDetect();