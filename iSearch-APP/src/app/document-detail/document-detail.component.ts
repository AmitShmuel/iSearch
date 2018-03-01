import {Component, Input, OnInit} from '@angular/core';
import {Document} from '../models/document.model';
import {WebApiService} from "../shared/web-api.service";
import {AuthService} from "../auth/auth.service";

@Component({
    selector: 'app-document-detail',
    templateUrl: './document-detail.component.html',
    styleUrls: ['./document-detail.component.css']
})
export class DocumentDetailComponent implements OnInit {

    @Input() document:Document;
    @Input() isAdmin:boolean = false;
    @Input() highlight:string = null;

    content:string[] = [];

    constructor(private webApiService:WebApiService,
                private authService:AuthService) { }

    ngOnInit() {
        this.content = this.document.contentDescription.split(" \n").filter(s => s.length > 1);
    }

    onToggle() {
        if(this.authService.isAuthenticated()) {
            this.webApiService.toggleDocumentStatus(this.document);
        }
    }

}