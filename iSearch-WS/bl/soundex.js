
String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
};

class Soundex {

    static generateCode(word) {

        let uppercaseWord = word.toLocaleUpperCase();
        let firstLetter = uppercaseWord[0];

        // convert letters to numeric code
        for (let i = 0; i < uppercaseWord.length; i++) {
            switch (uppercaseWord[i]) {

                case 'B':
                case 'F':
                case 'P':
                case 'V':
                    uppercaseWord = uppercaseWord.replaceAt(i, "1");
                    break;

                case 'C':
                case 'G':
                case 'J':
                case 'K':
                case 'Q':
                case 'S':
                case 'X':
                case 'Z':
                    uppercaseWord = uppercaseWord.replaceAt(i, "2");
                    break;

                case 'D':
                case 'T':
                    uppercaseWord = uppercaseWord.replaceAt(i, "3");
                    break;

                case 'L':
                    uppercaseWord = uppercaseWord.replaceAt(i, "4");
                    break;

                case 'M':
                case 'N':
                    uppercaseWord = uppercaseWord.replaceAt(i, "5");
                    break;

                case 'R':
                    uppercaseWord = uppercaseWord.replaceAt(i, "6");
                    break;

                default:
                    uppercaseWord = uppercaseWord.replaceAt(i, "0");
                    break;
            }
        }

        // remove duplicates
        let output = "" + firstLetter;
        for (let i = 1; i < uppercaseWord.length; i++) {
            if (uppercaseWord[i] !== uppercaseWord[i-1] && uppercaseWord[i] !== '0') {
                output += uppercaseWord[i];
            }
        }

        // pad with 0's or truncate
        output = output + "0000";
        return output.substring(0, 4);
    }
}

module.exports = Soundex;