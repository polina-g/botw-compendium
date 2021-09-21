//CONSTANTS AND GLOBAL VARIABLES
const BASE_URL = 'https://botw-compendium.herokuapp.com/api/v2';
let category;
let subCategory
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
    $loadingBox.fadeIn();
})

$(document).ajaxStop(function() {
    console.log('request complete')
    $loadingBox.fadeOut();
})

//Showing API data when category container clicked
function showList(event) {
    let category = $(event.target).closest('div').attr('id');
    $listContainer.fadeIn();
    $cardContainer.fadeOut();
    
    $.ajax(`${BASE_URL}/category/${category}`).then(function(data) {
        //Remove list items from previous API call
        $('.list-item').remove();
        $('.subcategory').remove();
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

    }, function() {
        console.log('Something went wrong')
    })

}

function renderList() {
    for (let i = 0; i < categoryData.length; i++) {
        $list.append(`<li class="list-item" id="${categoryData[i].id}">${categoryData[i].name}</li>`)
    }

}

function showCard(event) {
    let cardId = $(event.target).attr('id');
    $('.list-item').remove();
    $listContainer.fadeOut();
    $cardContainer.fadeIn();
    $.ajax(`${BASE_URL}/entry/${cardId}`).then(function(data) {
        console.log(data);
        itemData = data.data;
        renderCard();
    })

}

function renderCard() {
    resetCard();
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

function goBack() {
    //Go to the previous window when <- pressed
}

function resetCard() {
    $name.text('');
    $description.text('');
    $locations.text('');
    $drops.text('');
}

function resetList() {
    $('.list-item').remove();
    $('.subcategory').remove();
}
