import {Consts} from "./consts";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {BlockUiService} from "./block-ui/block-ui.service";
import 'rxjs/Rx';

@Injectable()
export class WebApiService {

    constructor(private http:HttpClient,
                private blockUiService:BlockUiService) {}

    public uploadDocuments(urls:string[]) {

        this.blockUiService.start(Consts.BASIC_LOADING_MSG);

        let data = {
            documents: urls,
        };

        this.http.post(`${Consts.WEB_SERVICE_URL}/admin/uploadFiles`, data)
            .finally(
                () => this.blockUiService.stop()
            )
            .subscribe(
                (response) => console.log(response),
                (error) => console.log(error),
            );
    }
}