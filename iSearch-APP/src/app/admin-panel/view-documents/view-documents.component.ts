import { Component, OnInit } from '@angular/core';
import {WebApiService} from "../../shared/web-api.service";
import {Document} from "../../models/document.model";

@Component({
    selector: 'app-view-documents',
    templateUrl: './view-documents.component.html',
    styleUrls: ['./view-documents.component.css']
})
export class ViewDocumentsComponent implements OnInit {

    documents:Document[] = null;

    constructor(private webApiService:WebApiService) { }

    ngOnInit() {
        this.webApiService.getDocuments().subscribe(
            (documents:Document[]) => {
                this.documents = documents;
            },
        );
    }
}