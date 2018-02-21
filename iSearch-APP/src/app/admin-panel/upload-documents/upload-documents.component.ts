import { Component, OnInit } from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
    selector: 'app-upload-documents',
    templateUrl: './upload-documents.component.html',
    styleUrls: ['./upload-documents.component.css']
})
export class UploadDocumentsComponent implements OnInit {

    uploadDocumentsForm:FormGroup;
    documentControls:FormArray;

    constructor() { }

    ngOnInit() {
        this.uploadDocumentsForm = new FormGroup({
            'documents': new FormArray([
                new FormControl(null, Validators.required)
            ]),
        });
        this.documentControls =  (<FormArray> (this.uploadDocumentsForm.get('documents')));
    }


    onAddDocument() {
        let newControl = new FormControl(null, Validators.required);
        this.documentControls.push(newControl);
    }

    onSubmit() {

    }

    onRemoveDocument(index:number) {
        if(this.documentControls.length !== 1) {
            this.documentControls.removeAt(index);
        }
    }
}