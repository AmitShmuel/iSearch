import { Component, OnInit } from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {WebApiService} from "../../shared/web-api.service";

@Component({
    selector: 'app-upload-documents',
    templateUrl: './upload-documents.component.html',
    styleUrls: ['./upload-documents.component.css']
})
export class UploadDocumentsComponent implements OnInit {

    uploadDocumentsForm:FormGroup;
    documentControls:FormArray;

    constructor(private webApiService:WebApiService) { }

    ngOnInit() {
        this.uploadDocumentsForm = new FormGroup({
            'documents': new FormArray([
                new FormControl(null, Validators.required)
            ]),
        });
        this.documentControls = (<FormArray> (this.uploadDocumentsForm.get('documents')));
    }


    onAddDocument() {
        let newControl = new FormControl(null, Validators.required);
        this.documentControls.push(newControl);
    }

    onSubmit() {
        let documentUrls:string[] = [];
        for(let ctrl of this.documentControls.controls) {
            documentUrls.push(ctrl.value)
        }
        console.log(documentUrls);
        this.webApiService.uploadDocuments(documentUrls);
    }

    onRemoveDocument(index:number) {
        if(this.documentControls.length !== 1) {
            this.documentControls.removeAt(index);
        }
    }
}