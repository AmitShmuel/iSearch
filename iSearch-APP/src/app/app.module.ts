import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import {AngularFontAwesomeModule} from "angular-font-awesome";
import { FooterComponent } from './layout/footer/footer.component';
import { HelpComponent } from './help/help.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import {AppRoutingModule} from "./app-routing.module";
import { SearchComponent } from './search/search.component';
import { MainComponent } from './layout/main/main.component';
import {ReactiveFormsModule} from "@angular/forms";
import { UploadDocumentsComponent } from './admin-panel/upload-documents/upload-documents.component';
import { ViewDocumentsComponent } from './admin-panel/view-documents/view-documents.component';
import {WebApiService} from "./shared/web-api.service";
import {HttpClientModule} from "@angular/common/http";


@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        FooterComponent,
        HelpComponent,
        AdminPanelComponent,
        SearchComponent,
        MainComponent,
        UploadDocumentsComponent,
        ViewDocumentsComponent
    ],
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        AngularFontAwesomeModule,
        AppRoutingModule,
    ],
    providers: [WebApiService],
    bootstrap: [AppComponent]
})
export class AppModule { }
