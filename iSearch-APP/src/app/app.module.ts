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


@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        FooterComponent,
        HelpComponent,
        AdminPanelComponent,
        SearchComponent,
        MainComponent
    ],
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        AngularFontAwesomeModule,
        AppRoutingModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
