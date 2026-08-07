// Web preview and same-machine testing can reach the backend via localhost.
// Testing on a physical device or a native simulator instead requires
// swapping this for your machine's LAN IP (e.g. http://192.168.1.20:5050/api),
// since "localhost" on a device refers to the device itself, not this Mac.
export const API_BASE_URL = 'http://localhost:5050/api';
