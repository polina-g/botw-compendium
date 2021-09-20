//CONSTANTS AND GLOBAL VARIABLES
const BASE_URL = 'https://botw-compendium.herokuapp.com/api/v2';
let category;
let subCategory
let categoryData;

//CACHE ELEMENTS
const $container = $('#container');
const $list = $('ul');

$container.on('click', showData)

$(document).ajaxStart(function() {
    console.log('request started')
})

$(document).ajaxStop(function() {
    console.log('request complete')
})

function showData(event) {
    let category = $(event.target).attr('id');
    $.ajax(`${BASE_URL}/category/${category}`).then(function(data) {
        categoryData = data.data;
        $('.list-item').remove();

        if (category === 'creatures') {
            $list.append(`<li class="subcategory" id="food">Food</li><li id="non_food">Not Food</li>`)
            $('li').click(function(event) {
                subCategory = $(event.target).attr('id');
            })
        }

        renderList();
    }, function() {
        console.log('Something went wrong')
    })

}

function renderList() {
    if (category === 'creatures') {
        console.log(subCategory)
        $('.subcategory').remove()
        categoryData = categoryData.subcategory;
        for (let i = 0; i < categoryData.length; i++) {
            $list.append(`<li class="list-item">${categoryData[i].name}</li>`)
        }
        
    }

    for (let i = 0; i < categoryData.length; i++) {
        $list.append(`<li class="list-item">${categoryData[i].name}</li>`)
    }

}