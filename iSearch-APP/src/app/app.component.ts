import {Component, OnInit} from '@angular/core';
import {NavigationStart, Router} from "@angular/router";
import "rxjs/add/operator/filter";
import {AppRoutingModule} from "./app-routing.module";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    titleText:string;

    constructor(private router:Router) {}

    ngOnInit() {
        this.router.events.filter(event => event instanceof NavigationStart)
            .subscribe((event:NavigationStart) => {
                // console.log(event);
                this.titleText = AppRoutingModule.TITLES[event.url.slice(1)];
            });
    }
}
