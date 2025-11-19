import React from 'react';

export interface MaintenanceNoticeProps {
    // 필요한 props가 있다면 여기에 추가
}

export default class MaintenanceNotice extends React.Component<MaintenanceNoticeProps> {
    componentDidMount(): void {
        const body = document.getElementById('loading');
        if (body) {
            body.remove();
        }
    }

    render(): React.ReactElement {
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

