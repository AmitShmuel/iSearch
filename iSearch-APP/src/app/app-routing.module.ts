import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {AdminPanelComponent} from "./admin-panel/admin-panel.component";
import {HelpComponent} from "./help/help.component";
import {SearchComponent} from "./search/search.component";

const APP_ROUTES:Routes = [
    {path: '', redirectTo: '/search', pathMatch: 'full'},
    {path: 'search', component: SearchComponent},
    {path: 'admin-panel', component: AdminPanelComponent},
    {path: 'help', component: HelpComponent},
];

@NgModule({
    imports: [
        RouterModule.forRoot(APP_ROUTES)
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {}