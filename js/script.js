//CONSTANTS AND GLOBAL VARIABLES
const BASE_URL = 'https://botw-compendium.herokuapp.com/api/v2';
let category;
let subCategory;
let categoryData;
let itemData;

//CACHE ELEMENTS
//List elemenets
const $container = $('#category-container');
const $listContainer = $('#list-container')
const $list = $('ul');

//Description Card Elements
const $cardContainer = $('#card-container');
const $name = $('#name');
const $photo = $('#photo');
const $description = $('#description');
const $locations = $('#common-locations');
const $drops = $('#drops');
const $loadingBox = $('div.loading');

$listContainer.hide();
$cardContainer.hide();
$loadingBox.hide();

//Event listeners
$container.on('click', ".box", showList)
$('main').on('click', '.list-item', showCard)
$('main').on('click', '.close', close);
$('main').on('click', '.back', goBack);

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
            //Remove list items from previous API call

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
