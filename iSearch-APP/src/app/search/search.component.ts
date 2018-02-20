import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

    searchForm:FormGroup;

    constructor() { }

    ngOnInit() {
        this.searchForm = new FormGroup({
           'search': new FormControl(null, Validators.required),
        });
    }

    onSearch() {
        console.log(this.searchForm);
        console.log("Search Clicked...");
    }
}