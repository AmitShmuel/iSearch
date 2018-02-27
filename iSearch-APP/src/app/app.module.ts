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
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { UploadDocumentsComponent } from './admin-panel/upload-documents/upload-documents.component';
import { ViewDocumentsComponent } from './admin-panel/view-documents/view-documents.component';
import {WebApiService} from "./shared/web-api.service";
import {HttpClientModule} from "@angular/common/http";
import {BlockUIModule} from "ng-block-ui";
import { BlockUiComponent } from './shared/block-ui/block-ui.component';
import {BlockUiService} from "./shared/block-ui/block-ui.service";
import {ToastModule, ToastOptions} from "ng2-toastr";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {CustomToastOption} from "./shared/config";
import { ColorTextBooleanPipe } from './shared/color-text-boolean.pipe';
import { AuthComponent } from './auth/auth.component';
import {AuthService} from "./auth/auth.service";


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
        ViewDocumentsComponent,
        BlockUiComponent,
        ColorTextBooleanPipe,
        AuthComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        AngularFontAwesomeModule,
        AppRoutingModule,
        BlockUIModule,
        BrowserAnimationsModule,
        ToastModule.forRoot(),
    ],
    providers: [
        WebApiService,
        BlockUiService,
        AuthService,
        {provide: ToastOptions, useClass: CustomToastOption},
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
