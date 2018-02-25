import {Consts} from "./config";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {BlockUiService} from "./block-ui/block-ui.service";
import 'rxjs/Rx';
import {ToastsManager} from "ng2-toastr";
import {Router} from "@angular/router";

@Injectable()
export class WebApiService {

    constructor(private http:HttpClient,
                private blockUiService:BlockUiService,
                private toast:ToastsManager,
                private router:Router) {}

    public uploadDocuments(urls:string[]) {

        this.blockUiService.start(Consts.BASIC_LOADING_MSG);

        let data = {
            documents: urls,
        };

        this.http.post(`${Consts.WEB_SERVICE_URL}/admin/uploadFiles`, data)
            .finally( () => this.blockUiService.stop() )
            .subscribe(
                (response) => {
                    console.log(response);
                    this.toast.success("Document uploaded & scanned successfully", "Upload Succeed");
                    this.router.navigate(["/admin-panel/view-documents"]);
                },
                (error) => {
                    console.log(error);
                    this.toast.error(error, "Upload Failed");
                },
            );
    }

    public getDocuments() {

        this.blockUiService.start(Consts.BASIC_LOADING_MSG);

        return this.http.get(`${Consts.WEB_SERVICE_URL}/admin/getFiles`)
            .finally( () => this.blockUiService.stop() );
    }
}