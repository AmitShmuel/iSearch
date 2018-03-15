![iSearch](/readme_assets/logo_icon_big.png)

## Search Engine Made for Information Retrieval Course in Shenkar, College of Engineering & Design

#### Authors: YoavSaroya & AmitShmuel

# [Go To App](https://saroyaman.github.io/iSearch/#/help)

##### Database Structure:
![DB Structure](/readme_assets/erd.png)

##### Document Structure:

###### The documents in our program consist of the following:

**Url**: The url supplied when this document was uploaded
**Title**: The title of the song
**Song name**
**Author**: The author of the song
**Description**: The description of the song taken from the description META tag
**Content description**: The first 3 lines of the song
**Active flag**: Signifies whether this document is hidden from searches or not


##### Program Structure:
###### The program is divided into two main projects:


**The web application** - which is the application the user interacts with and the requests are being sent from. 

**The web server** - where the requests are being handled (by controllers) and where the models are defined.
Under the Controllers folder in this project you will find:
* Admin controller:
	* Getting the document from the link and parsing it
	* Creating the index file and inverted index file
	* Saving the documents and the terms in the database
	* Getting all the documents to the admin
	* Activating and deactivating documents
* Search controller:
	* Query validations
	* Query parsing
	* Combine soundex and stemming
	* Supports binary operators and parentheses in the query
	* Getting the relevant documents from the query’s words

