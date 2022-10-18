/*
- implement a search feature
- implement a tagging feature
  - allows you to create tags, such as `marketing` `sales`, `engineering`, when you add/edit a contact you can select a tag to attach to the contact
  - you can click on a tag, and show all the contacts with that tag

Note:
  - a difference between the project in the link and the one you'll develop is that your application will
  have an API server to store and retrieve the contact


structure of page:
title, contact Manager

add contact button
- if 

search bar textArea


An area where all the contacts appear:
  - if there are no contacts
  - show a message, there are no contacts, with a larger button 
  - in the contacts area


  once a contact is created,
  - each will have an edit and delete button

  - edit button: when clicked, edit form will be dragged up into user view
    edit page will show the 3 input fields: ALL inputs are validaed
      - full name

      - email address
        - validates emai l at , must have @ and end with `.com`

      - telephone number
  
  - when delete button clicked, alert pops up to confirm user action
    user form submitted asynchronously and deleted

API:-
- deleting a contact:
    DELETE  /api/contacts/:id
    takes an `id` field : integer 
    successful: 204 No content
    error: 400 contact not found'

- get all contacts: JSON format response
  GET api/contacts
    retunns an arr of contact objects
    success 200 OK
      - [{id: integer, full_name, email, phone_number, tags}, {}, {}...] (rest are strings)
    error: 4xx Cannot find contact

- retrieve a single contact: JSON
  GET api/contacts
    contact object {id: integer, full_name, email, phone_number, tags(comma-separated string)}
  - 200 OK
- save a Contact
  POST api/contacts
    params: {full_name, email, phone_number, tags}
  success 201, returns contact object created
  error 4xx (cannot find contact), won't happen you validate inputs

  update a contact
  POST /api/contact/:id - integer
  - ACCEPTS JSON or query string as request body
  - preserves previous value of attribuets that are not presen
    - updated data
      params:
        {id, full_name, email, phone_number, tags}
    success: 201: updated contact object
    error: 4xx bad request


NOW for CSS & HTML
  - everything will be on the page, or everything will be generated
    on the same page

  - handlebars? yes
  -  you can add data-id attributes
  - can add all the relevant info, specifically id

but as for the actual project structure: visually speaking
  - generate all with javascript?
  - too much

  most handlebars? ok. sure but what structures
  scripts will all be made by handlebars
  specifically
    - create and update scripts are nearly identical
  forms:  each form will have a submit and cancel button
  - the cancel button will take it back to the main page, 
    - create
    - delete
    - update

  forms will be dynamically created etc
  search by tags will be a select
 
*/

let testVar = 'ok';

class searchItems {

}

class itemList {
  constructor(items, display) {
    this.handlebarsCompilation();
    this.items = items;
    this.display = display;

  }

  handlebarsCompilation() {
    this.itemsListTemplate = Handlebars.compile(document.getElementById('contacts').innerHTML);
    this.itemListFormTemplate = Handlebars.compile(document.getElementById('form').innerHTML);
    this.itemTagsTemplate = Handlebars.compile(document.getElementById('tags').innerHTML);
  }
}


document.addEventListener('DOMContentLoaded', function(event) {
  let display = this.querySelector('.content');

  fetch('api/contacts')
    .then(response => response.json)
    .then(json => {
      console.log(json);
      new itemList(json, display);
    })

});