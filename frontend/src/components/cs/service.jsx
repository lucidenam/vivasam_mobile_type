import axios from 'axios';
import {SERVER_LOCAL_IMAGE_PATH} from "../../constants/index";

class Service {

    constructor() {
        //console.log("Service is constructed");
    }

    getRestClient() {
        if (!this.serviceInstance) {
            this.serviceInstance = axios.create({
                method: 'post',
                timeout: 10000,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }
        return this.serviceInstance;
    }
}

export default (new Service());