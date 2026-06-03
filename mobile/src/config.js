import Constants from 'expo-constants';

// Expo Go 디버깅 환경에서 Metro 개발 서버의 호스트 IP를 감지
// 배포 환경이거나 호스트 IP를 찾을 수 없는 경우 localhost:3000를 기본값으로 사용
const getBackendUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:3000`;
  }
  return 'http://localhost:3000';
};

export const BASE_URL = getBackendUrl();
export const SOCKET_URL = BASE_URL;

console.log('Detected Backend URL:', BASE_URL);
