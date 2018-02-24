import { Component, OnInit } from '@angular/core';
import {BlockUI, NgBlockUI} from "ng-block-ui";
import {BlockUiService} from "./block-ui.service";

@Component({
    selector: 'app-block-ui',
    templateUrl: './block-ui.component.html',
    styleUrls: ['./block-ui.component.css']
})
export class BlockUiComponent implements OnInit {

    @BlockUI() blockUI: NgBlockUI;

    constructor(private blockUiService:BlockUiService) {}

    ngOnInit() {
        this.blockUiService.setBlock(this.blockUI);
    }
}