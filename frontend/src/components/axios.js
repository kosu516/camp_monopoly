import _axios from "axios";
import { demoAdapter } from "../demo/api";
import { isDemo } from "../demo/mode";

const instance = _axios.create(isDemo ? { adapter: demoAdapter } : {
  baseURL: process.env.REACT_APP_API_URL || "/api",
  timeout: 2000,
});

export default instance;
