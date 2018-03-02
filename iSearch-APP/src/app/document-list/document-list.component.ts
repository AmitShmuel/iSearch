import {Component, Input, OnInit} from '@angular/core';
import {Document} from '../models/document.model';

@Component({
    selector: 'app-document-list',
    templateUrl: './document-list.component.html',
    styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit {

    @Input() documents:Document[];
    @Input() isAdmin:boolean = false;
    @Input() highlight:string = null;

    p:number = 1;

    constructor() { }

    ngOnInit() {
    }
}