import {Component, Input, OnInit} from '@angular/core';
import {Document} from '../shared/document.model';
import {WebApiService} from "../shared/web-api.service";
import {AuthService} from "../auth/auth.service";

@Component({
    selector: 'app-document-detail',
    templateUrl: './document-detail.component.html',
    styleUrls: ['./document-detail.component.css']
})
export class DocumentDetailComponent implements OnInit {

    @Input() document:Document;
    @Input() admin:boolean = false;

    constructor(private webApiService:WebApiService,
                private authService:AuthService) { }

    ngOnInit() {

    }

    onToggle() {
        if(this.authService.isAuthenticated()) {
            this.webApiService.toggleDocumentStatus(this.document);
        }
    }

}