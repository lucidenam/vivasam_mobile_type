import type {Store} from 'redux';
import {createStore} from 'redux';

// 임시 Redux store 설정
// 실제 구현에 맞게 수정 필요
export default function configure(preloadedState?: any): Store {
  // 임시 reducer
  const rootReducer = (state: any = preloadedState || {}) => state;
  
  return createStore(rootReducer, preloadedState);
}

