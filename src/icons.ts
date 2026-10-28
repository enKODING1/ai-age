// Phosphor Icons (Bold, MIT) — 빌드 때 SVG 를 그대로 넣어 OS 마다 모양이 다른 이모지 대신 쓴다
import aperture from '@phosphor-icons/core/assets/bold/aperture-bold.svg?raw';
import arrowCounterClockwise from '@phosphor-icons/core/assets/bold/arrow-counter-clockwise-bold.svg?raw';
import chartBar from '@phosphor-icons/core/assets/bold/chart-bar-bold.svg?raw';
import cpu from '@phosphor-icons/core/assets/bold/cpu-bold.svg?raw';
import deviceMobile from '@phosphor-icons/core/assets/bold/device-mobile-bold.svg?raw';
import globeSimple from '@phosphor-icons/core/assets/bold/globe-simple-bold.svg?raw';
import imageSquare from '@phosphor-icons/core/assets/bold/image-square-bold.svg?raw';
import instagramLogo from '@phosphor-icons/core/assets/bold/instagram-logo-bold.svg?raw';
import lightning from '@phosphor-icons/core/assets/bold/lightning-bold.svg?raw';
import lockSimple from '@phosphor-icons/core/assets/bold/lock-simple-bold.svg?raw';
import magnifyingGlass from '@phosphor-icons/core/assets/bold/magnifying-glass-bold.svg?raw';
import moon from '@phosphor-icons/core/assets/bold/moon-bold.svg?raw';
import shareNetwork from '@phosphor-icons/core/assets/bold/share-network-bold.svg?raw';
import shieldCheck from '@phosphor-icons/core/assets/bold/shield-check-bold.svg?raw';
import sparkle from '@phosphor-icons/core/assets/bold/sparkle-bold.svg?raw';
import sun from '@phosphor-icons/core/assets/bold/sun-bold.svg?raw';
import uploadSimple from '@phosphor-icons/core/assets/bold/upload-simple-bold.svg?raw';
import userFocus from '@phosphor-icons/core/assets/bold/user-focus-bold.svg?raw';
import videoCamera from '@phosphor-icons/core/assets/bold/video-camera-bold.svg?raw';
import warning from '@phosphor-icons/core/assets/bold/warning-bold.svg?raw';
import x from '@phosphor-icons/core/assets/bold/x-bold.svg?raw';

export const ICONS = {
    aperture,
    'arrow-counter-clockwise': arrowCounterClockwise,
    'chart-bar': chartBar,
    cpu,
    'device-mobile': deviceMobile,
    'globe-simple': globeSimple,
    'image-square': imageSquare,
    'instagram-logo': instagramLogo,
    lightning,
    'lock-simple': lockSimple,
    'magnifying-glass': magnifyingGlass,
    moon,
    'share-network': shareNetwork,
    'shield-check': shieldCheck,
    sparkle,
    sun,
    'upload-simple': uploadSimple,
    'user-focus': userFocus,
    'video-camera': videoCamera,
    warning,
    x,
};

export type IconName = keyof typeof ICONS;
