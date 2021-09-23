//CONSTANTS AND GLOBAL VARIABLES
const BASE_URL = 'https://botw-compendium.herokuapp.com/api/v2';
let category;
let subCategory;
let categoryData;
let allData;
let itemData;
let allNames = [];

//CACHE ELEMENTS
//List elemenets
const $container = $('#category-container');
const $listContainer = $('#list-container')
const $list = $('#item-list');

//Description Card Elements
const $cardContainer = $('#card-container');
const $name = $('#name');
const $photo = $('#photo');
const $description = $('#description');
const $locations = $('#common-locations');
const $drops = $('#drops');
const $loadingBox = $('div.loading');

//Search Elements
const $searchInput = $('#search-input');
const $searchBtn = $('#search-btn');
const $searchList = $('#search-list');
const $placeholderText = $('#placeholder-text')

$listContainer.hide();
$cardContainer.hide();
$loadingBox.hide();

//Event listeners
$container.on('click', ".box", showList)
$('main').on('click', '.list-item', showCard)
$('main').on('click', '.close', close);
$('main').on('click', '.back', goBack);
$searchInput.on('keyup', generateDynamicList)
$('#search').on('click', '.search-list-item', showCard)


//Monitoring API requests//
$(document).ajaxStart(function() {
    console.log('request started')
    resetCard();
    resetList()
    $loadingBox.fadeIn();
})

$(document).ajaxStop(function() {
    console.log('request complete')
    $loadingBox.fadeOut();
})

//Showing API data when category container clicked
function showList(event) {
    category = $(event.target).closest('div').attr('id');
    $listContainer.fadeIn();
    $cardContainer.fadeOut();
    callCategoryApi();
}


function callCategoryApi() {
    $.ajax(`${BASE_URL}/category/${category}`)
        .then(function(data) {
            categoryData = data.data; 

            if (category === 'creatures') {
                $list.append(`<li class="subcategory" id="food">Food</li><li class="subcategory" id="non_food">Animals</li>`)
                $('li').click(function(event) {
                    subCategory = $(event.target).attr('id');
                    $('.subcategory').remove();
                    categoryData = categoryData[subCategory]
                    renderList();
                })        
            }

            renderList();

        },
        function() {
            console.log('Something went wrong')
        })
}

function renderList() {
    let nameData = categoryData.map(object => object.name);
    nameData.sort();
    categoryData = nameData.map(name => categoryData.find(object => object.name === name))
    console.log(categoryData);
    for (let i = 0; i < categoryData.length; i++) {
        $list.append(`<li class="list-item" id="${categoryData[i].id}">${categoryData[i].name}</li>`)
    }

}

function showCard(event) {
    let cardId = $(event.target).attr('id');
    $listContainer.fadeOut();
    $cardContainer.fadeIn();
    $.ajax(`${BASE_URL}/entry/${cardId}`).then(function(data) {
        itemData = data.data;
        renderCard();
    })

}

function renderCard() {
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
    console.log("List or Card: ", currentBoxType); 
    if (currentBoxType === 'card-container') {
        console.log(categoryData)
        $cardContainer.hide();
        $listContainer.fadeIn();
        renderList()
    } else if (currentBoxType === 'list-container') {
        let listType = $(event.target).closest('button').parent().siblings('ul').find('li').attr('class');
        console.log('Type of list: ', listType, $(event.target).parent())
        if (listType === 'list-item' && category == 'creatures') {
            console.log('calling API')
            callCategoryApi();
        } else {
            close(event);
        }
        
    }
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

let countCalls = 0;
function grabNames() {
    //If we've already called this API during the session, skip calling it again!!!
    if (countCalls > 0) {
        return;
    }

    $.ajax(`${BASE_URL}`)
        .then(function(data){
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
            console.log('something went wrong')
        });

        countCalls++;
  }
  
function generateDynamicList() {
    //Bug difficult to reproduce, console log here to debug once the problem occurs again!
    console.log('generating...')
 

    let keyInput = $searchInput.val().toLowerCase(); 
 
    $('.search-list-item').remove();
    console.log(keyInput);

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
        console.log(resultArr.length)
        for (let i = 0; i < resultArr.length; i++) {          
            $searchList.append(`<li class="search-list-item" id=${resultArr[i].id}>${resultArr[i].name}</li>`)
        }
    }
}
