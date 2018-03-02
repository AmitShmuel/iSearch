import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'highlight',
})
export class HighlightPipe implements PipeTransform {

    isEmptyOrSpaces(str){
        return str == null || str.match(/^ *$/) != null;
    }

    transform(text:string, search:string): any {

        let searchArray = search.replace(/[^a-zA-Z ]/g, "").split(" ");
        for(let i = 0; i < searchArray.length; i++) {
            searchArray[i] = searchArray[i].trim();
        }

        for(let se of searchArray) {
            if(!this.isEmptyOrSpaces(se)) {
                // b - for full Match word
                let regex = new RegExp("\\b" + se + "\\b", 'gi');
                text = text.replace(regex,
                    (match, contents, offset, input_string) => {
                        return "<strong><mark>" + match + "</mark></strong>";
                    });
            }
        }

        return text.concat("<br>");
    }
}