/**
 *
 * @repository		https://github.com/enkoding1/ThemeHandler
 * @author		    SeongJIN Kang - enKODING
 * @version 	    1.0 (2021/09/29)
 * @license		    MIT License
 */
 export class ThemeHandler {
    constructor(light_mode, night_mode) {
        this.light = light_mode;
        this.night = night_mode;
        this.control_mode = window.matchMedia && window
            .matchMedia(
                '(prefers-color-scheme: dark)'
            )
            .matches;
        this.mode_dark = "night";
        this.mode_white = "light"
        this.theme_mode = this.mode_white;
        this.detectTheme();
    }

    //백그라운드 컬러 변경
    Background = (dom, color) => {
        let dom_arr = document.querySelectorAll(dom);
        dom_arr.forEach((elem) => {
            elem.style.backgroundColor = color
        })
    }

    //폰트 컬러 변경
    FontColor = (dom, color) => {
        let dom_arr = document.querySelectorAll(dom);
        dom_arr.forEach((elem) => {
            elem.style.color = color
        })
    }

    themeHandler = (bg_handler, ft_handler) => {
        //배경화면 변경
        bg_handler.map((mode) => {
            `${this.Background(mode.elem, mode.color)}`
        });
        //폰트 변경
        ft_handler.map((mode) => {
            `${this.FontColor(mode.elem, mode.color)}`
        });
    }

    //리로딩시 테마 감지
    detectTheme = () => {
        if (this.control_mode === true) {
            this.themeHandler(this.night.background, this.night.font);
            this.theme_mode = this.mode_white;
        } else {
            this.themeHandler(this.light.background, this.light.font);
            this.theme_mode = this.mode_dark;

        }
    }

    //실시간으로 테마를 감지 후 변경
    autoDetect = () => {
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', () => {

                this.control_mode = window.matchMedia && window
                    .matchMedia(
                        '(prefers-color-scheme: dark)'
                    )
                    .matches;

                if (this.control_mode === true) {
                    this.themeHandler(this.night.background, this.night.font);
                    this.theme_mode = this.mode_white;

                } else {
                    this.themeHandler(this.light.background, this.light.font);
                    this.theme_mode = this.mode_dark;

                }
            })
    }

    currentMode = () => {

        if (this.theme_mode === this.mode_white) {
            return this.mode_dark;
        } else {
            return this.mode_white;
        }
    }

    changeTheme = (theme_mode) => { //'white' or 'black'
        if (theme_mode === this.mode_white) {
            this.themeHandler(this.light.background, this.light.font);
            this.theme_mode = this.mode_dark;
        } else if (theme_mode === this.mode_dark) {
            this.themeHandler(this.night.background, this.night.font);
            this.theme_mode = this.mode_white;
        } else {
            console.error(
                `error, theme mode is support only ${this.mode_white} or ${this.mode_dark}`
            )
            console.warn(
                `ex) handler.changeTheme('${this.mode_white}' or '${this.mode_dark}')`
            )
        }
    }

}
