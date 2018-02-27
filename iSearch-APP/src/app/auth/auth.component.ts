import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "./auth.service";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

    @ViewChild('f') signInForm:NgForm;

    constructor(private authService:AuthService) { }

    ngOnInit() {
    }

    onSubmit() {
        let password = this.signInForm.value.password;
        let isRememberMe = this.signInForm.value.rememberMe;

        this.authService.signin(password, isRememberMe);
    }
}