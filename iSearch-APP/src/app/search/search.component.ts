import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {WebApiService} from "../shared/web-api.service";
import {Document} from "../models/document.model";
import {ToastsManager} from "ng2-toastr";

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

    searchForm:FormGroup;
    documents:Document[] = [];
    searchString = "";

    constructor(private webApiService:WebApiService,
                private toast:ToastsManager) { }

    ngOnInit() {
        this.searchForm = new FormGroup({
            'search': new FormControl(null, Validators.required),
            'isSoundex': new FormControl(false),
        });
    }

    onSearch() {
        let querySearch = this.searchForm.value.search;
        let isSoundex = this.searchForm.value.isSoundex;

        this.webApiService.search(querySearch, isSoundex)
            .subscribe(
                (response:any) => {
                    this.documents = response;
                    if(this.documents.length === 0) {
                        this.toast.warning(`No result was found from ${querySearch}`, "Empty Results");
                    }
                    this.searchString = querySearch;
                }
            );
    }

    onClear() {
        this.searchForm.reset();
        this.documents = [];
    }
}