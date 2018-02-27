import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../auth/auth.service";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {

    constructor(private authService:AuthService) { }

    signout() {
        this.authService.signout();
    }

    isAuth() {
        return this.authService.isAuthenticated();
    }
}