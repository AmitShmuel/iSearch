import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {WebApiService} from "../shared/web-api.service";
import {Document} from "../shared/document.model";

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

    searchForm:FormGroup;
    documents:Document[] = [];

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
                },
                (error) => {
                    console.log(error);
                }
            );
    }
}