import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'highlight',
})
export class HighlightPipe implements PipeTransform {

    transform(text:string, search:string): any {

        let searchArray = search.split(" ");

        for(let se of searchArray) {
            // b - for full Match word
            let regex = new RegExp("\\b" + se + "\\b", 'gi');
            text = text.replace(regex,
                (match, contents, offset, input_string) => {
                return "<strong><mark>" + match + "</mark></strong>";
            });
        }

        return text.concat("<br>");
    }
}