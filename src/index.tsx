import { createRoot } from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import type { Store } from 'redux';
import App from './App';
import MaintenanceNotice from './components/MaintenanceNotice';
// CSS 파일 임포트
import './css/common.css';
import './css/slick.css';
import './css/slick-theme.css';
import configure from './store/configure';
import transit from 'transit-immutable-js';
import { BlockDebug } from "./lib/PreventUtil";
import { IS_UC_LOCK } from "./constants/index";

const preloadedState = window.__PRELOADED_STATE__ ? transit.fromJSON(window.__PRELOADED_STATE__) : undefined;
const store: Store = configure(preloadedState);

let isHandlingHashChange = false;

const handleHashChange = (): void => {
    if (isHandlingHashChange) {
        isHandlingHashChange = false;
        return;
    }

    const rawHash = window.location.hash;
    const message = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;

    //뷰어,팝업이 열려있는 상태에서 뒤로가기 막음
    if (message && message.includes("true") && message.split("|")[0]) {
        //return url값이 있는경우 (login page)
        if (message.includes("returnUrl=true")) {
            window.viewerClose?.();
            return;

            //뷰어 팝업 모두 열려있는경우  우선순위는 팝업 > 뷰어
        } else if (message.includes("popup=true") && message.includes("viewer=true") && window.popupClose) {
            window.popupClose();

            //팝업 뷰어 각각 한개씩 종료시킴
        } else {
            if (message.includes("popup=true") && window.popupClose) window.popupClose();
            if (message.includes("viewer=true") && window.viewerClose) window.viewerClose();
        }
        isHandlingHashChange = true;
        window.location.hash = message.split("|")[0];
        const scrollY = Number(message.split("|scrollY=").pop() ?? 0);
        window.scrollTo(0, scrollY);
    }
};

window.addEventListener('hashchange', handleHashChange);

if (process.env.NODE_ENV === 'production') {
    try {
        const ho: string = window.location.hostname !== undefined ? window.location.hostname : "";
        // console.log('ho :: ' + ho);
        if (ho.toLowerCase().trim() === 'mv.vivasam.com') {
            BlockDebug(false);
        }
    } catch (e) {
        // 에러 처리
    }
}

const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(
        <Provider store={store}>
            <Router>
                {!IS_UC_LOCK ? <App /> : <MaintenanceNotice />}
            </Router>
        </Provider>
    );
}
