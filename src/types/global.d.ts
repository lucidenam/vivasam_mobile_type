/// <reference types="vite/client" />

// 전역 타입 확장 정의
// Window, Document 등 전역 객체에 커스텀 속성 추가

interface Window {
  __PRELOADED_STATE__?: string;
  viewerClose?: () => void;
  popupClose?: () => void;
}

