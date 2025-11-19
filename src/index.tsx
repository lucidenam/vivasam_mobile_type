import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import type { Store } from 'redux';
import App from './App';
// CSS 파일 임포트
import './css/common.css';
import './css/slick.css';
import './css/slick-theme.css';
import configure from './store/configure';
// @ts-ignore
import transit from 'transit-immutable-js';
import { BlockDebug } from "./lib/PreventUtil";
import { IS_UC_LOCK } from "./constants/index";

const preloadedState = window.__PRELOADED_STATE__ ? transit.fromJSON(window.__PRELOADED_STATE__) : undefined;
const store: Store = configure(preloadedState);

// getUserConfirmation 함수 - react-router-dom v7에서는 지원되지 않음
// 필요시 useBlocker 훅 또는 hashchange 이벤트 리스너로 재구현 필요

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

// Block Page (Just In Case)
// 사용되지 않는 컴포넌트 - 필요시 주석 해제
interface UCProps {
    // 필요한 props가 있다면 여기에 추가
}

class UC extends React.Component<UCProps> {
    constructor(props: UCProps) {
        super(props);
    }

    componentDidMount(): void {
        const body = document.getElementById("loading");
        if (body) {
            body.remove();
        }
    }

    render(): React.ReactElement {
        // styleComponent 임시
        const btnStyle: React.CSSProperties = {
            color: "white",
            background: "teal",
            padding: ".375rem .75rem",
            border: "1px solid teal",
            borderRadius: ".25rem",
            fontSize: "1rem",
            textAlign: "center",
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
        };
        const letters: string = `비바샘 모바일 초등 점검중입니다.\n감사합니다.`;
        return <div style={btnStyle}>{letters}</div>;
    }
}


const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    const MainComponent = !IS_UC_LOCK ? <App /> : <UC />;
    root.render(
        // <Provider store={store}>
        // <Router>
        //     <App />
        // </Router>
        // </Provider>
        <Provider store={store}>
            {/* @ts-ignore - HashRouter accepts children but types don't reflect it */}
            <Router>
                {MainComponent}
            </Router>
        </Provider>
    );
}
