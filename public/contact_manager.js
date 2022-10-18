class itemList {
  constructor(items) {
    this.handlebarsCompilation();
    
    this.display = document.querySelector('.display');
    this.itemsDisplay = document.querySelector('.contact-list');
    this.tagFilters = document.querySelector('.tag-filters');

    this.searchBy = this.display.querySelector('div.search');
    this.itemList = this.display.getElementsByTagName('LI');
    this.addItem = this.display.getElementsByTagName('BUTTON')[0];

    this.initializePage();
    this.bind();
  }

  handlebarsCompilation() {
    this.itemsListTemplate = Handlebars.compile(document.getElementById('contacts').innerHTML);
    this.itemTagsTemplate = Handlebars.compile(document.getElementById('tags').innerHTML);
    this.itemFormTemplate = Handlebars.compile(document.getElementById('form').innerHTML);
  }

  bind() {
    this.addItem.addEventListener('click', this.showAddItemForm.bind(this));
    this.itemsDisplay.addEventListener('click', this.handleItemClick.bind(this));
  }

  initializePage() {
    async function load() {
      await this.showMainPage();
      this.enableSearch();
    }

    load.call(this);
  }

  showMainPage() {
    async function show() {
      await this.fetchItems();
      this.showTagFilters();
      this.showItems();
    }

    show.call(this);
  }

  fetchItems() {
    return fetch('/api/contacts')
      .then(response => response.json())
      .then(json => this.items = json);
  }

  showItems() {
    this.itemsDisplay.innerHTML = this.itemsListTemplate({contacts: this.items});
  }

  showTagFilters() {
    let allTags = this.items.flatMap(contact => contact.tags ? contact.tags.split(',') : []);
    let unique = allTags.filter((tag, idx) => allTags.indexOf(tag) === idx);
    this.tagFilters.innerHTML = this.itemTagsTemplate({tags: unique});
  }

  enableSearch() {
    let tagSearch = this.searchBy.querySelector('.tag-filters');
    let textSearch = this.searchBy.querySelector('.text');

    tagSearch.addEventListener('input', this.handleTagSearch.bind(this, tagSearch));
    textSearch.addEventListener('input', this.handleTextSearch.bind(this, textSearch));
  }

  handleTagSearch(tag) {
    let matches = this.items.filter(item => item.tags && item.tags.includes(tag.value));
    if (!tag.selectedIndex) matches = this.items;
    this.displayMatches(matches);
  }

  handleTextSearch(text) {
    let search = text.value.replace(/^\s+/, '');

    let match = new RegExp(search, 'i');
    let matches = this.items.filter(item => match.test(item.full_name));

    this.displayMatches(matches);
    this.displayNoMatches(matches.length, search);
  }

  displayNoMatches(anyMatches, search) {
    let noContacts = document.querySelector('.no-matches');
    document.getElementById('search-text').textContent = search + '.';
    noContacts.style.display = anyMatches ? 'none' : 'inline-block';    
  }

  displayMatches(matches) {
    const DEFAULT_DISPLAY = 'inline-block';
    let ids = matches.map(item => item.id);

    [...this.itemList].forEach(item => {
      let noMatch = !ids.includes(+item.dataset.id);
      item.classList.toggle('hide', noMatch);
    });
  }

  showAddItemForm() {
    let formHtml = this.itemFormTemplate({crud: 'Create', path: 'api/contacts', method: 'POST'});
    this.display.insertAdjacentHTML('afterbegin', formHtml);
    
    let form = this.display.firstElementChild;
    form.classList.add('slide');
    let tagSection = form.querySelector('.add-tag');

    
    tagSection.addEventListener('click', this.handleTagAction.bind(this));
    form.addEventListener('submit', this.handleFormSubmission.bind(this));
  }

  handleTagAction(e) {
    if (e.target.name === 'add') {
      let tagList = e.target.parentNode.firstElementChild;
      let tagName = e.target.previousElementSibling.value
      this.addTag(tagName, tagList);
    } else if (e.target.matches('.tag-list span')) {
      let tagInput = document.querySelector('input[name=tags]');
      let tag = e.target.parentNode;
      this.removeTag(tag, tagInput);
    }
  }

  removeTag(tag, tagInput) {
    let tagName = tag.firstChild.nodeValue;
    let tags = tagInput.value.split(',').filter(name => name !== tagName);

    tagInput.value = tags.join(',');
    tag.remove();
  }

  addTag(name, tagList) {
    let errorMsg = tagList.parentNode.lastElementChild;

    if (name.length && /[a-z0-9]$/i.test(name)) {
      let tagInput = tagList.parentNode.previousElementSibling;

      tagInput.value += tagInput.value ? `,${name}` : name;
      tagList.appendChild(this.makeTag(name))

      errorMsg.style.display = 'none';
    } else {
      let msg = /[^a-z0-9 ]/.test(name) ? 'Can only use characters: a-z, 0-9, and spaces' : 'Cannot end on whitespace';
      errorMsg.textContent = msg;
      errorMsg.style.display = 'inline-block';
    }
  }

  makeTag(name) {
    let newTag = document.createElement('li');
    newTag.textContent = name;

    this.makeRemoveTagButton(newTag);
    return newTag;
  }

  makeRemoveTagButton(tag) {
    let removeButton = document.createElement('span');
    removeButton.textContent = '❌';
    tag.appendChild(removeButton);
  }

  handleFormSubmission(e) {
    e.preventDefault();
    let form = e.target;

    if (e.submitter.name === 'cancel') {
      this.showMainPage();
      form.remove();
    } else {
      let data = new FormData(e.target);

      fetch(form.action, {
        method: form.dataset.method,
        headers: {
          ContentType: 'application/x-www-form-urlencoded; charset=utf-8'
        },
        body: new URLSearchParams([...data]),
      }).then(response => {
        if (response.status === 201) {
          this.showMainPage()
          console.log(response, response.body)
          form.remove()
        } else {
          alert(response.body);
        }
      });
    } 
  }

  handleItemClick(e) {
    let item = e.target.parentNode;

    if (e.target.name === 'edit') {
      this.showEditItemForm(item);
    } else if (e.target.name === 'delete') {
      if (confirm('Do you want to delete this contact?')) {
        fetch(`api/contacts/${item.dataset.id}`, {
          method: 'DELETE',
        }).then(response => {
          response.status === 204 ? item.remove() : alert(response.body);
        })
      }
    }
  }

  showEditItemForm(item) {
    let id = item.dataset.id;
    let formHtml = this.itemFormTemplate({crud: 'Edit', path: `api/contacts/${id}`, method: 'PUT'});
    this.display.insertAdjacentHTML('afterbegin', formHtml);
    
    let form = document.querySelector('form');
    let inputs = form.querySelectorAll('div.inputs > input');
    let tagList = document.querySelector('.tag-list');

    inputs.forEach(input => input.value = item.dataset[input.name]);
    let tagNames = inputs[inputs.length - 1].value;
    tagNames = tagNames ? tagNames.split(',') : [];

    tagNames.forEach(name => tagList.appendChild(this.makeTag(name)));
    tagList.parentNode.addEventListener('click', this.handleTagAction.bind(this));
    form.addEventListener('submit', this.handleFormSubmission.bind(this));
  }
}

document.addEventListener('DOMContentLoaded', function(event) {
  new itemList();
});
