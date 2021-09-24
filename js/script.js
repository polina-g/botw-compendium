//CONSTANTS AND GLOBAL VARIABLES
const BASE_URL = 'https://botw-compendium.herokuapp.com/api/v2';
let category;
let subCategory = null;
let categoryData;
let allData;
let itemData;
let allNames = [];

//CACHE ELEMENTS
//List elements
const $container = $('#category-container');
const $listContainer = $('#list-container');
const $list = $('#item-list');
const $categoryTitle = $('#category-title');

//Description Card Elements
const $cardContainer = $('#card-container');
const $name = $('#name');
const $photo = $('#photo');
const $description = $('#description');
const $locations = $('#common-locations');
const $drops = $('#drops');
const $browseLoadingBox = $('div.browse-loading');
const $backBtn = $('button.back');

//Search Elements
const $searchInput = $('#search-input');
const $searchBtn = $('#search-btn');
const $searchList = $('#search-list');
const $placeholderText = $('#placeholder-text');
const $searchLoadingBox = $('div.search-loading');

//Hiidng elements that appear dynamically throughout the website
$listContainer.hide();
$cardContainer.hide();
$browseLoadingBox.hide();
$searchLoadingBox.hide();

//Event listeners
$container.on('click', ".box", createList)
$('main').on('click', '.list-item', createCard)
$('main').on('click', '.close', close);
$('main').on('click', '.back', goBack);
$searchInput.on('keyup', generateDynamicList)
$('#search').on('click', '.search-list-item', createCard)


//Reseting list and card divs at start of new api calls//
$(document).ajaxStart(function() {
    resetCard();
    resetList();
})

//Helper functions
function sortByName(objectArray) {
    let nameData = objectArray.map(object => object.name);
    nameData.sort();
    objectArray = nameData.map(name => objectArray.find(object => object.name === name))
    return objectArray;
}

function resetCard() {
    $name.text('');
    $photo.attr('src', '#').attr('alt', '');
    $description.text('');
    $locations.text('');
    $drops.text('');
}

function resetList() {
    $('.list-item').remove();
    $('.subcategory').remove();
}

//When category is selected, call API, creating a list of items
function createList(event) {
    category = $(event.target).closest('div').attr('id');
    $listContainer.fadeIn();
    $cardContainer.fadeOut();
    callCategoryApi();
}


function callCategoryApi() {
    $browseLoadingBox.fadeIn();
    $.ajax(`${BASE_URL}/category/${category}`)
        .then(function(data) {
            //Fade loading box, store fetched data in global variable
            $browseLoadingBox.fadeOut();
            categoryData = data.data; 

            //Unlike other categories, the creatures category has two subcategories: before passing the API data to render, user chooses the subcategory first
            if (category === 'creatures') {
                $backBtn.hide();
                $categoryTitle.text(`${category.toUpperCase()}`);
                $list.append(`<li class="subcategory" id="food">Food</li><li class="subcategory" id="non_food">Animals</li>`)

                //Once subcategories are appended - add event listener for click
                $('li').click(function(event) {
                    subCategory = $(event.target).attr('id');
                    $('.subcategory').remove();

                    //Store data for chosen subcategory in global variable
                    categoryData = categoryData[subCategory];
                    
                    renderList();
                })        
            } else {
            $browseLoadingBox.fadeOut();
            renderList();
            }
        },
        function() {
            $browseLoadingBox.text('Someting went wrong when loading data. Please try again later.')
        })
}

function renderList() {
    $backBtn.hide()

    // Show back button on the list page only if showing list for a subcategory of creatures
    if (category === 'creatures' && subCategory !== null) {
        $backBtn.show();
    }
  
    //Sort data my name and append
    categoryData = sortByName(categoryData)
    $categoryTitle.text(`${category.toUpperCase()}`);
    for (let i = 0; i < categoryData.length; i++) {
        $list.append(`<li class="list-item" id="${categoryData[i].id}">${categoryData[i].name}</li>`)
    }
}


function createCard(event) {
    //Grab item id from the clicked list item and the location of the generated list (search box or browsing)
    //This deterines if the rendered card will have a back button or not
    let cardId = $(event.target).attr('id');
    let eventLocation = $(event.target).closest('ul').attr('id');
  
    $listContainer.fadeOut();
    $cardContainer.fadeIn();

    //Show loading screen before calling API
    $browseLoadingBox.fadeIn();
    $.ajax(`${BASE_URL}/entry/${cardId}`).then(function(data) {
        //Once data was fetched succesfully - fade out loading box
        $browseLoadingBox.fadeOut();

        //Store data for card from API in global variable
        itemData = data.data;

        //Depending on where the user clicked the list item - assign boolean value to backButtonShow, passing it into the render function
        if (eventLocation == 'item-list') {
            renderCard(true);
        }

        else if (eventLocation == 'search-list') {
            renderCard(false)
        }
    }, function(error) {
        $browseLoadingBox.text('Someting went wrong when loading data. Please try again later.')
    })

}

function renderCard(backButtonShow) {
    // Nullify subcategory to make sure the back button doesn't appear if the creature category is chosen again
    if (category !== 'creatures') {
        subcategory = null;
    }

    if (backButtonShow) {
        $backBtn.show();
    } else {
        $backBtn.hide();
    }

    //change value of falsey value to show 'unknown' on the card
    for (key in itemData) {
        if (!itemData[key]) {
            itemData[key] = ['unknown'];
        }
    }

    //Generate card
    $name.append(`${itemData.name}`);
    $photo.attr('src', `${itemData.image}`).attr('alt', `${itemData.name} image`);
    $description.append(`<span class="highlight">Description: </span>${itemData.description}`);
    $locations.append(`<span class="highlight">Common Locations: </span>${itemData.common_locations.join(', ')}`);
    $drops.append(`<span class="highlight">Drops: </span>${itemData.drops.join(', ')}`)
}

// Close and back button functions
function close(event) {
    $(event.target).closest('div.container').fadeOut();
    resetCard()
    resetList()
}

function goBack(event) {
    //Depending on the current screen type at the time of the event, generate the logically previously shown screen. 
    let currentBoxType = $(event.target).parents('div.container').attr('id');

    if (currentBoxType === 'card-container') {
        $cardContainer.hide();
        $listContainer.fadeIn();
        renderList()
        return;
    }

    callCategoryApi();

}

//Calls API when user inputs first letter in search bar and stores objects with the name and id in a global variable array
let countCalls = 0;
function grabNames() {
    //Counting API calls for one search 
    if (countCalls > 0) {
        return;
    }

    //Show loading screen
    $searchLoadingBox.fadeIn()

    //API call
    $.ajax(`${BASE_URL}`)
        .then(function(data){
          $searchLoadingBox.fadeOut()
          let allData = data.data;

          //Iterate through categories and store items+id 
          for (category in allData) {
            if (category != 'creatures'){
              allNames.push(allData[category].map(itemObject => ({name: itemObject.name, id: itemObject.id})))
            } else if (category === 'creatures') {
                for (subCategory in allData[category]) {
                  allNames.push(allData[category][subCategory].map(itemObject => ({name: itemObject.name, id: itemObject.id})))
                }
            }
          }

          //Flatten the array and generate list
          allNames = allNames.flat();
          generateDynamicList();
         

        },
        function(error){
            $searchLoadingBox.text('Something went wrong when loading. Please try again later')
        });

        countCalls++;
  }
  
//Generate list based on current input of the search bar
function generateDynamicList() {
    let keyInput = $searchInput.val().toLowerCase(); 

    //remove previously displayed items
    $('.search-list-item').remove();

    //When the input is empty, return to baseline state
    if(keyInput.length < 1) {
        $placeholderText.fadeIn();
        return
    }

    //If we haven't called the API to store the names yet - grab the names
    if (allNames.length === 0) {
        grabNames();
    } else {
        $placeholderText.fadeOut();
        let resultArr = [];

        //Find all the names that include the typed in letters, sort and append to container
        resultArr = allNames.filter(object => object.name.includes(`${keyInput}`))
        resultArr = sortByName(resultArr);
        for (let i = 0; i < resultArr.length; i++) {          
            $searchList.append(`<li class="search-list-item" id=${resultArr[i].id}>${resultArr[i].name}</li>`)
        }
    }
}
