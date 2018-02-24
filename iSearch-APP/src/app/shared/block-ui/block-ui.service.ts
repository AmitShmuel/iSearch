import {NgBlockUI} from "ng-block-ui";

export class BlockUiService {

    blockUi: NgBlockUI;

    setBlock(blockUI: NgBlockUI) {
        this.blockUi = blockUI;
    }

    start(msg: string) {
        this.blockUi.start(msg);
    }

    stop() {
        this.blockUi.stop();
    }

    reset() {
        this.blockUi.reset();
    }

    update(msg:string) {
        this.blockUi.update(msg);
    }
}
