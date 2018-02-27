import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {AdminPanelComponent} from "./admin-panel/admin-panel.component";
import {HelpComponent} from "./help/help.component";
import {SearchComponent} from "./search/search.component";
import {UploadDocumentsComponent} from "./admin-panel/upload-documents/upload-documents.component";
import {ViewDocumentsComponent} from "./admin-panel/view-documents/view-documents.component";
import {AuthComponent} from "./auth/auth.component";
import {AuthService} from "./auth/auth.service";

const APP_ROUTES:Routes = [
    {path: '', redirectTo: '/search', pathMatch: 'full'},
    {path: 'search', component: SearchComponent},
    {path: 'admin-panel', canActivate: [AuthService], component: AdminPanelComponent, children: [
            {path: '', redirectTo: 'view-documents', pathMatch: 'full'},
            {path: 'upload-documents', component: UploadDocumentsComponent},
            {path: 'view-documents', component: ViewDocumentsComponent},
        ]},
    {path: 'help', component: HelpComponent},
    {path: 'auth', component: AuthComponent},
];

@NgModule({
    imports: [
        RouterModule.forRoot(APP_ROUTES)
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {

    public static TITLES = {
        "search": "Search",
        "admin-panel": "Manage Files",
        "help": "Help",
        "admin-panel/view-documents": "Manage Files: View Documents",
        "admin-panel/upload-documents": "Manage Files: Upload Documents",
    };
}