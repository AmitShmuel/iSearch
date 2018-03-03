import { Component } from '@angular/core';
import {AuthService} from "../auth/auth.service";

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.css']
})
export class HelpComponent {

    constructor(private authService:AuthService) { }

    isAuth() {
        return this.authService.isAuthenticated();
    }

}