import service from './service.jsx';

export class FileService {
    uploadFileToServer(data){
        //returns Promise object
        console.log("in FileService");
        return service.getRestClient().post('/api/files', data);
    }
}