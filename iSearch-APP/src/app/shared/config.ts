import {ToastOptions} from "ng2-toastr";


export class Consts {

    public static readonly WEB_SERVICE_URL = "http://localhost:3000";
    public static readonly SOURCE_DOCOUMENTS_URL ="http://www.poetry-archive.com";
    public static readonly BASIC_LOADING_MSG = "Loading...";
}

export class CustomToastOption extends ToastOptions {
    animate = 'flyLeft'; // you can override any options available
    newestOnTop = false;
    showCloseButton = true;
    positionClass = 'toast-bottom-left';
    toastLife = 3500;
}