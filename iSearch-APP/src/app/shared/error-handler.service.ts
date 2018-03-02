import {Injectable} from "@angular/core";
import {ToastsManager} from "ng2-toastr";
import {Observable} from "rxjs/Observable";

@Injectable()
export class ErrorHandlerService {

    constructor(private toast:ToastsManager) {}

    handleHttpRequest(error, title?:string) {

        console.log(error);
        if(error.status === 0) {
            this.toast.error("The server is currently down", "Server is down");
        }
        else {
            this.toast.error(error.error, title);
        }
        return Observable.throw(error);
    }
}