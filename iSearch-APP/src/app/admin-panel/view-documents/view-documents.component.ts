import { Component, OnInit } from '@angular/core';
import {WebApiService} from "../../shared/web-api.service";

@Component({
    selector: 'app-view-documents',
    templateUrl: './view-documents.component.html',
    styleUrls: ['./view-documents.component.css']
})
export class ViewDocumentsComponent implements OnInit {

    // TODO: Recieve document on Init

    constructor(private webApiService:WebApiService) { }

    ngOnInit() {
    }
}