import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import 'rxjs/Rx';
import {BlockUiService} from "../shared/block-ui/block-ui.service";
import {ToastsManager} from "ng2-toastr";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Consts} from "../shared/config";
import {Observable} from "rxjs/Observable";
import {ErrorHandlerService} from "../shared/error-handler.service";

@Injectable()
export class AuthService implements CanActivate {

    token:string = null;

    constructor(private http:HttpClient,
                private blockUiService:BlockUiService,
                private toast:ToastsManager,
                private router:Router,
                private errorHandlerService:ErrorHandlerService) {

        // Load token from the Local Storage
        this.token = localStorage.getItem('token');
    }

    signin(password:string, isRememberMe:boolean) {

        this.blockUiService.start(Consts.BASIC_LOADING_MSG);

        let data = {
            password: password
        };

        this.http.post(`${Consts.WEB_SERVICE_URL}/admin/getToken`, data)
            .finally( () => this.blockUiService.stop() )
            .catch(error => {
                return this.errorHandlerService.handleHttpRequest(error, "Login Failed");
            })
            .subscribe(
                (data) => {

                    // Setting the token according to response
                    this.token = data['token'];

                    // if isRememberMe => Saving the token in LocalStorage
                    if(isRememberMe) {
                        localStorage.setItem('token', this.token);
                    }

                    this.toast.success("Login as admin succeeded", "Login Succeeded");
                    this.router.navigate(["/admin-panel"]);
                },
            );
    }

    signout() {
        localStorage.clear();
        this.token = null;
        this.router.navigate(["/"]);
    }

    isAuthenticated() {
        return this.token != null;
    }

    canActivate(route:ActivatedRouteSnapshot, state:RouterStateSnapshot)
    : Observable<boolean> | Promise<boolean> | boolean {
        if(!this.isAuthenticated()) {
            this.router.navigate(["/auth"]);
            return false;
        }
        return true;
    }
}