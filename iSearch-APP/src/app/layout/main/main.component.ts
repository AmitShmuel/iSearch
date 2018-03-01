import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {AppRoutingModule} from "../../app-routing.module";
import "rxjs/add/operator/filter";

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

    titleText:string;

    constructor(private router:Router) {}

    ngOnInit() {
        this.router.events.filter(event => event instanceof NavigationEnd)
            .subscribe((event:NavigationEnd) => {
                this.titleText = AppRoutingModule.TITLES[event.urlAfterRedirects.slice(1)];
            });
    }
}