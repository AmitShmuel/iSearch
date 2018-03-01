import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {WebApiService} from "../shared/web-api.service";
import {Document} from "../models/document.model";

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

    searchForm:FormGroup;
    documents:Document[] = [];
    searchString = "";

    constructor(private webApiService:WebApiService) { }

    ngOnInit() {
        this.searchForm = new FormGroup({
           'search': new FormControl(null, Validators.required),
        });
    }

    onSearch() {
        let querySearch = this.searchForm.value.search;

        this.webApiService.search(querySearch)
            .subscribe(
                (response:any) => {
                    console.log(response);
                    this.documents = response;
                    this.searchString = querySearch;
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    onClear() {
        this.searchForm.reset();
        this.documents = [];
    }
}