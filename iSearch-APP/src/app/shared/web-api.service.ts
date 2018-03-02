import {Consts} from "./config";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {BlockUiService} from "./block-ui/block-ui.service";
import 'rxjs/Rx';
import {ToastsManager} from "ng2-toastr";
import {Router} from "@angular/router";
import {Document} from "../models/document.model";
import {ErrorHandlerService} from "./error-handler.service";

@Injectable()
export class WebApiService {

    constructor(private http:HttpClient,
                private blockUiService:BlockUiService,
                private toast:ToastsManager,
                private router:Router,
                private errorHandlerService:ErrorHandlerService) {}

    public uploadDocuments(urls:string[]) {

        this.blockUiService.start(Consts.BASIC_LOADING_MSG);

        let data = {
            documents: urls,
        };

        this.http.post(`${Consts.WEB_SERVICE_URL}/admin/uploadFiles`, data)
            .finally( () => this.blockUiService.stop() )
            .catch(error => {
                return this.errorHandlerService.handleHttpRequest(error, "Upload Failed");
            })
            .subscribe(
                (response) => {
                    this.toast.success("Document uploaded & scanned successfully", "Upload Succeeded");
                    this.router.navigate(["/admin-panel/view-documents"]);
                },
            );
    }

    public getDocuments() {

        this.blockUiService.start(Consts.BASIC_LOADING_MSG);

        return this.http.get(`${Consts.WEB_SERVICE_URL}/admin/getFiles`)
            .finally( () => this.blockUiService.stop() )
            .catch(error => {
                return this.errorHandlerService.handleHttpRequest(error, "Get documents Failed");
            })
    }

    toggleDocumentStatus(doc:Document) {
        this.blockUiService.start(Consts.BASIC_LOADING_MSG);

        let data = {
            documentId: doc['_id'],
            active: !doc.isActive,
        };

        this.http.patch(`${Consts.WEB_SERVICE_URL}/admin/toggleFile`, data)
            .finally( () => this.blockUiService.stop() )
            .catch(error => {
                return this.errorHandlerService.handleHttpRequest(error, "Switch Failed");
            })
            .subscribe(
                (response) => {
                    doc.isActive = !doc.isActive;
                    this.getDocuments().subscribe();
                    this.toast.success("Document switched successfully", "Switch Succeeded");
                },
            );
    }

    search(querySearch:string, soundex:boolean) {
        this.blockUiService.start(Consts.BASIC_LOADING_MSG);

        let paramsObj = new HttpParams()
            .append('querySearch', querySearch)
            .append('soundex', String(soundex));

        return this.http.get(`${Consts.WEB_SERVICE_URL}/search`, {params: paramsObj})
            .finally( () => this.blockUiService.stop() )
            .catch(error => {
                return this.errorHandlerService.handleHttpRequest(error, "Query Error");
            });
    }
}