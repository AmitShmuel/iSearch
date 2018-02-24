import {Consts} from "./consts";
import {HttpClient} from "@angular/common/http";

export class WebApiService {

    constructor(private http:HttpClient) {}

    public uploadDocuments(urls:string[]) {
        let data = {
            documents: urls,
        };

        this.http.post(`${Consts.WEB_SERVICE_URL}/admin/uploadFiles`, data)
            .subscribe(
                (response) => console.log(response),
                (error) => console.log(error)
            );
    }
}