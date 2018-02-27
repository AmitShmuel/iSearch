import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import 'rxjs/Rx';
import {BlockUiService} from "../shared/block-ui/block-ui.service";
import {ToastsManager} from "ng2-toastr";
import {Router} from "@angular/router";
import {Consts} from "../shared/config";

@Injectable()
export class AuthService {

    private token;

    constructor(private http:HttpClient,
                private blockUiService:BlockUiService,
                private toast:ToastsManager,
                private router:Router) {

        // Try to load token from the Local Storage
    }

    login(password:string, isRememberMe:boolean) {

        this.blockUiService.start(Consts.BASIC_LOADING_MSG);

        let data = {
            password: password
        };

        this.http.post('getToken', data)
            .finally( () => this.blockUiService.stop() )
            .subscribe(
            (response) => {
                console.log(response);

                // Setting the token according to response
                // if isRememberMe => Saving the token in LocalStorage

                this.toast.success("Login as admin succeed", "Login Succeed");
                this.router.navigate(["/admin-panel"]);
            },
            (error) => {
                console.log(error);
                this.toast.error(error, "Login Failed");
            },

        )
    }

    isAuthenticated() {
        return this.token != null;
    }
}