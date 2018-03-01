import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'colorTextBoolean'
})
export class ColorTextBooleanPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        return value ? "Enabled" : "Disabled";
    }

}
