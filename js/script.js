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

//When category is selected, call API and create list
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
            $browseLoadingBox.fadeOut();
            categoryData = data.data; 

            //Unlike othe categories, the creatures category has two subcategories: before passing the API data to render, user chooses the subcategory first
            if (category === 'creatures') {
                $backBtn.hide();
                $categoryTitle.text(`${category.toUpperCase()}`);
                $list.append(`<li class="subcategory" id="food">Food</li><li class="subcategory" id="non_food">Animals</li>`)
                $('li').click(function(event) {
                    subCategory = $(event.target).attr('id');
                    $('.subcategory').remove();
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
    if (category === 'creatures' && subCategory !== null) {
        $backBtn.show();
    }
  
    categoryData = sortByName(categoryData)
    $categoryTitle.text(`${category.toUpperCase()}`);
    for (let i = 0; i < categoryData.length; i++) {
        $list.append(`<li class="list-item" id="${categoryData[i].id}">${categoryData[i].name}</li>`)
    }

}

function createCard(event) {
    let cardId = $(event.target).attr('id');
    let eventLocation = $(event.target).closest('ul').attr('id');
  
    $listContainer.fadeOut();
    $cardContainer.fadeIn();
    $browseLoadingBox.fadeIn();
    $.ajax(`${BASE_URL}/entry/${cardId}`).then(function(data) {
        $browseLoadingBox.fadeOut();

        itemData = data.data;
        backButtonShow = true;
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
    if (category !== 'creatures') {
        subcategory = null;
    }

    if (backButtonShow) {
        $backBtn.show();
    } else {
        $backBtn.hide();
    }

    for (key in itemData) {
        if (!itemData[key]) {
            itemData[key] = ['unknown'];
            console.log(itemData)
        }
    }

    $name.append(`${itemData.name}`);
    $photo.attr('src', `${itemData.image}`).attr('alt', `${itemData.name} image`);
    $description.append(`<span class="highlight">Description: </span>${itemData.description}`);
    $locations.append(`<span class="highlight">Common Locations: </span>${itemData.common_locations.join(', ')}`);
    $drops.append(`<span class="highlight">Drops: </span>${itemData.drops.join(', ')}`)
}


function close(event) {
    $(event.target).closest('div.container').fadeOut();
    resetCard()
    resetList()
}

function goBack(event) {
    let currentBoxType = $(event.target).parents('div.container').attr('id');
    if (currentBoxType === 'card-container') {
        console.log(categoryData)
        $cardContainer.hide();
        $listContainer.fadeIn();
        renderList()
    } else if (currentBoxType === 'list-container') {
        let listType = $(event.target).closest('button').parent().siblings('ul').find('li').attr('class');
        if (listType === 'list-item' && category == 'creatures') {
            callCategoryApi();
        } else {
            close(event);
        }
        
    }
}


let countCalls = 0;
function grabNames() {
    //If we've already called this API during the session, skip calling it again!!!
    if (countCalls > 0) {
        return;
    }

    $searchLoadingBox.fadeIn()

    $.ajax(`${BASE_URL}`)
        .then(function(data){
          $searchLoadingBox.fadeOut()
          let allData = data.data;
          for (category in allData) {
            if (category != 'creatures'){
              allNames.push(allData[category].map(itemObject => ({name: itemObject.name, id: itemObject.id})))
            } else if (category === 'creatures') {
                for (subCategory in allData[category]) {
                  allNames.push(allData[category][subCategory].map(itemObject => ({name: itemObject.name, id: itemObject.id})))
                }
            }
          }

          allNames = allNames.flat();
          console.log("All Names length ", allNames.length)
          generateDynamicList();
         

        },
        function(error){
            $searchLoadingBox.text('Something went wrong when loading. Please try again later')
        });

        countCalls++;
  }
  
function generateDynamicList() {
    let keyInput = $searchInput.val().toLowerCase(); 
    $('.search-list-item').remove();

    //When the imput is empty, return to baseline state
    if(keyInput.length < 1) {
        $placeholderText.fadeIn();
        return
    }

    //If we haven't called the API to store the names yes - grab the names
    if (allNames.length === 0) {
        grabNames();
    } else {
        $placeholderText.fadeOut();
        let resultArr = [];
        resultArr = allNames.filter(object => object.name.includes(`${keyInput}`))
        resultArr = sortByName(resultArr);
        for (let i = 0; i < resultArr.length; i++) {          
            $searchList.append(`<li class="search-list-item" id=${resultArr[i].id}>${resultArr[i].name}</li>`)
        }
    }
}
