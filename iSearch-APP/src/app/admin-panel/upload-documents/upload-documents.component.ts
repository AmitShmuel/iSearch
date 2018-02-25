import { Component, OnInit } from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {WebApiService} from "../../shared/web-api.service";
import {AbstractControl} from "@angular/forms/src/model";
import {Consts} from "../../shared/config";

@Component({
    selector: 'app-upload-documents',
    templateUrl: './upload-documents.component.html',
    styleUrls: ['./upload-documents.component.css']
})
export class UploadDocumentsComponent implements OnInit {

    uploadDocumentsForm:FormGroup;
    documentFormArray:FormArray;
    documentControls:AbstractControl[];

    constructor(private webApiService:WebApiService) { }

    ngOnInit() {
        this.uploadDocumentsForm = new FormGroup({
            'documents': new FormArray([
                new FormControl(null, [
                    Validators.required, this.validateUrl.bind(this)
                    ])
            ]),
        });
        this.documentFormArray = (<FormArray> (this.uploadDocumentsForm.get('documents')));
        this.documentControls = this.documentFormArray.controls;
    }

    onAddDocument() {
        let newControl = new FormControl(null, [
            Validators.required, this.validateUrl.bind(this)
        ]);
        this.documentFormArray.push(newControl);
    }

    onSubmit() {
        let documentUrls:string[] = [];
        for(let ctrl of this.documentControls) {
            documentUrls.push(ctrl.value)
        }
        console.log(documentUrls);
        this.webApiService.uploadDocuments(documentUrls);
    }

    onRemoveDocument(index:number) {
        if(this.documentFormArray.length !== 1) {
            this.documentFormArray.removeAt(index);
        }
    }

    validateUrl(control:FormControl): {[s:string]: boolean} {
        if(!(control.value && control.value.startsWith(`${Consts.SOURCE_DOCOUMENTS_URL}`))) {
            return {'urlIsForbidden': true};
        }
        return null;
    }
}