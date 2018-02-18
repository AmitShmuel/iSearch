import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import {AngularFontAwesomeModule} from "angular-font-awesome";
import { FooterComponent } from './footer/footer.component';
import { HelpComponent } from './help/help.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import {AppRoutingModule} from "./app-routing.module";
import { SearchComponent } from './search/search.component';


@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        FooterComponent,
        HelpComponent,
        AdminPanelComponent,
        SearchComponent
    ],
    imports: [
        BrowserModule,
        AngularFontAwesomeModule,
        AppRoutingModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
