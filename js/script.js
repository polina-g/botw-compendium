//CONSTANTS AND GLOBAL VARIABLES
const BASE_URL = 'https://botw-compendium.herokuapp.com/api/v2';
let category;
let subCategory
let categoryData;

//CACHE ELEMENTS
const $container = $('#container');
const $listContainer = $('#list-container')
const $list = $('ul');

$listContainer.hide();
$container.on('click', showData)

//Monitoring API requests//
$(document).ajaxStart(function() {
    console.log('request started')
})

$(document).ajaxStop(function() {
    console.log('request complete')
})

//Showing API data when category container clicked
function showData(event) {
    let category = $(event.target).attr('id');
    $listContainer.fadeIn();
    
    $.ajax(`${BASE_URL}/category/${category}`).then(function(data) {
        //Remove list items from previous API call
        $('.list-item').remove();
        categoryData = data.data; 

        if (category === 'creatures') {
            $list.append(`<li class="subcategory" id="food">Food</li><li class="subcategory" id="non_food">Animals</li>`)
            $('li').click(function(event) {
                subCategory = $(event.target).attr('id');
                $('.subcategory').remove();
                categoryData = data.data[subCategory]
                console.log(categoryData);
                renderList();
            })        
        }

        renderList();

    }, function() {
        console.log('Something went wrong')
    })

}

function renderList() {
    // if (category === 'creatures') {
    //     console.log(subCategory)
    //     $('.subcategory').remove()
    //     categoryData = categoryData.subcategory;
    //     for (let i = 0; i < categoryData.length; i++) {
    //         $list.append(`<li class="list-item">${categoryData[i].name}</li>`)
    //     }
        
    // }

    for (let i = 0; i < categoryData.length; i++) {
        $list.append(`<li class="list-item">${categoryData[i].name}</li>`)
    }

}